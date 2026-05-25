---
pubDatetime: 2020-04-15T11:28:46Z
title: Vue로 만든 페이지 Github에 배포하기
slug: deploy-vuejs-spa-to-github-pages
featured: true
draft: false
tags:
  - Vue
  - HEXO
  - Github Pages
description: vue-cli를 이용해 제작된 정적 페이지를 Github Pages에 배포하는 방법에 대해 알아봅니다.
---

# Vue.js로 정적 페이지 배포하기

Vue.js 를 이용해 간단한 페이지를 만들고 Github 블로그에 배포했더니 하얀 화면만 뜨는 현상을 경험하신적이 있을 겁니다.
제 경우 간단한 포트폴리오 사이트를 제작해 github 블로그의 `/portfolio` 경로에 올려두었는데요, 로컬에선 문제없이 뜨지만 웹에 올렸더니 화면이 안나오는 증상에 대해 삽질한 경험을 공유합니다.

## vue.config.js 생성(@vue/cli > 3.0.0)

제 vue 프로젝트는 vue-cli를 이용해 생성했습니다.
vue-cli 3.0 버전 이상일 경우 프로젝트 root에 빌드 환경설정을 담은 `vue.config.js`를 만들어 주어야 합니다. 제가 사용하고 있는 vue-cli 버전은 현재 4.3.1 이며 4.X 버전도 동일합니다.

`vue.config.js`의 내용은 다음과 같이 넣어주시면 됩니다.

{% codeblock vue.config.js lang:javascript %}
module.exports = {
publicPath: process.env.NODE_ENV === 'production'
? '/여기에-원하는-경로명-입력/'
: '/'
}
{% endcodeblock %}

위 내용의 경우

> _production 모드로 빌드할 경우 `(yarn build)` publicPath를 `여기에-원하는-경로명-입력` 값으로 하며, 그렇지 않을경우`(yarn start)`publicPath를 `/` 로 한다_
> 라는 의미입니다. 만약 로컬에서 실행할때도 해당 경로값을 입력해서 접근하고 싶다면(주소에 `/` 로 접근하는게 아닌 `localhost:8080/my-page` 와 같이) 다음과 같이 조건문을 없애주면 됩니다.

{% codeblock vue.config.js lang:javascript %}
module.exports = {
publicPath: '/portfolio'
}
{% endcodeblock %}

## 빌드

이제 우리가 할 일은 끝났습니다. 평소에 하듯이 페이지를 빌드해 줍니다. (`yarn build`)
마찬가지로 빌드 결과물은 `/dist` 안에서 찾으실 수 있습니다.

## 배포

### Github Pages

일반적인 Github Pages 를 사용하시는 경우 프로젝트 루트에 dist 폴더 내용물을 그대로 복사해 `vue.config.js`에서 입력한 경로와 같은 이름을 가진 폴더를 만들고 그 안에 모두 붙여넣어 줍니다.

예를들어, 위에서 `/portfolio` 라고 설정하고 빌드했으니 Github Pages 프로젝트에 `portfolio` 라는 폴더를 만들고 그 안에 빌드 산출물을 모두 넣어주면 됩니다.

이후 커밋-푸시 를 해주면 배포가 완료됩니다.

참 쉽죠?

### HEXO

저와 같이 별도의 블로그 엔진을 사용하시는 경우입니다. 저는 HEXO를 사용중인데요, 일반 Github Pages 와 크게 다르지 않습니다.
HEXO에서 페이지 생성하는 기준이 되는 폴더는 `soruces` 입니다. 말 그대로 이 폴더의 소스들을 이용해 `hexo generate` 명령어를 내리면 `/public` 폴더에 정적인 html 파일로 만들어서 뽑아주고, `hexo deploy`를 했을때 이 폴더의 내용물들을 배포하는것이죠.
이번에는 Vue로 빌드된 파일들에 대해서 다루지만 기타 자신이 배포하고싶은 정적 파일들을 여기에다 넣어두면 모두 동일하게 빌드되서 배포됩니다.

먼저 HEXO 블로그용 레포의 `/sources` 폴더안에 vue 환경설정에서 입력했던 값과 같은 이름의 폴더를 만들어 줍니다.
그 다음 동일하게 vue 에서 빌드된 `/dist` 폴더의 산출물들을 방금 만든 폴더로 복사해줍니다.

```
D:\DEV\hexo-blog.io\SOURCE
├─all-categories
├─all-tags
├─portfolio                     // 새로만든 폴더
│  ├─css                        //
│  ├─img                        // 빌드
│  ├─js                         // 산출물들
│  ├─index.html                 //
│  ├─favicon.ico                //
│  └─site.webmanifest           //
└─_posts
    └─2020-04-04-Awesome_post
```

이제 HEXO블로그를 배포할때와 동일하게 `hexo generate` 명령어를 통해 `public` 폴더에 파일들을 새로 생성해주고, `hexo deploy` 명령어로 배포해주면 끝.

참 쉽죠?

### 번외편 - 응용

Source 폴더에 다른 배포하고싶은 정적 파일을 넣어두고 배포하면 `~.github.io/'파일명이나 폴더명'` 으로 접근할수 있습니다.
이전 포스트에서 Flutter 로 만들었던 제 소개페이지 역시 빌드 결과물을 `/profile` 폴더에 넣고 hexo 블로그로 만들어 올린것입니다.

### 결과물

1. CV : [https://zerogyun.dev/portfolio](https://zerogyun.dev/portfolio)
2. profile : [https://zerogyun.dev/profile](https://zerogyun.dev/profile)

참고한 사이트

- [https://cli.vuejs.org/guide/deployment.html#github-pages](https://cli.vuejs.org/guide/deployment.html#github-pages)
