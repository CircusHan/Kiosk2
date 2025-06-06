# Kiosk2 프로젝트 자세한 설명
## 프로젝트 개요
이 프로젝트는 시각·청각 장애인을 포함한 누구나 이용할 수 있는 보건소 키오스크를 만들기 위한 예제입니다. 화면의 글자 크기를 조절하거나 음성 안내를 들을 수 있고, 긴급 호출 버튼과 AI 챗봇까지 제공하여 접근성을 높였습니다. 프론트엔드는 HTML과 자바스크립트로 작성되었고, AI 기능 처리를 위해 Python의 Flask 프레임워크가 사용됩니다.

## 폴더와 파일 구조
* **README.md** – 프로젝트 소개와 실행 순서를 설명합니다.
* **app.py** – Flask 서버 구현 파일로, 사용자의 질문을 받아 Google Gemini API와 통신합니다.
* **index.html** – 키오스크 화면을 담당하는 하나의 HTML 파일이며 자바스크립트가 포함되어 있습니다.
* **settings.html** – API 키 입력 등 향후 확장을 위한 간단한 설정 화면 예제입니다.
* **requirements.txt** – Flask 등 Python에서 필요한 패키지 목록입니다.

H2(`Flask 백엔드란?')
Flask는 Python으로 웹 서버를 손쉽게 만들 수 있게 해 주는 도구입니다. `app.py` 를 실행하면 내 컴퓨터에서 작은 서버가 열리고, 이 서버가 AI 챗봇 요청을 처리합니다. 터미널에서 아래와 같이 실행하면 됩니다.
```
python app.py
```
실행 후 `Running on http://127.0.0.1:5001/` 같은 메시지가 보이면 정상적으로 동작하는 것입니다.

## 키오스크 화면의 주요 기능
* **접수·수납·증명서 발급 버튼**: 각 업무 화면으로 이동합니다. 실제 기능은 예시로 비워져 있습니다.
* **글자 크기 조절**: 화면 하단 버튼으로 글자 크기를 네 단계 중 선택할 수 있고 선택 시 음성 안내가 나옵니다.
* **음성 안내(TTS)**: 대부분의 버튼이 눌릴 때 현재 화면 정보를 음성으로 읽어 줍니다. 크롬 등의 브라우저에 내장된 Web Speech API를 사용합니다.
* **AI 챗봇**: 우측 하단 말풍선 아이콘을 누르면 웹캠이 켜지고 음성 또는 텍스트로 질문할 수 있습니다. 질문과 화면 캡처 이미지는 Flask 서버를 통해 Gemini API로 전송됩니다.
* **긴급 도움 요청 버튼**: 우측 하단의 고정 버튼을 누르면 직원 호출 화면이 나타납니다.
* **주변 의료 시설 지도**: 지도 버튼을 누르면 위치 정보를 예시로 보여 주는 모달 창이 뜹니다.

## 버튼을 눌렀을 때 동작하는 함수들
각 버튼과 연결된 주요 자바스크립트 함수는 다음과 같습니다.
* **접수 버튼** → `showScreen('receptionScreen')`, `speak('접수 화면입니다.')`
* **수납 버튼** → `showScreen('paymentScreen')`, `speak('수납 화면입니다.')`
* **증명서 발급 버튼** → `showScreen('certificateScreen')`, `speak('증명서 발급 화면입니다.')`
* **홈으로 버튼** → `showScreen('homeScreen')`, `speak('홈 화면으로 돌아왔습니다.')`
* **글자 크게/작게 버튼** → `updateAllTextSizes()` 호출 후 현재 크기를 음성으로 안내
* **음성안내 버튼** → `ttsEnabled` 값을 토글하고 `updateTtsButtonUI()` 실행
* **시설안내 버튼** → `mapModal.style.display = 'block'` 으로 모달 표시
* **긴급 도움 요청 버튼** → `emergencyHelpModal.style.display = 'block'`
* **AI 챗봇 아이콘** → `openAiChatbot()` 으로 챗봇 창을 엽니다

## 실행 방법 자세히 보기
1. Python이 설치되어 있지 않다면 [python.org](https://www.python.org)에서 설치합니다.
2. 터미널에서 프로젝트 폴더로 이동한 뒤 다음 명령으로 필요한 패키지를 설치합니다.
   ```
   pip install -r requirements.txt
   ```
3. Google Gemini API 키를 환경 변수 `GEMINI_API_KEY` 로 지정합니다. 예시(Linux/Mac):
   ```
   export GEMINI_API_KEY="여기에_키_입력"
   ```
   Windows는 `set GEMINI_API_KEY=여기에_키_입력` 형태를 사용합니다.
4. Flask 서버를 실행합니다.
   ```
   python app.py
   ```
5. 새 터미널을 열어 프론트엔드 파일을 제공할 간단한 HTTP 서버를 실행합니다.
   ```
   python -m http.server 8000
   ```
6. 웹 브라우저에서 `http://localhost:8000` 에 접속하면 키오스크 화면이 보입니다. AI 챗봇 기능을 사용하려면 백엔드 서버(`http://localhost:5001`)가 계속 실행 중이어야 합니다.

H2(`기타 참고 사항')
* API 키와 같은 민감한 정보는 코드에 직접 적지 말고 반드시 환경 변수로 관리하세요.
* Flask나 JavaScript에 익숙하지 않더라도 위 실행 절차를 그대로 따라 하면 데모를 구동할 수 있습니다. 기능을 수정하고 싶다면 `index.html`을 열어 텍스트나 버튼을 조금씩 바꿔 보며 학습해 볼 수 있습니다.
