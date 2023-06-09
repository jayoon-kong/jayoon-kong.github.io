---
title: "Next.js 전환 과정 - 자동로그인 (토큰 갱신)"
date: "2023-04-04"
tags: ["V컬러링", "next.js", "ssr", "csr", "react-query"]
author: "jayoon"
description: "React로 구현된 SPA (CSR) 프로젝트를 Next.js로 전환하는 과정"
---

V 컬러링에서는 jwt 인증 방식을 사용하고 있습니다.
최초에 사용자가 로그인을 하면 서버로부터 `access_token`과 `refresh_token`을 발급받고, 그 값을 어딘가에 저장해 두고 있다가 토큰 값이 만료되면 저장된 `refresh_token`을 이용해 다시 유효한 토큰을 발급받는 방식입니다.

기존의 V 컬러링은 SPA이기 때문에 초기 페이지 진입 시 토큰 만료 여부를 한 번 체크하여 자동로그인이 필요한 경우 토큰 갱신 작업을 수행하고, 이후에는 API fech 때마다 만료 여부를 체크하여 토큰을 갱신합니다.
이번에도 비슷하게 구현하기 위해서 axios instance의 요청 인터셉터에서 만료 체크 및 자동로그인을 수행하도록 하였는데, 클라이언트 사이드에서 API 요청 시 토큰이 만료되었을 경우에는 성공적으로 자동로그인이 되었지만 서버 사이드에서 최초로 요청했을 경우에는 갱신이 제대로 처리되지 않는 문제가 발생했습니다.

### 이슈1

처음에 작성한 코드는 다음과 같습니다.

```javascript
// axios instance
instance.interceptors.request.use(
  async config => {
    // 요청 데이터 처리
    if (TokenHelper.needRefresh()) {
      const response = await updateToken()
      const { access_token, refresh_token, expires_in } = response

      if (access_token) {
        TokenHelper.setToken({
          token: access_token,
          refreshToken: refresh_token,
          expired: Date.now() + expires_in,
        })
      }
    }
    return merge(getConfig(), config)
  },
  error => {
    // 요청 오류 처리
    return Promise.reject(error)
  }
)
```

```javascript
// update token
export const updateToken = async () => {
	...
  return axios
    .post(
      `${baseURI}/oauth/token`,
      {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        scope: 'read',
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: getAuthorization(),
        } as Record<string, string>,
      }
    )
    ...
};
```

원인을 살펴 보니 우선 헤더가 제대로 요청되지 않고 있었습니다.
모든 API는 요청 시 axios의 interceptors를 거쳐 `getConfig()`에서 선언된 공통 헤더와 각 API에서 전달된 특정 config가 합쳐진 헤더를 최종적으로 전달하게 되는데, `updateToken` 함수에서는 axios instance를 상속받지 않고 직접 axios를 호출해서 헤더가 제대로 넘어가지 않는 문제였습니다.

그래서 `updateToken()` 시 다음과 같이 헤더를 세팅해 주었습니다.

```javascript
{
  headers: {
    ...getConfig().headers,
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: getAuthorization(),
  } as Record<string, string>,
}
```

이렇게 했더니 토큰 갱신 API에서 정상 응답을 받을 수 있었습니다.

### 이슈2

토큰은 정상적으로 가져왔으나 원래 호출하려던 API에서 401 에러가 발생하였습니다. 요청 헤더를 살펴보니 갱신된 토큰 값이 제대로 전달되지 않고 있었습니다.

코드를 다시 살펴보니, 토큰을 세팅한 후 변경된 토큰 정보를 헤더에 실어 주는 작업이 누락되었다는 점을 발견할 수 있었습니다.
갱신된 토큰 값을 쿠키에만 저장하고 정작 헤더 정보는 업데이트하지 않았기 때문에, 서버로 요청되는 헤더에는 기존에 넘어온 config 값에 들어있는 `Authorization` 정보가 들어가게 되는 것이었습니다.

그래서 다음과 같이 헤더에 새 토큰을 실어서 return하도록 변경하였습니다.

```javascript
const mergeConfig = merge(getConfig(), config)

if (TokenHelper.needRefresh()) {
  const response = await updateToken()
  const { access_token, refresh_token, expires_in } = response

  if (access_token) {
    TokenHelper.setToken({
      token: access_token,
      refreshToken: refresh_token,
      expired: Date.now() + expires_in,
    })
    return merge(mergeConfig, {
      headers: { Authorization: `Bearer ${access_token}` },
    })
  }
}
return mergeConfig
```

### 이슈3

클라이언트 사이드에서 테스트를 했을 때는 위와 같이 했을 때 잘 수행되었는데, 서버 사이드에서는 계속해서 오류가 발생하였습니다.
원인을 분석해 보니, **서버 사이드에서는 갱신된 토큰 값을 가져와도 브라우저의 쿠키에 직접적으로 세팅을 할 수 없기 때문**이었습니다.
아무리 setToken을 해도 서버에서는 브라우저에 접근이 불가능했기 때문에 갱신된 토큰 값이 실제로 반영되지 않았고, 이후 호출되는 API에서는 그대로 쿠키의 토큰 정보를 가져와서 헤더에 실어 보냈기 때문에 계속 401 오류가 발생하였던 것입니다.

어떤 방법이 있을까 검색하다가, 페이지의 응답에 쿠키를 다시 세팅하면 클라이언트에서 다시 접근할 수 있다는 사실을 알게 되었습니다.

_흐름을 쉽게 정리하자면, **페이지 요청에 담긴 쿠키를 빼와**서 refresh api를 호출하는데 사용하고, 그 새로 받아온 토큰들을 **페이지 응답의 헤더에 다시 껴서 브라우저로** 보내주는 것이다._

출처 : [https://9yujin.tistory.com/104](https://9yujin.tistory.com/104)

`_app.tsx` 진입 시 initialize를 호출하는 부분에서 토큰 값을 갱신하고, 받아온 토큰 값을 응답 헤더에 세팅하도록 구현하였습니다. ([이전 포스팅](https://jayoon-kong.github.io/nextjs-authentication) 참조)

```javascript
// TokenHelper.tsx
public static setToken(params: VRAuth.IToken) {
  if (params) {
    const { token, refreshToken, expired } = params;

    this.cookie.set('token', token, { path: '/', expires: new Date(expired) });
    // 만료 시 refreshToken을 꺼내야 하는데, 기간이 같이 만료되면 안되기 때문에 길게 세팅
    this.cookie.set('refreshToken', refreshToken, { path: '/', expires: new Date(expired * 60) });
    this.cookie.set('expired', expired, { path: '/', expires: new Date(expired) });
  }
}

const initializeToken = async (ctx: any) => {
  const { req: { headers } = {} as any } = ctx;
  const { token, refreshToken, expired } = cookies(ctx);

  if (token && refreshToken && expired) {
    instance.defaults.headers.Authorization = `Bearer ${token}`; // 헤더에 토큰 정보 저장
    TokenHelper.setToken({ token, refreshToken, expired: Number(expired) });
    ...
  }
}
```

이렇게 하면 새로운 토큰 값이 브라우저의 쿠키에 세팅되어 클라이언트에서 접근이 가능합니다.

이제 서버사이드와 클라이언트사이드 모든 API 호출 시 자동로그인이 잘 동작합니다. 🙂
