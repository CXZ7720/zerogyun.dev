---
title: Oracle Cloud 완전무료티어 이용하기
date: 2020-08-15 11:28
tags: 
    - Oracle
    - Cloud
categories:
    - Cloud
    - Oracle
---
최근 새롭게 등장한 신생 클라우드, 오라클 클라우드에서 컴퓨팅 인스턴스를 생성하고 접속하는 방법에 대하여 알아봅니다.
<!-- excerpt -->

# ⚔️클라우드 삼국시대에 새로운 도전자 ㄷㄷㄷㅈ!! 
대부분 클라우드 컴퓨팅 시장 하면 Microsoft Azure, Amazon AWS, Google Cloud Platform 을 떠올릴 것이다. 클라우드 삼국시대에 JAVA로 익숙한 오라클에서 새롭게 클라우드 시장에 도전했다.

사실 오라클 클라우드가 서울리전을 개설하고 마케팅을 시작한건 약 1년정도 전이었던것으로 기억한다. 그 당시에 어디선가 프리티어 프로모션 글을보고 나도 가입해두면 언젠간 쓸 일이 있겠지 싶어서 만들어서 좀 가지고 놀았었다. 하지만 출시 초기라 그런지 서울리전에서 생성할 수 있는 인스턴스 전체 할당량이 오버되어 프로모션기간동안 결국 VM하나 띄우지 못하는 실망적인 상황만 계속되었고, 이후 다른 프로젝트를 하더라도 고려대상에서는 자연스럽게 빠지게 되었다.


# 🚧 VPN 서버를 띄울만한 괜찮은 곳 없을까 
주말이면 여러 사람들과 함께 그룹을 만들어 게임을 하는 낙으로 스트레스를 풀곤 한다. 하지만 학교 기숙사에 거주하는 대학원생 친구는 매번 게임에 접속하기 위하여 별도의 VPN을 이용하고 있었는데 Public VPN이다보니 사용자가 몰리거나 서버측 환경에 따라서 종종 접속이 끊겨서 의도치 않은 "탈주" 처리 되는 경우가 종종 있었다.

> 정말 이건 우리학교도 동일한 정책을 취하고 있는데, 머리 다 큰 성인들끼리 있는 대학교에서 게임접속을 원천 차단한다는게 무슨 IT후진국적 발상인지 도무지 이해가 가지 않는다. 처음 도입당시에 우리학교에서는 "화이트리스트" 정책을 고수해서  GCP/AWS 상 인스턴스로 향하는 IP들이 모두 차단당해서 연구실이고, 학회고 전부 난리가 났었던 적도 있었다.

이런 고충을 해결하기 위해서 쓸만한 무료 VPN 서버를 구축하기 위하여 알아보았고, 그 중에서 그나마 가장 후한 프리티어를 제공하는 오라클 AWS가 떠올라 한번 써보게 되었다. 게다가 서울리전도 지원해서 게임에서 중요한 PING도 나쁘지 않을 것으로 기대하고 있었다.


## 💸 오라클 프리티어 
일단 오라클 클라우드 프리티어에 관한 정보는 [여기](https://www.oracle.com/kr/cloud/free/)에 자세히 정리되어 있다. GCP와 비슷하게 $300 상당의 크레딧을 지급해주고, 그와 별도로 완전무료 티어도 존재한다. $300 은 가입 직후 한달간만 때문에 이번엔 순전히 완전무료 범위 안에서 해결을 보아야 했다.

다양한 서비스가 있지만, 주로 우리가 사용할 관심사는 VM, DB, Network, LB 등등일 것이다.
* Compute : 2VM(1CPU, 1GB RAM)
* Block Storage : 2개, 100GB
* Object Storage
  * Standard mode : 10GB
  * Archive mode : 10GB
* Load Balancer : 1개, 10Mbps
  
정도가 되겠다. 이정도면 간단한 ovpn 서버 하나 정도 돌리는데는 차고 넘친다.

# 🛠️ VM 만들기 
일단 오라클 클라우드 콘솔에 로그인한다. [링크](https://console.ap-seoul-1.oraclecloud.com/)
로그인 후 첫 화면은 다음과 같은 대시보드이다.
![image](https://user-images.githubusercontent.com/29659112/90341195-7f7e5e80-e038-11ea-9871-7c4c6f476ffe.png)

확인해봐야 할건 현재 선택된 리전이 어디인가 정도일 것이다.
사진처럼 South Korea Central(Seoul) 인지 확인해본다. 다른 옵션으로는 `도쿄리전` 이 있다.

## 🛠️ VM 생성 
먼저 대시보드에서 `VM 인스턴스 생성` 버튼을 눌러 컴퓨트인스턴스를 생성한다. "항상 무료 적격" 이라고 친절히 리본을 다 달아두어 어떤걸 선택하는게 좋을지 고민을 하지 않아도 된다.

<img width="1178" alt="new1" src="https://user-images.githubusercontent.com/29659112/90341253-0af7ef80-e039-11ea-940a-61d602eaecf5.png">

이미지는 무난하게 우분투 20.04 LTS로 지정한다.
구성 옵션에서는 딱히 건들게 없다. 항상무료 티어에서는 수정 할 수 있는것도 거의 없다. 외부망 접속도 기본적으로 활성화 되어 있어서 그대로 다음단계로 진행해도 된다.

## 🔑 SSH키 등록 또는 추가 

***여기가 가장 골때리는 부분의 원인이다.***
만들어진 인스턴스에 콘솔로 접속하기 위해 SSH키를 새로 등록하거나 발급받을 수 있다. 기존에 다른 서비스에서 만들어둔 키가 있다면 그 키를 그대로 업로드해서 일괄적으로 관리할 수 있을 것이다.

하지만 대부분의 사용자들은 그런게 없을 것이므로 만들어주는 새 키를 다운로드해서 저장하는 방식일 것이다.

"전용 키 저장" 버튼을 통해 받는 것이 비밀키(`.key` 확장자), "공용 키 저장" 을 통해 받는 것이 공개키(`.pub` 확장자) 이며, 로그인에는 비밀키를 이용한다.

이때 저장되는 키는 추후에 VM접속을 위해 꼭 필요하며 잃어버릴 경우 두번다시 발급받을 수 없으므로 반드시 잘 보관하자.

왜 골때리는 부분인지는 다음 파트에서 다룬다.

일단 여기까지 하면 VM 설정은 끝이다.
간단하다. So simple isn't it?

## 🤔 콘솔 로그인이 안되는데? 
자 이제 시작이다.
VM이 성공적으로 만들어졌다는 것을 확인했다면 아까 받아뒀던 priv key 를 이용해서 콘솔로 로그인하자.

`ssh -i "키파일명"@ubuntu@인스턴스IP`

* 희망편 : 
```bash

Welcome to Ubuntu 20.04.1 LTS (GNU/Linux 5.4.0-1019-oracle x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

0 updates can be installed immediately.
0 of these updates are security updates.

ubuntu@testVM:~$

```

* 절망편 : 
```
error loading `myPrivateKey.key': unrecognised key type
```

정말 이것때문에 VM만 세번을 갈아 엎았다. 우분투에서도, 맥에서도, 윈도우 putty keygen 에서도 모두 똑같은 메시지를 뿜으며 터졌다.

이유는 오류메시지처럼 이 키가 어떤 타입인지 알 수 없기 때문인 것으로 추정..
방금 다운받은 키를 에디터로 열어보면 다음과 같이 생겼다.
```
-----BEGIN PRIVATE KEY-----
aoidaouwthoauthothaoghnahoighaoiwhtoiawfjf
대충 엄청 어려운 암호화 텍스트틀
aoiethalegnalkwghoiawehtlwaknylkwanglaknga
-----END PRIVATE KEY-----
```

이를 해결하는 방법은 간단하다. Password를 변경해주는 명령어를 이용하여 이 키가 어떤 구성인지 알려주는 헤더를 추가해줘야한다.
`ssh-keygen -p -f private_keyfile`
명령어로 패스워드를 바꾼다. 참고로 이때 입력한 패스워드는 키파일 자체를 잠그는 비밀번호기 때문에 로그인시마다 패스워드를 물어본다.

그 뒤 다시 키파일을 열어보면 다음과 같이 생겼다.
```
-----BEGIN RSA PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: AES-128-CBC,AWESOMEHASHCODESHERE

AWESOMEHASHTEXTSHEREBLABLABLA~~~
-----END RSA PRIVATE KEY-----
```
기존의 키파일이 RSA알고리즘으로 암호화되었음을 확인할 수 있다. 그 후 콘솔에서 다시 로그인해본다. 윈도우라면 먼저 putty-gen을 이용하여 ppk 파일로 변환한 다음, putty 에서 auth탭에 ppk 파일을 넣고 로그인한다.

![image](https://user-images.githubusercontent.com/29659112/90341681-827b4e00-e03c-11ea-9b77-122218747c8e.png)

짠~ 로그인에 성공했다.


## 🏓 부록 
일단 목표했던 OPEN VPN 서버를 설치해 보았다.
도커로 이쁘게 말아진 [이미지](https://hub.docker.com/r/kylemanna/openvpn/)가 있어서 간단하게 컨테이너를 띄우고 네트워크 보안그룹에서 VPN용 포트(1194번)을 열어주었다.
![image](https://user-images.githubusercontent.com/29659112/90341749-046b7700-e03d-11ea-9e9d-2e0eaae9d0c7.png)

![image](https://user-images.githubusercontent.com/29659112/90341809-c3279700-e03d-11ea-9f21-8faefa2e5f7e.png)

도커 커멘드를 이용해서 ovpn 클라이언트용 프로파일을 익스포트하고, 게임용 PC에서 VPN에 접속을 확인해봤다.

![image](https://user-images.githubusercontent.com/29659112/90341772-4ac0d600-e03d-11ea-81b1-0d16e3321d3f.png)

vpn 없이 일반게임을 돌렸을 경우 보통 20ms 안팎이었고, 커스텀방에서 게임을 진행할 경우 아마 근처 해외서버(아마도 도쿄즈음?)으로 잡히는듯 한데 그때 약 40ms 정도였다.

이정도면 아주 만족스럽다!!