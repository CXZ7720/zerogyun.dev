---
layout: post
title: "Apache2 웹서버 SSL Labs 고득점 노리기"
date: 2020-01-30 18:23:21 +0900
tags:
  - NAS
  - Docker
  - NextCloud
  - HTTPS
  - SSL
  - LetsEncrypt
  - Apache
  - TLS
categories: NAS
color: rgb(0, 130, 201, 1)
cover: "../assets/SSL_A.png"
published: true
---

이전 포스팅에서 B등급을 받은 SSL Labs 테스트를 보완하여 A등급까지 끌어올리는 방법을 소개합니다.

<!-- excerpt -->

# SSL Labs 점수 높이기

이전 글에서 테스트했던 제 클라우드서버의 SSL 점수는 B 등급이었습니다.
점수가 깎인 주요한 원인으로는 TLS1.0, TLS1.1 프로토콜의 지원, 그리고 Forward Secracy(전방향 암호화) 를 지원하지 않는 알고리즘의 사용 때문이었습니다.

![image](https://user-images.githubusercontent.com/29659112/73431286-660b1300-4383-11ea-99ee-1f1ba45ebb5e.png)

## 서버 환경

이전글과 동일하게 제 클라우드 서버는 NextCloud Docker 이미지에 LetsEncrypt 인증서를 막 붙임 참입니다.
Host OS는 Ubuntu 18.04.3 Bionic LTS 입니다.

NextCloud는 Apache 위에서 돌아가고 있습니다.

## TLS 1.0, TLS1.1 호환성 제거

먼저 오래된 방식의 프로토콜인 TLS1.0과 TLS 1.1 은 이미 많은 취약점이 드러난 상태이고, 현대의 대부분 브라우저에서도 지원을 중단하기로 선언했었죠.([보호나라 발표 자료](https://www.krcert.or.kr/data/trendView.do?bulletin_writing_sequence=30064))

때문에 SSL Labs 테스트에서도 감점요소로 작용했습니다.

TLS1.0 과 TLS1.1 프로토콜을 제거하는 방법은 간단합니다.

### Apache SSl Conf 수정

Next Cloud가 구동중인 도커 컨테이너에 접속합니다.

Apache서버 환경설정이 들어있는 `/etc/apache2/mods-available` 로 이동합니다.
![image](https://user-images.githubusercontent.com/29659112/73434216-a79ebc80-4389-11ea-930b-1d4e6f34dc73.png)

그 중, `ssl.conf`를 에디터로 열어줍니다.
약 73번째 줄 근처에 `SSLProtocol` 이라는 항목의 기본값이 `all -SSLv3` 라고 되어있는 것을 아래 사진처럼 `-TLSv1 -TLSv1.1` 을 추가해줍니다.

> `SSLProtocol all -TLSv1 -TLSv1.1 -SSLv3`
>
> 사용가능한 옵션은 Apache 공식 문서 [https://httpd.apache.org/docs/trunk/mod/mod_ssl.html#sslprotocol](https://httpd.apache.org/docs/trunk/mod/mod_ssl.html#sslprotocol) 에서 확인할 수 있습니다.

![image](https://user-images.githubusercontent.com/29659112/73434284-c7ce7b80-4389-11ea-8445-e80ccc9c1303.png)

수정을 마쳤다면 저장후 빠져나와 Apache 서버를 재시작 해줍니다.

> `service apache2 reload`

다시 SSL Labs 의 테스트를 돌려보면 TLS1.1 관련 경고가 사라진 것을 확인할 수 있습니다.
![tls](https://user-images.githubusercontent.com/29659112/73433711-9bfec600-4388-11ea-8745-f99dffc30f04.png)

아직 여전히 B 등급이네요.
나머지 하나도 해결해봅시다.

### Forward Secrecy 확보

Forward Secrecy, 또는 Perfect Forward Secrecy(PFS)는, 비밀키가 공격자에게 노출되었을 경우에도 기존 암호문을 유출된 비밀키로 해독할수 없도록 만들 수 없도록 합니다. 주로 서버와 브라우저 사이에서 단시간만 사용 가능한 '세션키'가 그 역할을 하게 되는데, PFS 를 이용하면 이 세션키의 수명이 매우 짧아져 공격받아도 데이터가 보호받을 확률이 높아집니다.

키 교환 암호화 알고리즘 중, PFS를 지원하는 알고리즘은 ECDHE 가 있는데요, Apache SSL 설정에서 관련 알고리즘을 활성화 하는 방법으로 SSL Labs 리포트 점수를 올릴 수 있습니다.

아까와 마찬가지로 `/etc/apache2/mods-available/ssl.conf` 를 에디터로 열어줍니다.
이번엔 59번째 줄 근처의 `SSLCipherSuite` 항목을 다음과 같이 바꿔줍니다.

> `SSLCipherSuite "EECDH+ECDSA+AESGCM EECDH+aRSA+AESGCM EECDH+ECDSA+SHA384 EECDH+ECDSA+SHA256 EECDH+aRSA+SHA384 EECDH+aRSA+SHA256 EECDH+aRSA+RC4 EECDH EDH+aRSA RC4 !aNULL !eNULL !LOW !3DES !MD5 !EXP !PSK !SRP !DSS"`

각 알고리즘을 나열한 부분을 모두 큰따옴표로 묶어주어야 Apache 서버에서 정상적으로 인식됩니다.

사용된 알고리즘은 SSL Labs 문서에 적혀있는 내용들을 이용했습니다.
[https://blog.qualys.com/ssllabs/2013/08/05/configuring-apache-nginx-and-openssl-for-forward-secrecy](https://blog.qualys.com/ssllabs/2013/08/05/configuring-apache-nginx-and-openssl-for-forward-secrecy)

![image](https://user-images.githubusercontent.com/29659112/73436086-2fd29100-438d-11ea-8f65-2fb2d934965a.png)

이제 다시 에디터를 저장하고 나와 아파치 서버를 다시 재시작해줍니다.

> `service apache2 reload`

## 최종점검

이제 다시 SSL Labs 테스트를 수행해봅니다.
![image](https://user-images.githubusercontent.com/29659112/73436320-a7082500-438d-11ea-9b3d-62fa936fce0e.png)

드디어 모든 Warning이 사라지고 A 등급으로 올라선 것을 확인할 수 있습니다.

<br>

#### 참고한 글

PFS - [https://rsec.kr/?p=465](https://rsec.kr/?p=465)

Apache2 SSL Ciphers - [https://blog.qualys.com/ssllabs/2013/08/05/configuring-apache-nginx-and-openssl-for-forward-secrecy](https://blog.qualys.com/ssllabs/2013/08/05/configuring-apache-nginx-and-openssl-for-forward-secrecy)

Apache 에서의 TLS 설정 - [https://xinet.kr/?p=2012](https://xinet.kr/?p=2012)

보호나라 - [https://www.krcert.or.kr/data/trendView.do?bulletin_writing_sequence=30064](https://www.krcert.or.kr/data/trendView.do?bulletin_writing_sequence=30064)

Apache2 SSL Protocols - [https://httpd.apache.org/docs/trunk/mod/mod_ssl.html#sslprotocol](https://httpd.apache.org/docs/trunk/mod/mod_ssl.html#sslprotocol)
