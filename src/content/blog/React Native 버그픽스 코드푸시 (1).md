---
pubDatetime: 2021-07-15T15:11:25Z
title: React Native 버그픽스 3분완성 [코드푸시 맛] - 2
slug: react-native-codepush-2
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

## 5. Multi Deployment 구현하기
공식 문서에서 제안하는 Production / Staging 트랙의 이상적인 운용은 다음과 같습니다.

1. 열심히 개발한 결과물을 `Staging` 트랙으로 배포합니다.
2. Staging 트랙을 바라보고 있는 앱을 이용해 서버로부터 업데이트 한 후 QA 를 진행하고, 의도대로 동작하는지 검증합니다.
3. 모든 QA 및 테스팅을 통과했다면 Staging 트랙에 배포된 현 상태를 `Production` 트랙으로 승격시킵니다.
4. Production 트랙을 바라보고 있는 앱을 이용해 서버로부터 업데이트 한 후, 의도대로 동작하는지 검증합니다.

또는,

설정 메뉴에 "베타 활성화" 토글 버튼을 추가하여 사용자가 베타기능에 참여할지 여부를 결정하도록 하고, 활성화 여부에 따라 CodePush 키를 동적으로 재정의하여 활성화된 트랙을 변경할 수도 있습니다.

## 5-1. Multi Deployment 설정하기(iOS)
1. Xcode 를 열어 Project Navigator 뷰에서 현재 프로젝트를 선택합니다.
2. Info 탭을 클릭합니다.
3. Configurations 그룹에서 + 버튼을 눌러 `Duplicate "Release" Configuration` 옵션을 선택하여 새 항목을 추가합니다.
   ![image](https://user-images.githubusercontent.com/29659112/125744653-50e4a2b0-0ccd-4647-9448-f02e9a354d65.png)
   
4. 이름을 `Staging` 으로 바꿔줍니다.
5. Build Settings 탭으로 이동합니다.
6.  '+' 버튼을 눌러 Add User-defined Setting 을 선택합니다.
    ![image](https://user-images.githubusercontent.com/29659112/125744750-3c111c2e-fd32-415d-bd67-0e6fe3757068.png)
7. Multi_Deployment_Config 라는 이름으로 변경하고 값으로는`$(BUILD_DIR)/$(CONFIGURATION)$(EFFECTIVE_PLATFORM_NAME)` 을 추가해줍니다.
   Staging 트랙의 경우 `$(BUILD_DIR)/Release$(EFFECTIVE_PLATFORM_NAME)` 라고 뜨는게 정상이니 안심하세요.
8. 다시 + 버튼을 눌러 Add User-Defined Setting 을 선택해주세요.
9. 이번엔 이름을 `CODEPUSH_KEY` 라고 해줍니다. 그 다음 드롭다운을 확장하여 각 트랙별로 CodePush키를 넣어줍니다. 키는 이전단계에서 앱센터 웹 대시보드에서 확인했던 그 값을 넣어주세요.
    ![image](https://user-images.githubusercontent.com/29659112/125744937-a7b743c9-b7f1-4237-860a-d5820badedfd.png)
   
10. 마지막으로 `Info.plist` 로 돌아와서 이전단계에서 만들었던 `CodePushDeploymentKey` 라는 항목을 찾고 값을 `$(CODEPUSH_KEY)` 로 변경해주면 됩니다.


## 5-2. Multi Deployment 구현하기 (Android)
먼저 Android Studio에서 `android/app/build.gradle` 파일을 열어줍니다.
그 중에서 `buildTypes` 항목을 찾아서 아래와 같이 고쳐줍니다.

```groovy
android {
    ...
    buildTypes {
        debug {
            ...
            // Note: CodePush updates should not be tested in Debug mode as they are overriden by the RN packager. However, because CodePush checks for updates in all modes, we must supply a key.
            resValue "string", "CodePushDeploymentKey", '""'
            ...
        }

        releaseStaging {
            ...
            resValue "string", "CodePushDeploymentKey", '"<INSERT_STAGING_KEY>"'

            // Note: It is a good idea to provide matchingFallbacks for the new buildType you create to prevent build issues
            // Add the following line if not already there
            matchingFallbacks = ['release']
            ...
        }

        release {
            ...
            resValue "string", "CodePushDeploymentKey", '"<INSERT_PRODUCTION_KEY>"'
            ...
        }
    }
    ...
}
```

debug 타입에는 아무런 키를 넣지 않고, releaseStaging 에는 Staging 키를, release 타입에는 production 키를 넣어줍니다.

> 💡Staging 타입의 이름이 굳이 releaseStaging 인 이유는 [이 라인](https://github.com/facebook/react-native/blob/e083f9a139b3f8c5552528f8f8018529ef3193b9/react.gradle#L79) 때문입니다.

## 6. codePush 컴포넌트 삽입
드디어 길고 긴 네이티브 코드 수정이 끝났습니다.
본격적으로 React Natve 를 이용해서 CodePush 플러그인을 호출하고 앱을 업데이트 하는 로직을 만들어봅니다.

모든 단계는 Functional Component 형태를 기준으로 설명합니다.


먼저 프로젝트의 root component 를  codePush 컴포넌트로 감싸줍니다.
보통 대부분 프로젝트의 root component 는 `App.tsx` 의 `<App />` 컴포넌트입니다.
```typescript App.tsx
import codePush from "react-native-code-push";

const App =() => {
// your code here
}

export default codePush(App);
```

이 CodePush 고차 컴포넌트(Higher order component) 로 App 컴포넌트를 감싸야 정상적으로 CodePush API 의 프로세스가 동작합니다.
> 💡 기본적으로 이 고차 컴포넌트는 코드푸시를 이용한 sync, sendResult, rollBack 등등 을 수행할 수 있게 합니다. 만약 이를 사용하지 않으면 일련의 과정 중 어딘가가 박살나게 될 겁니다.
이렇게 강조하는 이유는 제가 직접 해봤기 때문이죠.. 🤯🤯<br />
> 예를 들어, CodePush 컴포넌트를 제외하고 강제로 Sync 메소드를 호출하면 정상적으로 JS 번들을 가져오는 것처럼 보이나, AppCenter 로 설치완료에 대한 Report를 하지 못하여 무한 업데이트에 빠지고 맙니다.


이 정도 설정만으로도 CodePush는 동작합니다. 자동으로 AppCenter 서버에서 최신 패키지를 가져오고 설치합니다.
만약 이걸 원치 않는다면 직접 설정값을 넘겨주면됩니다

사용 가능한 옵션으로는 `checkFrequency`, `deploymentKey`, `installMode`, `mandatoryInstallMode`, `minimumBackgroundDuration`, `updateDialog`, `rollbackRetryOptions` 가 있습니다.

```typescript
import codePush from "react-native-code-push";

let codePushOptions = { checkFrequency: codePush.CheckFrequency.ON_APP_RESUME };
const App =() => {
// your code here
}

export default codePush(codePushOptions)(App);

```


## 7. 업데이트 로직 정의하기
옵션을 잘 설정한다면 다양한 방식으로 업데이트를 제공할 수 있습니다.
저희 프로덕트 경우
1. 앱 초기로딩시 업데이트의 존재 유무를 확인하고,
2. 가능한 업데이트가 있다면 사용자에게 팝업을 띄워 동의를 요청합니다.
3. 그 후, 업데이트 페이지로 넘어가서 sync 를 진행합니다.
4. 다운로드가 완료되면 즉시 JS 번들을 교체하고 앱을 재실행합니다.

> 🚧 주의 <br />
> 개발자가 Codepush 업데이트 로직을 재 정의할 경우, 가장 먼저  `checkFrequency` 를 `MANUAL` 로 설정해야 합니다. 그래야 뒤에서 직접 Sync() 메소드를 이용해서 컨트롤 할 수 있게 됩니다. 만약  `ON_APP_START` 또는, `ON_APP_RESUME` 로 둘 경우 App 컴포넌트를 감싼 CodePush 컴포넌트가 자동으로 수행하는 업데이트 로직과 개발자가 재정의한 업데이트 로직이 충돌하게 됩니다.


#### ***업데이트 존재 유무 확인***
`codePush.checkForUpdate()` 메소드를 이용해서 확인합니다. 업데이트가 존재한다면 Object를, 가용 업데이트가 존재하지 않는다면 Null 을 리턴합니다.

주의할 점은 업데이트가 존재하지만 RollBack 등의 사유로 인하여 설치를 보류한 경우에도 Object 를 리턴하니 세심하게 경우의 수를 나눠서 조건처리를 해야 합니다.

> 🚧 당신도 AppCenter 에 담겨질 수 있습니다. <br />
> 우리 마소 서버는 생각보다 개복치와 같아서 꽤나 자주 장애를 일으킵니다. AppCenter 의 장애는 광역기라서 대부분의 과정에 영향을 미칩니다. 예를들어 개발팀에서 새 패치를 배포할때나, 클라이언트에서 업데이트 가용성을 검사하거나, 패키지를 다운로드 할때 등이 있습니다.<br /> 적절히 try-catch 로 Error Handling 하지 않는다면 우리 앱도 개복치가 될 수 있습니다.<br />저희 팀에서는 Maximum delay 를 10초로 두고 그 이상이 되면 Promise reject 를 하여 해당 과정을 건너뛰도록 하고 있습니다.
> 개복치 MS 서버의 건강상태가 궁금하신 분은 https://status.appcenter.ms/ 에서 상황을 확인할 수 있습니다.

#### ***업데이트 시작 및 요청 팝업 띄우기***
codePush.sync() 메소드를 이용하여 업데이트 패키지의 다운로드 및 업데이트 설치까지 한번에 진행할 수 있습니다.
사용법은 다음과 같습니다.
```typescript
codePush.sync({
	options: SyncOptions,
	syncStatusChangedCallback : SyncStatusChangedCallback,
	downloadProgressCallback: DownloadProgressCallback,
	handleBinaryVersionMismatchCallback: HandleBinaryVersionMismatchCallback
})
```

* **options** : end-user의 업데이트 환경을 정의합니다. 업데이트 다이얼로그, 설치시점 등이 여기에 해당합니다. `syncOptions` 타입의 객체를 가지며 syncOption 으로는 `deploymentKey`, `installMode`, `mandatoryInstallMode`, `minimumBackgroundDuration`, `updateDialog` 가 있습니다.
* **syncStatusChangedCallback** : 설치 단계의 진행에 따른 콜백입니다. `UP_TO_DATE`, `UPDATE_INSTALLED`, `UPDATE_IGNORED`, `UNKNOWN_ERROR`, `SYNC_IN_PROGRESS`, `CHECKING_FOR_UPDATE`, `DOWNLOADING_PACKAGE`, `INSTALLING_UPDATE` 의 타입을 가집니다.
* **downloadProgressCallback** : 다운로드 진행상황에 대한 콜백입니다. `DownloadProgress` 타입의 객체를 리턴하며 `{totalBytes : number, receivedBytes: number}` 형태로 되어있습니다.
  저희 회사 앱에서는 `React-Native-Progress` 패키지와 연동하여 다운로드 진행 바를 출력하는데 이용합니다.
* **targetBinaryMismatchCallback** : 바이너리 버전이 일치하지 않을때 호출됩니다.


업데이트 시작 전 사용자에게 확인창을 띄우려면 `options` 파라미터에 `updateDialog` 객체를 선언해주면 확인 팝업을 설정할 수 있습니다.

조금 복잡하지만, 결국 최종적으로 완성된 sync() 메소드는 아래와 같은 형태입니다.

```typescript jsx
await codePush.sync(
    {
        updateDialog: {  //업데이트 다이얼로그 설정
          title: t('update:UPDATE_DIALOG_TITLE'),
          optionalUpdateMessage: t('update:UPDATE_DIALOG_BODY'),
          optionalIgnoreButtonLabel: t('common:LATER'),
          optionalInstallButtonLabel: t('update:UPDATE'),
          mandatoryContinueButtonLabel: t('update:UPDATE'),
          mandatoryUpdateMessage: t('update:MANDATORY_UPDATE_DIALOG_BODY'),
        },
        installMode: codePush.InstallMode.IMMEDIATE,
      },
      undefined,
      (progress) => setProgress(progress),
      (e) => {
        console.error('Target binary version mismatch', e)
      }
  )
```

설정은 정말 모든것이 끝났습니다.
이제 잘 돌아가는지 확인하러 갑시다.

## 8. 릴리즈

릴리즈는 AppCenter CLI 를 통해 할 수 있습니다.
만약 AppCenter CLI 를 아직 설치하지 않았다면 [https://github.com/microsoft/appcenter-cli](https://github.com/microsoft/appcenter-cli) 에서 dev-dependency 또는 global install 해주신 뒤 기본적인 로그인 절차를 진행하면 됩니다.

릴리즈 명령어는 다음과 같은 구조로 되어있습니다.
`yarn appcenter codepush release-react -a <조직 또는 이름>/<프로젝트명> -d <디플로이 타겟> --plist-file <ios일 경우에만, Info.plist파일위치 - 보통은 ios/RN프로젝트이름/Info.plist> --description <"여기에 설명입력">`

예를들어서 Android 프로젝트를 Staging 트랙으로 배포한다면,
```shell
yarn appcenter codepush release-react -a JohnDoe/SampleAndroid -d Staging --description "CodePush Works!" --mandatory
```
와 같은 형태가 됩니다.

IOS 프로젝트를 Production 트랙으로 배포한다면
```shell
yarn appcenter codepush release-react -a JohnDoe/SampleIos -d Production --plist-file ios/HelloCodePush/Info.plist --description "CodePush Works!" --mandatory
```
가 됩니다.

명령어 맨 마지막에 붙은 `—mandatory` 파라미터는 사용자에게 업데이트를 강제하도록 하는 설정입니다. 이 옵션이 붙은 배포는 설치 알림 다이얼로그에 취소 버튼이 존재하지 않습니다.
간단한 빌드과정이 지나고, MS 서버에 업로드가 완료되면 AppCenter 대시보드에서 현황을 확인할 수 있습니다.
<img width="2576" alt="codepush" src="https://user-images.githubusercontent.com/29659112/125747697-122f88b7-1ac9-4726-a9a6-24e7a78804dd.png">


## 9. 심화편
복수의 트랙을 운용하는 방법으로는 내부 개발용으로 사용하는 것 이외에도, 베타 테스터용 트랙으로 활용할 수도 있습니다. 설정페이지 등에서 토글 버튼으로 사용자가 직접 Opt-In 할 수 있도록 하는 옵션을 두고, 활성화 여부에 따라 동적으로 CodePush Token 을 변경한다면 베타테스트 프로그램을 보다 쉽게 운용할 수 있게 됩니다.

단, 주의할 점은 Opt-Out 한다고 해서 무조건 바뀐 버전의 업데이트를 다시 가져오는 것은 아닙니다. **해당 기기가 변경된 트랙의 최신판을 성공적으로 설치 한 기록이 존재하지 않을때에만** 새 업데이트를 가져옵니다.

설명이 조금 어려울 수도 있는데, Apple 기기의 베타프로그램 운영 방식을 상상하시면 비슷합니다.
* Staging 최신 : V2, Production 최신 : V2 라고 가정.
* Production V2 → Staging 트랙으로 변경한 경우 : Staging V2 업데이트 진행.
* 이 사용자가 Opt-Out 하여 다시 Production 채널로 돌아올 경우 :
  기존에 Production V2를 설치(실행)했던 기록이 있으므로 바라보는 채널은 바뀌었지만 해당 채널의 최신 번들을 가져오지 않음.(기존 Staging 번들을 그대로 유지하고 있음)
* 이후 Production 에서 V3가 릴리즈 된 경우에 업데이트를 수신하게 되고, 완전히 Staging 소프트웨어를 벗어나게 됨.


## 10. 마무리
CodePush 는 React Native 앱에 있어서 정말 가뭄의 단비와도 같은 기능입니다.
Codepush가 없었더라면 매 번 스토어를 통해 수많은 버그들을 수정한 앱 버전의 심사를 올리고, 심사가 끝날 때 까지 마음졸이며 기다려야 했을 겁니다.


저희 팀은 CodePush 를 이용한 패치를 일주일 주기로 내보내고 있습니다. 어떤 주는 UI 수정을 할 때도 있고, 어떤 주는 버그를 고칠때도 있습니다. 리액트 네이티브를 개발해보신 분들은 알겠지만, 일단 네이티브 의존성을 가지는 패키지들을 설치해두기만 하면 개발의 80% 이상은 JS/TS 를 이용하여 만들어 나갈 수 있습니다. 때문에 네이티브 패키지가 이미 심어져 있기만 하다면 아무리 복잡한 컴포넌트를 수정하는 일도 문제가 없습니다.

Microsoft Azure 를 기반으로 운영되기때문에 배포도 꽤나 빨라서 LTE 환경에서 30MB 정도 되는 번들을 받는데 2~3초면 충분합니다. 다만, 유일한 흠은 Microsoft AppCenter 서버가 종종 아프다는 것 정도가 되겠습니다.

구성이 조금 복잡해 보이지만, 그래도 CodePush 가 선녀임에는 틀림없습니다.
