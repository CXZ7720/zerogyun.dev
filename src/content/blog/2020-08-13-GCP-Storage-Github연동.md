---
pubDatetime: 2020-07-26T11:28:11Z
title: Google Cloud Builder 로 굽고 버킷 저장소에 담아서 서빙하기
slug: build-and-serve-with-gcb-gcs
featured: false
draft: false
tags:
  - GCP
  - Cloud Builder
  - Cloud Storage
  - Github Hook
description: GCP Cloud Builder 를 통해 Google Storage Bucket 내에 정적 파일을 자동으로 업데이트 하는 방법에 대하여 알아봅니다.
---

# Storage Bucket 내 파일을 업데이트하자

App Engine 기반의 API 서버에서 Google Storage Bucket로 정적 파일을 서비스 하는 방향으로 프로젝트 구성을 바꾼 뒤 가장 큰 문제는 파일 업데이트였습니다. 이전에는 Github 레포에 올리기만 하면 알아서 Cloud Builder 가 긁어다가 뚝딱뚝딱 인스턴프를 만들어 줬는데, 새롭게 스토리지로 이전하고 나니 기존 설정은 무쓸모해졌습니다.

기존의 Cloud builder 의 STEP을 정의해두었던 `cloudbuild.yaml`을 조금만 응용하면 App Engine 서비스가 아닌, Cloud Storage 를 직접 컨트롤 할 수 있지 않을까 하고 고민하였고 생각보다 쉽게 방법을 찾아냈었습니다.

# rsync 를 이용한 동기화

rsync는 파일동기화에 사용되는 유틸리티입니다. GCP에서도 이 rsync를 손쉽게 사용할 수 있도록 준비되어있는데요,
Cloud Storage에 접근하는데 사용되는 GSutil과 rsync 를 같이 사용하면 파일을 손쉽게 StorageBucket 에 "동기화" 할 수 있습니다.

## cloudbuild.yaml을 만들어봅시다.

제일 중요한 `cloudbuild.yaml` 파일 입니다.

```yaml
steps:
  # backup previous files to backup storage bucket
  - name: gcr.io/cloud-builders/gsutil
    args: [
        "-m", # accelerate upload by processing multiple files
        "rsync", # using rsync framework
        "-r",
        "-c", # avoids reupload unchanged files
        "-d",
        "gs://SOURCE_BUCKET", # source directory
        "gs://BACKUP_BUCKET", # target directory
      ]

  # copy new files from git source to cloud storage bucket
  - name: gcr.io/cloud-builders/gsutil
    args:
      ["-m", "rsync", "-r", "-c", "-d", "./GIT_SOURCE", "gs://SOURCE_BUCKET"]
```

스크립트는 크게 두 단계로 이루어져 있습니다. 일단 두 스텝 모두 공통적으로 gsutil 이미지를 이용해서 Cloud Storage에 접근할 수 있도록 합니다. gsutil 이미지를 이용해 만들어진 컨테이너에 전달될 `args`에 우리가 구체적으로 하게 될 일들을 전달해주면 됩니다.

스크립트의 첫번째 부분은 기존 Bucket 에 들어있던 데이터를 Backup용 Buket 으로 옮겨주는 작업입니다. 백업과정이 필요없다면 이 스텝은 과감하게 지우셔도 됩니다.

## 아니 저게 도대체 무슨소리냐

이제 무슨소리인지 모르겠는 `args` 파라미터에 대하여 알아봅시다.

- `-m` : 동시에 다수의 파일을 동기화하여 처리 속도를 향상시킵니다
- `rsync` : gsutil에게 rsync를 이용해 Storage Bucket 을 동기화 할 것임을 알려줍니다.
- `-r` : 대상 디렉토리 하위 파일들도 재귀적으로 순회하며 복사하기 위한 옵션입니다. 리눅스에서 `cp -r` 과 같은 원리입니다.
- `-d` : 대상 Storage Bucket 의 내용물을 지우고 덮어씌웁니다.
- `-c` : 바뀐 파일들만 동기화 합니다. 변경점이 없는 파일은 건너뛰어 IO를 최소화합니다.

결국 위 명령어는 **원본 Bucket 및 그 하위디렉토리 내용물을 백업 Bucket 으로 동기화 하되, 변경점이 있는 파일들만 옮기고, 목적지의 파일들은 신경쓰지 않을테니 그냥 덮어 씌워라** 라는 뜻이 되겠습니다.

## 그래서 제일중요한 업데이트는 어떠게 하는데?

이제 나머지 두번째 스텝을 봅시다.
이전 스텝과 모두 같지만 맨 마지막 두줄만 다릅니다. 바로 Source 와 Target이 다른데요, 업데이트 작업이니 Target 은 그렇다 쳐도 Source 는 GSutil 명령어 형태가 아닌 일반 디렉토리 형식입니다.
바로 이 파일은 `cloudbuild.yaml` 이므로, 결국 Google Cloud Builder 가 받아서 처리할 내용들입니다.

이 스크립트 파일이 실행될 때는, Git에서 뭔가 훅이 들어와서 변경사항이 있을 때 실행될 것이므로, 현재 Working directory 의 파일을 Source 로 선언하시면 됩니다.

결국 두번째 스크립트는 **깃헙에서 새롭게 받아온 Working Directory의 파일 및 그 하위디렉토리 내용물을 목적지 Bucket 으로 동기화 하되, 변경점이 있는 파일들만 옮기고, 목적지의 파일들은 신경쓰지 않을테니 그냥 덮어 씌워라** 라는 뜻이 되겠습니다.

# Cloud Builder 트리거 작성

트리거 작성은 이전에 작성했던 포스팅인 [GCP CloudBuilder 를 이용한 AppEngine 자동빌드](https://zerogyun.dev/2020/01/29/GAE%20%EC%9E%90%EB%8F%99%EB%B9%8C%EB%93%9C/)에서 잘 정리해 뒀으니 참고하면 됩니다.

이번 단계에서는 기존 트리거를 그대로 이용하므로 추가적으로 트리거를 직접 수정할 필요는 없습니다.

# 커밋을 쏘아올리자

스크립트가 잘 돌아가는지 한번 커밋을 쏘아올려 봅시다. Cloud Builder 의 로그를 복사해왔습니다.

```bash
starting build "8186de41-3f57-486c-92b6-*********"

FETCHSOURCE
Fetching storage object: gs://***************.cloudbuild-source.googleusercontent.com/55f3b2db0ee4220bbb71da3b50ce8c40c31b6fdd-f29bc344-7cf5-4828-855f-ad719c940eb9.tar.gz#***************
Copying gs://***************.cloudbuild-source.googleusercontent.com/55f3b2db0ee4220bbb71da3b50ce8c40c31b6fdd-f29bc344-7cf5-4828-855f-ad719c940eb9.tar.gz#***************...
/ [0 files][    0.0 B/578.4 KiB]
/ [1 files][578.4 KiB/578.4 KiB]
Operation completed over 1 objects/578.4 KiB.
BUILD
Starting Step #0
Step #0: Already have image (with digest): gcr.io/cloud-builders/gsutil

Step #0:
Step #0: Building synchronization state...
Step #0: Starting synchronization...
Finished Step #0
Starting Step #1
Step #1: Already have image (with digest): gcr.io/cloud-builders/gsutil
Step #1:
Step #1:
Step #1: Building synchronization state...
Step #1: Starting synchronization...
Step #1: Copying mtime from src to dst for gs://***************/**/**.pdf
Step #1: Copying mtime from src to dst for gs://***************/**/**.json
...중략...
Step #1: Copying mtime from src to dst for gs://***************/**.json
Finished Step #1
PUSH
DONE
```

스크립트에 작성했던대로 두개의 스텝으로 나뉘어 진행되는것을 볼 수 있습니다.
첫번째 스텝의 경우 변경점이 없어서 별다른 동기화 작업 없이 백업과정을 SKIP 한것으로 확인되네요.(`-c` 옵션)

그 후 두번째 스텝의 경우 새롭게 Fetch 한 소스코드의 내용을 Storage Bucket 으로 복사해 넣는 것을 확인할 수 있었습니다.

## 마무리

이제 Cloud Storage Bucket 의 내용을 직접 일일히 수동으로 업데이트 하지 않아도, 깃헙에 푸시하는것만으로 자동으로 최신화하여 동일버전으로 유지할 수 있게 되었습니다!

#### 참고한 글

Automated Publishing Cloud build - [https://cloud.google.com/community/tutorials/automated-publishing-cloud-build](https://cloud.google.com/community/tutorials/automated-publishing-cloud-build)
