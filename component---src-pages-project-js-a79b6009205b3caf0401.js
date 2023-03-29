"use strict";(self.webpackChunkgatsby_starter_blog=self.webpackChunkgatsby_starter_blog||[]).push([[746],{387:function(e,t,a){a.d(t,{Z:function(){return o}});var n=a(7294),l=a(1883);var r=()=>n.createElement("div",{className:"menu"},n.createElement(l.Link,{to:"/"},"blog"),n.createElement(l.Link,{to:"/profile"},"profile"),n.createElement(l.Link,{to:"/project"},"project"),n.createElement(l.Link,{to:"/seminar"},"seminar")),c=a.p+"static/cony-21b9d603b7b46df341112559c739afae.png";var i=e=>{let{title:t}=e;return n.createElement("header",{className:"global-header"},n.createElement("div",{className:"main-heading"},n.createElement("div",{className:"logo"},n.createElement("img",{className:"bio-avatar",src:c,alt:"logo"}),n.createElement(l.Link,{to:"/"},t)),n.createElement(r,null)))};var m=()=>n.createElement("footer",{className:"footer"},"Copyright © Jayoon Kong"," "+(new Date).getFullYear(),", all right reserved.");var o=e=>{let{location:t,title:a,children:l}=e;const r="/"===t.pathname;return n.createElement("div",{className:"global-wrapper","data-is-root-path":r},n.createElement(i,{title:a}),n.createElement("main",null,l),n.createElement(m,null))}},9357:function(e,t,a){var n=a(7294),l=a(1883);t.Z=e=>{var t,a,r;let{description:c,title:i,children:m}=e;const{site:o}=(0,l.useStaticQuery)("2841359383"),s=c||o.siteMetadata.description,p=null===(t=o.siteMetadata)||void 0===t?void 0:t.title;return n.createElement(n.Fragment,null,n.createElement("title",null,p?i+" | "+p:i),n.createElement("meta",{name:"description",content:s}),n.createElement("meta",{property:"og:title",content:i}),n.createElement("meta",{property:"og:description",content:s}),n.createElement("meta",{property:"og:type",content:"website"}),n.createElement("meta",{name:"twitter:card",content:"summary"}),n.createElement("meta",{name:"twitter:creator",content:(null===(a=o.siteMetadata)||void 0===a||null===(r=a.social)||void 0===r?void 0:r.twitter)||""}),n.createElement("meta",{name:"twitter:title",content:i}),n.createElement("meta",{name:"twitter:description",content:s}),n.createElement("meta",{name:"google-site-verification",content:"vMqBtqtAuaCt-E77Hy3kVwYFp3Ve9kaAMI1cBnYSfa4"}),m)}},134:function(e,t,a){a.r(t),a.d(t,{Head:function(){return o},default:function(){return s}});var n=a(5785),l=a(7294),r=a(387);const c=[{name:"V 컬러링",subject:"통신사에서 제공하는 부가서비스로, 원하는 동영상 컬러링을 상대방의 단말에 보여주는 서비스\n(http://vcoloring.com) mobile only",skill:"React.js, typescript, Redux, React Query, webpack, git",me:"아키텍쳐 설계 및 개발\n홈 화면 렌더링 개선(memo, lazy loading 등 사용)\n플레이어 iOS 렌더링 이슈 등 크로스 브라우징 문제 해결\nAPP Interface 연동 및 이슈 해결\nUX 개선\nReact Query 도입 등"},{name:"동의정보 지킴이",subject:"SK ICT Family사의 개인정보를 통합 관리하는 사이트 (https://privacy.sk.com)",skill:"Vue.js",me:"전체 사이트 설계 및 개발"},{name:"스마트홈",subject:"신축 아파트에 스마트홈 서비스 적용 및 영역 확장",skill:"Vue.js",me:"기존에 운영 중이던 프로젝트의 리팩토링 및 고도화\n라우터 적용\nDOM Select 부분을 상태로 관리하도록 변경\n웹뷰 렌더링 성능 개선(memo, lazy loading 등 사용) 등"},{name:"T월드",subject:"모바일 T world 전체 개편",skill:"javascript, typescript, jQuery, HTML, CSS",me:"순수 Javascript를 사용하여 프로토타입 기반으로 아키텍처를 설계하여 개발\n업무분장 등 리딩\n팝업, 히스토리 등 공통 모듈 개발\n요금 서비스 개발 등"},{name:"Contents soda",subject:"이북 및 웹툰 서비스",skill:"React.js, Redux",me:"전체 아키텍쳐 설계 및 개발\nAPP Interface 연동 및 이슈 해결\n웹툰 화면 렌더링 개선 등"},{name:"와우브릭",subject:"레고 중고거래 앱",skill:"javascript, jQuery, HTML, CSS",me:"프론트엔드 전체 웹뷰 설계 및 개발"},{name:"MDM",subject:"원격 모바일 보안 솔루션을 통제하는 관리자 콘솔 어플리케이션",skill:"javascript, jQuery, HTML, CSS",me:"전체 아키텍쳐 설계 및 개발\n처음으로 SPA 방식 구현\nUX 설계 및 컴포넌트 모듈화\n크로스 브라우징 이슈 해결 등"},{name:"포털",subject:"대한생명, LG전자 등 다수 포털 사이트 구축",skill:"java, javascript, jQuery, HTML, CSS",me:"Ajax 기반으로 REST API를 이용한 웹 어플리케이션 구축"},{name:"LIG",subject:"LIG 장기계약시스템 유지보수 및 차세대 전환",skill:"COBOL, DB2, Oracle, Java",me:"쿼리 설계 및 개발, 마이그레이션 등"}];var i=e=>{let{childKey:t}=e;return l.createElement("div",{key:t,className:"project-detail"},l.createElement("ul",null,l.createElement("li",{className:"header"},"프로젝트 소개"),l.createElement("li",null,c[t].subject),l.createElement("li",{className:"header"},"사용한 기술"),l.createElement("li",null,c[t].skill),l.createElement("li",{className:"header"},"기여한 점"),l.createElement("li",null,c[t].me)))},m=a(9357);const o=()=>l.createElement(m.Z,{title:"공자윤의 프로젝트"});var s=e=>{var t;let{data:a,location:c}=e;const m=null===(t=a.site.siteMetadata)||void 0===t?void 0:t.title,o=(0,l.useMemo)((()=>[{company:"SK",name:"V 컬러링",period:"2020.01 ~ 현재"},{company:"SK",name:"SK 동의정보 지킴이",period:"2019.10 - 2019.12"},{company:"SK",name:"SKT 스마트홈",period:"2019.06 - 2019.09"},{company:"SK",name:"모바일 T world",period:"2018.04 - 2019.05"},{company:"SK",name:"콘텐츠소다",period:"2017.09 - 2018.03"},{company:"SK",name:"와우브릭",period:"2016.01 - 2016.07"},{company:"LG",name:"모바일 보안 솔루션 (MDM) 관리자 콘솔",period:"2011.01 - 2015.12"},{company:"LG",name:"대한생명 및 LG전자 등 포털 서비스 개발",period:"2009.07 - 2010.12"},{company:"LG",name:"LIG손해보험 시스템 차세대 전환 및 운영",period:"2008.01 - 2009.06"}]),[]),s=(0,l.useMemo)((()=>o.filter((e=>"SK"===e.company))),[o]),{0:p,1:u}=(0,l.useState)(o.map((e=>({isOpened:!1})))),d=(0,l.useCallback)((e=>{u([].concat((0,n.Z)((p||[]).slice(0,e)),[{isOpened:!(p||[])[e].isOpened}],(0,n.Z)((p||[]).slice(e+1))))}),[p]),E=(0,l.useMemo)((()=>e=>s.length+e),[s]);return l.createElement(r.Z,{location:c,title:m},l.createElement("div",{className:"project"},l.createElement("ul",null,l.createElement("li",{className:"title"},"SK Planet"),o.filter((e=>"SK"===e.company)).map(((e,t)=>{var a;return l.createElement("li",{key:t,className:"icon "+(null!==(a=(p||[])[t])&&void 0!==a&&a.isOpened?"up":"down"),onClick:()=>d(t)},l.createElement("span",{className:"name"},e.name),l.createElement("span",{className:"period"},e.period),(p||[])[t].isOpened?l.createElement(i,{childKey:t}):null)}))),l.createElement("ul",null,l.createElement("li",{className:"title"},"LG CNS"),o.filter((e=>"LG"===e.company)).map(((e,t)=>{var a;return l.createElement("li",{key:E(t),className:"icon "+(null!==(a=(p||[])[E(t)])&&void 0!==a&&a.isOpened?"up":"down"),onClick:()=>d(E(t))},l.createElement("span",{className:"name"},e.name,l.createElement("br",null),l.createElement("span",{className:"period"},e.period)),(p||[])[E(t)].isOpened?l.createElement(i,{childKey:E(t)}):null)})))))}}}]);
//# sourceMappingURL=component---src-pages-project-js-a79b6009205b3caf0401.js.map