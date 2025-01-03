---
pubDatetime: 2018-09-31T03:24:21Z
modDatetime: 2018-09-31T03:24:21Z
title: 오픈스택 맛보기 - 환경구축
slug: try-opensack-a-little-1
featured: false
draft: true
tags:
  - openstack
  - cloud
description: 오픈스택을 이용한 클라우드 컴퓨팅 스터디 포스팅 중 첫 번째 글입니다. 오픈스택을 설치하기 위한 기본적인 환경을 구축합니다.
---

<!-- excerpt -->

막상 오픈스택을 공부해보겠다!! 라고 비장하게 마음먹고 환경구축부터 도전했지만 공식 홈페이지에 적혀있는 문서만으로는 역부족이었습니다.

낯선 오류로 한참을 삽질하고, 새로 나온 Queens 버전과 Ubuntu 18.04 버전에서 성공한 사례는 찾기 힘들어서 여러 사이트 구글링해가며 얻은 정보들을 모아 포스팅 할 예정입니다.

이 포스팅에서는 Openstack의 수많은 컴포넌트 중 Keostone, Nova, Glance, Horizon 까지만 진행합니다.

시작은 오픈스택 Queens로 했지만, 스터디 진행은 SKTelecom OS-Lab의 [TACO-Script](https://github.com/sktelecom-oslab/taco-scripts)를 통해 할 예정입니다. TACO-All in One Script 관련해서도 시간이 나는대로 업로드 예정입니다.

## Openstack 설치하기

### 1) 설치 환경

윈도우의 VirtualBox에 우분투를 설치하여 진행하였습니다.

```
Guest OS : Ubuntu 18.04.1 Desktop
CPU : Ryzen R5 2600x
HDD : 80GB 동적할당
Network : 어댑터에 브릿지(공유기 DHCP에서 별도의 ip 할당)
```

참고한 링크

1. [Server World - Openstack Rocky](https://www.server-world.info/en/note?os=Ubuntu_18.04&p=openstack_rocky&f=1)
   설치 당시에는 Queens 버전으로 진행했었는데 얼마 전 Rocky 버전이 릴리즈 되었네요. 지금은 Rocky 기준으로 문서가 갱신되었습니다. 포스팅도 Rocky 기준으로 진행될 예정입니다.

2. [Openstack Docs](https://docs.openstack.org/install-guide/openstack-services.html#minimal-deployment-for-rocky)
   공식 문서입니다. 설명이 다소 부족한감이 없잖아 있었습니다. 공식문서만 따라서 진행하다가 헤멘적이 꽤 많았던 기억이 있네요.

### 2) Ubuntu 18.04 Desktop 설치

저는 Ubuntu 18.04.1 기반으로 설치했습니다.
Virtualbox에서 사용자의 환경에 맞게 설정값을 바꿔주신 뒤 Guest OS를 설치하시면 됩니다.

제가 변경한 부분은 CPU 개수, 네트워크 어댑터 정도 입니다.
![CPU 설정](/assets/openstack/machine_set2.PNG)
![네트워크 설정](/assets/openstack/machine_set4.PNG)

설치가 완료되면 `sudo apt-get update -y && sudo apt-get upgrade -y` 를 이용해 패키지 목록을 최신화하는것도 잊지 마세요.

### 3) Pre-requirements 설치

이제부터 모든 작업은 Root 권한에서 실행됩니다.
sudo su 를 이용해 Root 유저로 변경해주세요.

- **MariaDB 설치 및 환경설정**
  다음 명령어를 이용해 MariaDB를 설치합니다.
  `apt -y install mariadb-server`
  그 후 에디터를 이용해 환경설정 파일을 수정해줍니다.
  `/etc/mysql/mariadb.conf.d/50-server.cnf` 파일을 열어주세요.

  아래 사진과 같이 111번째 줄의 `utf8mb4`를 `utf8`로,
  112번째 줄은 주석처리 해주세요.
  ![mariadb.conf](/assets/openstack/mariadb_conf.PNG)

  그 다음 `systemctl restart mariadb` 명령어로 MarinDB 서비스를 재시작합니다.

  재시작이 완료되면 Initial Setting을 할 차례 입니다.
  `mysql_secure_installation` 를 입력하면 단계별로 설정 마법사를 이용해 단계별로 적용할 수 있습니다.

  `Change the root password?` 에서 `Y`를 입력해 데이터베이스의 새 root 유저 패스워드를 입력하세요.

  그 뒤 나오는

  ```
  Remove anonymous users?
  Disallow root login remotely?
  Remove test database and access to it?
  Reload privilege tables now?
  ```

  에 모두 `Y`를 입력한 뒤 마법사를 빠져나오면 됩니다.

- **오픈스택 Rocky 레포지토리 추가**

  ```
  apt -y install software-properties-common
  add-apt-repository cloud-archive:rocky
  apt update
  apt -y upgrade
  ```

- **RabbitMQ, Memcached 설치**

  ```
  apt -y install rabbitmq-server memcached python-pymysql
  rabbitmqctl add_user openstack '원하는_비밀번호_여기에_입력'
  rabbitmqctl set_permissions openstack ".*" ".*" ".*"
  ```

  순서대로 입력 후 서비스를 재시작 해줍니다.
  `systemctl restart rabbitmq-server`

  에디터를 이용해 다시 Mariadb 설정파일을 열어 29번째 줄을 아래 이미지 같이 0.0.0.0으로 수정한 뒤 서비스를 재시작 해줍니다.
  `/etc/mysql/mariadb.conf.d/50-server.cnf`
  ![bind-address](/assets/openstack/bind_address.PNG)

  `systemctl restart mariadb`

  이번엔 `memcached` 설정파일을 수정합니다.
  `/etc/memcached.conf`를 열어 35번째 줄을 아래 이미지와 같이 0.0.0.0으로 수정하고 서비스를 재시작 해줍니다.
  ![memcached_conf](/assets/openstack/memcached_conf.PNG)

  `systemctl restart memcached`

  환경구축이 모두 끝났습니다.
  본격적인 Keystone설치는 다음 포스팅에 이어서 진행하도록 하겠습니다.
