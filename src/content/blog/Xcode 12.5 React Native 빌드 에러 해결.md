---
pubDatetime: 2021-05-06T03:09:11Z
title: Xcode 12.5에서 React Native 빌드에러 해결하기
slug: fix-react-native-build-error-in-xcode-12-5
featured: true
draft: false
tags:
    - React Native
    - Xcode
    - iOS
description:
  Xcode 12.5 로 업데이트 되면서 발생한 React Native 빌드 에러를 해결하는 방법에 대해서 알아봅니다.
---

# ⚾️ Xcode 12.5 가 쏘아올린 작은(?) 공
Mac OS 11.3.1(20E241) 업데이트와 함께 Xcode 12.5 와 Xcode Command Line Tools 버전도 같이 배포되었습니다. 하지만, Swift 컴파일러의 내부적인 설정이 바뀌었는지 기존의 모든 React Native 프로젝트들이 빌드가 실패하는 현상이 발생하기 시작했습니다.

사실 이 문제는 Xcode 12.5 Beta3가 나왔을 때 부터 이슈가 열려있었는데요, 딱히 뽀족한 해결책을 찾지 못하고 시간만 흐르다가, 결국 정식 릴리즈 이후에 뻥 터져버린 케이스가 되겠습니다.

[😵‍💫 New RN project will not build on Xcode 12.5 Beta 3/#31179
](https://github.com/facebook/react-native/issues/31179)


# 🤦🏼‍♂️ 어떤 문제가 생기나요?
## 1. Flipper 관련 빌드에러
![image](https://user-images.githubusercontent.com/29659112/117192573-dc1ae700-ae1c-11eb-8894-29613f57d262.png)

일단 가장 큰 원인은 **Flipper** 때문에 발생합니다.

Flipper 는 Facebook 에서 개발한 디버딩 도구인데요, 매우 Native 코드에 종속적인 기능이라 빌드과정에서도 상당히 오랜 시간을 잡아먹는 녀석입니다. 기존의 Creact-React-Native 를 이용해 만들어진 대부분의 프로젝트들이 사용하는 Flipper 를 빌드하는 과정에서 새롭게 바뀐 Swift 컴파일러에서 빌드에러를 유발하는것이 이번 이슈의 가장 큰 원인입니다.

정확히는 Flipper 소스코드 중 `atomic_wait_until is unavailable` 를 이용하는 부분에서 에러가 발생합니다.

👻 [Flipper 레포 이슈](https://github.com/facebook/flipper/issues/2215)


## 2. FBSDK 빌드에러
Flipper 라는 산을 넘었어도, 혹시 빌드에 실패하셨나요?
제 경우에는 **Facebook SDK** 에서 빌드가 실패했습니다. fbsdk-share-kit 및 fbsdk-loginkit 관련해서 빌드 에러가 발생하였습니다.

## 3. Swift Compiler 오류
![image](https://user-images.githubusercontent.com/29659112/117192358-98c07880-ae1c-11eb-8051-ddfebbfdac8e.png)


## 4. 기타 잡다한 모듈들 ld 에러(Linking error)
으악! 컴파일러의 망령이 내 퇴근을 막는다!! 👻👻👻

# 🍹 어떻게 해결하나요?

## 1. Flipper 버전업
   
🍒 [Xcode 12.5 troubleshooting guide (RN 0.62/0.63/0.64)/ #31480](https://github.com/facebook/react-native/issues/31480)

다행히 Xcode 12.5 릴리즈 일주일만에 해결책이 나왔습니다.


잠깐! 현재 프로젝트에서 사용중인 React Native 의 버전을 꼭 확인하고, 해당 버전에 맞는 솔루션을 사용하세요.

### RN 0.62
Podfile의 `useFlipper!` 항목에 다음 내용을 추가합니다.
`use_flipper!('Flipper' => '0.75.1', 'Flipper-Folly' => '2.5.3', 'Flipper-RSocket' => '1.3.1')`

그리고, 프로젝트 루트의 package.json 에서 React Native 버전을 올려주세요
`"react-native": "0.62.3"`

### RN 0.63
Podfile의 `useFlipper!` 항목에 아래 내용만 추가해주면 됩니다.
`use_flipper!('Flipper' => '0.75.1', 'Flipper-Folly' => '2.5.3', 'Flipper-RSocket' => '1.3.1')`

필요에 따라서 기존에 남은 Podfile 관련 캐시 및 RN캐시, Pods 폴더를 모두 지우고 다시 인스톨 하는 등의 과정이 필요할 수도 있습니다.

### RN 0.64
Podfile.lock 에 정의되어있는 Flipper 버전이 0.75보다 높은지, Flipper-polly 버전이 2.5.3보다 높은지 확인합니다. 만약 그렇지 않다면 Podfile 에 다음 내용을 추가해주세요.

`use_flipper!('Flipper' => '0.75.1', 'Flipper-Folly' => '2.5.3', 'Flipper-RSocket' => '1.3.1')`

그리고 프로젝트 루트에 있는 package.json에서 RN 버전을 다음과 같이 올려주세요.
`"react-native": "0.64.1"`


## 2. React-Native-FBSDK-next 로 교체
   
react-native-fbsdk 패키지를 열어보면, 해당 패키지에서 사용하는 네이티브 코어 sdk 버전이 7.0 버전입니다. 현재 FBSDK 최신버전은 9.2 까지 올라와 있는 상황입니다.

안타깝게도 현재 Facebook 측에서는 React Native SDK 에 대한 지원을 중단함을 바로 얼마 전에 선언했습니다.


🧊 [React Native Facebook SDK Git](https://github.com/facebookarchive/react-native-fbsdk)
🧊 [Facebook Blog Post](https://developers.facebook.com/blog/post/2021/01/19/introducing-facebook-platform-sdk-version-9/)

대신 커뮤니티에서 [react-native-fbsdk-next](https://www.npmjs.com/package/react-native-fbsdk-next) 라는 모듈을 이어받아서 계속해가고 있습니다. 이 모듈을 이용하면 최신 SDK 인 9.x 버전을 이용할 수 있습니다.

모든 JS/TS 메소드는 동일합니다. 패키지만 교체하고, pod install 해주면 기존 소스코드 변경없이 이용 가능합니다.


## 3. 시스템 껐다가 켜기

놀랍게도, 이게 왜 되는지 모르겠지만, Swift Compiler 에러는 이걸로 해결이 된다고 합니다.

모든 터미널을 끄고, 에뮬레이터를 끄고, Xcode 도 끄고, 마지막으로 시스템도 껐다가 다시 켜줍니다.

아이고 세상에나..

🍭 [Build Fail on iOS](https://www.notion.so/XCode-12-5-53b6447a6f4a4908b20944bce50974cf#13407c0c4226438fbc523b8b48a21de3)


## 4. LD 에러해결
Xcode 12 버전에 들어오면서 발생한 이슈입니다.
일부 패키지에서 React pod을 참조하는것이 원인입니다.

🤷🏼 [Build failed on XCode 12 beta4](https://github.com/facebook/react-native/issues/29633#issuecomment-694187116)

node_modules 폴더를 열어서 해당 패키지를 찾아들어간 뒤, `*.podspec` 확장자를 가진 파일을 열어줍니다.

그 중, s.dependency 라인에 있는 `React` 디펜던시를 `React-Core` 로 수정해줍니다.

예를들어서, 아래는 제가 사용중인 lottie-react-native 모듈의 Podspec 파일입니다. 해당 패키지는 최신버전인 4.x버전에서 이미 패치가 되었습니다만, 제가 사용중인 버전은 3.5.x 버전이라 패치가 수동으로 필요합니다.

```podspec
require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = "lottie-react-native"
  s.version      = package['version']
  s.summary      = "Lottie component for React Native (iOS and Android)"

  s.authors      = { "intelligibabble" => "leland.m.richardson@gmail.com" }
  s.homepage     = "https://github.com/airbnb/lottie-react-native#readme"
  s.license      = package['license']
  s.platform     = :ios, "9.0"

  s.source       = { :git => "https://github.com/react-community/lottie-react-native.git", :tag => "v#{s.version}" }
  s.source_files  = "src/ios/**/*.{h,m,swift}"
  s.swift_version = "5.0"
  - s.dependency 'React'        <-- 이 라인을
  + s.dependency 'React-Core'   <-- 이렇게 고쳐주세요
  s.dependency 'lottie-ios', '~> 3.1.8'
end

```
저명한 패키지들은 진작에 패치가 이루어 졌습니다만, 개발자가 손을 때었거나, 활발하게 사용되지 않는 패키지들은 새 버전 릴리즈까지 기다릴 수 없으니 patch-package 를 이용하여 덕테이프를 발라줍시다.



# 🗝 이도저도 안된다면...
위 방법으로도 해결이 안되거나 할 수 없는 상황이라면 Xcode 를 다운그레이드 하는 방법만이 남았습니다.

[Apple Download Center](https://developer.apple.com/download/more/) 에 개발자 계정으로 로그인 한 뒤, Xcode 14.4.xip 파일을 다운로드 해줍니다.

그 후, 압축 유틸리티를 이용해 풀어준 뒤, Applications 폴더에 던져주면 해결!



## 번외 - Xcode 동시에 돌려쓰기
그러나, 언제까지나 오래된 에디터 및 컴파일러로 개발 할 수는 없습니다.
상황에 맞게 디버깅하고, 새 도구를 테스트 해야하는데, 몇십기가나 되는 Xcode를 매번 지웠다 다시 까는것도 번거로운 일입니다.

다행히도, 바로 xcode-select 도구를 이용하면 Xcode 를 버전별로 여러개 설치해서 사용할 수 있습니다.


먼저 이전에 다운로드해둔 Xcode.xip파일의 압출을 풀어서 나온 app 파일의 이름을 바꿔줍니다. 제 경우에는 `Xcode-12.4.app` 로 했습니다.

그 뒤, 똑같이 Applications 폴더에 던져줍니다.

마지막으로 터미널을 열어서 아래 명령어를 실행시켜줍니다.
`sudo xcode-select -s /Applications/[바꾼 Xcode 이름].app/Contents/Developer`

현재 활성화된 버전을 확인하려면 
`xcode-select -p`로 확인할 수 있습니다. 
![image](https://user-images.githubusercontent.com/29659112/117195644-7af51280-ae20-11eb-92f4-2514a791f984.png)


또는, RN 빌드에 사용되는 명령어인 xcodebuild 의 버전으로도 확인할 수 있습니다.
`xcodebuild -v`
![image](https://user-images.githubusercontent.com/29659112/117195705-8fd1a600-ae20-11eb-9999-6401f41c5e34.png)
