---
title: "V 컬러링에 Next.js 도입하기 (3)"
date: "2023-03-23"
tags: ["V컬러링", "next.js", "ssr", "csr", "react-query"]
author: "jayoon"
description: "React로 구현된 SPA (CSR) 프로젝트를 Next.js로 Migration하는 과정"
---

본 포스팅에서는 로그인 여부에 따라 각자 다른 페이지를 리턴하고, 세션을 관리하는 방법에 대해 작성해 보도록 하겠습니다.

현재 V 컬러링에서는 **JWT** 방식을 이용하여 세션 관리를 하고 있습니다. 사용자가 휴대폰 번호나 소셜 계정으로 로그인을 하면 서버에서는 거기에 맞는 `access_token`을 `refresh_token`과 함께 발급하고, API 호출 시 header에 `access_token`을 실어 보내서 인증을 하고 만료가 되면 `refresh_token`으로 다시 갱신을 하는 구조입니다.

일반적으로 보안이 우수하다고 알려진 방식은 `access_token`은 받아서 바로 header의 default 값으로 세팅하고, `refresh_token`은 cookie의 `httpOnly` 속성을 사용하는 것입니다.

기존의 V 컬러링은 그냥 로컬스토리지에 토큰을 저장하여 사용하고 있는데, 이번에 next.js를 도입하면서 세션을 서버 사이드 및 클라이언트 사이드 모두에서 사용할 수 있도록 변경해 보는 것이 좋겠다는 생각이 들었습니다. 특히 my 영역의 경우 APP에서도 웹뷰 형태로 제공되고 있기 때문에 초기 로딩 속도가 느려서, 서버사이드에서 세션 유무를 판단한 후 로그인을 하지 않은 사용자는 로그인 페이지를, 로그인한 사용자는 마이페이지를 바로 띄워 주기로 결정한 점이 가장 큰 이유입니다.

여러 가지 방법을 검색해 보고 라이브러리도 찾아본 끝에, 결국 양쪽에서 자유롭게 사용하기 위해 토큰을 쿠키에 저장하는 것이 가장 좋겠다는 결론을 내렸습니다. httpOnly 속성을 서버에서 리턴해 주면 좋겠지만 현재 구조적으로 그렇게 설계되어 있지 않고, 또 SSR에서는 로컬스토리지에 접근할 수 없기 때문에 양쪽에서 모두 쓸 수 있는 쿠키로 선택하게 되었습니다.

SSR과 CSR 모두에서 접근이 가능한 `js-cookie` 라이브러리를 설치하고 먼저 로그인 페이지에서 로그인을 하는 로직을 구현한 뒤, 로그인 성공 후 토큰을 쿠키에 저장하는 부분을 구현하였습니다.

```javascript
// set token
import Cookies from "js-cookie"

export const setToken = () => {
  Cookies.set("token", token.token, { expires: 30, path: "/" })
  Cookies.set("refreshToken", token.refreshToken, { expires: 30, path: "/" })
  Cookies.set("expired", token.expired.toString(), { expires: 30, path: "/" })
}

//login
const setUserInfoAfterLogin = () => {
  router.replace("/my")
}

const login = async (username: number, authKey: string) => {
  const res = AuthApi.getToken(username, authKey).then((res: any) => {
    if (res.access_token) {
      setUserInfoAfterLogin()
    }
  })
}
```

다음은 my.tsx에서 세션 유무를 체크하였습니다.

```javascript
export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const queryClient = new QueryClient()

  // 쿠키에서 토큰 정보를 추출한 뒤 header의 Authorization에 추가해 줍니다.
  const token = req.cookies.token
  if (token) {
    axios.defaults.headers["Authorization"] = `Bearer ${token}`
  }

  const { data: userInfo } = await queryClient.fetchQuery(
    [QueryKey.GET_USER_INFO],
    UserApi.getUserInfo,
    {
      staleTime: 60 * 60 * 1000,
      cacheTime: Infinity,
    }
  )

  if (!userInfo) {
    return { redirect: { destination: "/login?my", permanent: false } }
  }

  const dehydrateState = dehydrate(queryClient)

  return {
    props: {
      dehydrateState,
      userInfo,
    },
  }
}
```

### 이슈

이렇게 구현했더니 새로고침 시에는 마이페이지가 정상적으로 로드되는데, 로그인 및 토큰을 셋팅한 직후에는 그대로 로그인 페이지에 머물러 있는 이슈가 발생했습니다. 로그를 찍어 보니 인증 오류 이슈였습니다.

참고로 오류가 났을 때의 axios instance의 interceptor 코드입니다.

```javascript
// 요청 인터셉터
instance.interceptors.request.use(
  config => {
    // 요청 전에 수행할 작업
    const token = Token.getToken() // Cookies.get('token')
    if (token) {
      config.headers.Authorization = token
    }
    return config
  },
  error => {
    // 요청 오류 처리
    return Promise.reject(error)
  }
)
```

axios의 interceptors에서는 토큰 값을 가져왔다 가져오지 못했다 하는 이슈가 있었습니다. 로그를 보며 현상을 파악해 보니 클라이언트 사이드에서 호출했을 때에만 Cookies.get(’token’)을 가져올 수 있다는 사실을 발견할 수 있었습니다.

그래서 코드를 다음과 같이 수정하였습니다.

```javascript
const getToken = () => {
  const auth = axios.defaults.headers.Authorization // 디폴트 헤더 값을 먼저 가져옴
  if (auth) {
    return auth
  }

  const token = Token.getToken() // 없는 경우에 쿠키에서 직접 가져옴
  if (token) {
    return `Bearer ${token}`
  }

  return null
}

// 요청 인터셉터
instance.interceptors.request.use(
  config => {
    // 요청 전에 수행할 작업
    const token = getToken()
    if (token && !config.url?.includes("oauth")) {
      config.headers.Authorization = token
    }
    return config
  },
  error => {
    // 요청 오류 처리
    return Promise.reject(error)
  }
)
```

서버사이드에서 `req.cookies.token` 으로 가져온 값을 디폴트 헤더에 넣었기 때문에 SSR인 경우 헤더 값이 있으므로 그 값을 사용하고, 없는 경우는 CSR이므로 쿠키에 접근하여 토큰을 가져오도록 처리하였습니다.

이렇게 했더니 로그인 페이지에서 세션이 없는 경우에는 로그인 페이지가, 세션이 있는 경우에는 마이 페이지가 리턴되었습니다. 그리고 로그아웃 후 로그인 시에도 자연스럽게 화면이 전환되는 것을 확인할 수 있었습니다.

(next.js의 /api를 활용하여 쿠키를 httponly로 다시 세팅하여 이용하는 방법도 고민중입니다.)

가장 삽질을 많이 했지만 많이 배울 수 있었던 경험이었습니다. 😊
