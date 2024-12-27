---
pubDatetime: 2021-07-15T15:11:25Z
title: React Native 버그픽스 3분완성 [코드푸시 맛] - 1
slug: react-native-codepush-1
featured: true
draft: false
tags:
  - React
  - React Native
  - CodePush
  - AppCenter
description:
  React Native 기반 앱의 변경사항을 앱스토어 심사 없이 CodePush 를 이용하여 빠르게 패치하는 방법에 대하여 알아봅니다.
---

# 앱스토어 심사를 제끼고 직접 핫픽스를 배포해보자

일반적으로 앱을 출시/업데이트 하기 위해서는 스토어에 등록하고, 메타데이터를 입력한 뒤 검수를 거쳐 출시 승인을 받는 일련의 과정이 필수적입니다. 이 과정은 짧으면 하루 이틀, 길면 일주일도 더 걸릴 수도 있습니다. 만약 중간에 누락되거나 미흡한 부분이 있다면 거절(Reject) 당하기 일쑤입니다.

만약 정해진 기간 내에 앱을 배포해야하는데 검수에서 탈락하여 시간이 빠듯해지거나, 일정이 지연된다면 엄청난 스트레스겠죠. 제가 있는 팀에서는 이러한 부담을 조금이나마 덜 수 있도록 MS AppCenter 의 Codepush 를 이용하여 핫픽스는 앱스토어 심사를 거치지 않고도 배포될 수 있도록 하고 있습니다.


지금부터 React Native에서 CodePush 를 어떻게 설정하고 활용하는지에 대하여 알아보겠습니다.

## 0. 알아두기
> 이 글은 React Native 0.63 기준에서 작성되었습니다.

<div style="display: flex; flex-direction: row; ">
<br />
<div style="flex: 1">

코드푸시로는 이런 걸 **할 수 있습니다**.
* 오타 수정하기
* 새 페이지 만들기
* 라우팅 수정하기
* 사진(이미지) 바꾸기
* `pod install` 을 하지 않는,
  네이티브 의존성을 가지지 않는 패키지의 추가
* 기타 등등 JS 영역 내 에서의 수정사항

</div>
<br />
<img src="https://user-images.githubusercontent.com/29659112/125738970-ff4b2062-c87b-4409-a279-c78e7ecca123.png" style="max-width: 350px; margin-top: 20px; margin-left: 10px" />

</div>

<div style="display: flex; flex-direction: row; margin-top: 50px ">
<br />
<div style="flex: 1">

코드푸시로는 이런 걸 **할 수 없습니다**.
* `pod install` 과 같은
  네이티브 의존성을 가지는 패키지의 추가
* 앱 아이콘 바꾸기
* 새 권한 추가하기
* Xcode 나 Android Studio를 열어서
  해줘야 하는 대부분의 변경사항들
* 다시말해, 네이티브 코드를 직접
수정해야 하는 부분들

</div>
<br />
<img src="https://user-images.githubusercontent.com/29659112/125740556-13649930-9e25-44f5-a0cd-4f53fb8a7990.png" style="max-width: 350px; margin-top: 20px; margin-left: 10px" />

</div>


코드푸시가 만능은 아닙니다.
그... 코드푸시가 좋긴 한데, 참 좋은데, 정말 좋은데, Microsoft의 AppCenter 서버가 종종 메롱해서 발등을 찍기도 합니다(경험담)


## 1. AppCenter 설정
먼저 Microsoft AppCenter 에 가입하여 계정을 생성해줍니다. 처음 로그인 하면 아래와 같이 앱을 추가하는 빈 화면이 보입니다. Add app 을 눌러 본인의 앱에 맞는 설정값을 넣어줍니다.
> 💡 안드로이드와 iOS 모두를 지원하는 앱이라면, 각각의 플랫폼에 맞는 두 개의 앱 프로젝트를 생성해야 합니다.

> 💡 React Native 이외에도 다양한 플랫폼과 다양한 프레임워크를 지원합니다.

<br />
<img width="1787" alt="appcenter 1" src="https://user-images.githubusercontent.com/29659112/125741042-e83d8f0e-adb3-44d6-b362-aecac5fb8808.png">

앱이 추가되면 처음 보이는 Overview 페이지의 내용을 따라 Appcenter SDK를 설치합니다.
* NPM 패키지 추가
`yarn add appcenter appcenter-analytics appcenter-crashes`
  `pod install`
  
## 2. react-native-codepush 패키지 설치
`yarn add react-native-code-push`
`cd ios && pod install`


놀랍게도, 일단  AppCenter 에서는 더이상 할 게 없습니다. 앱 설정을 마치고 나중에 다시 돌아옵시다.

## 3. iOS 설정
* Xcode 에서 앱 이름을 우클릭 하여 나오는 메뉴에서 `Add Files to <APP NAME>` 을 눌러 `AppCenter-Config.plist` 파일을 새로 생성해줍니다.
  파일 추가할때 `Add this file to Project` 에 체크를 꼭 해주세요.

생성된 파일에  Overview 에서 보여준 내용을 복사해줍니다.
시크릿 키 값은 사용자의 화면에 나와있는걸 사용하셔야 합니다. 아래 키는 임의로 치환된 더미키입니다!

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "https://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
    <dict>
    <key>AppSecret</key>
    <string>4321a9876-37ac-4ed9-99ea-e73b12345678</string>
    </dict>
</plist>
```

* `AppDelegate.m` 파일에 아래 내용을 추가해 주세요. 
`#if DEBUG` 또는 `#ifdef FB_SONARKIT_ENABLED` 바로 위에다가 넣어주시면 됩니다.
  
    ```
    #import <AppCenterReactNative.h>
    #import <AppCenterReactNativeAnalytics.h>
    #import <AppCenterReactNativeCrashes.h>
    #import <CodePush/CodePush.h>
    ```
  `didFinishLaunchWithOptions` 메소드 아래에 다음 내용을 추가해 주세요.
    ```
    [AppCenterReactNative register];
    [AppCenterReactNativeAnalytics registerWithInitiallyEnabled:true];
    [AppCenterReactNativeCrashes registerWithAutomaticProcessing];
    ```
* 다음과 같은 라인을 찾아서
```
return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
```

    이렇게 바꿔주세요.
    Debug 빌드와 Production 빌드의 상황을 각각 나누어 어떤 JS Bundle을 로드할지 결정합니다.
    ```
    - (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
        {
        #if DEBUG
            return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
        #else
            return [CodePush bundleURL];
        #endif
        }
    ```

* 그 다음, Info.plist  파일에 CodePushDeploymentKey 라는 엔트리명으로  CodePush 트랙 키를 넣어주세요.

    코드푸시 키는 공식문서에서는 AppCenter CLI 를 이용해서 확인하는 방법으로 안내하지만, 웹 콘솔에서도 확인할 수 있습니다.

<img width="1782" alt="keys" src="https://user-images.githubusercontent.com/29659112/125742462-7e8819a1-ea94-4fa8-a380-8e2cbb72e501.png" />

    
여기서 Production 트랙과 Staging 트랙으로 나뉩니다.

Production은 보통 실제 사용자에게 전달되는 트랙이며, Staging 은 내부 테스트용으로 사용합니다. 원한다면 다른 트랙을 추가할 수도 있습니다.

위에 적은 키를 하나 입력하는 것은 단일트랙 배포의 경우입니다.

하지만 보통 단일트랙만을 운용하는 경우는 많지 않습니다. CodePush 기능 자체도 테스트해봐야하고, Release Candidate 의 경우 직접 OTA를 통한 테스트를 꼭 거치고 나갑니다. 이 때 활용되는것이 바로 Staging 트랙입니다.

CodePush의 꽃, Multi Deployment 는 다음장에서 알아보겠습니다.


## 4. Android 설정
CodePush 설정에 앞서서 AppCenter SDK 기본설정을 해줍니다. 이 내용은 AppCenter 대시보드에서 처음 React Native Android 프로젝트를 생성하면 보여주는 페이지의 내용입니다.

`android/app/src/main/assets` 하위에 `appcenter-config.json` 이라는 파일을 새로 생성하고 아래 내용을 입력합니다.
```json
{
  "app_secret": "1234567-26c6-4556-9542-b123b12a123a"  // <-- 사용자 고유의 키값 넣기
}
```

그 다음, `Strings.xml` 에 다음 내용을 추가해줍니다.
```xml
<string name="appCenterCrashes_whenToSendCrashes" moduleConfig="true" translatable="false">DO_NOT_ASK_JAVASCRIPT</string>
<string name="appCenterAnalytics_whenToEnableAnalytics" moduleConfig="true" translatable="false">ALWAYS_SEND</string>
```

여기까지 해두면 기본적인 앱에 대한 크래시 리포트나 Analytics 정보가 AppCenter 대시보드에 출력됩니다.

이제 코드푸시를 설정해봅시다.
먼저 `android/settings.gradle` 파일에 다음 줄을 추가해줍니다.

```groovy
include ':app', ':react-native-code-push'
project(':react-native-code-push').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-code-push/android/app')
```

그 다음 `android/app/build.gradle` 에서 아래와 같이 수정해줍니다.
```groovy
...
apply from: "../../node_modules/react-native/react.gradle"  // <- 기존에 있던 라인
apply from: "../../node_modules/react-native-code-push/android/codepush.gradle" // <- 새롭게 추가한 라인
...
```

`MainApplication.java` 파일을 다음과 같이 수정합니다.

```java
...
// 1. 아래 플러그인을 import 해주세요
import com.microsoft.codepush.react.CodePush;

public class MainApplication extends Application implements ReactApplication {

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        ...
				// 2. 앱 시작시 코드푸시 런타임이 어디에서 JS번들을 가져올지 결정하도록 아래와 같이 수정합니다.
        @Override
        protected String getJSBundleFile() {
            return CodePush.getJSBundleFile();
        }
    };
}
```

마지막으로 `Strings.xml` 에 CodePush Key 를 넣어줍니다.

```xml
<resources>
     <string moduleConfig="true" name="CodePushDeploymentKey">DeploymentKey</string>
 </resources>
```


여기까지 양 플랫폼에 대한 기본적인 설정이 끝났습니다.
다음 글에서 Multi Deploy 및 배포에 대해서 알아봅니다.
