---
title: "Next.js 전환 과정 (6) - Infinite scroll 데이터에 react query 적용하기"
date: "2023-04-24"
tags: ["V컬러링", "next.js", "ssr", "csr", "react-query", "useInfiniteScroll"]
author: "jayoon"
description: "React로 구현된 SPA (CSR) 프로젝트를 Next.js로 전환하는 과정"
---

Next.js 프로젝트 수행 시 함께 진행하는 중요 과제로 **기존의 Redux를 걷어내고 모든 fetch data를 React Query로 관리하기**가 있습니다.
<br />
이번 포스팅에서는 무한스크롤 시 `react query`를 사용해서 데이터를 가져온 과정을 정리해 보겠습니다.

현재 저는 `InfiniteScroll` 라이브러리를 사용 중입니다. 버튼 대신 스크롤을 내렸을 때 페이징 처리를 쉽게 해 주는 라이브러리인데요, 간단한 사용법은 다음과 같습니다.

```javascript
<InfiniteScroll hasMore={hasMore} loadMore={loadMore} loader={loader}>
  {children}
</InfiniteScroll>
```

여기서 `hasMore`은 데이터가 더 있는지를 판단하는 값이고, `loadMore`은 일반적으로 데이터를 다시 불러오는 `fetch` 역할을 합니다.
그리고 `loader`는 loading중일 때 return되는 element입니다.

기존에는 `redux`를 사용하고 있었기 때문에 `loadMore` 호출 시 현재 페이지의 값에서 1을 더하여 데이터를 다시 fetch하고, 받아온 데이터를 `reducer`에서 `merge`하여 return하는 방식을 사용했습니다.
사실 `react query`도 사용법은 별반 다를 바가 없었으나, 실제로 사용해 보니 `redux`를 사용할 때보다 좀더 편리하게 쓸 수 있는 몇 가지 방법이 있었습니다.

## useInfiniteQuery

기존의 `useQuery` 대신 `useInfiniteQuery`를 사용했습니다. 이 `hook`을 사용하면 `useQuery`에서 return해 주는 `isLoading`, `data`, `isError` 이외에도 몇 가지 기능을 더 가져올 수 있습니다.

- **_fetchNextPage_**
  - 다음 페이지의 데이터를 가져옵니다.
- **_fetchPreviousPage_**
  - 이전 페이지의 데이터를 가져옵니다.
- **_hasNextPage_**
  - 다음 페이지의 데이터가 있는지의 여부를 리턴합니다.
- **_hasPreviousPage_**
  - 이전 페이지의 데이터가 있는지의 여부를 리턴합니다.
- **_isFetchingNextPage_**
  - 다음 페이지의 데이터를 가져오는 중이라는 상태를 리턴합니다.
- **_isFetchingPreviousPage_**
  - 이전 페이지의 데이터를 가져오는 중이라는 상태를 리턴합니다.

무한스크롤의 경우 이전 페이지로 가는 경우는 없기 때문에 저는 `fetchNextPage`, `hasNextPage`, `isFetchingNextPage` 이 세 가지 리턴값만 사용하였습니다.
이 값을 `InfiniteScroll`의 prop에 매칭시켜 줍니다.

```javascript
<InfiniteScroll hasMore={hasNextPage} loadMore={fetchNextPage} loader={loader}>
  {children}
</InfiniteScroll>
```

### pageParam

그런데 `react query`에서는 페이지의 값을 넘겨주지도 않았는데 어떻게 페이지 정보를 알고 자동으로 `fetch`를 해주는 걸까요?

`useInfiniteQuery`를 사용하면 두 번째 파라미터인 `queryFn`의 파라미터 값으로 `pageParam`을 받을 수 있습니다.
`pageParam`은 `useInfiniteQuery`가 현재 어떤 페이지에 있는지 확인할 수 있는 값입니다.

```javascript
const response = useInfiniteQuery(
  [QueryKey.GET_MY_CONTENTS],
  ({ pageParam = 1 }) => fetchContents(),
  ...
);
```

이와 같이 사용할 수 있습니다.

### getNextPagePram

`useInfiniteQuery`를 사용할 때 파라미터로 넘기는 값에 `getNextPageParam`라는 옵션이 있습니다. 이 옵션은 데이터를 추가로 fetch하기 위해 지정하는 다음 페이지의 값입니다.

위 코드에서 다음과 같이 추가해 줍니다.

```javascript
const response = useInfiniteQuery(
  [QueryKey.GET_MY_CONTENTS],
  ({ pageParam = 1 }) => fetchContents(),
  {
    getNextPageParam: ({ page }) => page && !page.isEndPage && (page.number ?? 0) + 1,
		...
  }
);
```

기본적으로 리턴하는 값은 `data.pages`이고 page는 V컬러링에서 리턴하는 page object data입니다.
마지막 페이지가 아닌 경우와 페이지 number가 있는 경우 1씩 더해서 다음 페이지로 넘기도록 해 주는 코드입니다.

### hasNextPage, fetchNextPage

이제 위 코드를 hook으로 만들어 사용해 주면 됩니다.

```javascript
const {
  data: list,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
} = useMyContents()

;<InfiniteScroll hasMore={hasNextPage} loadMore={fetchNextPage} loader={loader}>
  {children}
</InfiniteScroll>
```

이렇게 호출해 주기만 하면, `useInfiniteQuery`에서 `getNextPageParam`을 기반으로 판단한 `hasNextPage` 값으로 더 fetch를 할지를 결정해 주고,
따로 다음 페이지의 값을 넘기지 않아도 `fetchNextPage` 값으로 자동으로 페이지 값을 증가시켜서 다음 API를 호출해 줍니다.
그리고 UI를 그리기 위해서 list를 merge하는 몇 줄의 코드만 더 작성해 주면 구현이 완료됩니다.

```javascript
// useMyContents 전체 코드
const useMyContents = (type: VRMy.IContentsType, usable: VRMy.IUsableType) => {
  const response = useInfiniteQuery(
    [QueryKey.GET_MY_CONTENTS, type, usable],
    ({ pageParam = 1 }) => fetchContents(type, usable, pageParam),
    {
      staleTime: ONE_HOUR,
      getNextPageParam: ({ page }) =>
        page && !page.isEndPage && (page.number ?? 0) + 1,
    }
  )

  const pages = response.data?.pages
  const contentsList = pages?.map(page => page?.contentsList || []).flat()

  const data = { ...pages?.at(-1), contentsList }
  return { ...response, data }
}
```

## 이슈

잘 동작하는 것은 확인했지만, 네트워크 탭에 들어가 보니 2페이지부터는 API가 두 번씩 호출되는 현상이 발견되었습니다.
첫 번째 파라미터인 `queryKey`에 페이지 값이 포함되지 않아서 그런 건가 생각이 되어 `fetchNextPage`를 이용할 때 수동으로 page를 넘기고, `queryKey`에 페이지 정보를 넣는 방식으로 변경해 보았으나 여전히 문제는 발생하였습니다.

이번에는 데이터를 다시 fetch해 올 때 `queryKey`를 완전히 `invalidate`시키고 다시 가져오는 방법도 사용해 보았습니다.
그리고 이 과정에서, `useInfiniteQuery`의 리턴값 중 `refetch`라는 값이 있다는 것도 알게 되었습니다. `refetch`는 사용하는 시점에 강제로 데이터를 다시 fetch해 오는 역할을 합니다.

### isFetchingNextPage

이런저런 방법으로도 해결이 되지 않아 동료에게 도움을 청해 방법을 찾게 되었습니다.
바로 `InfiniteScroll`의 `hasMore` 속성에 `hasNextPage`뿐 아니라 `!isFetchingNextPage` 값을 넣어 주지 않았기 때문에 발생한 문제였는데요,
데이터가 더 있는지 여부를 판단할 때 다음 페이지를 fetching중일 때도 `hasNextPage` 값은 true로 리턴되기 때문에 짧은 시간 안에 API가 한번 더 호출되는 것이었습니다.

아래와 같이 `!isFetchingNextPage` 조건을 추가하니 문제 없이 깔끔하게 한 번만 호출되는 것을 확인할 수 있었습니다!
(늘 도움을 주시고 저의 부족한 부분을 채워주시는 kirim님에게 항상 감사드립니다. 😊)

```javascript
const {
  data: list,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
} = useMyContents()

<InfiniteScroll
  hasMore={hasNextPage && !isFetchingNextPage}
  loadMore={fetchNextPage}
  loader={loader}
>
  {children}
</InfiniteScroll>
```

이렇게 해서 보관함 리스트의 무한 스크롤 기능을 `useInfiniteQuery`를 이용해 성공적으로 구현하였습니다.
