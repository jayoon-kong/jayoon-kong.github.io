"use strict";(self.webpackChunkgatsby_starter_blog=self.webpackChunkgatsby_starter_blog||[]).push([[989],{387:function(e,t,a){a.d(t,{Z:function(){return m}});var n=a(7294),r=a(1883);var l=()=>n.createElement("div",{className:"menu"},n.createElement(r.Link,{to:"/"},"blog"),n.createElement(r.Link,{to:"/profile"},"profile"),n.createElement(r.Link,{to:"/project"},"project"),n.createElement(r.Link,{to:"/seminar"},"seminar")),i=a.p+"static/cony-21b9d603b7b46df341112559c739afae.png";var c=e=>{let{title:t}=e;return n.createElement("header",{className:"global-header"},n.createElement("div",{className:"main-heading"},n.createElement("div",{className:"logo"},n.createElement("img",{className:"bio-avatar",src:i,alt:"logo"}),n.createElement(r.Link,{to:"/"},t)),n.createElement(l,null)))};var o=()=>n.createElement("footer",{className:"footer"},"Copyright © Jayoon Kong"," "+(new Date).getFullYear(),", all right reserved.");var m=e=>{let{location:t,title:a,children:r}=e;const l="/"===t.pathname;return n.createElement("div",{className:"global-wrapper","data-is-root-path":l},n.createElement(c,{title:a}),n.createElement("main",null,r),n.createElement(o,null))}},9357:function(e,t,a){var n=a(7294),r=a(1883);t.Z=e=>{var t,a,l;let{description:i,title:c,children:o}=e;const{site:m}=(0,r.useStaticQuery)("2841359383"),s=i||m.siteMetadata.description,u=null===(t=m.siteMetadata)||void 0===t?void 0:t.title;return n.createElement(n.Fragment,null,n.createElement("title",null,u?c+" | "+u:c),n.createElement("meta",{name:"description",content:s}),n.createElement("meta",{property:"og:title",content:c}),n.createElement("meta",{property:"og:description",content:s}),n.createElement("meta",{property:"og:type",content:"website"}),n.createElement("meta",{name:"twitter:card",content:"summary"}),n.createElement("meta",{name:"twitter:creator",content:(null===(a=m.siteMetadata)||void 0===a||null===(l=a.social)||void 0===l?void 0:l.twitter)||""}),n.createElement("meta",{name:"twitter:title",content:c}),n.createElement("meta",{name:"twitter:description",content:s}),n.createElement("meta",{name:"google-site-verification",content:"vMqBtqtAuaCt-E77Hy3kVwYFp3Ve9kaAMI1cBnYSfa4"}),n.createElement("link",{rel:"stylesheet",type:"text/css",href:"https://cdn.jsdelivr.net/gh/moonspam/NanumSquare@2.0/nanumsquare.css"}),o)}},2583:function(e,t,a){a.r(t),a.d(t,{Head:function(){return s},default:function(){return u}});var n=a(7294),r=a(1883);const l={jayoon:{name:"공자윤",team:"SK플래닛",description:"글쓰기를 좋아하는 프론트엔드 개발자입니다.",thumbnail:a.p+"static/jayoon-d5c764119394a065460a4c01aa4969a5.jpg"},cony:{name:"Cony",team:"SK플래닛",description:"공자윤의 부캐입니다"}};var i=a.p+"static/default-21b9d603b7b46df341112559c739afae.png";var c=e=>{let{author:t}=e;const{name:a,description:r,thumbnail:c,link:o}=function(e){const t=l[e.toLowerCase()];return t?{name:t.name+" ("+t.team+")",description:t.description,thumbnail:t.thumbnail||i,link:t.link||null}:{name:e,thumbnail:i}}(t);return n.createElement("div",{className:"bio"},n.createElement("img",{src:c,alt:"profile",className:"bio-avatar"}),t&&n.createElement("p",null,o?n.createElement("a",{href:o,target:"_blank",rel:"noreferrer"},n.createElement("strong",null,a)):n.createElement("strong",null,a),n.createElement("br",null),r))},o=a(387),m=a(9357);const s=e=>{let{data:{markdownRemark:t}}=e;return n.createElement(m.Z,{title:t.frontmatter.title,description:t.frontmatter.description||t.excerpt})};var u=e=>{var t;let{data:{previous:a,next:l,site:i,markdownRemark:m},location:s}=e;const u=(null===(t=i.siteMetadata)||void 0===t?void 0:t.title)||"Title";return n.createElement(o.Z,{location:s,title:u},n.createElement("article",{className:"blog-post",itemScope:!0,itemType:"http://schema.org/Article"},n.createElement("header",null,n.createElement("h2",{itemProp:"headline"},m.frontmatter.title),n.createElement("p",null,m.frontmatter.date)),n.createElement("section",{dangerouslySetInnerHTML:{__html:m.html},itemProp:"articleBody"}),n.createElement("hr",null),n.createElement("footer",null,n.createElement(c,{author:m.frontmatter.author}))),n.createElement("nav",{className:"blog-post-nav"},n.createElement("ul",{style:{display:"flex",flexWrap:"wrap",justifyContent:"space-between",listStyle:"none",padding:0}},n.createElement("li",null,a&&n.createElement(r.Link,{to:a.fields.slug,rel:"prev"},"← ",a.frontmatter.title)),n.createElement("li",null,l&&n.createElement(r.Link,{to:l.fields.slug,rel:"next"},l.frontmatter.title," →")))))}}}]);
//# sourceMappingURL=component---src-templates-blog-post-js-87491fbdd3646763201f.js.map