---
pubDatetime: 2021-05-27T02:30:20Z
title: React Native에서 Android Native Dialog 커스터마이즈 하기
slug: customize-android-native-dialog-in-react-native
featured: true
draft: false
tags:
    - React Native
    - Android Studio
    - Android
    - XML
    - Dialog
    - Alert
description:
  React Native 에서 직접 커스터마이즈 하기 어려웠던 네이티브 컴포넌트인 `Alert()` 의 스타일을 변경하는 법에 대하여 알아봅니다.
---

# 🍭 Android 의 Alert 커스터마이즈

React Native 의 컴포넌트인 `Alert()`는 OS 에 따라 서로 다른 모습으로 동작합니다.
각각 OS에서 사용하는 네이티브 다이얼로그를 호출하는데요, Android 와 IOS 모두 Javascript 의 영역이 아닌 Native Code 영역에서 모양을 관장하기 때문에 개발자가 직접 커스터마이즈 가능한 요소가 거의 없습니다.
<br />
<div style="display: flex">
<image src='https://user-images.githubusercontent.com/29659112/119706265-b5d4ee00-be94-11eb-87ec-5268c1c17bf6.png' style="margin-right: 10px; width: 45%"/>
<image src='https://user-images.githubusercontent.com/29659112/119706990-9be7db00-be95-11eb-87aa-b64264275428.png' style="margin-left: 10px; width: 45%" />
</div>

그러나 Android 계열은 Android Studio 에서 XML을 조금 건들어준다면 앱 전역적으로 Dialog 의 스타일을 변경할 수 있습니다.

# 🦄 styles.xml
Android 개발을 조금 접하셨다면 보다 쉽게 이해하실 수 있을겁니다.
React Native 에서 호출하는 네이티브 Dialog 요소의 스타일 중 `Theme.AppCompat.Light.Dialog.Alert` 속성을 전역적으로 오버라이드 하면 우리 입맛대로 Dialog 를 커스터마이즈 할 수 있습니다.
안드로이드 프로젝트 경로 중 `app/src/main/res/values/styles.xml` 파일을 열어줍니다.

별다른 설정을 하지 않았다면 아래와 비슷한 모양입니다.

```xml
<resources>
    <!-- Base application theme. -->
    <style name="AppTheme" parent="Theme.AppCompat.Light.NoActionBar">
        <!-- Customize your theme here. -->
        <item name="android:textColor">#000000</item>
    </style>
</resources>

```

먼저 `AppTheme` 의 아이템으로 아래 내용을 추가해 줍니다.
```xml
<item name="android:alertDialogTheme">@style/AlertDialogTheme</item>
```

그 다음, 이 아이템이 참조하는 스타일 속성을 새롭게 정의합니다. 이 속성은 AppCompat.Light.Dialog.Alert 스타일을 상속합니다.
```xml
    <style name="AlertDialogTheme" parent="Theme.AppCompat.Light.Dialog.Alert">
    <item name="android:textColorPrimary">#FF0000</item>
    <item name="android:textColor">#00FF00</item>
    <item name="android:background">#123456</item>
    <item name="android:buttonBarNegativeButtonStyle">@style/NegativeButtonStyle</item>
    <item name="android:buttonBarPositiveButtonStyle">@style/PositiveButtonStyle</item>
    </style>
```

버튼은 `butonBarNegativeButtonStyle` 및 `buttonBarPositiveButtonStyle` 을 이용하여 재정의합니다.
```xml
    <style name="NegativeButtonStyle" parent="Widget.AppCompat.Button.ButtonBar.AlertDialog">
        <item name="android:textColor">#FFC107</item>
    </style>
    <style name="PositiveButtonStyle" parent="Widget.AppCompat.Button.ButtonBar.AlertDialog">
        <item name="android:textColor">#FFC107</item>
    </style>
```

최종적인 파일의 전체 모습은 아래와 같습니다.

```xml
<resources>
    <!-- Base application theme. -->
    <style name="AppTheme" parent="Theme.AppCompat.Light.NoActionBar">
        <!-- Customize your theme here. -->
        <item name="android:textColor">#000000</item>
        <item name="android:alertDialogTheme">@style/AlertDialogTheme</item>
    </style>

    <style name="AlertDialogTheme" parent="Theme.AppCompat.Light.Dialog.Alert">
        <item name="android:textColorPrimary">#FF0000</item>
        <item name="android:textColor">#00FF00</item>
        <item name="android:background">#123456</item>
        <item name="android:buttonBarNegativeButtonStyle">@style/NegativeButtonStyle</item>
        <item name="android:buttonBarPositiveButtonStyle">@style/PositiveButtonStyle</item>
    </style>
    
    <style name="NegativeButtonStyle" parent="Widget.AppCompat.Button.ButtonBar.AlertDialog">
        <item name="android:textColor">#FFC107</item>
    </style>
    <style name="PositiveButtonStyle" parent="Widget.AppCompat.Button.ButtonBar.AlertDialog">
        <item name="android:textColor">#FFC107</item>
    </style>
</resources>
```

이 상태로 파일을 저장하고 `yarn run android` 를 다시한번 해 줍니다. XML파일을 변경하는것은 네이티브영역의 변경사항이므로 앱 빌드를 다시한번 해주어야 합니다!
앱이 실행되고 Alert Dialog 를 확인해보면 아래와 같은 모습을 보실 수 있습니다.
<br />
<div style="display: flex; justify-content: center">
<image src='https://user-images.githubusercontent.com/29659112/119710859-d5bae080-be99-11eb-9021-0f3b5334d10e.png' style="max-width: 300px"/>
</div>


# 🪁 뜯어보기
추가된 XML 속성들이 어떻게 매칭되는지는아래 이미지를 보면 쉽게 이해할 수 있습니다.
<div style="display: flex; justify-content: center">
<image src='https://user-images.githubusercontent.com/29659112/119713190-68f51580-be9c-11eb-9563-5218281fe78e.PNG' style="max-width: 300px"/>
</div>

아래 버튼의 경우 `textColor` 속성을 통해 글자색을 변경하였습니다. 비슷하게 조금만  더 응용하면 버튼 영역에 해당하는 배경색을 따로 지정할 수도 있겠죠?

앱 테마 전체에 일괄적으로 적용된다는 점만 유념하면 React Native 에서 직접 다루기 까다로운 네이티브 컴포넌트도 손쉽게 커스터마이즈 할 수 있습니다.


<br />
<br />

#### 🌺 참조한 글
[How to use and style new AlertDialog from appCompat 22.1 and above](https://stackoverflow.com/questions/29797134/how-to-use-and-style-new-alertdialog-from-appcompat-22-1-and-above)

