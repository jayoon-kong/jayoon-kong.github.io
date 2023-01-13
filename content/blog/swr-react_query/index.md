---
title: "Redux vs SWR vs React Query"
date: "2022-04-14"
tags: ["React", "Redux", "SWR", "React Query", "react-query"]
---

기존의 Redux는 React 개발자라면 반드시 사용해야 할 세트 같은 개념의 라이브러리였습니다. 데이터의 상태는 크게 각 컴포넌트에서 독립적으로 사용되는 **로컬 상태**와 전체 어플리케이션에서 공통으로 사용되는 **글로벌 상태**로 나눌 수 있는데요, Redux는 어플리케이션 전체에 하나의 store를 두고 거기서 공통의 상태를 관리해 주는 라이브러리입니다. 사실 Redux 자체도 굉장히 훌륭하고 아주 유용하게 쓰이고 있지만 Redux에서 상태 관리를 하기 위해서는 액션 처리, 리듀서에서의 작업 수행, 실제 처리 시의 dispatch 등 조금 복잡하게 코드를 작성해야 합니다. 심지어 서버 통신 같은 비동기 처리에서의 데이터 동기화 같은 경우 코드가 그다지 깔끔하게 동작하지 않습니다. 상태 관리는 대부분 서버 데이터를 효율적으로 사용하기 위해서 쓴다고 해도 과언이 아닌데 말이죠. 리듀서는 동기적으로 동작하지만 액션은 비동기로 동작하고, 스토어에 액션을 던지면서도 해당 상태가 정확히 어느 시점에 변경되는지 알 수 없는 어려움이 생기게 됩니다.

심지어 Redux 자체만으로는 비동기 작업을 수행할 수 없습니다. 이로 인해 redux-thunk나 redux-saga와 같은 미들웨어를 사용하여 작업을 위임할 수밖에 없는데요, 

서버로부터 user 정보를 가져오기 위해 Redux에서 어떤 코드를 사용하고 있는지 알아보겠습니다. (V 컬러링에서는 redux-thunk를 사용하고 있습니다.)

## Redux

### Action

```javascript
export enum CommonDataTypes {
  GET_USER = 'GET_USER',
}

const createAction = <T extends { type: CommonDataTypes }>(d: T): T => d;

const ActionCreators = {
  getUser: (user: IUser, userInfo: IUserInfo) => createAction({ 
		type: CommonDataTypes.GET_USER, 
		payload: { user, userInfo } 
	})
};
```
```javascript
export const getUser = () => async (dispatch: Dispatch<Actions>) => {
  const [userRes, userInfoRes] = await Promise.all([
		UserApi.getUser(), 
		UserApi.getUserInfo()
	]);

  if (userRes.code === StatusCodes.SUCCESS && userRes.data) {
    dispatch(ActionCreators.getUser({ 
			...userRes.data, 
			currentTimestamp: userRes.currentTimestamp 
		}, { 
			...userInfoRes.data 
		}));
  }
};
```

### Reducer

```javascript
case CommonDataTypes.GET_USER: {
  return {
    ...state,
    user: action.payload.user,
    userInfo: action.payload.userInfo
  };
};
```

### Component
```javascript
store.dispatch(getUser());
```

user 정보를 가져오기 위해서 redux-thunk를 이용하면 이렇게 액션, 리듀서, 실제 action 호출까지 무수히 많은 코드를 작성해야 합니다. 개발자가 user 정보를 갱신하고자 할 때 `store.dispatch(getUser())`이라는 명령어로 액션을 store에 날리면 리듀서에 의해 user 정보가 변경되죠. 하지만 위에서 보시다시피 액션은 비동기로 동작하고, 정확히 user 정보가 어떤 시점에 갱신되는지 알 수 없습니다. 이와 같은 문제를 redux-saga를 이용하면 조금 더 직관적으로 해결할 수는 있습니다. 액션이 순수 객체의 모습을 찾게 되기 때문이죠. 하지만 resux-saga 역시 코드가 길고 가독성이 그리 좋아 보이지는 않습니다.

Redux의 이러한 문제점을 해결하기 위해 SWR과 React Query라는 data fetching 라이브러리가 등장했습니다. 이 두 가지의 라이브러리를 사용하게 되면 앞서 소개했던 Redux처럼 많은 코드를 작성할 필요가 없고, 어떤 데이터를 언제 fetch하는지만 작성하면 되기 때문에 보다 직관적인 프로그래밍이 가능합니다. 또한 동일한 API 호출이 여러 번 일어날 경우 한 번만 처리해 주기 때문에 불필요한 트랜잭션의 낭비를 막을 수 있습니다.

data fetching 라이브러리의 주된 장점은 다음과 같습니다.

> 1. 중복 API 요청 시 한 번만 처리한다.
> 2. 코드가 선언적이므로 가독성이 좋다.
> 3. 로컬 상태와 원격 상태를 동기화한다. 

이제 두 라이브러리의 사용법을 한번 비교해 보겠습니다.

## SWR

```javascript
import useSWR from "swr";

const getUser = () => {
  const { data, isLoading, isError } = useSWR(`/api/user`, fetcher, options);

  if (isLoading) return <div>로딩중입니다...</div>;
  if (isError) return <div>에러가 발생했습니다.</div>;

	return <div>hello, {data.name}!</div>;
}
```

"SWR"이라는 이름은 [HTTP RFC 5861](https://tools.ietf.org/html/rfc5861)에 의해 알려진 HTTP 캐시 무효 전략인 `stale-while-revalidate`
에서 유래되었습니다. SWR은 먼저 캐시로부터 데이터를 반환한 후, fetch 요청(재검증)을 하고, 최종적으로 최신화된 데이터를 가져오는 전략입니다.

SWR의 특징은 다음과 같습니다.

### 불필요한 API 요청 제거
위의 Redux 코드와 비교해 보았을 때 훨씬 코드가 짧아지고, 복잡한 명령형으로 수행될 필요 없이 선언적으로 구현된 것을 알 수 있습니다. 가독성도 더 좋아졌구요. 뿐만 아니라 API 요청을 할 때에는 동일한 SWR key를 사용하며 그 요청이 자동으로 **중복 제거, 캐시, 공유**되므로 단 한 번의 요청만 API로 전송됩니다. 따라서 빠르고 가볍게 데이터를 가져올 수 있습니다.

위 예시에서 useSWR은 key 문자열과 fetcher 함수를 받습니다. key는 데이터의 고유한 식별자이며(일반적으로 API URL), fetcher 함수로 전달됩니다. fetcher는 key를 받고 데이터(또는 에러)를 반환하는 비동기 함수가 될 수 있습니다.

### 자동 갱신
기존의 Redux와 같은 다른 상태 관리 라이브러리에서도 마찬가지로, SWR을 사용하면 한 번 받아온 원격 데이터를 각 컴포넌트에서 공유할 수 있습니다. 하지만 데이터의 추가나 수정이 일어나면 개발자는 로컬 상태를 초기화하고, 다시 API 요청을 보내 원격 상태를 업데이트해야만 했죠.

SWR은 로컬 상태와 원격 상태를 하나로 통합합니다. 마치 로컬 상태가 실시간으로 원격 상태의 데이터 스트림을 받는 것처럼 느낄 수 있는데요, 그 원인은 SWR이 **내부적으로 적절한 타이밍에 지속적으로 데이터를 폴링**하기 때문입니다.

예를 들면 사용자가 페이지에 다시 focus를 주거나 다른 탭에서 이동했을 때를 감지하여 자동으로 데이터를 갱신해 줍니다. 컴퓨터가 슬립 상태에 빠졌다가 다시 활성화되거나, 혹은 네트워크가 잠시 끊겼다가 재연결이 되는 등의 상황에서도 데이터를 최신으로 유지할 수 있기 때문에 아주 유용합니다. 이 자동 갱신 기능은 옵션을 통해 비활성화할 수도 있습니다.

### 조건부 데이터

```javascript
// 조건부 가져오기
const { data } = useSWR(shouldFetch ? `/api/data` : null, fetcher);

// ...또는 falsy 값 반환
const { data } = useSWR(() => shouldFetch ? `/api/data` : null, fetcher);

// ...또는 user.id가 정의되지 않았을 때 에러 throw
const { data } = useSWR(() => `/api/data?uid=` + user.id, fetcher);
```

이렇게 데이터를 조건부로 가져오는 것도 가능합니다.

### Mutation

SWR의 데이터 갱신을 기다릴 필요 없이 로컬에서 바로 상태 변경을 하고 싶은 경우에는 mutation 기능을 이용할 수 있습니다. mutate 함수가 호출되면 해당 상태를 즉시 다시 fetch 하고 데이터를 갱신합니다. 만약 fetch를 원하지 않는다면 옵션 값으로 로컬 상태만 변경할 수도 있습니다.

```javascript
import useSWR, { useSWRConfig } from 'swr'

const Profile = () => {
  const { mutate } = useSWRConfig();
  const [profile, setProfile] = useState({ name: "Polly" });

  const handleEditProfile = () => {
    await updateProfile(profile);
    // mutate 함수에 data 인자를 전달하면 refetch 없이 즉시 변경 가능합니다.
    mutate(`/user/${userId}`, profile, false);
  };
};
```

## React Query

```javascript
import { useQuery } from "react-query";

const useUser = id => {
  const result = useQuery(`/api/user/${id}`, fetcher, options);
  return result;
};

const Example = () => {
  const { data, isLoading, isError } = useUser("Polly");

  if (isLoading) return <div>로딩중입니다...</div>;
	if (isError) return <div>에러가 발생했습니다.</div>;

  return <div>hello, {data.name}!</div>;
}
```

React Query 역시 SWR과 마찬가지로 **선언적**이고, 불필요하게 코드를 작성할 필요 없이 아주 **간단하게** 작성할 수 있으며, 강력한 **캐싱** 기능을 통해 자동으로 오래된 데이터를 갱신합니다.

React Query의 가장 큰 특징은 Server State를 관리하는 것인데요, 쉽게 말하자면 Redux는 전역 상태를, React Query에서는 서버에서 받아온 데이터(Server State)를 관리한다고 생각하면 편할 것 같습니다. React Query에서 말하는 Server State란 다음과 같습니다.

> 1. 클라이언트에서 제어하지 않는 원격 상태로 관리
> 2. 비동기 요청으로 받아올 수 있는 백엔드 데이터
> 3. 항상 최신임을 보장할 수 없음
> 4. 여러 클라이언트에 의해 수정될 수 있음

위 예시에서 볼 수 있듯이 useQuery를 사용하여 요청을 보낼 수 있습니다. useQuery가 반환하는 객체의 프로퍼티로 Query들의 상태를 확인할 수 있습니다. Query의 상태는 다음과 같습니다.

> 1. fresh : active 상태의 시작으로, 호출이 끝나고 바로 stale 상태로 변경됩니다. 기본 stale time은 0이고, stale time을 늘려줄 경우 fresh한 상태가 유지됩니다. 이 때 쿼리가 다시 마운트되면 fetching이 발생하지 않고 기존의 fresh한 값을 반환합니다.
> 2. fetching: 요청 수행 중
> 3. stale : 이미 fetcing이 완료된 상태입니다. 같은 fetching이 시도되면 캐싱된 데이터를 반환합니다.
> 4. inactive: active instance가 없는 상태로, cacheTime이 지나면 소멸됩니다.

React Query 역시 사용하는 방식의 차이만 있을 뿐 SWR과 거의 유사한 특징을 가지고 있습니다.

### 불필요한 API 요청 제거

클라이언트가 소유하며 지속적이지 않은 Clinet State와 달리 Server State는 사용자가 직접 매번 요청을 보내지 않는 이상 업데이트되지 않기 때문에, 사용자가 명시적으로 fetching을 수행해야만 하고 복수의 컴포넌트에서 중복으로 여러 번 수행하는 통신 낭비가 발생할 수 있게 됩니다. 위 예시에서 볼 수 있듯이 useQuery을 사용하여 fetching을 하면 개발자가 따로 처리하지 않아도 캐싱을 가능하게 해 줍니다.

첫 번째 인자인 unique key (여기서는 API 주소) 는 리패칭, 캐싱, 공유 등을 할 때 참조되는 값입니다. 위 예시와 같이 URL 주소가 될 수도 있고 문자열이나 배열이 될 수도 있습니다. 만약 배열이 들어가게 된다면 배열의 요소로는 쿼리의 이름을 나타내는 문자열과 프로미스를 리턴하는 함수의 인자로 쓰이는 값을 넣습니다. 이 때 배열 요소의 순서가 중요합니다. 내용은 같아도 순서가 다르면 다르게 해싱됩니다.

두 번째 인자는 SWR과 마찬가지로 fecher 함수인데 promise 형태의 모든 함수가 올 수 있습니다.

### 자동 갱신

다음과 같은 경우 자동 갱신이 일어납니다.

> 1. 런타임에 stale인 특정 Query instance가 다시 만들어진 경우
> 2. window에 다시 focus된 경우
> 3. 네트워크가 끊겼다가 다시 연결되었을 경우
> 4. refetch interval이 있을 경우 (요청 실패한 Query가 있으면 default로 3번 더 호출합니다.)

### Mutation

useMutation을 사용할 수 있습니다. 서버의 데이터 변경 요청을 할 때 사용하는 함수로, useQuery와는 다르게 Create, Update, Delete 요청과 같이 API 통신으로 server state에 side effect를 일으키는 경우에 사용합니다.

```javascript
import { useQueryClient } from "react-query";

const Profile = () => {
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState({ name: "Polly" });

  const handleEditProfile = () => {
    await updateProfile(profile);
    // unique key를 통해서 data가 invalid 상태임을 전달합니다.
    // react query에서는 해당 데이터를 즉시 refetch 하게 됩니다.
    queryClient.invalidateQueries(`/user/${userId}`);
  };
};
```

위 예시에 Invalidation에 대한 코드도 있는데 Create, Update, Delete와 같이 Mutation 요청 시에는 서버의 값이 변하게 되므로 React Query에 들고 있는 server state는 낡은(stale) 데이터가 되게 됩니다. 이때 QueryClient에서 제공하는 invalidation 메서드들을 사용한다면 해당 Key를 들고 있는 Query들이 refetch가 발생하게 할 수 있습니다.

지금까지 SWR과 React Query를 비교해 보며 data fetching 라이브러리의 특징을 간단하게 살펴보았습니다. 확실히 언뜻 보기만 해도 서버의 데이터를 관리하기에는 Redux보다 훨씬 간결하게 사용할 수 있는 것 같네요. SWR과 React Query 모두 편하게 사용할 수 있지만, 조사를 해 보니 SWR을 사용하게 되면 자동 갱신은 GET 요청인 경우에만 지원을 하는 것 같습니다. V 컬러링에서는 조회 API 중에도 POST가 많기도 하고, 또 여러 reference가 많은 것도 고려해서 아마도 React Query를 도입하지 않을까 합니다.

다음 포스트에서는 V 컬러링에서 Redux로 관리되던 상태를 실제로 React Query로 적용한 내용에 대해 소개하도록 하겠습니다.