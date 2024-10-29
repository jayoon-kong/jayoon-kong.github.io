---
title: "채팅플랫폼 구현 과정 - 개발"
date: "2024-10-14"
tags:
  ["채팅플랫폼", "채팅", "웹소켓", "스크롤", "react", "next", "타입스크립트"]
author: "jayoon"
description: "채팅플랫폼 구현 과정 - 개발"
---

## 웹소켓 연결

채팅플랫폼에서는 웹소켓 라이브러리로 stompJS를 사용하였습니다. stompJS에 관련해서 어떤 블로그에서 정리해 둔 내용을 가져와 봤는데요, 정의는 다음과 같습니다.

### **Stomp.js**

JavaScript에서 STOMP 프로토콜을 사용하여WebSocket 기반의 통신에 도움을 주는 라이브러리

### **STOMP**

Simple/Stream Text Oriented Message Protocol

> WebSocket 위에서 동작하는 프로토콜로써 클라이언트와 서버가 전송할 메세지의 유형, 형식, 내용들을 정의하는 매커니즘
>
> - _규격을 갖춘 메시지를 보낼 수 있는 텍스트 기반 프로토콜_
> - publisher, broker, subscriber 를 따로 두어 처리 (pub/sub 구조)
> - _연결시에 헤더를 추가하여 인증 처리 구현이 가능_
> - _STOMP 스펙에 정의한 규칙만 잘 지키면 여러 언어 및 플랫폼 간 메세지를 상호 운영할 수 있음_

출처 : https://medium.com/@woal9844/stomp-js-를-이용한-websocket-연동-c9f0ef6ab540

다른 라이브러리도 많았지만 stompJS를 채택한 이유는, 백엔드와의 통신이 가장 간편하다는 데 있었습니다. 또한 header에 데이터를 포함할 수 있어서 메시지 송/수신 시 인증 정보를 포함시킬 수 있다는 것도 큰 장점이었습니다.

(참고로 저희 채팅플랫폼의 경우에는 메시지 수신에 한해서만 웹소켓을 사용하였기 때문에 따로 인증 정보는 포함시키지 않았습니다.)

웹소켓 연결 코드는 다음과 같습니다.

```javascript
const useSocket = (url: string, subPath: string, roomId: number) => {
  const client = useRef<Client>();
  const webSocketErrorCount = useRef<number>(0);

  const [connected, setConnected] = useState<boolean>(true);
  const [lastWsChat, setLastWsChat] = useState<IWebsocketResponse>();

  const { setMessage } = useSetMessages();

  const subscribe = useCallback(() => {
    client.current?.subscribe(subPath, ({ body }: IMessage) => {
      if (!body) return;
      setLastWsChat(JSON.parse(body));
    });
  }, [subPath]);

  const socketDisconnect = useCallback(() => {
    client.current?.deactivate();
  }, []);

  const socketConnect = useCallback(() => {
    client.current = new Client({
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        webSocketErrorCount.current = 0;
        subscribe();
      },
      onWebSocketError: () => {
        handleError();
      },
      webSocketFactory: () => new SockJS(url),
    });

    client.current?.activate();
  }, [subscribe, handleError, url]);

  useEffect(() => {
    setMessage(lastWsChat.data as IMessageResponse);
  }, [lastWsChat]);

  useEffect(() => {
    socketConnect();
    return () => socketDisconnect();
  }, [socketConnect, socketDisconnect]);

  return {
    connected,
    lastWsChat,
  };
};

export default useSocket;
```

먼저 웹소켓에 연결을 맺고, 연결이 되면 (onConnect) 클라이언트 생성 및 구독 작업을 시작합니다. 구독을 통해 메시지를 수신하면 그 메시지를 전역으로 사용되는 메시지 상태를 통해 관리합니다.

## API 연동

메시지 수신 준비를 마쳤으니 채팅방 구동에 필요한 API를 호출해야 합니다. useSocket을 호출하는 시점에 최신 채팅 리스트 및 방 정보를 가져오는 API를 각각 호출합니다. 채팅 리스트와 방 정보는 어떤 서비스에서든 공통적으로 필요한 정보이기 때문에, 각 모듈을 별도의 hook으로 분리하여 공통 비즈니스 로직 영역에 추가하였습니다.

## 스크롤 이벤트

채팅 리스트를 새로 가져오는 부분에 대해서도 고민이 많았습니다. 스크롤을 위로 올리면 일정 시점에 과거의 채팅을 가져와야 하는데, 이 부분을 어떻게 구현해야 할지 고민하였습니다. 고민했던 방식은 다음과 같습니다.

1. window scroll event
2. intersectionObserver
3. infinite scroll library

먼저 라이브러리 사용에 대해 고민해 보았습니다. 하지만 플랫폼의 성격상 너무 많은 라이브러리에 의존하고 싶지 않았고, 심지어 역방향의 infinite scroll이었기 때문에 레퍼런스가 충분하지 않았습니다. 또한 앱 내 웹뷰를 여러 환경의 저사양 단말에서 돌아가게 해야 하는데, 제공되는 라이브러리가 안정적이지 못해 라이브러리 사용은 배제하였습니다.

다음으로는 `intersectionObserver` 사용에 대해 고민했습니다. `intersectionObserver`는 스크롤 이벤트에 비해 성능이 우수한 것으로 알려져 있고 기존 프로젝트에서도 유용하게 쓰고 있었기 때문에 이 방식을 사용하려고 하였으나, 이미지를 포함하는 등 메시지의 길이가 가변적이기 때문에 정확도 측면에서 다소 떨어진다는 판단을 하였습니다.

그래서 결론적으로는 `window scroll event`를 통해 스크롤 위치를 감지하여, 스크롤을 올리다가 어느 정도 뷰포트의 상단에 올라왔다고 판단되면 다시 API를 호출하는 방식으로 결정하였습니다.

코드는 다음과 같습니다.

```javascript
const useScroll = (callback: (scrolling: ScrollType) => void) => {
  const [isBottom, setIsBottom] = useRecoilState<boolean>(bottomState);

  const lastY = useRef<number>();
  const throttleRef = useRef<NodeJS.Timeout | null>();

  const handler = useCallback(() => {
    if (throttleRef.current) {
      return;
    }

    throttleRef.current = setTimeout(() => {
      if (lastY.current == null) {
        lastY.current = window.scrollY;
        throttleRef.current = null;
        return;
      }

      const gap = lastY.current - window.scrollY;
      if (gap > 0) {
        // 'UP'
        setIsBottom(false);
        const isUp = window.scrollY < 500;
        if (isUp) {
          callback('up');
        }
      } else {
        // 'DOWN'
        if (window.scrollY + window.innerHeight + 500 >= document.body.scrollHeight) {
          callback('down');
        }
      }

      if (window.scrollY + window.innerHeight + 10 >= document.body.scrollHeight) {
        setIsBottom(true);
      }
      lastY.current = window.scrollY;
      throttleRef.current = null;
    }, 100);
  }, [callback, setIsBottom]);

  useEffect(() => {
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, [handler]);

  return { isBottom };
};

export default useScroll;
```

(참고 : isBottom을 따로 기록하는 이유는, 다른 서비스에서도 쉽게 볼 수 있는 ‘최신 채팅으로 이동’ 버튼을 제공하기 위해서입니다.)

### 이슈 1

처음에는 스크롤 이벤트 대신 wheel 이벤트를 사용하려고 하였습니다. 해당 이벤트는 delta 값을 제공하여, 사용자가 스크롤을 어느 방향으로 조작하고 있는지 보다 쉽게 알 수 있기 때문입니다. 하지만 저희 서비스의 앱 내 웹뷰에서는 동작하지 않아, 스크롤 이벤트로 대체하였습니다.

그리고 iOS 사파리 브라우저에서는 최신 채팅으로 이동 시 바로 잘 동작하지 않는 이슈가 있었습니다. 안드로이드와 높이를 계산하는 로직이 다르기 때문인데, 이를 위해 setTimeout을 추가하였습니다.

useScroll 역시 모든 서비스에서 사용되는 기능이기 때문에, 공통 비즈니스 로직 영역에 추가하였습니다.

### 이슈 2

iOS 웹뷰에서는 굉장히 매끄럽게 잘 동작하였지만, 일정 데이터가 쌓이면 안드로이드 웹뷰에서는 속도가 굉장히 느려지는 이슈가 있었습니다. 해당 이슈의 원인을 찾느라 굉장히 많은 시간을 소비했는데요, 그 과정에서 가상화 라이브러리를 사용해 보기도 하고, buffer list를 따로 만들어 100개 이하의 데이터만 렌더링하도록 처리하기도 하였으나 쉽게 해결되지 않았습니다.

동료의 도움을 받아, performance 탭 분석을 통해 닉네임을 가져오는 부분에서 속도가 느려진다는 사실을 발견하였습니다.

```javascript
const { data: user, isLoading } = useCustomQuery(
  Query.myInfo(channelId, roomId)
)
```

보시는 것처럼 react query를 사용하고 있고, useCustomQuery 내부에 들어가는 파라미터인 Query.myInfo는 QueryKey와 QueryFn, QueryOptions 등으로 구성된 객체를 따로 정의하여 반환한 값입니다. 응답으로 받는 data: user에는 사용자의 닉네임이 담겨져 있습니다.

웹소켓에서 내려주는 메시지의 사용자 정보에는 userId만 담겨져 있기 때문에, 이 메시지가 내 메시지인지 아닌지는 위 쿼리를 통해 구분하고 있었습니다. 대량의 메시지가 빠른 속도로 내려오고, 메시지 건마다 호출을 하는 로직이지만 어차피 react query는 cache time을 따로 설정하지 않으면 같은 요청에 한해서는 중복으로 서버에 요청을 보내지 않기 때문에 성능상 문제가 없다고 생각했었죠.

하지만 서버에 요청을 보내지 않더라도, 메시지 한 건당 해당 로직을 수행하는 것은 굉장히 부하가 많이 걸리는 작업이라는 것을 performance 탭을 통해 알 수 있었습니다.

이에, 한 번 계산된 로직은 다시 계산하지 않는 useMemo를 이용하여 위 문제를 해결하였습니다.

```javascript
const query = useMemo(
  () => Query.myInfo(channelId, roomId),
  [channelId, roomId]
)
const { data: user, isLoading } = useCustomQuery(query)
```

이렇게 했더니 눈에 띄게 속도가 빨라진 것을 체감할 수 있었습니다.

## 마무리

채팅플랫폼은 많은 기능을 필요로 하지 않지만, 웹소켓 사용 및 크로스 브라우징 등 여러 면에서 새로운 도전이 된 프로젝트였습니다.<br />
그리고 가장 많이 시간을 할애했던 속도 이슈의 원인은 결론적으로 불필요한 함수의 호출이었지만, 해당 문제를 해결하기 위하여 여러 가지 가상화 라이브러리를 찾아보고, 또 직접 만들어서 적용까지 해 보았던 경험을 통해 많은 것을 배울 수 있었습니다.

또한 플랫폼 성격의 프로젝트를 여러 서비스에서 사용할 수 있도록 기능을 모듈화하고, 또 언젠가 디자인 시스템을 수월하게 적용하기 위해 UI를 분리하여 구현한 작업도 의미 있는 일이었습니다.

따로 포스팅하지 않았지만 서버 아키텍처에 대해서도 관심을 가지고 공부할 수 있었고, 대규모 성능 테스트를 위해 시나리오를 작성하며 수행했던 검증 작업도 좋은 경험이 되었다고 생각합니다.

다음 포스팅에서는 모노레포 전환 과정 및 빌드, 배포에 대해 다뤄 보도록 하겠습니다.
