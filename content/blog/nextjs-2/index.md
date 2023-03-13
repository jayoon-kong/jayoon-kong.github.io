---
title: "V 컬러링에 Next.js 도입하기 (2)"
date: "2023-03-13"
tags: ["V컬러링", "next.js", "ssr", "csr", "react-query"]
author: "jayoon"
description: "React로 구현된 SPA (CSR) 프로젝트를 Next.js로 Migration하는 과정"
---

본 포스팅에서는 하단 네비게이션 탭 클릭 시 플레이어 화면으로 이동하는 라우터 처리 부분과, 실제 플레이어 화면의 구조를 어떻게 개선하였는지를 중점적으로 다룰 예정입니다.

포스팅 내용을 미리 요약하면 다음과 같습니다.

1. **Architecture 구현에 대한 고민**
2. **rendering 처리**
3. **react query 적용**
4. **swiper library 업데이트**

## Architecture

next.js를 도입하기로 결정한 뒤 가장 큰 숙제는 **기존 프로젝트를 어떻게 하면 문제 없이 migration할 수 있을까** 하는 것이었습니다. 신규 프로젝트와 달리, 이미 운영 중인 서비스는 기능이 조금만 잘못되어도 아주 크리티컬한 결과로 이어지기 때문입니다. 특히 V컬러링 같은 경우 자사의 솔루션이 아니기 때문에 기존에 잘 돌아가는 프로젝트를 굳이 왜 건드려서? 라는 블레임으로부터 자유로울 수 없는 상황이라 더욱 많은 고민이 필요하였습니다.

기존 프로젝트는 전체가 SPA(Single Page Application)로 구현되어 있어 모든 페이지가 CSR 방식으로 처리되고 있었습니다. 사용자와의 interaction이 많은 프로젝트의 성격상 CSR의 장점이 훨씬 많고, 특히 플레이어 같은 경우 스와이핑이 빈번하게 일어나기 때문에 여전히 플레이어 영역은 CSR로 구현되어야 한다는 생각에는 변함이 없었으나, 초기 진입 시 비디오를 로드하는 부분은 서버에서 가져오는 방식이 더 빠를 수도 있겠다는 생각이 들어 아키텍쳐를 어떻게 설계하는 것이 좋은지에 대해 아주 오랜 시간 동안 고민하였습니다.

고민 끝에 **플레이어 영역은 SSR과 CSR 방식을 혼합**하여 사용하기로 결정했습니다. 최초 진입 시에는 서버로부터 컨텐츠 리스트를 받아오는 부분을 포함하여 가장 처음과 그 다음에 표시될 두 컨텐츠의 상세 정보까지 서버 사이드에서 처리하여 렌더링하고, 이후 사용자의 액션에 따라 slide change event가 발생하는 순간부터는 클라이언트 사이드에서 API를 호출하여 렌더링하는 방식을 사용하기로 하였습니다.

또한 기존에는 redux를 사용하고 있어 데이터가 무겁고 리스트를 구성하는 방식을 reducer에서 일일이 찾아서 처리해야 하는 번거로움이 있었기 때문에, 데이터 fetching 처리를 **react query를 사용**하도록 변경하였습니다. 서버 사이드 렌더링 시에도 react query를 사용할 수 있을지, 거기서 처리한 데이터를 클라이언트에서도 그대로 사용할 수 있을지에 대한 고민이 많았으나 다행히 react query에서 해당 기능을 지원하고 있어서 무리 없이 사용할 수 있었습니다.

## rendering 처리

### routing

먼저 player 컴포넌트를 생성하였습니다. next.js는 파일 시스템 기반의 라우팅 방식을 적용하고 있기 때문에, pages 폴더 안에 ${이름}.tsx 파일을 생성하면 해당 이름으로 웹 페이지에서 접근할 수 있습니다. 기존과 같이 `${V컬러링}/player`으로 진입하기 위해 player.tsx 파일을 pages 하위에 생성하였습니다.

### getServerSideProps

컴포넌트 영역은 기존 React와 동일하게 작성하면 되지만, 서버 사이드 렌더링을 처리하기 위해서는 `getServerSideProps`라는 함수를 작성해야 합니다. 공식 문서에는 다음과 같이 기술되어 있습니다.

> If you export a function called `getServerSideProps` (Server-Side Rendering) from a page, Next.js will pre-render this page on each request using the data returned by `getServerSideProps`.

즉 Next.js에서 서버 사이드 렌더링을 사용하기 위해서 `getServerSideProps`를 호출하면, 해당 함수의 데이터를 통해 페이지를 미리 렌더링할 수 있습니다.

우선 컨텐츠 리스트를 받아 오는 부분을 구현해 보았습니다.

```javascript
// fetch data
const fetchContentsIds = async () => {
  const response = await fetch(`${baseURL}/v1/...`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
  const { data } = await response.json()
  return { data }
}

// component
interface IProps {
  list: number[];
  id: number;
}

const Player = ({ list, id }: IProps) => {
  return <PlayerComponent list={list || []} type="home" id={id} />
}

// getServerSideProps
export const getServerSideProps: GetServerSideProps = async () => {
  const { data } = await fetchContentsIds()
  const list = data?.contentsList.map(
    (item: { contentsId: number }) => item.contentsId
  )

  const id = list[0]

  return {
    props: {
      list,
      id,
    },
  }
}
```

이렇게 하면 서버에서 HTML을 내리기 전 미리 `fetchContentsIds`에서 데이터를 fetching하여 클라이언트로 전달할 수 있습니다.

## react query

저는 컨텐츠 아이디 리스트 뿐 아니라, 최초 진입 시 보여줄 비디오 정보를 미리 로드하기 위하여 추가적으로 API를 호출하였습니다. 기존의 redux 대신 react query를 이용하여 데이터를 가져왔습니다.

```javascript
const fetchContent = async (id: number) => {
  const response = await fetch(`${baseURL}/${id}`)
  const { data } = await response.json()
  return { data }
}

export const getServerSideProps: GetServerSideProps = async () => {
  const queryClient = new QueryClient()

  const { data } = await queryClient.fetchQuery(
    `contentsIds`,
    fetchContentsIds,
    { staleTime: 10 * 1000 * 1000 }
  )
  const list = data?.contentsList.map(
    (item: { contentsId: number }) => item.contentsId
  )

  const contentsId = list[0]
  const nextId = list[1]

  await Promise.all([
    queryClient.fetchQuery(`content${contentsId}`, () =>
      fetchContent(contentsId)
    ),
    { staleTime: 10 * 1000 * 1000 },
    queryClient.fetchQuery(`content${nextId}`, () => fetchContent(nextId)),
    { staleTime: 10 * 1000 * 1000 },
  ])

  const dehydratedState: DehydratedState = dehydrate(queryClient)

  return {
    props: {
      dehydratedState,
      list,
      id: contentsId,
    },
  }
}
```

처음 list에서 받아온 ID값으로 **react query**의 키를 설정하였습니다. **react query**를 사용할 때는 항상 `useQuery` 또는 `fetchQuery`의 첫 번째 인자 값이 키가 되는데, 이 키를 바탕으로 현재 프로젝트가 해당 데이터를 최신으로 유지하고 있는지 여부를 판단합니다. 즉, contentsIds 키로 한 번 조회한 데이터(list)는 이후에 API를 다시 호출하더라도 데이터 상태가 stale하게 변경되지 않는 이상 fetching이 다시 일어나지 않습니다.

데이터 상태의 신선도를 판단하거나 다시 호출하기 위해서는 `staleTime`, `cacheTime` 등의 옵션을 사용하면 되는데, 위 예제에서는 우선 `staleTime`을 설정하였습니다. 그렇게 되면 해당 시간 동안은 데이터가 fresh한 상태라고 판단하여 API 호출이 일어나더라도 실제로 fetching이 일어나지 않고 캐시된 데이터를 사용하게 됩니다. 이를 통해 불필요한 API 호출을 줄여 성능을 최적화할 수 있습니다.

이렇게 fetching된 데이터는 `queryClient`에 담기게 됩니다. 여기까지는 CSR 방식에서 **react query**를 사용하는 방식과 동일합니다. 하지만 이번에는 서버에서 최초 데이터를 fetching하였기 때문에 이 부분을 클라이언트로 전송하는 방식에 대해 조사해 보았습니다.

### hydrate

서버 사이드에서 fetching된 데이터는 queryClient에 담기고, 이것은 dehydrate라는 작업을 통해 전달할 수 있습니다.

```javascript
const dehydratedState: DehydratedState = dehydrate(queryClient)
```

그리고 이렇게 만들어진 dehydratedState를 prop으로 전달하면, \_app.tsx에서 Hydrate로 감싸 전달받을 수 있고, 최종적으로 PageProps를 통해 각 컴포넌트로 전송됩니다.

```javascript
// _app.tsx
<QueryClientProvider client={queryClient}>
  <Hydrate state={pageProps.dehydratedState}>
    <Layout>
      <Component {...pageProps} />
    </Layout>
    <Navigation router={router} />
  </Hydrate>
</QueryClientProvider>
```

쉽게 말하면 서버 사이드에서 말린 데이터를 클라이언트 사이드에서 받아, 사용하고자 하는 각 컴포넌트에서 다시 적셔서 사용한다고 볼 수 있습니다. 특별히 데이터를 전송하지 않았는데 어떻게 그 값을 판단하지? 라는 생각이 들 수 있는데, 앞에서 언급했듯이 react query에서 제공하는 키 값으로 데이터를 받아 사용할 수 있습니다.

```javascript
const PlayerComponent = ({ list, id, type }: IProps) => {
  const { data: currentData } = useQuery(
    `content${list[current]}`,
    () => fetchContent(list[current]),
    { staleTime: 10 * 1000 * 1000 }
  )
  const { data: prevData } = useQuery(
    `content${list[current - 1]}`,
    () => fetchContent(list[current - 1]),
    { staleTime: 10 * 1000 * 1000, enabled: !!list[current - 1] }
  )
  const { data: nextData } = useQuery(
    `content${list[current + 1]}`,
    () => fetchContent(list[current + 1]),
    { staleTime: 10 * 1000 * 1000, enabled: !!list[current + 1] }
  )
}
```

실제 컴포넌트에서는 위와 같이 사용할 수 있습니다. 이렇게 하면 키 값의 구분자가 되는 list[current] 값에 따라 기존에 호출되지 않았던 API에 대해서만 데이터 fetching이 일어나기 때문에, 컴포넌트에서 세 번의 API를 호출하였지만 실제로는 서버에서 이미 받아온 두 컨텐츠의 데이터는 가져오지 않게 됩니다. 그리고 prevData의 경우 현재로서는 list[current - 1] 값이 존재하지 않기 때문에 enabled 속성에 따라 호출이 무시됩니다. 즉 이 예시를 적용하여 네트워크 탭을 확인해 보면 **위 세 API가 클라이언트 사이드에서는 실제로 모두 호출되지 않는다는 사실을 확인할 수 있습니다**.

그리고 실제로 content가 렌더링되도록 구현해 보았습니다.

```javascript
<Swiper {...swiperParams} direction="vertical">
  {list.map((video: number, index: number) => {
    return (
      <SwiperSlide key={`video_${video}_${index}`} data-reactid={video}>
        {index <= current + 1 && index >= current - 1 ? (
          <Content
            type={type}
            contents={
              contents.filter(item => item.contentsId === video)[0]
                ?.contentsFiles
            }
            isShown={index === current}
          />
        ) : null}
      </SwiperSlide>
    )
  })}
</Swiper>
```

하위 컴포넌트로 전송하는 prop인 contents에는 위에서 가져온 prevData, currentData, nextData를 모두 담아, 빠른 렌더링을 위해 스와이프가 일어날 때 미리 직전/직후의 썸네일 및 동영상을 로드할 수 있도록 하였습니다. 그리고 스와이핑 시 current 값이 변경되면서 useQuery로 가져오는 키 값이 바뀌며 데이터 fetching이 일어납니다. 그리고 설정된 staleTime에 따라, 이미 가져온 데이터는 캐싱되어 다시 스와이핑이 되어도 fetching되지 않습니다.

## Swiper library update

기존의 swiper library는 오래되기도 했고 next.js와 호환하기에는 몇 가지 문제가 있어 swiper library를 업데이트하였습니다. 사용법에 크게 차이가 없으나 달라진 점은 다음과 같습니다.

```javascript
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Pagination } from "swiper";
import type { Swiper as SwiperType } from "swiper/types";

// Navigation 및 Pagination 모듈을 초기화합니다.
SwiperCore.use([Navigation, Pagination]);

// SwiperType을 따로 import하여, activeIndex를 가져올 때 swiper.activeIndex를 사용합니다.
// 이렇게 하면 기존의 useRef로 swiper를 선언하지 않아도 됩니다.
onSlideChange: (swiper: SwiperType) => {
  const index = swiper.activeIndex || 0;
  setCurrent(index);
},
```

이렇게 해서 기존과 동일한 UX로 player를 재구현해 보았습니다. 사실 체감상 속도가 크게 개선되었다고 느끼기는 어렵지만, architecture 설계에 대해 심도 있게 고민해 볼 수 있는 좋은 기회였다고 생각합니다.

다음 포스팅에서는 사용자 세션을 적용한 결과를 리뷰해 보도록 하겠습니다.
