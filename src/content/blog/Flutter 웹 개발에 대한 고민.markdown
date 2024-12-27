---
layout: post
title:  "Flutter 에서 WEB을 추구하면 안되는걸까"
date:   2020-02-07 18:23:21 +0900
tags: 
    - Flutter
    - web
    - dart
categories: Flutter
color: rgb(114, 169, 207, 1)
cover: '../assets/flutterweb_blogtitle_crop.png'
published: true
---
Flutterl 를 이용해 웹페이지를 만들면서 배운점으 적어보았습니다.
<!-- more -->
# Flutter로 Web 개발을?!
![flutterweb_blogtitle](https://user-images.githubusercontent.com/29659112/74025568-97b95500-49e7-11ea-99d1-fb97821ee34d.png)

처음 Flutter 를 접한 건, Android와 IOS 개발을 한큐에!! 라는 문구에 끌려서였다.
그런데 얼마 전, Flutter로도 WEB프로젝트를 할수 있다는 재미있는 글을 읽었다.

Android와 IOS, 그리고 이젠 WEB까지 가능하다니!! 보면볼수록 팔색조같은 매력을 가진 Flutter인것 같다.
<center><img src='https://user-images.githubusercontent.com/29659112/74019308-c4b33b00-49da-11ea-8857-e01b25ff2766.png'>
오옷!!</center>
<br>
오늘 포스팅에서는 **Flutter 로 WEB개발을 추구하면 안될까?** 라는 주제로 간단한 프로젝트 생성하는 방법에 대해 적는다.

<br>

## Flutter 준비
Flutter for WEB는 Flutter 버전 1.12 릴리즈부터 DEV 채널에서 BETA 채널로 옮겨졌다. 물론 아직까지는 BETA라서 불안정하거나 다듬어야 할 부분도 꽤 많지만, 그래도 DEV 에 있었을때 보다는 훨씬 많이 나아졌다. ([링크](https://medium.com/flutter/web-support-for-flutter-goes-beta-35b64a1217c0))
<br>

### Flutter 프레임워크 업데이트

먼저 Flutter를 이용해 WEB개발을 시작하기 위해서 기존의 Flutter 환경에서 BETA 채널로 업데이트가필요하다.
Master 채널에서도 가능하다고 하지만 공식문서에서에서는 Framework 를 Beta로 업데이트할것을 권장하고 있다.

글을쓰는 시점인 2020년 2월 현재, Beta채널은 1.14.6 버전까지 배포되어있다.


```sh
flutter channel beta
flutter upgrade
```

### web 개발기능 활성화
 
 ```sh
 flutter config --enable-web
 ```
 web support 를 활성화하면, `flutter-doctor -v` 명령어를 수행했을때 기존 Android Device 를 찾던것과 달리 Chrome 브라우저를 검출하게 된다.

 아래는 내 개발환경에서 `flutter doctor -v` 명령어를 수행했을때의 출력결과이다.
 
 ```sh
 D:\DEV>flutter doctor -v
[√] Flutter (Channel beta, v1.14.6, on Microsoft Windows [Version 10.0.18363.628], locale ko-KR)
    • Flutter version 1.14.6 at C:\src\flutter
    • Framework revision fabeb2a16f (9 days ago), 2020-01-28 07:56:51 -0800
    • Engine revision c4229bfbba
    • Dart version 2.8.0 (build 2.8.0-dev.5.0 fc3af737c7)

[√] Android toolchain - develop for Android devices (Android SDK version 29.0.2)
    • Android SDK at C:\Users\kygha\AppData\Local\Android\sdk
    • Android NDK location not configured (optional; useful for native profiling support)
    • Platform android-29, build-tools 29.0.2
    • Java binary at: C:\Program Files\Android\Android Studio\jre\bin\java
    • Java version OpenJDK Runtime Environment (build 1.8.0_202-release-1483-b03)
    • All Android licenses accepted.

[√] Chrome - develop for the web
    • Chrome at C:\Program Files (x86)\Google\Chrome\Application\chrome.exe

[√] Android Studio (version 3.5)
    • Android Studio at C:\Program Files\Android\Android Studio
    • Flutter plugin version 43.0.1
    • Dart plugin version 191.8593
    • Java version OpenJDK Runtime Environment (build 1.8.0_202-release-1483-b03)

[√] IntelliJ IDEA Ultimate Edition (version 2019.3)
    • IntelliJ at C:\Program Files\JetBrains\IntelliJ IDEA 2019.2.2
    • Flutter plugin version 43.0.3
    • Dart plugin version 193.6015.53

[√] VS Code (version 1.41.1)
    • VS Code at C:\Users\kygha\AppData\Local\Programs\Microsoft VS Code
    • Flutter extension version 3.8.0

[√] Connected device (2 available)
    • Chrome     • chrome     • web-javascript • Google Chrome 79.0.3945.130
    • Web Server • web-server • web-javascript • Flutter Tools

• No issues found!
```

## 프로젝트 생성
프로젝트 생성은 기존 Flutter 프로젝트를 만들던 것과 다르지 않다.
```sh
flutter create Flutter_web
```
를 터미널에서 임력하거나,
IntelliJ 같은 IDE를 사용한다면
![project](https://user-images.githubusercontent.com/29659112/74022068-2033f780-49e0-11ea-8404-10665209136d.png)

이런 과정을 거칠 것이다.
Android 프로젝트같이 생겼지만 지금은 신경쓰지 않아도 된다.

프로젝트를 생성하고나면, 다음과 같은 구조가 만들어진다.

![project structure](https://user-images.githubusercontent.com/29659112/74022146-48235b00-49e0-11ea-9e59-0b37094e23da.png)

기존 앱을 만들때의 Flutter 구조와 다른점이라면 `web` 폴더가 생성되어있다. 그리고 IntellJ 기준, **RUN** 옵션에서 Target 을 지정하는 부분에 Chrome 을 선택할 수 있다.

![image](https://user-images.githubusercontent.com/29659112/74022842-bcaac980-49e1-11ea-956f-9dfd8cb2875f.png)

## 프로젝트 빌드

위 사진처럼 Target Device를 WEB SERVER로 맞추고, 실행하면 자동으로 Flutter Framework 에서 컴파일을 거쳐 웹 브라우져로 실행시켜준다.

터미널에서 직접 실행시킬때는
```sh
 flutter run -d chrome
```
로 실행시킬 수 있다.

기존의 Flutter 앱 만들때와 같이 Hot reload 를 지원하기 때문에 IntelliJ 의 경우 `Ctrl + S` 를 누르면 자동으로 페이지가 Hot Reload 된다.

터미널에서 실행시켤 경우 키보드 `r` 을 입력하면 자동으로 Hot reload 가 되며, `Shift + R` 을 누를 경우 Hot restart 가 된다.

최종적으로 프로젝트를 빌드할 때는 
```sh
flutter build web
또는
flutter run --release
```

명령어로 릴리즈빌드를 생성할 수 있다.

### 프로젝트 예시
그 후 개발은 기존 앱개발 할때와 마찬가지로 할 수 있다.
다만 WEB 에서 지원하지 않는 부분들이 종종 있으니 확인해가면서 모듈을 이용할 필요가 있다.

![image](https://user-images.githubusercontent.com/29659112/74023175-5a05fd80-49e2-11ea-81d2-2080572e65c8.png)

다른 솜씨좋은 개발자들의 Flutter WEB 프로젝트 예시는 아래 링크에서 확인할 수 있다.

[Flutter Web samples](https://flutter.github.io/samples/#/)

<br>
<br>
<br>

#### 참고한 사이트
[Web support for Flutter](https://flutter.dev/web)<br>
[Web support for Flutter goes beta](https://medium.com/flutter/web-support-for-flutter-goes-beta-35b64a1217c0)