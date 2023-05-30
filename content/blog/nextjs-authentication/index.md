---
title: "Next.js 전환 과정 (3) - 인증 및 토큰 처리하기"
date: "2023-03-23"
tags: ["V컬러링", "next.js", "ssr", "csr", "react-query"]
author: "jayoon"
description: "React로 구현된 SPA (CSR) 프로젝트를 Next.js로 전환하는 과정"
---

본 포스팅에서는 로그인 여부에 따라 각자 다른 페이지를 리턴하고, 세션을 관리하는 방법에 대해 작성해 보도록 하겠습니다.

현재 V 컬러링에서는 **JWT** 방식을 이용하여 세션 관리를 하고 있습니다. 사용자가 휴대폰 번호나 소셜 계정으로 로그인을 하면 서버에서는 거기에 맞는 `access_token`을 `refresh_token`과 함께 발급하고, API 호출 시 header에 `access_token`을 실어 보내서 인증을 하고 만료가 되면 `refresh_token`으로 다시 갱신을 하는 구조입니다.

일반적으로 보안이 우수하다고 알려진 방식은 `access_token`은 받아서 바로 header의 default 값으로 세팅하고, `refresh_token`은 cookie의 `httpOnly` 속성을 사용하는 것입니다.

기존의 V 컬러링은 그냥 로컬스토리지에 토큰을 저장하여 사용하고 있는데, 이번에 next.js를 도입하면서 세션을 서버 사이드 및 클라이언트 사이드 모두에서 사용할 수 있도록 변경해 보는 것이 좋겠다는 생각이 들었습니다. 특히 my 영역의 경우 APP에서도 웹뷰 형태로 제공되고 있기 때문에 초기 로딩 속도가 느려서, 서버사이드에서 세션 유무를 판단한 후 로그인을 하지 않은 사용자는 로그인 페이지를, 로그인한 사용자는 마이페이지를 바로 띄워 주기로 결정한 점이 가장 큰 이유입니다.

여러 가지 방법을 검색해 보고 라이브러리도 찾아본 끝에, 결국 양쪽에서 자유롭게 사용하기 위해 토큰을 쿠키에 저장하는 것이 가장 좋겠다는 결론을 내렸습니다. httpOnly 속성을 서버에서 리턴해 주면 좋겠지만 현재 구조적으로 그렇게 설계되어 있지 않고, 또 SSR에서는 로컬스토리지에 접근할 수 없기 때문에 양쪽에서 모두 쓸 수 있는 쿠키로 선택하게 되었습니다.

먼저 `react-cookie` 라이브러리를 설치하고 로그인 페이지에서 로그인을 하는 로직을 구현한 뒤, 로그인 성공 후 토큰을 쿠키에 저장하는 부분을 구현하였습니다.

```javascript
// 로그인 성공 이후 처리
TokenHelper.setToken({
  token: token.access_token,
  refreshToken: token.refresh_token,
  expired: Date.now() + token.expires_in * 1000,
});

// TokenHelper
import { Cookies } from 'react-cookie';

public static cookie = new Cookies();
public static setToken(params: VRAuth.IToken) {
  if (params) {
    const { token, refreshToken, expired } = params;

    this.cookie.set('token', token, { path: '/', expires: new Date(expired) });
    this.cookie.set('refreshToken', refreshToken, { path: '/', expires: new Date(expired * 60) });
    this.cookie.set('expired', expired, { path: '/', expires: new Date(expired) });
  }
}
```

로그인은 클라이언트 사이드에서 이루어지기 때문에, 서버 사이드에서 `getInitialProps`으로 접근했을 때 쿠키가 날아가지 않도록 서버 사이드에서도 세팅을 해 줍니다.
먼저 `CookiesProvider`로 app을 감싸고, 서버의 쿠키를 쉽게 가져올 수 있도록 `next-cookies`를 추가로 설치하였습니다.

```javascript
import { CookiesProvider } from 'react-cookie';
import cookies from 'next-cookies';
...

const App = () => {
  return (
    <CookiesProvider>
      <Layout>
        ...
      </Layout>
    </CookiesProvider>
  );
}

App.getInitialProps = ({ Component, pageProps, ctx }: any) => {
  initializeToken(ctx);
  return {
    props: {
      Component,
      pageProps: pageProps || {},
    },
  };
};

export const initializeToken = async (ctx: any) => {
  const { req: { headers } = {} as any } = ctx;
  const { token, refreshToken, expired } = cookies(ctx);

  if (token && refreshToken && expired) {
    instance.defaults.headers.Authorization = `Bearer ${token}`; // 헤더에 토큰 정보 저장
    TokenHelper.setToken({ token, refreshToken, expired: Number(expired) });

    // 자동 갱신
    if (Number(expired) < Date.now()) {
      const response = await updateToken(refreshToken);
      const { access_token, refresh_token, expires_in } = response;

      if (access_token) {
        instance.defaults.headers.Authorization = `Bearer ${token}`;
        TokenHelper.setToken({
          token: access_token,
          refreshToken: refresh_token,
          expired: Date.now() + expires_in * 1000,
        });
      }
    }
    return;
  }

  delete instance.defaults.headers.Authorization;
  TokenHelper.clearToken();
};
```

다음은 my.tsx에서 세션 유무를 체크하여 세션이 없는 경우 로그인 페이지로 리다이렉트 처리를 합니다.
login.tsx에서도 마찬가지로 처리합니다.

```javascript
// my.tsx
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  initializeToken(ctx);

  const { query } = ctx;
  const param = searchParams(query as IParameters);

  const { token, expired } = cookies(ctx);

  if (!token || Number(expired) < Date.now()) {
    if (EnvChecker.isApp()) {
      return { props: {} };
    }
    return { redirect: { destination: `/login?my${param ? `&${param}` : ''}`, permanent: true } };
  }

  return { props: {} };
};

export default memo(My);

// login.tsx
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  initializeToken(ctx);

  const { token, expired } = cookies(ctx);

  if (token && Number(expired) > Date.now()) {
    return { redirect: { destination: `/${redirectTo()}`, permanent: false } };
  }

  return { props: {} };
};
```

### 이슈

처음에 구현했을 때 새로고침 시에는 마이페이지가 정상적으로 로드되는데, 로그인 및 토큰을 셋팅한 직후에는 그대로 로그인 페이지에 머물러 있는 이슈가 발생했습니다. 로그를 찍어 보니 인증 오류 이슈였습니다.

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

axios의 interceptors에서는 토큰 값을 가져왔다 가져오지 못했다 하는 이슈가 있었습니다.
로그를 보며 현상을 파악해 보니 클라이언트 사이드에서 호출했을 때에만 Cookies.get(’token’)을 가져올 수 있다는 사실을 발견할 수 있었습니다.

그래서 `initializeToken`에서 axios instance의 헤더에 값을 세팅하고, 요청 interceptors의 코드를 다음과 같이 수정하였습니다.

```javascript
export const initializeToken = async (ctx: any) => {
  ...
  if (token && refreshToken && expired) {
    instance.defaults.headers.Authorization = `Bearer ${token}`; // 헤더에 토큰 정보 저장
    TokenHelper.setToken({ token, refreshToken, expired: Number(expired) });
    ...
  }
  delete instance.defaults.headers.Authorization;
  TokenHelper.clearToken();
};

// 요청 인터셉터
instance.interceptors.request.use(
  config => {
    // 요청 데이터 처리
    return merge(getConfig(), config);

    export const getConfig = (): AxiosRequestConfig => {
      const token = TokenHelper.getToken();

      return {
        headers: {
          ...,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        } as Record<string, string>
      };
    };
  },
  error => {
    // 요청 오류 처리
    return Promise.reject(error)
  }
)
```

서버사이드에서 req의 헤더에 있는 쿠키 정보로 가져온 토큰 값을 디폴트 헤더에 넣었기 때문에 SSR인 경우 헤더 값이 있으므로 그 값을 사용하고, 없는 경우는 CSR이므로 쿠키에 접근하여 토큰을 가져오도록 처리하였습니다.

이렇게 했더니 로그인 페이지에서 세션이 없는 경우에는 로그인 페이지가, 세션이 있는 경우에는 마이 페이지가 리턴되었습니다. 그리고 로그아웃 후 로그인 시에도 자연스럽게 화면이 전환되는 것을 확인할 수 있었습니다.

(next.js의 /api를 활용하여 쿠키를 httponly로 다시 세팅하여 이용하는 방법도 고민중입니다.)

가장 삽질을 많이 했지만 많이 배울 수 있었던 경험이었습니다. 😊
