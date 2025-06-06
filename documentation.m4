\divert(-1)
\# Simple macros for readability
\define(`H1', `\n\$1\n')
\define(`H2', `\n\$1\n')
\divert(0)
H1(`Kiosk2 프로젝트 설명')
H2(`개요')
이 저장소는 시각·청각 장애인을 포함한 모두가 사용할 수 있는 보건소 키오스크 예제입니다. HTML, 자바스크립트, 그리고 Flask 기반의 Python 백엔드를 사용하여 접근성을 강화한 다양한 기능을 제공합니다.
H2(`주요 파일')
* **README.md** – 프로젝트 소개와 실행 방법을 설명합니다.
* **app.py** – Flask 서버 구현. Gemini API와 통신하여 AI 챗봇 기능을 제공합니다.
* **index.html** – 키오스크 UI의 주요 화면과 스크립트를 포함한 단일 페이지 애플리케이션입니다.
* **settings.html** – API 키 저장 등 간단한 설정 화면을 위한 파일입니다.
* **requirements.txt** – Python 의존성 목록입니다.
H2(`구현 세부 사항')
* `app.py` 에서는 환경 변수 `GEMINI_API_KEY` 를 통해 API 키를 로드하고, `/api/chatbot` 엔드포인트에서 사용자의 질문과(선택적으로) 웹캠으로 캡처한 이미지를 받아 Google Gemini API에 전달합니다.
* `index.html` 은 TailwindCSS 로 스타일링되며, 화면 내비게이션과 접근성 도구(글자 크기 조절, TTS, 다국어 버튼, 지도 모달, 긴급 요청 버튼 등)를 JavaScript로 구현합니다.
* AI 챗봇 모달에서 사용자의 음성 인식을 Web Speech API 로 처리하며, 백엔드로 질문과 캡처 이미지를 전송해 응답을 받아 채팅 UI에 표시합니다.
* 긴급 도움 요청 모달과 주변 의료 시설 안내 모달을 제공하며, 미사용 시 화면 잠김을 방지하기 위한 타이머도 포함되어 있습니다.
H2(`실행')
1. `requirements.txt` 에 명시된 패키지를 설치하고 `app.py` 를 실행하여 백엔드를 5001번 포트에서 구동합니다.
2. 별도 터미널에서 간단한 HTTP 서버(예: `python -m http.server 8000`)를 실행해 프론트엔드를 제공합니다.
3. 브라우저에서 `http://localhost:8000` 주소로 접속하면 키오스크 화면을 확인할 수 있습니다.
H2(`참고')
API 키는 코드에 하드코딩하지 말고 환경 변수로 관리해야 하며, 자세한 설정 방법은 `README.md` 에 기술되어 있습니다.
