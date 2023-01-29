---
title: "react router v6에서 react testing libarary 사용하기"
date: "2023-01-28"
tags:
  ["react router v6", "useHistory", "useNavigation", "react testing library"]
author: "jayoon"
description: "react router v6에서 변경된 점 (test 포함)"
---

현재 수행 중인 프로젝트(React)에 테스트 코드를 도입하기 위해서 공부하고 있습니다. react-testing-library라는, 이름에서도 유추할 수 있듯이 react에 최적화된 테스트용 라이브러리를 이용하여 스터디를 하고 있는데요, 자세한 내용은 추후 포스팅하도록 하겠습니다.

이번 포스팅을 시작하게 된 계기는, 위 스터디를 진행하면서 router와 관련된 테스트를 하다가 부딪힌 문제들에 대한 해결 방법을 기록해 두고 싶어서입니다. 현재 ‘스무디 한 잔 마시며 끝내는 리액트 + TDD’라는 책으로 공부 중인데요, 해당 책에서 예제로 나오는 부분은 router v5 기반으로 작성되었기 때문에 최신버전인 v6를 설치하여 실습을 하다 보니 다른 점이 많았습니다.

각설하고 제가 부딪혔던 문제들에 대해 기록해 보겠습니다.

## Switch → Routes

기존 v5 버전에서는 `route` 요소들의 상위를 `Switch` 컴포넌트로 감쌌으나, 이제 명칭이 `Routes`로 변경되었습니다.

## exact path → path

`Route exact path`로 사용하던 부분에서 `exact`가 제거되었습니다.

## component → element

`component`로 렌더링하거나 또는 `<Route>{children}</Route>` 형태로 사용하던 것을 이제는 `element`라는 요소로 사용할 수 있습니다.

세 가지 변경 사항을 예시 비교를 통해 보여드리도록 하겠습니다.

### v5

```javascript
import { Switch } from "react-router-dom"

const Test = () => {
  return (
    <Switch>
      <Route exact path="/" component={<Home />} />
      <Route path="/add">{<Add />}</Route>
    </Switch>
  )
}

export default Test
```

### v6

```javascript
import { Routes } from "react-router-dom"

const Test = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/add" element={<Add />} />
    </Routes>
  )
}

export default Test
```

## useHistory → useNavigate

기존에는 페이지 이동을 위해 `useHistory`를 많이 사용하였으나, 이제 `useNavigate`라는 이름으로 변경되었습니다. 사용법 또한 약간씩 달라졌습니다.

v5 버전에서는 `history`에서 `push`, `replace`, `go` 등을 사용하였다면, `navigate`에서는 이동 및 back 시에는 `navigate`만 사용하도록 변경되었고, `replace`나 `state`는 옵션으로 사용하도록 변경되었습니다.

### v5

```javascript
import { useHistory } from "react-router-dom"

const Test = () => {
  const history = useHistory()
  history.push("/")
  history.replace("/")
  history.go(-1)
}

export default Test
```

### v6

```javascript
import { useNavigate } from "react-router-dom"

const Test = () => {
  const navigate = useHistory()
  navigate("/")
  navigate("/", { replace: true, state: { ...state } })
  navigate(-1)
}

export default Test
```

## MemoryRouter

사실 여기까지는 검색으로도 쉽게 알 수 있는 내용이고, 제가 적은 것 이외에도 중첩 라우팅, `useRoutes` 등 몇 가지 변경 사항이 더 있는데요,

실습 중인 코드에서는 `useParams`를 이용하고 있는데, 이것을 이용하면 다음과 같은 코드에서 id를 쉽게 추출할 수 있습니다.

```javascript
// App.tsx
...
<Route path="/detail/:id" element={<Detail />} />
...

// Detail.tsx
const params = useParams();
const id = Number(params.id);
```

이렇게 `useParams`를 이용해서 구현한 컴포넌트를 테스트하기 위해서는 history를 제어할 수 있는 router를 사용해야 합니다.

테스트 코드에서는 실제로 경로 변경을 할 수 없기 때문에 기존에는 react-router가 테스트용으로 제공하는 `createMemoryHistory`를 사용해서 코드를 작성했는데요,

v5용으로 작성된 예제를 v6에서 어떻게 변경해야 하는지는 쉽게 찾을 수 없었습니다.

검색을 계속하다가 Testing Library 공식 홈페이지에서 `MemoryRouter`라는 것을 알게 되었습니다.

`MemoryRoute`는 위치를 내부적으로 저장하는 라우터로, history를 제어할 수 있기 때문에 테스트용으로 최적화되어 있는 라우터입니다.

이번에도 예제를 통해 비교해 보도록 하겠습니다.

### v5

```javascript
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
...

describe('<PageHeader />', () => {
	it('renders component correctly', () => {
		const history = createMemoryHistory();
		history.push('/');

		const { container } = render(
			<Router history={history}>
				<PageHeader />
			</Router>
		);
		...
	});
});
```

### v6

```javascript
import { MemoryRouter } from 'react-router-dom';
...

describe('<PageHeader />', () => {
	it('renders component correctly', () => {
		const path = '/';

    const { container } = render(
      <MemoryRouter initialEntries={[path]}>
        <PageHeader />
      </MemoryRouter>
    );
		...
	});
});
```

v5에서는 `Router`로 감싼 부분에 `history(createMemoryHistory)`라는 `prop`을 주었으나, v6에서는 따로 `history`를 `import`해올 필요 없이 `MemoryRouter`로 감싼 컴포넌트에 `initialEntries`라는 `prop`으로 URL을 보내는 방식으로 변경되었습니다.

위와 같이 변경하고 `npm run test` 명령어를 통해 테스트를 수행하였더니 성공적인 결과를 확인할 수 있었습니다.

(추가)

`MemoryRouter`에 대한 부연 설명을 위해 좀더 검색을 해 보다가 좀더 쉽게 공통화할 수 있는 방법을 찾게 되었습니다.

```javascript
import { render } from "@testing-library/react"
import { Route, MemoryRouter, Routes } from "react-router-dom"

export const renderWithRouterMatch = (
  ui: JSX.Element,
  { path = "/", route = "/" } = {}
) => {
  return {
    ...render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={ui} />
        </Routes>
      </MemoryRouter>
    ),
  }
}
```

이제 테스트 코드에서 다음과 같이 사용할 수 있습니다.

```javascript
test("renders component correctly", () => {
  renderWithRouterMatch(
    <Detail />,
    {
      path: "/detail/:id",
      route: "/"
    }
  );
  ...
});
```

(출처 : [https://woong-jae.com/react/220717-useParams-testing](https://woong-jae.com/react/220717-useParams-testing))
