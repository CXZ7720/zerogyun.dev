---
layout: post
title:  "Flutter 웹 개발 후기"
date:   2020-02-26 18:23:21 +0900
tags: 
   - Flutter
   - web
   - dart
categories: Flutter
color: rgb(114, 169, 207, 1)
thumbnail: true
published: true
---
Flutter 로 web 개발을 추구하면 안되는걸까? 포스팅에 이어 적는 개발후기 입니다.
<!-- more -->
# Flutter로 Web 개발을 추구해 보았습니다.

* [이전글 : Flutter에서 web을 추구하면 안되는걸까](https://zerogyun.dev/flutter/2020/02/07/Flutter에서-web을-추구하면-안되는걸까.html)

## 개발환경
제가 Flutter를 사용한 환경은 다음과 같습니다.

* OS : Windows 10 x64 1903
* Flutter version : Channel beta, v1.14.6
* Dart version : 2.8.0
* IDE : IntelliJ IDEA Ultimate Edition(v2019.3) / Flutter Plugin v43.0.3 / Dart Plugin version 193.6015.53
* Browser : Google Chrome 79.0.3945.130

## 결과물 미리보기
먼저 Flutter 로 만들어진 간단한 정적 웹 페이지 입니다.
제 소개 페이지를 간단하게 만들어 보았는데요, 아래 링크로 접속해서 확인하실 수 있습니다.

* [zerogyun's portfolio](https://zerogyun.dev/portfolio)
* [Source Code](https://github.com/CXZ7720/Portfolio_flutter)

<br><br>
여기부터는 주관적인 소감 위주의 내용 입니다.

## Flutter 웹개발의 좋았던점
#### 1. Widget 구조 덕분에 레이아웃 그리기가 쉬웠습니다.
   프론트엔드 개발도 몇번 해보았지만 안드로이드에서 하듯이 위젯만 잘 배치해주면 생각보다 쉽게 구조가 완성됩니다. 제 생각에는 이게 가장 큰 메리트가 아닐까 싶습니다.

#### 2. 이것은 앱인가 웹인가
위아래로 긴 페이지를 스크롤 할때 보면 드래그 액션을 사용할 수 있습니다. 마치 우리가 안드로이드에서 그렇듯이요. 이걸 장점에 넣은 이유는 새로운 사용자 경험을 줄 수 있다고 생각 *(이라고 적고 포장 이라고 읽는다..)* 해서 였습니다. 하지만 이것 때문에 발생하는 문제도 있는데 이건 단점에서 적도록 하겠습니다.



## Flutter 웹개발의 불편한점
### 베타는 아직 베타..
가장 큰 문제입니다. 이 글이 작성되는 2020년 2월 기준, Flutter 로 웹개발 기능을 활성화 하기 위해서는 beta 채널을 이용할것을 **공식문서가 권장하고 있습니다.**

사실 Flutter 자체가 나온지 얼마 안되어서 Github 레포를 들어가보면 매일같이 쏟아지는 무수한 이슈의 요청을 확인하실 수 있는데요, 그만큼 자잘한 버그가 굉장히 많습니다.

아래는 제가 경험한 대표적인 몇가지 이슈입니다.
#### 이미지 삽입을 위해서는 `Images.network`를 이용해야 합니다.
일반적으로 이미지 삽입을 위해서 이용하던 `Images.asset` 위젯을 사용할 수 없습니다.
해당 위젯 사용시 `pubspec.yaml`에 지정된 경로를 찾지 못하고 404 에러를 발생시킵니다.
현재 Flutter WEB 에서 로컬 에셋 이미지를 불러오기 위해서는 WWW폴더 하위에 이미지를 놓고, `Images.network` 나 `NetworkImage` 같은 위젯을 이용해야만 정상적으로 이미지가 로드됩니다.

해당 부분은 이슈로 등록해두었습니다. [issue#50349](https://github.com/flutter/flutter/issues/50349), [issue#43966](https://github.com/flutter/flutter/issues/43966)

#### 날카로운 폰트 렌더링
이건 제 주관적인 느낌입니다만, 보편적인 웹 페이지와 달리 Flutter 로 만들어진 페이지의 웹 폰트 렌더링이 조금 더 다듬어지지 못하고, 날카로운 느낌입니다. 제가 사용한 폰트는 Google Fonts 의 Noto Sans KR, Spoqa Han Sans KR 입니다.
자세한건 아래 사진으로 확인해 보세요.
![image](https://user-images.githubusercontent.com/29659112/75315072-f9f9cd00-58a4-11ea-988f-7cf78c65dd32.png)

#### 브라우저마다 렌더링 되는 모양이 다릅니다.
일반적으로 Chrome을 이용해서 개발하시겠지만, Firefox만 해도 화면 렌더링이 달라져서 전체적으로 UI가 틀어집니다.
정확히 말하면 User Agent 쪽과 더욱 밀접한 관련이 있다고 할수 있습니다.
[이 링크](https://github.com/flutter/flutter/issues/50631#issuecomment-585931461) 를 보시면 Font Clipping 에 관련한 이슈인데, 확장프로그램을 이용해서 UserAgent를 바꿔주는 것 만으로도 어느정도해결이 가능한 현상이었습니다.
현재는 이슈로 등록되어 March 2020 마일스톤으로 지정되어 있는 상태입니다.
[issue#49946](https://github.com/flutter/flutter/issues/49946)


#### 스크롤 퍼포먼스가 매우 나쁩니다.
기본적으로 마우스 휠 스크롤이 굉장히 뚝뚝 끊깁니다. Chrome 개발자도구의 Performance Test 도구로 측정해 본 결과, 스크롤이벤트 발생시 프레임드랍이 굉장히 심한것을 알 수 있었습니다.
![image](https://user-images.githubusercontent.com/29659112/75317311-054ff700-58ab-11ea-9e20-793bf66cd6e0.png)


그나마 스크롤이 아닌 드래그를 할 경우에는 조금 낫습니다만, 이 역시 쾌적하지는 않습니다.
![image](https://user-images.githubusercontent.com/29659112/75316777-945c0f80-58a9-11ea-8f92-66f24f073683.png)

주변 지인들이 제 페이지를 처음 접속해서 느낀점이 스크롤이 굉장히 '구리다' 라고 평가할 정도로 스크롤 퍼포먼스가 좋지 않습니다.

제가 사용한 스크롤 방식은 Listview 를 사용했지만, SingleChildScrollView 를 사용했을때도 크게 나아지지는 않았습니다.



## 결론
Flutter 로 웹페이지를 제작해본건 상당히 재미있는 일이었습니다.
프론트엔드 작업은 주로 Vue.js를 이용해서 하고 있었는데 Flutter로 레이아웃을 직접 그려가며 해보니 Vue와는 또 다른 매력이 있었습니다.

하지만 개발 과정에서 여러 난관을 만나고, 공식문서보다는 Github Issue 페이지가 좀 더 도움이 되는걸 보니 아직은 역시 갈 길이 멀다고 느껴졌습니다.

그래도 뭔가 색다른 방향으로 웹개발을 해볼 수 있어서 의미있었던 프로젝트였습니다.