---
pubDatetime: 2020-03-03T18:23:21Z
title: Naver Band API와 텔레그램을 이용한 맞춤형 새글 알림 챗봇 제작기
slug: naver-band-web-crawller
featured: false
draft: true
tags:
    - NaverBand
    - python
    - bot
    - telegram
    - 챗봇
description:
  'Naver Band 키워드 알림봇" 토이 프로젝트의 후기입니다.
---

# 네이버 Band의 새글알림을 선택적으로 받기
슬랙이나 카카오톡처럼 키워드 알림을 설정할수 없는 Band에서는 자신이 원하는 글이 등록되었을 때 선택적으로 알림을 받을 수 있는 방법이 없습니다.

Band에 등록된 글 중, 우리가 확인해야 할 게시글이 올라왔는지 알기 어려워 수시로 들어가야 하는 불편함이 있어 새글알림 봇을 만들게 되었습니다.
해당 업무 특성상 새롭게 올라온 글은 실시간으로 확인하여 처리해야할 필요가 있어서 다른 업무중에도 수시로 들어가서 확인해야 하는 불편함이 있다고 하셨습니다.

물론 Band 에도 사용자를 직접 태그하여 해당 유저에게 알림이 가도록 하는 방법이 있으나 
* 글 작성자가 불특정 다수인 경우라 모든 사람이 해당 유저를 태그해준다는 보장이 없었으며
* 올라오는 글의 특성상 어떤 유저에게 해당하는 포스팅인지 업무담당자 이외에는 판단하기 힘든 부분이 많아 잘못된 유저가 태그될 가능성이 높습니다.

때문에 유저가 자신에게 해당하는 글이 올라왔을때에만 확인하도록 하는것이 가장 효과적인 방법이라고 판단하고 프로젝트를 구성하였습니다.

### 1. Band API 토큰 발급
네이버 Band API 토큰은 아래 링크에서 발급받을 수 있습니다.
[https://developers.band.us/](https://developers.band.us/)
처음엔 API의 존재를 모르고 BS4나 Selenium 을 이용해서 크롤링 할 생각에 고민이었습니다만, 다행히도 API를 제공해서 손쉽게 포스팅을 불러올 수 있었습니다.

간단한 서비스 등록 양식을 작성하면 바로 토큰이 발급되어 사용할 수 있습니다.
![image](https://user-images.githubusercontent.com/29659112/75741587-687bd680-5d4e-11ea-9626-47df4b36944a.png)

### 2. 서비스 구성도
![Untitled Diagram](https://user-images.githubusercontent.com/29659112/75742318-9e21bf00-5d50-11ea-841b-8806db9027d0.png)

프로젝트의 구성도이다.
1. 토큰을 이용해 Band ID를 가져오고
2. Band ID를 이용해 Post 목록을 불러와 리스트에 담는다.
3. 각 Post의 ID값을 DB목록과 대조하여 이미 조회한(검사한) 포스트일경우 `continue`
4. DB에 등록되지 않은 새로은 포스트일 경우 Content 를 분석하여 우리 회사에 해당하는 글인지 검사
5. 우리회사에 해당하는 글이라면 Telegram Bot 메시지 전송, 아니라면 다음 Iteration 진행.
6. 리스트의 마지막까지 반복
7. 전체 과정을 지정된 시간마다 반복

으로 계획했다.

주기적으로 새글을 가져와야해서 7번 과정은 crontab 으로 구현하였고, 매번 글을 가져올때마다 이미 분석해서 판단이 완료된 포스팅은 중복처리를 방지하기 위하여 별도로 DB에 기록하여 비교하는 과정을 추가하였다.

### 3. 개발
대학교 1학년때 처음 배운 Python3 로 프로젝트를 시작했다. 그때 배운 뒤로는 한번도 제대로 파이썬을 프로젝트에서 사용해본 적이 없어서 다시 공부하며 진행했다.😂😂😂
#### python-telegram-bot 패키지
처음 개발환경은 윈도우노트북에서 진행하였으며 실제 서비스 환경은 Raspberry PI 3에서 굴리기로 하였다.

그런데 꼭 필요한 python-telegram-bot 패키지가 pychram 에서 도통 설치가 되지 않는 문제가 계속 반복되었다.
에러 로그를 확인해보니 cryptography 패키지를 설치하는데서 발생하는 문제였는데, .NET Framework를 설치해서 해결하라는 StackOverflow 답변대로 해보았지만 별다른 도움이 되지 못했다.
![image](https://user-images.githubusercontent.com/29659112/75742740-dece0800-5d51-11ea-88b1-a2ad245bd7ce.png)

결국 윈도우 개발환경을 포기하고 **우분투 가상머신**으로 넘어가서 해결하였다.

### Band 정보 가져오기
main.py의 첫번째 부분은 Band 의 정보를 가져오는 부분이다.
각 Band마다 고유한 ID값을 부여받는데 이 ID를 이용해 해당 Band 의 정보와 포스팅을 가져올 수 있다.
```python
#main.py
import bandCrawler as bc

band_ID = bc.getBandInfo()
band_Post = bc.getBandPost(band_ID, bc.band_token)
```

`bandCrawler.py` 에서는 request 모듈을 이용해 Access Token을 가지고 Band 포스팅을 가져온다.
필요한 토큰값은 로컬파일로 저장된 내용을 불러와 변수에 담아서 사용하였다. env 관련 내용은 뒤쪽에서 다룬다.
```python
# bandCrawler.py
# 타겟 Band의 ID를 얻는 함수
def getBandInfo():
    band_list_url = "https://openapi.band.us/v2.1/bands?access_token=" + band_token
    list_req = urllib.request.Request(band_list_url)
    list_res = urllib.request.urlopen(list_req)

    decoded_list = list_res.read().decode("utf8")

    bandlist_json = json.loads(decoded_list)

    target_id = bandlist_json['result_data']['bands'][0]['band_key']


    return target_id
```
이후, 전달받은 BandID 를 이용해 포스팅을 가져온다.
API문서에 의하면 한번에 불러올 수 있는 포스팅은 10개이다.
새글 빈도가 매우 잦은 밴드는 아니라 약 10분에 한번인 새로고침 주기를 고려할 떄 충분한 숫자라 판단하였다.

```python
# bandCrawler.py
# 전달받은 BandID 를 이용해 포스팅을 가져오는 함수
def getBandPost(target_id, band_token):
    post_list_url = "https://openapi.band.us/v2/band/posts?access_token=" + band_token + "&band_key=" + target_id + "&locale=ko_KR"
    post_req = urllib.request.Request(post_list_url)
    post_res = urllib.request.urlopen(post_req)

    decoded_post = post_res.read().decode("utf8")
    # print(decoded_post)
    postlist_json = json.loads(decoded_post)

    # print(postlist_json)

    return postlist_json
```
전달받은 Post 내용이 담긴 JSON 객체를 가공하는 부분이다.
필요한 정보를 객체로 묶어서 리턴하도록 하였다.
전달받은 데이터 중, `createdate`의 경우에는 milisec 로 되어있어 알아보기 쉽게 DATE 로 변환하는 함수 `mil_to_date` 를 만들어서 적용하였다.


```python
# bandCrawler.py
# 데이터를 가공하는 부분
def makeData(postlist_json):

    author = postlist_json['author']['name']
    postkey = postlist_json['post_key']
    content = postlist_json['content']
    createdate = mil_to_date(postlist_json['created_at'])  # milisecond, long
    photos = getPhotoUrl(postlist_json['photos'])  # 사진의 url이 담긴 배열을 리턴

    return {
        'author': author,
        'postkey': postkey,
        'content': content,
        'createdate': createdate,
        'photos': photos
    }

def mil_to_date(milliseconds):
    return str(datetime.fromtimestamp(milliseconds // 1000))
```
이렇게 작성된 `makeData` 함수는 `main()`에서 for loop 를 돌며 사용된다.

```python
# main.py
import bc as bandCrawler.py

for i in band_Post['result_data']['items']:
   temp = bc.makeData(i)  # 1개의 처리 데이터를 임시로 딕셔너리 형태로 저장.
   postkey = temp.get('postkey')
   createdate = temp.get('createdate')
   photos = temp.get('photos')
   #이하생략
```

### 분석하기
#### 중복처리
본격적으로 데이터가 준비되었으면 분석에 들어간다.
분석에 앞서서 이미 처리한적이 있는 포스팅인지 DB를 조회하여 확인한다.
```python
# main.py
import db.py as db

isExist = db.search_postkey(postkey)  # 0 || 1
   if (isExist == 1):  # 이미 등록된 글이면
      print("Already exists")
      continue
   else:  # 새글일 경우 분석로직 시작
      db.insertPost(postkey, createdate)
   #이하생략
```
DB쪽은 단순하다. count 를 이용하여 그 갯수를 리턴하도록 하였다.

```python
# db.py
def search_postkey(postkey):
    query = "SELECT COUNT(*) as count FROM Band WHERE post_id='" + postkey + "';"

    db.cursor.execute(query)
    result = db.cursor.fetchall()

    return result[0]['count']

def insertPost(postkey, createdate):
    query = "INSERT INTO Band (date, post_id) VALUES ('%s', '%s');" % (createdate, postkey)
    print(query)
    db.cursor.execute(query)

    db.conn.commit()
```

#### 분석
실절적인 분석은 정규표현식을 이용하였다.
Posting에서 실질적인 본문에 해당하는 Content 부분을 전달한다.
```python
# main.py
import parseAddress.py as parse

parsed_address = parse.parseAddress(temp['content'])  # 정규표현식에 의한 주소 파싱(str)
```
가장 시간이 많이 걸렸고, 시행착오도 많았다.

보통 우리가 처리해야할 포스팅인가를 판단하는 기준은 도로명주소 또는 회사명 언급 정도였다.
예를들어서 `세종대로 1` 이렇게 적혀있는경우 또는 `한국기업 님 처리 부탁드립니다` 와 같다.

처음에는 도로명주소 및 지번주소 모두를 처리하기 위하여 정규식을 만들었으나 조건을 너무 널널하게 한 나머지 도로명 주소 이외에도 전혀 상관없는 콘텐츠까지 알림이 오는 일이 발생하였다.

결국 지도를 보고 실제로 우리가 처리해야하는 주소값 데이터는 그렇게 다양하지 않다는 것을 알게되어(5개 정도) 해당 데이터를 직접 정규식에 넣기로 하였다.

이때의 문제점은 도로라는게 여러 지역에 걸쳐서 길게 뻗어있기 때문에 종종 해당되지 않는 포스팅도 우리지역으로 판단되어 알림이 간다는 문제가있다. 

이를 해결하기 위하여 다른 유저의 업무에 해당하는 포스팅을 판정하는 키워드 몇개를 이용하여 정규표현식을 만들어 해당 조건에 걸릴 경우 `None`을 리턴하도록 하였다.

예시 코드에서 정규식 부분은 임의의 단어로 치환하였다.
실제 코드에서는 정규표현식으로 도로명주소에 해당하는 몇몇 키워드를 넣어서 해당 도로명주소가 들어있는 내용일 경우 그 단어를 리턴하도록 하였다.

```python
#parseAddress.py
import re

def parseAddress(content):
    p = re.compile('여기에|예외조건|입력|세종대로|을지로|안국동길|등등')
    q = re.compile('예외조건|키워드|입력')# 예외조건
    reg_res = p.search(content)
    except_res = q.search(content)
    if reg_res:
        m = reg_res.group()
        if except_res: # 예외조건에 해당하는 경우 None 리턴
            print("Not our business!!")
            return None
        # print(m)
        return m
    else:
        return None

```

#### 텔레그램 메시지 전송

파싱된 데이터를 가지고 전달할 메시지를 만든다.
`main.py`에서 사용되는 bot 함수들은 `bot.py` 에 정의해두었다.

`parsed_address`의 결과가 존재할때만 메시지를 생성하도록 하였다.
`bot.py`의 `sendMessage(text)` 함수에서 `parse_mode` 파라미터를 HTML 로 두었기 때문에 간단한 HTML 태그를 이용하여 메시지 가독성을 높일 수 있었다.

```python
# main.py
import bot as bot.py

if (parsed_address != None):
    text = """<b>새로운 민원이 등록되었습니다!</b>\n<b>찾은 단어 : %s</b>\n\n<b>작성자 :</b> %s\n<b>등록일 :</b> %s\n<b>내용 :</b> \n%s\n""" \
            % (parsed_address, temp['author'], temp['createdate'], temp['content'])
    bot.sendMessage(text)
    #이하생략
```

이미지의 경우 밴드 API에서 jpeg 확장자의 URL이 담긴 배열을 리턴한다.
이를 통째로 `sendImage(imgArr)` 함수로 전달하여 이미지그룹을 전달하도록 하였다.

처음엔 단순히 `sendPhoto` 메소드를 사용하였으나, 여러개의 이미지가 동시에 전달될 경우 각각의 메시지로 따로 전송되어 채팅창에 도배되는 현상이 발생하여 `sendMediaGroup` 메소드로 교체하였다.

[API 문서를 읽어보면](https://python-telegram-bot.readthedocs.io/en/stable/telegram.bot.html#telegram.Bot.send_media_group) `sendMediaGroup` 메소드를 사용하기 위해서는 `media` 파라미터로 `InputMedia` 객체가 담긴 배열을 전달해줘야 한다. 이를 위해 `sendImage` 함수에서 전달받은 이미지 배열을 for 루프를 통해 `InputMediaPhoto` 객체를만들어 배열에 추가한뒤 전송하는 방법을 이용했다.


```python
# bot.py
import env, telegram

def sendMessage(message):
    bot.sendMessage(chat_id = channel_id, text=message, parse_mode=telegram.ParseMode.HTML)

def sendImage(url):
    InputMediaPhotoObjList = []

    for i in range(len(url)):
        InputMediaPhotoObjList.append(telegram.InputMediaPhoto(url[i]))
    bot.sendMediaGroup(chat_id=channel_id, media=InputMediaPhotoObjList, disable_notification=True, timeout=30)
```

마지막으로 `main.py`에서 sendImage 부분을 try - except 구문으로 에러핸들링을 해주었다. 이미지가 많거나, 용량이 큰 경우 종종 텔레그램 서버측에서 Timeout을 리턴하는 경우가 있어 에러상황에서도 프로그램이 죽지않고 다음 루프를 계속 돌 수 있도록 하였다.

```python
#main.py

   if len(photos) > 0:
      try :
         bot.sendImage(photos)
      except:
         print("Timeout")
```

#### 후처리
후처리라고 거창하게 적었지만 DB 컬럼 한줄 업데이트하는 구문이다. 메시지를 보낸것은 보냈다고 업데이트 해주었다.

```python
# main.py
   db.afterSend(postkey)
```

``` python
# db.py
def afterSend(postkey: int):
    query = "UPDATE Band SET isAlert = 1 WHERE post_id = '%s';" % (postkey)
    db.cursor.execute(query)

    db.conn.commit()
```

#### 토큰관리
각종 토큰이나 DB 접근에 관련한 파라미터들은 소스코드에 포함되서는 안되므로 별도의 파일에 저장해두고 `env.py`로 하여금 꺼내쓰도록 하였다.

crontab에서 python 파일을 실행할 경우 절대경로를 입력해줘야 하므로 os모듈에서 `getcwd()` 메소드를 사용하였다.
다만, 개발을 진행했던 우분투 가상머신의 경로와 실제로 서비스할 라즈베리파이에서의 경로가 조금 달라 매번 고쳐쓰기 불편하여 `try - except` 문으로 처리했다.
```python
# env.py
import os

def openenv():
    try:
        return open(os.getcwd()+"/BandCrawler/env", "r") #Crontab 실행환경은 절대경로를 입력해야한다.
    except:
        return open(os.getcwd() + "/env", "r") # 개발환경

def getenv(file):
    env = {}
    lines = file.readlines() # 줄별로 읽어서 배열로 리턴
    env['band_token'] = lines[0][:-1]
    env['db_usr'] = lines[1][:-1]
    env['db_pwd'] = lines[2][:-1]
    env['db_name'] = lines[3][:-1]
    env['telegram_token'] = lines[4][:-1]
    env['channel_id'] = lines[5]

    return env

```

### 실행!!
위에서 적었듯이 서비스는 집에서 굴러다니는 라즈베리파이에 올려주었다. 주기적으로 게시글을 가져오기 위하여 crontab 을 이용해 10분마다 `main.py`를 실행하도록 하였으며 실행과정에서 나오는 로그를 `crontab.log` 에 기록하도록 하였다.

`/10 * * * * python3 /home/pi/BandCrawler/main.py >> /home/pi/BandCrawler/cronlog.log 2>&1`

로그도 만족스럽게 잘 찍히고 있다.
![cronlog](https://user-images.githubusercontent.com/29659112/75757126-2023df00-5d75-11ea-93d8-ba5d790d3c96.png)

메시지도 10분 주기로 잘 들어온다.(불필요한 내용은 편집했다.)
![msg](https://user-images.githubusercontent.com/29659112/75777813-fdf08800-5d99-11ea-9f2c-740ca9c970cc.jpg)

### 마무리
사실 개발을 시작한건 한두주 전이었는데 그사이 개인적인 일이 많아 마무리를 짓지 못하고 3월이 되어버렸다.
마침 개강도 연기된 덕에 끝마무리를 지을 수 있어서 다행이다.

아버지께서도 평소보다 메신저에 신경쓰지 않고 훨씬 효율적인 업무를 하실 수 있게 되어 만족하실 것 같다.

가능하다면 정규표현식 쪽을 좀 더 다듬어서 정확한 알림서비스를 구현하고, 성공한다면 주소파싱을 통해 지도API를 이용해 정확한 위치를 찍어서 같이 공유하는 기능을 추가할 계획이다.

추가로 DB구조도 다듬어서 알림을 보냈거나 그러지 않은 이유를 같이 기록하게 개선하면 좋을 것 같다.
