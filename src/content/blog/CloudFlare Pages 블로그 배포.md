---
pubDatetime: 2021-11-15T02:11:25Z
title: CloudFlare Pages로 블로그 배포하기
slug: deploy-with-cloudflare-pages
featured: true
draft: false
tags:
  - Hexo
  - CloudFlare Pages
  - Github Blog
description:
  Github Pages로 배포중이던 Hexo 블로그를 CloudFlare Pages로 이전해봅시다.
---

## 1. CloudFlare Pages
작년 말 클라우드플레어 사에서 발표한 웹사이트 배포 플랫폼입니다. 비슷한 서비스로 Vercel, GatsbyCloud, Netlify 등이 있습니다.

[공식 블로그](https://blog.cloudflare.com/cloudflare-pages/)와 [홈페이지](https://www.cloudflare.com/products/cloudflare-pages/)에서는 ***the best way to build JAMstack websites*** 라고 소개하고 있습니다.

업계에서는 후발주자라서 그런지 무료티어에서 사용할 수 있는 Capasity가 꽤 넉넉한편이고, 사용자 유입분석과 Cloudflare Access를 통한 접근권한 관리도 사용할 수 있습니다.
![image](https://user-images.githubusercontent.com/29659112/142735110-e390a7ec-4cd5-411b-86a7-2fa7587cad49.png)


## 2. 배경
기존에 사용중이던 블로그는 Hexo 기반의 블로그로 GithubPages에서 배포되고 있었습니다.

소스코드를 가지고 있는 레포 1개와 해당 소스를 통해 Hexo 빌드 결과물을 GithubPages 로 띄우는 레포 1개로, 총 2개의 레포를 이용해야서 운영중이었습니다.
개발자는 첫번째 소스코드가 있는 레포에만 신경쓰면 두번째 배포용 블로그는 거의 신경 쓸 일이 없긴 하지만, 매번 새 글으 발행할 때 마다 두번씩 소스코드를 커밋/푸시 해주는일은 꽤 귀찮은 일이었습니다. Github Actions 를 이용해 자동화하여 해결하는 방법도 있었지만 근본적으로 두개의 레포를 띄우는것 자체가 썩 마음에 드는 구조는 아니었죠.


CloudFlare Pages에 배포하게 되면서 이런 고민을 해결할 수있게 되었습니다.
Actios에서 트리거되는 Github 서드파티 앱을 레포지토리에 연동해두기만 하면 알아서 웹훅 발생시 소스코드를 가져가 빌드 및 배포를 CloudFlare 네트워크에 띄워주므로 한개의 레포만으로 관리할 수 있게 됩니다. 또한 깃헙 앱을 통해 자동배포 프로세스가 구축되기 때문에 복잡한 hexo 커맨드를 매번 실행시키지 않아도 사전설정값으로 알아서 배포해줍니다.

또한 부수적인 장점으로 배포된 서비스는 CloudFlare 네트워크에 올라가기때문에 Github Actions 보다는 상대적으로 더 나은 네트워크 환경을 기대할 수 있을 것입니다.

## 배포
배포 절차는 간단합니다. 기존 소스코드를 빌드할 타겟 레포를 연동하고, 빌드에 사용될 커맨드를 사전정의 해 두면 모든 작업이 완료됩니다.
별도로 클라우드플레어 DNS 에서 관리중인 도메인이 있다면 손쉽게 연동할 수도 있습니다.


### 빌드 설정

![image](https://user-images.githubusercontent.com/29659112/142735502-833290f6-23a1-4976-9a23-f790f4736e52.png)

이 블로그를 빌드하는데 사용된 설정값입니다.
#### Preset
다양한 프리셋을 지원해서 미리 지정된 설정을 그대로 사용할 수도 있습니다. CRA, Next, Gatsby, Nuxt, Hugo, React, Vue, Svetle 등등 굉장히 다양한 프레임워크를 지원합니다.

제 블로그는 Hexo인데 따로 프리셋이 존재하지 않아서 `None` 옵션으로 그대로 두었습니다.

#### Build Command
실제로 빌드에 사용될 커맨드를 입력합니다.
제 경우 Hexo 블로그 형태에 Tranquilpeak 테마를 themes 폴더에 추가하여 사용하고 있습니다.
이 테마의 경우 첫 빌드시 직접 해당 디렉토리 내에서 build 과정을 별도로 수행해줘야 합니다. 다소 복잡하지만 일련의 과정을 터미널에서 입력하듯 그대로 넣어줍니다.
추가로 수행해야 할 커맨드가 많고 복잡하다면 sh 스크립트로 뽑아내는것도 좋은 방법일 것입니다.

제 블로그를 빌드하는데 사용한 커맨드는 아래와 같습니다.
```sh
cd themes/tranquilpeak && npm install && npm run build && cd ../../ && yarn build
```

#### Build Output Directory
빌드 결과로 나온 정적 파일들이 보관되는 디렉토리를 지정합니다. 해당 소스들을 CloudFlare Pages 서버로 디플로이하게 됩니다.
`dist`, `lib`, `build` 등등 본인 환경에 맞게 지정해주시면 됩니다.

#### 환경변수
빌드시에 사용될 토큰과 같은 환경변수들은 따로 입력할 수 있습니다. 특히 CloudFlare Pages는 빌드 환경을 시스템 환경변수로 따로 선언해두면 사용자가 직접 프레임워크 환경을 커스터마이징 할 수 있습니다.

제 블로그의 경우 별 문제없이 빌드되었지만, 다른 프로젝트를 빌드해봤더니 Node.JS 버전이 낮아서 에러가 나는 경우도 있었습니다.

아래는 기본 설정입니다.
[https://developers.cloudflare.com/pages/platform/build-configuration#language-support-and-tools](https://developers.cloudflare.com/pages/platform/build-configuration#language-support-and-tools)

해당 프로젝트의 경우 Node.JS 버전 최솟값인 14버전 LTS인 Fermium 으로 설정되어있었는데 빌드환경에서는 12.18.0을 사용하고 있어서 발생하는 문제였습니다.
이 경우 환경변수에 `NODE_VERSION` 키로 원하는 값을 추가해 주면 됩니다.


#### Automatically Add build comments on PR
이 옵션을 활성화하면 PR이 열릴 경우 해당 브랜치의 소스로 자동으로 빌드한 뒤 PR에 프리뷰 링크를 댓글로 알려줍니다. 버셀과 비슷하군요!


### 도메인 연결
프리뷰 페이지는 기본적으로 CloudFlare 에서 관리하는 랜덤 도메인이 부여됩니다.
만약 개인이 직접 소유한 도메인이 있다면 손쉽게 연동할수 있습니다.

여기서는 CloudFlare DNS에 등록되어있는 도메인을 기준을 설명합니다.

절차도 간단합니다.
먼저 가지고 있는 도메인을 입력하면 자동으로 CloudFlare Domains 에 등록된 본인 도메인정보를 불러옵니다.
![KakaoTalk_20211115_011328949](https://user-images.githubusercontent.com/29659112/142736126-dfa50e98-42ed-4921-90a4-0579681aaff4.png)

그 후, DNS 레코드에 해당 값들이 추가될 것임을 알려줍니다. 특별히 여기서 수행해야 할 적업은 없습니다.
![KakaoTalk_20211115_011329131](https://user-images.githubusercontent.com/29659112/142736156-2752bb7e-57ea-4fa5-8594-3f423d25ab3d.png)


Active 버튼을 눌러주고 DNS 레코드가 네트워크에 정상적으로 올라갈 때 까지 기다려 주면(약 2~3분) 활성 상태로 바뀐것을 확인할 수 있습니다.
![KakaoTalk_20211115_011329222](https://user-images.githubusercontent.com/29659112/142736195-1f9512ec-7610-4ca0-9c3d-a2afc62a572d.png)



## 결과
![image](https://user-images.githubusercontent.com/29659112/142737233-91fb0636-9e8f-4aac-bd7b-68b44e0943e3.png)

현재 이 블로그를 개발자도구에서 열어보면 CloudFlare에서 제공하는 응답헤더들을 볼 수 있습니다.
응답 서버가 `cloudflare`이며, 최신 압축 알고리즘인 `brotli` 로 인코딩되어있고, [`CF-RAY` 헤더](https://developers.cloudflare.com/fundamentals/get-started/http-request-headers) 중 `KIX`가 있는걸로 보아 일본 오사카 리전에서 서빙되고 있는것을 알 수 있습니다.(클라우드 플레어는 각 리전의 네이밍을 공항식별코드(IATA)로 사용하고 있습니다. KIX는 오사카 간사이 공항의 IATA 코드입니다) 


메인페이지 로드과정에서 그려진 워터폴을 보면 무난해보입니다. 체감적으로도 gh-pages 에서 서빙할 때 보다 훨씬 빨라진것 같습니다.
~~나눔고딕라운드 웹폰트로 전환해야하는데...~~
![image](https://user-images.githubusercontent.com/29659112/142737198-b0d1c173-ead3-4e97-9237-387b6689ff87.png)



기존에 사용하던 디플로이용 레포는 덕분에 아카이빙 해두고 더이상 사용하지 않도록 했습니다.
![image](https://user-images.githubusercontent.com/29659112/142737314-da3e006c-0cdb-499e-a9dd-21e4b037582a.png)


## 기타 후기

![image](https://user-images.githubusercontent.com/29659112/142737393-b4515390-8be1-4152-b42a-0be3e74af104.png)

### 장점
* 저렴한 가격. 적어도 개인 블로그 운영하는데 있어서는 충분한 티어.
* 클라우드플레어의 빵빵한 네트워크를 그대로 쓸 수 있다
* AccessPolicy 설정이 가능하다. 메일주소 기반 인증 및 도메인 기반 인증도 지원해서 사내 메일 도메인으로 접근제한을 걸 수도 있다. 다만 이것도 규모가 커지면 별도 요금이니 주의해야할 듯.
* Web Analytics도 자체적으로 지원한다. 버튼한번 클릭으로 활성화 가능. 다만, Google Analytics 를 기대하진 말자.


### 단점
* 한달에 빌드 500번이면 프로젝트 단위에서는 생각보다 많은 캐파는 아니다. 초반에 환경설정하면서 네다섯번 날리고 매번 푸시마다 일일히 빌드하면 500은 순삭이다. 
* Vercel에 비해서 빌드 속도가 느리다. 이 블로그 기준으로 빌드에 약 3분~4분 정도 소요된다.
