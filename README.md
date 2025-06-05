# AI 음성 비서 웹 애플리케이션 (AI Voice Assistant Web Application)

이 프로젝트는 사용자의 음성을 인식하고 OpenAI의 ChatGPT API(gpt-4o 모델)를 통해 응답을 생성하여 음성으로 출력하는 웹 애플리케이션입니다. 사용자는 설정 페이지에서 자신의 OpenAI API 키를 입력하고 저장할 수 있습니다.

## 주요 기능

*   **음성 인식**: 사용자의 음성을 텍스트로 변환합니다 (한국어 지원).
*   **ChatGPT API 연동**: 변환된 텍스트를 OpenAI의 ChatGPT API(gpt-4o 모델)로 전송하여 지능적인 응답을 생성합니다.
*   **텍스트 음성 변환 (TTS)**: ChatGPT로부터 받은 응답을 음성으로 사용자에게 전달합니다 (한국어 음성 지원).
*   **API 키 설정**: 사용자가 자신의 OpenAI API 키를 안전하게 저장하고 관리할 수 있는 설정 페이지를 제공합니다 (`localStorage` 사용).
*   **사용자 인터페이스**: 깔끔하고 반응형인 UI를 제공합니다.
*   **오류 처리**: API 오류, 음성 인식 오류 등 다양한 상황에 대한 알림을 제공합니다.

## 기술 스택

*   HTML5
*   CSS3
*   JavaScript (ES6+)
*   Web Speech API (SpeechRecognition for STT, SpeechSynthesis for TTS)
*   OpenAI ChatGPT API (gpt-4o)

## 사전 준비 사항

1.  **웹 브라우저**: 최신 버전의 Chrome, Edge, Safari 등 Web Speech API를 지원하는 브라우저.
    *   음성 인식 및 합성은 브라우저 및 운영체제에 따라 지원 여부와 품질이 다를 수 있습니다.
2.  **OpenAI API 키**: [OpenAI](https://platform.openai.com/)에서 API 키를 발급받아야 합니다.
    *   API 사용에는 요금제가 적용되므로, 사용 전에 정책을 확인하세요.

## 설치 및 실행 방법

1.  **프로젝트 클론 또는 다운로드**:
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```
    또는 ZIP 파일로 다운로드하여 압축을 해제합니다.

2.  **애플리케이션 실행**:
    *   별도의 빌드 과정이나 서버 설정 없이 로컬 파일 시스템에서 직접 `index.html` 파일을 웹 브라우저로 열어 실행할 수 있습니다.
    *   `index.html` 파일을 더블 클릭하거나, 브라우저에서 "파일 열기" (Ctrl+O 또는 Cmd+O) 기능을 사용하여 선택합니다.
    *   **참고**: 일부 브라우저는 로컬 파일 시스템에서 Web Speech API의 모든 기능을 완벽하게 지원하지 않을 수 있습니다. 최상의 경험을 위해서는 간단한 로컬 HTTP 서버 (예: Live Server VS Code 확장, Python `http.server` 등)를 사용하여 파일을 제공하는 것이 좋습니다.
        ```bash
        # Python 3 사용 시 (프로젝트 루트 디렉토리에서 실행)
        python -m http.server
        ```
        이후 브라우저에서 `http://localhost:8000` (또는 지정된 포트)으로 접속합니다.

3.  **OpenAI API 키 설정**:
    *   애플리케이션을 처음 실행하면 AI 응답 영역에 API 키가 설정되지 않았다는 메시지가 표시됩니다.
    *   상단의 "설정" (Settings) 링크를 클릭하여 설정 페이지로 이동합니다.
    *   발급받은 OpenAI API 키를 입력 필드에 붙여넣고 "API 키 저장" 버튼을 클릭합니다.
    *   성공적으로 저장되면 메시지가 표시되고, 이제 음성 비서 기능을 사용할 수 있습니다. API 키는 브라우저의 `localStorage`에 저장됩니다.

4.  **음성 비서 사용**:
    *   메인 페이지에서 "녹음 시작" 버튼을 클릭합니다.
    *   브라우저에서 마이크 접근 권한을 요청하면 허용합니다.
    *   말을 하면 음성이 텍스트로 변환되어 "사용자 음성" 영역에 표시됩니다.
    *   인식이 완료되면 해당 텍스트가 ChatGPT API로 전송되고, AI의 응답이 "AI 응답" 영역에 표시되며 음성으로도 출력됩니다.
    *   "녹음 중지" 버튼으로 수동으로 녹음을 중단할 수 있습니다.

## 테스트

*   `tests/test-runner.html` 파일을 브라우저에서 열어 기본적인 단위 테스트를 실행할 수 있습니다.
*   테스트는 `localStorage` 조작, API 응답 처리 로직 (mocked) 등을 검증합니다. Web API 자체의 기능 테스트는 포함하지 않습니다.

## 브라우저 호환성

*   **Chrome**: 음성 인식 및 합성에 대해 가장 잘 지원합니다.
*   **Edge (Chromium 기반)**: Chrome과 유사하게 잘 작동합니다.
*   **Safari**: 음성 인식 및 합성을 지원하지만, 음성 품질이나 특정 기능에 차이가 있을 수 있습니다. 한국어 음성 지원이 제한적일 수 있습니다.
*   **Firefox**: 기본적으로 Web Speech API의 SpeechRecognition을 지원하지 않을 수 있습니다 (플래그를 통해 활성화 필요 또는 미지원). SpeechSynthesis는 지원합니다. 이 애플리케이션의 음성 입력 기능은 Firefox에서 제대로 작동하지 않을 가능성이 높습니다.

## 향후 개선 사항

*   실시간 음성 인식 (중간 결과 표시)
*   보다 자연스러운 음성 합성 옵션 (다양한 목소리 선택 등)
*   대화 기록 기능
*   보다 정교한 상태 관리 및 UI 피드백
*   PWA (Progressive Web App)으로 전환하여 오프라인 기능 및 설치 지원

## 기여 방법

버그를 발견하거나 개선 사항이 있다면 언제든지 이슈를 생성하거나 풀 리퀘스트를 보내주세요.

---

This README provides a Korean guide for the AI Voice Assistant application.