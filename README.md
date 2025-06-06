# 배리어-프리 보건소 키오스크

이 저장소는 시각·청각 장애인을 포함한 모두가 쉽게 이용할 수 있는 보건소 키오스크 예제입니다. HTML, 자바스크립트, 그리고 Python 백엔드를 사용하여 음성 안내(TTS), 음성 인식(STT), 글자 크기 조절, 긴급 호출 버튼, 주변 시설 안내, AI 챗봇 기능 등을 제공합니다.

## 주요 기능
- 접수, 수납, 증명서 발급과 같은 기본 업무 화면
- 글자 크기 확대/축소 및 음성 안내 지원
- 긴급 도움 요청 및 주변 의료 시설 안내 모달
- 웹캠 화면 캡처와 음성 인식을 활용한 AI 챗봇 (Python 백엔드를 통해 Google Gemini API 사용)

## Python Backend (New)

The AI Chatbot functionality now uses a Python backend (Flask) to securely manage the Gemini API key and interact with the Gemini API. You will need to run this backend server in addition to the simple HTTP server for the frontend HTML/JS files.

## 필요 환경 (Prerequisites)
- Python 3.7+ and pip
- 최신 Chrome, Edge, Safari 등 Web Speech API 를 지원하는 브라우저
- Google Gemini API 키

## 실행 방법 (Execution Steps)

1.  **레포지토리를 클론한 뒤 프로젝트 폴더로 이동합니다.**
    ```bash
    git clone <repository-url>
    cd Kiosk2
    ```

2.  **Python 백엔드 설정 및 실행:**
    *   **API 키 설정:** AI 챗봇 기능을 사용하려면 Google Gemini API 키가 필요합니다. 이 키를 환경 변수로 설정해야 합니다.
        *   Linux/macOS:
            ```bash
            export GEMINI_API_KEY="YOUR_API_KEY_HERE"
            ```
        *   Windows (Command Prompt):
            ```bash
            set GEMINI_API_KEY=YOUR_API_KEY_HERE
            ```
        *   Windows (PowerShell):
            ```bash
            $env:GEMINI_API_KEY="YOUR_API_KEY_HERE"
            ```
        **중요:** `"YOUR_API_KEY_HERE"` 부분을 실제 API 키로 교체하세요. `.bashrc`, `.zshrc` 또는 이와 유사한 쉘 설정 파일에 `export` 명령을 추가하여 영구적으로 설정할 수 있습니다. **API 키를 코드에 직접 하드코딩하지 마세요.**

    *   **Python 의존성 설치:** 백엔드 서버에 필요한 Python 라이브러리를 설치합니다. 프로젝트 루트 디렉토리에서 다음 명령을 실행하세요:
        ```bash
        pip install -r requirements.txt
        ```
        (가상 환경 사용을 권장합니다: `python -m venv venv; source venv/bin/activate` 또는 `venv\Scriptsctivate` 후 `pip install ...`)

    *   **Python 백엔드 서버 실행:** Flask 개발 서버를 시작합니다. 이 서버는 기본적으로 5001번 포트에서 실행됩니다.
        ```bash
        python app.py
        ```
        서버가 실행되면 `* Running on http://127.0.0.1:5001/` 와 같은 메시지가 표시됩니다. 이 터미널 창을 열어두세요.

3.  **프론트엔드 실행 (별도의 터미널에서):**
    *   HTML, CSS, JavaScript 파일을 제공하기 위해 간단한 HTTP 서버를 시작합니다. 프로젝트 루트 디렉토리에서 새 터미널 창을 열고 다음 명령을 실행하세요:
        ```bash
        python -m http.server 8000
        # 또는 다른 사용 가능한 포트 번호
        ```

4.  **키오스크 접속:**
    *   브라우저에서 프론트엔드 서버 주소로 접속합니다 (예: `http://localhost:8000` 또는 `http://127.0.0.1:8000`).

5.  **기능 테스트:**
    *   브라우저에서 각 메뉴를 눌러 기능을 테스트하고, "AI 챗봇" 버튼을 눌러 질문을 해 보세요. 챗봇은 이제 Python 백엔드를 통해 Gemini API와 통신합니다.

## 커스터마이징
HTML/CSS/JS 파일을 수정하여 화면 디자인이나 기능을 자유롭게 확장할 수 있습니다. Python 백엔드(`app.py`)를 수정하여 프롬프트, 모델 또는 API 호출 로직을 변경할 수 있습니다.

## 기여
버그 제보나 개선 제안은 이슈 또는 풀 리퀘스트로 남겨 주세요.
