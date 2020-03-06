---
layout: post
title:  "NextCloud에 LetsEncrypt 인증서 끼얹기"
date:   2020-01-30 02:23:21 +0900
tags: 
  - NAS
  - Docker
  - NextCloud
  - HTTPS
  - SSL
  - LetsEncrypt
  - Apache
categories: NAS
color: rgb(0, 130, 201, 1)
cover: '../assets/nextcloud_ssl.jpg'
published: true
---
Docker 를 이용해 NextCloud 를 띄우고, 가지고 있는 도메인의 서브도메인을 연결하는 과정을 기록했습니다.
<!-- more -->
# NextCloud에 DEV 도메인 걸기
헤놀로지에서 자작나스로 이전한뒤, 가장 먼저 알아본게 오픈소스 클라우드 서비스였는데요, NextCloud는 PHP 기반으로 만들어져 다양한 형태로 배포되고 있습니다. 저는 자작나스로 이용될 PC에 Docker Cotainer 형태로 만들어서 사용중입니다.

얼마 전 새로 구입한 도메인의 서브도메인을 등록해 클라우드 접근성을 높이고자 했는데요, 제가 이용중인 `.dev` 도메인은 SSL 연결을 반드시 필요로 합니다. 때문에 일반 컨테이너로 올라간 클라우드접속 페이지를 로드할 수 없는 문제가 발생해 직접 Let's Encrypt 를 이용해 SSL 인증서를 발급해 등록하는 과정을 진행했습니다.

개인 소유의 도메인이 있고, Docker 환경이 모두 구축된 Ubuntu Bionic 시스템에서 진행했습니다.

## Lets Encrypt 인증서 발급하기
먼저 자신이 소유한 도메인의 Lets Encrypt 인증서를 발급해야 합니다. 보통은 CertBot 을 이용하여 자동으로 발급하고, 주기적으로 3개월마다 갱신하는 과정을 거쳐야 합니다.

재미있게도 Certbot 에서 Docker Container 형태로 바이너리를 배포하고 있어 별도의 패키지 설치 없이 손쉽게 인증서를 발급, 갱신 할 수 있습니다.

### Certbot 컨테이너 실행
아래 명령어를 이용해 Certbot 컨테이너를 실행시킵니다.
```Dockerfile
docker run -it --rm --name certbot \
  -v '/etc/letsencrypt:/etc/letsencrypt' \
  -v '/var/lib/letsencrypt:/var/lib/letsencrypt' \
  certbot/certbot certonly -d '*.example.com' \
  --manual --preferred-challenges dns \
  --server https://acme-v02.api.letsencrypt.org/directory
```

`-v` 옵션을 통해 발급된 인증서가 저장될 경로를 로컬디스크의 `/etc/letsencrypt`와 `/var/lib/letsencrypt`를 마운트 해줍니다.

도커 커맨드에 여러 옵션이 붙는데,
* `--rm` : 도커스크립트가 완료된 뒤, 컨테이너가 종료되면 자동으로 삭제합니다.
* `--name` : 컨테이너 이름을 지정합니다.
* `-v` : 위에서 설명한 마운트될 디렉토리 입니다.
* `-d` : 발급받을 대상 도메인을 적어줍니다. 특정 도메인을 입력해도 좋고(서브도메인), 와일드카드로 입력해도 됩니다.
* `--manual --preferred-challenges dns` : 도메인의 소유권 인증 방식을 DNS를 이용해서 한다는 옵션입니다. 추후 설정 과정에서 나타나는 랜덤텍스트를 도메인관리자 페이지에서 TXT 레코드로 등록하는 방식입니다.
* `--server` : 발급을 요청할 Lets Encrypt 서버주소를 특정합니다.

### 이메일 주소 입력
```
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Enter email address (used for urgent renewal and security notices) (Enter 'c' to cancel):
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```
컨테이너가 시작되면 자동으로 다음과 같은 질문이 보입니다.
연락 가능한 이메일을 입력하고 넘어갑니다.

### Lets Encrypt 인증서 사용약관 동의
```
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Please read the Terms of Service at
https://letsencrypt.org/documents/LE-SA-v1.2-November-15-2017.pdf. You must 
agree in order to register with the ACME server at
https://acme-v02.api.letsencrypt.org/directory
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(A)gree/(C)ancel:
```
A 를 입력합니다. 동의해야만 다음단계로 넘어갈 수 있습니다.

### EFF 재단 이메일 수신동의
```
Would you be willing to share your email address with the Electronic Frontier Foundation, a founding partner of the Let's Encrypt project and the non-profit
organization that develops Certbot? We'd like to send you email about our work encrypting the web, EFF news, campaigns, and ways to support digital freedom.

(Y)es/(N)o:
```
동의하지 않아도 진행에 문제가 없습니다.
저는 거부했습니다.


### IP주소 공개에 대한 주의 및 동의
```
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
NOTE: The IP of this machine will be publicly logged as having requested this certificate. If you're running certbot in manual mode on a machine that is not your server, please ensure you're okay with that.

Are you OK with your IP being logged?
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
(Y)es/(N)o:
```
IP주소가 DNS 에 기록되어 공개적으로 노출될 수도 있다는 주의문입니다.
동의하지 않으면 진행이 불가하니 Y를 입력해줍니다.

### DNS 소유권 검증
```
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Please deploy a DNS TXT record under the name
_acme-challenge with the following value:

A1CDEfgHijK29NoP_xxxxxxxxxxxxxxxxxxxxxxxxxxx

Before continuing, verify the record is deployed.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Press Enter to Continue
```
도커 컨테이너 실행 옵션에서 미리 선언해두었던 옵션대로 DNS의 소유권 검증을 TXT 레코드에 발급된 토큰값을 입력하는 형태로 진행합니다.

본인이 소유하고 있는 도메인 관리 페이지에 들어가서 TXT 레코드에 해당토큰값을 입력해줍니다.

저는 제가 이용중인 Google Domains에서 다음과 같이 설정해 주었습니다.

![image](https://user-images.githubusercontent.com/29659112/73393870-c5cfd280-431f-11ea-8876-31cbebf12e89.png)

터미널로 돌아와서 Enter 를 누르기 전에 도메인전파가 잘 이루어졌는지 확인하고 진행하시기 바랍니다.
아직 전파가 덜 되어 확인에 실패한 경우 위 과정을 다시 진행해야하며, 일정횟수 이상 반복하면 인증이 막히는 경우도 있다고합니다.

`dig -t txt example.dev`

명령어로 토큰값이 잘 보이는지 확인이 된 뒤 다음단계로 진행합니다.

마지막으로 긴 안내문이 나온뒤, 컨테이너가 자동으로 종료되고 터미널에서 빠져나오게 됩니다.

처음에 마운트했던 경로에 가면 도메인에 대한 Lets Encrypt 인증서가 발급된 것을 확인할 수 있습니다.

### 발급된 인증서를 NextCloud 컨테이너에 마운트하여 실행
![image](https://user-images.githubusercontent.com/29659112/73394390-e51b2f80-4320-11ea-9bd9-6b9aec43ab8b.png)

방금 발급된 인증서가 저장된 경로를 통째로 NextCloud 에 마운트한뒤 컨테이너를 시작합니다.

### Apache Config 수정
NextCloud Container 에 접속하여 
`/etc/apache2/sites-available/default-ssl.conf` 를 에디터로 열어줍니다.

약 32번째와 33번째 줄에 있는 
`SSLCertificateFile` 과 `SSLCertificateKeyFile`을 방금 발급받은(마운트된) 경로를 입력해줍니다.

여기서 주의해야 할 점은,
*  `SSLCertificateFile` 에는 `fullchain,pem` 파일을,
*  `SSLCertificateKeyFile` 에는 `privkey.pem` 파일을
   
넣어줘야 합니다.
저는 이걸 못찾아서 거의 반나절을 허비했습니다.

![image](https://user-images.githubusercontent.com/29659112/73394758-8bffcb80-4321-11ea-844d-6929b3a8e6ff.png)


마지막으로 아래 명령어 세 줄을 순서대로 입력하여 Apache서버를 재시작해줍니다.

```
a2enmod ssl
a2ensite default-ssl
service apache2 reload
```

### 서브도메인 할당하기
NextCloud 웹 페이지에 원하는 도메인을 걸고 접속해보면 아래와같이 HTTPS가 적용된 것을 확인할 수 있습니다.
![image](https://user-images.githubusercontent.com/29659112/73431516-f2b5d100-4383-11ea-991a-bd57fd450971.png)


### SSL Labs 테스트 결과
SSL Labs 에서 서버의 인증서를 테스트해볼 수 있습니다.
![image](https://user-images.githubusercontent.com/29659112/73431286-660b1300-4383-11ea-99ee-1f1ba45ebb5e.png)

Key Exchange 항목에서 점수가 깎여 B 등급이 나왔네요.
세부 내역을 보면 TLS1.0, TLS1.1 을 활성화해둬서 그런것 같습니다. 추가로 Forward Secracy 를 지원하지 않아서 그렇다고 합니다.

일단 B 등급이면 무난하니 다음 기회에 등급을 올리는걸로 하겠습니다.

#### 참고한 글
LetsEncrypt Docker - [https://velog.io/@ilcm96/2019-08-31-lets-encrypt-wildcard](https://velog.io/@ilcm96/2019-08-31-lets-encrypt-wildcard)

LetsEncrypt 와일드카드 인증서 발급받기 - [https://lynlab.co.kr/blog/72](https://lynlab.co.kr/blog/72)