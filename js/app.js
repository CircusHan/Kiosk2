document.addEventListener('DOMContentLoaded', () => {
    const startRecordButton = document.getElementById('startRecordButton');
    const stopRecordButton = document.getElementById('stopRecordButton');
    const userTranscript = document.getElementById('userTranscript');
    const aiResponse = document.getElementById('aiResponse');
    const settingsLink = document.querySelector('nav a[href="settings.html"]');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;
    const speechSynthesis = window.speechSynthesis;

    // Function to speak text
    function speakText(text) {
        if (speechSynthesis && text) {
            // Cancel any ongoing speech
            speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            // Optionally set language for speech, e.g., Korean
            // Attempt to find a Korean voice. This is highly browser/OS dependent.
            const voices = speechSynthesis.getVoices();
            let koreanVoice = voices.find(voice => voice.lang === 'ko-KR');

            if (koreanVoice) {
                utterance.voice = koreanVoice;
            } else {
                // Fallback or default voice will be used
                console.warn('Korean voice not found, using default.');
            }
            utterance.lang = 'ko-KR'; // Set language for the utterance
            utterance.rate = 1.0; // Speed of speech
            utterance.pitch = 1.0; // Pitch of speech

            utterance.onerror = (event) => {
                console.error('SpeechSynthesisUtterance error:', event.error);
                aiResponse.textContent += " (음성 재생 오류)";
            };
            speechSynthesis.speak(utterance);
        } else if (!speechSynthesis) {
            console.warn('Speech synthesis not supported in this browser.');
            aiResponse.textContent += " (음성 재생 기능이 지원되지 않는 브라우저입니다)";
        }
    }

    // It's good practice to load voices first, as getVoices() might be async initially
    if (speechSynthesis && speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => {
            // Pre-load voices to improve chance of finding Korean voice
            speechSynthesis.getVoices();
        };
    }


    // Function to call Gemini API
    async function callGeminiAPI(text) {
        const apiKey = localStorage.getItem('geminiApiKey');
        if (!apiKey) {
            const msg = 'Gemini API 키가 설정되지 않았습니다. 설정에서 입력해주세요.';
            aiResponse.textContent = msg;
            // speakText(msg); // Optionally speak this message
            return;
        }

        const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;
        aiResponse.textContent = 'AI가 생각 중입니다...';

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: text
                        }]
                    }]
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Gemini API Error:', errorData);
                const errorMsg = `Gemini API 오류: ${response.status} ${response.statusText}. ${errorData?.error?.message || ''}`;
                aiResponse.textContent = errorMsg;
                speakText("API 호출 중 오류가 발생했습니다.");
                throw new Error(errorMsg);
            }

            const data = await response.json();

            if (data.candidates && data.candidates.length > 0 &&
                data.candidates[0].content && data.candidates[0].content.parts &&
                data.candidates[0].content.parts.length > 0) {
                const geminiText = data.candidates[0].content.parts[0].text;
                aiResponse.textContent = geminiText;
                speakText(geminiText); // Speak the Gemini response
            } else if (data.promptFeedback && data.promptFeedback.blockReason) {
                const blockReason = data.promptFeedback.blockReason;
                const safetyRatings = data.promptFeedback.safetyRatings.map(rating => `${rating.category}: ${rating.probability}`).join(', ');
                const blockedMsg = `콘텐츠가 차단되었습니다. 이유: ${blockReason}.`;
                aiResponse.textContent = `${blockedMsg} 안전 등급: ${safetyRatings}`;
                console.warn('Content blocked by Gemini API:', data.promptFeedback);
                speakText(blockedMsg);
            } else {
                const errMsg = 'Gemini API로부터 예상치 못한 응답 형식입니다.';
                aiResponse.textContent = errMsg;
                console.error('Unexpected Gemini API response structure:', data);
                speakText("API 응답을 처리할 수 없습니다.");
            }

        } catch (error) {
            console.error('Gemini API 호출 중 오류 발생:', error);
            // Avoid speaking the full technical error message if it's too long or complex
            const userFriendlyError = `오류가 발생했습니다. API 키와 네트워크 연결을 확인해주세요.`;
            aiResponse.textContent = `${userFriendlyError} (${error.message})`;
            speakText(userFriendlyError);
        }
    }

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'ko-KR';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            userTranscript.textContent = '음성 인식 중...';
            aiResponse.textContent = '';
            startRecordButton.disabled = true;
            stopRecordButton.disabled = false;
            speechSynthesis.cancel(); // Stop any ongoing speech
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userTranscript.textContent = transcript;
            callGeminiAPI(transcript);
        };

        recognition.onerror = (event) => {
            userTranscript.textContent = `음성 인식 오류: ${event.error}`;
            console.error('Speech recognition error:', event.error);
            const errorMsg = `음성 인식 중 오류가 발생했습니다: ${event.error}`;
            // aiResponse.textContent = errorMsg; // Avoid overriding AI response area for this
            speakText(errorMsg);
            startRecordButton.disabled = false;
            stopRecordButton.disabled = true;
        };

        recognition.onend = () => {
            startRecordButton.disabled = false;
            stopRecordButton.disabled = true;
            if (userTranscript.textContent === '음성 인식 중...') {
                 const noSpeechMsg = '음성을 감지하지 못했습니다. 다시 시도해주세요.';
                userTranscript.textContent = noSpeechMsg;
                // speakText(noSpeechMsg); // Optionally speak this
            }
        };

    } else {
        const noSupportMsg = '이 브라우저에서는 음성 인식을 지원하지 않습니다.';
        userTranscript.textContent = noSupportMsg;
        aiResponse.textContent = '음성 인식 기능을 사용하려면 다른 브라우저를 이용해주세요.';
        // speakText(noSupportMsg + " 다른 브라우저를 이용해주세요."); // Optionally speak this
        startRecordButton.disabled = true;
        stopRecordButton.disabled = true;
    }

    const initialApiKey = localStorage.getItem('geminiApiKey');
    if (!initialApiKey) {
        const noApiKeyMsg = 'Gemini API 키가 설정되지 않았습니다. 설정 페이지로 이동해주세요.';
        aiResponse.textContent = noApiKeyMsg;
        // speakText(noApiKeyMsg); // Optionally speak this
        if (SpeechRecognition) {
            startRecordButton.disabled = true;
        }
    }

    startRecordButton.addEventListener('click', () => {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel(); // Stop any currently playing speech before starting new recognition
        }
        if (recognition) {
            const currentApiKey = localStorage.getItem('geminiApiKey');
            if (!currentApiKey) {
                const noApiKeyMsg = 'Gemini API 키가 설정되지 않았습니다. 설정 페이지로 이동해주세요.';
                aiResponse.textContent = noApiKeyMsg;
                userTranscript.textContent = '';
                speakText(noApiKeyMsg);
                return;
            }
            userTranscript.textContent = '';
            aiResponse.textContent = '';
            recognition.start();
        } else {
            const noSupportMsg = '음성 인식을 시작할 수 없습니다.';
            userTranscript.textContent = noSupportMsg;
            speakText(noSupportMsg);
        }
    });

    stopRecordButton.addEventListener('click', () => {
        if (recognition && typeof recognition.stop === 'function') {
             // Check if recognition is actually running. Some browsers might have recognition object but not active.
            try {
                recognition.stop();
            } catch (e) {
                console.warn("Error stopping recognition:", e.message);
            }
        }
        // Manually disable stop button and enable start, as onend might not fire if stopped prematurely
        stopRecordButton.disabled = true;
        startRecordButton.disabled = false;
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel(); // Stop speech if user manually stops.
        }
    });

    if (settingsLink) {
        settingsLink.addEventListener('click', () => {
            console.log('Navigating to settings page.');
            if (speechSynthesis.speaking) {
                speechSynthesis.cancel(); // Stop speech when navigating away
            }
        });
    }
});
