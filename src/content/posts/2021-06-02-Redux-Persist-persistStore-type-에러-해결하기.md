---
pubDatetime: 2021-06-02T03:06:14Z
title: Redux-Persist - persistStore type 에러 해결하기
slug: fix-redux-persist-type-error
featured: false
draft: false
tags:
  - React
  - Redux
  - Redux-Persist
description: Redux와 Redux-Persist를 사용할 때 발생하는 Type Error 해결법입니다.
---

## 💣 문제

오랜만에 React 프로젝트를 새로 생성했습니다.
이전과 비슷하게 Redux와 Redux-Persist 를 이용하여 브라우저에 유지되는 Redux Store 를 만들었습니다.

그런데 같은 코드인데도 이전에 못보던 Type Error가 발생합니다.
<img width="924" alt="persist" src="https://user-images.githubusercontent.com/29659112/120370684-e06cee00-c34f-11eb-9f5f-d7151e6ece82.png">

대충 읽어보니 Store의 Type 으로 EmptyObject라는 못보던 타입이 하나 추가되었네요. 결과적으로는 `AnyAction` 타입이 없다는 에러입니다.

## 🎉 해결

- 관련 이슈 : [https://github.com/rt2zz/redux-persist/issues/1140#issuecomment-590868279](https://github.com/rt2zz/redux-persist/issues/1140#issuecomment-590868279)
- 관련 PR : [https://github.com/rt2zz/redux-persist/pull/1278](https://github.com/rt2zz/redux-persist/pull/1278)

이미 관련하여 이슈가 열려있었습니다.
가장 많은 Up vote 를 받은 댓글에서는 PersistStore 에 RootState라는 타입을 명시해주면 된다고 합니다.

하지만 저는 구조가 조금 달라서 애매한것 같아서 TypeSafe 패치가 적용된 PR 을 가져와 patch-package 로 적용시켜주었습니다.

<img width="655" alt="persist-after" src="https://user-images.githubusercontent.com/29659112/120371587-fe871e00-c350-11eb-9c16-cef3ecc7844a.png">
