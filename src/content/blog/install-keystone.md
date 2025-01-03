---
pubDatetime: 2018-10-14T14:50:21Z
modDatetime: 2018-10-14T14:50:21Z
title: 오픈스택 맛보기 - keystone 설치
slug: try-opensack-a-little-2
featured: false
draft: true
tags:
  - openstack
  - cloud
description: 오픈스택 두번째 글 입니다.
  OpenStack 서비스에 대한 인증과 권한을 관리하는 역할을 하는 keystone 을 설치합니다.
---

### 1) Keystone DB 설정

지난 포스팅에서 설치한 MariaDB 에 Keystone이 사용할 데이터베이스를 만들어줍니다.

루트 권한에서 아래 명령어를 입력하세요.
먼저 `mysql -u root -p` 명령어로 root 계정으로 DB에 접속한 다음 `creat database keystone;` 을 통해 `keystone` DB를 만들어줍니다.

`grant all privileges on keystone.* to keystone@'localhost' identified by 'password';`와 `grant all privileges on keystone.* to keystone@'%' identified by 'password';` 명령으로 테이블에 권한을 할당해 줍니다.

`flush privileges` 로 정책을 적용해준 뒤 `exit`를 통해 MariaDB 콘솔에서 빠져나옵니다.
![DB만들기](/assets/openstack/keystone_db.PNG)

### 2) keystone 설치

저는 Ubuntu 18.04.1 기반으로 설치했습니다.

먼저 최신버전인 Rocky를 설치하기 위하여 레포지토리를 apt 소스에 등록해야 합니다.

**Ubuntu 18.04 LTS with Openstack Rocky**

```
apt install software-properties-common
add-apt-repository cloud-archive:rocky

sudo apt update && apt dist-upgrade
```

그 다음 keystone과 구성 프로그램을 설치해 줍니다.

```
apt -y install keystone python-openstackclient apache2 libapache2-mod-wsgi python-oauth2client
```

### 3) keystone.conf 수정

`vim /etc/keystone/keystone.conf` 로 keystone.conf를 수정합니다.
줄 번호는 상황에 따라 다를 수 있습니다.

**1. 610번째 줄 :**
memcache_servers 주소를 `localhost:11211` 로 바꿔줍니다.
미리 할당된 머신의 IP를 알고 있다면 그 주소값을 넣어줍니다.
![keystone_conf1](/assets/openstack/keystone_conf1.PNG)

**2. 725번째 줄 :**
database 항목의 connection 정보를 다음과 같이 바꿔줍니다.
`connection = mysql+pymysql://keystone:password@10.0.0.30/keystone`
이때 `password` 글자에는 MariaDB 설정단계에서 입력했던 비밀번호를 넣습니다.
![keystone_conf2](/assets/openstack/keystone_conf2.PNG)

**3. 2823번째 줄**
provider 라인의 주석을 해제하세요.
![keystone_conf3](/assets/openstack/keystone_conf3.PNG)

수정하던 vim을 모두 저장한 뒤 빠져나와 DB_Sync 작업을 수행합니다. 이 명령은 아무련 결과값을 출력하지 않습니다.
`su -s /bin/bash keystone -c "keystone-manage db_sync`

### 4) Fernet Key 초기화

```
keystone-manage fernet_setup --keystone-user keystone --keystone-group keystone
keystone-manage credential_setup --keystone-user keystone --keystone-group keystone
```

을 통해 fernet 설정을 초기화해줍니다.

### 5) Keystone Bootstrap

설정에 앞서 controller 환경변수에 현재 머신의 IP를 넣어줍니다. 192.168.X.X 형식의 내부 내트워크에서 할당된 IP 또는 저 처럼 localhost 로 입력해도 됩니다.

`echo $controller` 를 통해 입력된 변수를 확인할 수 있습니다.

```
keystone-manage bootstrap --bootstrap-password adminpassword \
--bootstrap-admin-url http://$controller:5000/v3/ \
--bootstrap-internal-url http://$controller:5000/v3/ \
--bootstrap-public-url http://$controller:5000/v3/ \
--bootstrap-region-id RegionOne
```

을 입력해주세요.
`\` 은 명령어가 길어져서 생긴 개행문자입니다. 실제로 입력할 땐 `\` 없이 한번에 이어서 적으셔야 합니다.
`adminpassword` 에는 원하는 비밀번호로 바꿔 넣으세요.

### 5) 아파치 서버 설정

편집기로 아파치 서버 설정파일을 열어줍니다.
`vim /etc/apache2/apache2.conf`

70번째 줄에 빈 공간에 원하는 서버 명을 적어주세요. 저는 Openstack-Study 라고했습니다.
![apache_config](/assets/openstack/apache_config.PNG)

저장 후 에디터에서 빠져나옵니다.

`systemctl restart apache2` 명령어로 아파치 서비스를 재시작 해 줍니다.

### 6) 환경변수 설정 스크립트 제작

오픈스택 구동에 필요한 환경변수들을 자동으로 실행시켜주는 스크립트를 제작합니다.

찾기 쉬운 위치에 keystonerc 라는 이름으로 새 파일을 생성합니다. 여기서는 루트 계정의 홈 디렉토리에 생성하겠습니다.
`vim ~/keystonerc`

에디터가 열리면 아래 내용을 입력후 저장해주세요. 이때도 마찬가지로 `adminpassword`는 원하는 비밀번호로 바꿔서 입력하면 됩니다.

```
export OS_PROJECT_DOMAIN_NAME=default
export OS_USER_DOMAIN_NAME=default
export OS_PROJECT_NAME=admin
export OS_USERNAME=admin
export OS_PASSWORD=adminpassword
export OS_AUTH_URL=http://10.0.0.30:5000/v3
export OS_IDENTITY_API_VERSION=3
export OS_IMAGE_API_VERSION=2
export PS1='\u@\h \W(keystone)\$ '
```

저장 후 keystonerc에 600 권한을 지정해 줍니다.
`chmod 600 ~/keystonerc`

`source ~/keystonerc` 로 환경변수 파일을 불러와 적용합니다.
명령줄의 모습이 바뀐걸 확인하실 수 있습니다.

그 상태에서 다음 명령어로 터미널 프로파일에 추가해줍니다.
`echo "soruce ~/keystonerc " >> ~/.bash_profile`

**이 이후에 사용하는 openstack 명령어는 `soruce` 명령어를 이용해 환경변수를 꼭 불러온 뒤 작업해야 합니다. 머신을 종료한 뒤 다시 작업을 이어서 할 때 등의 경우에 반드시 해당 파일을 다시 불러와야 정상적으로 명령어가 실행됩니다.**

### 7) 서비스 프로젝트 추가

본격적으로 openstack 명령어를 이용하여 서비스 프로젝트를 추가합니다.
`openstack project create --domain default --description "Service Project" service`
