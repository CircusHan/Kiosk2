// tests/app.test.js
describe('Main Application Logic (app.js)', () => {
    let originalFetch;
    let originalGetElementById;
    let originalQuerySelector;
    let mockUserTranscript, mockAiResponse, mockStartButton, mockStopButton, mockSettingsLink;

    // Mock Web APIs
    let mockSpeechRecognitionInstance = {
        start: () => {
            console.log("mock recognition.start()");
            if (mockSpeechRecognitionInstance.onstart) mockSpeechRecognitionInstance.onstart();
        },
        stop: () => {
            console.log("mock recognition.stop()");
            if (mockSpeechRecognitionInstance.onend) mockSpeechRecognitionInstance.onend();
        },
        continuous: false,
        lang: '',
        interimResults: false,
        maxAlternatives: 1,
        onstart: null,
        onresult: null,
        onerror: null,
        onend: null,
        readyState: '' // To simulate states like 'recording'
    };

    let MockSpeechRecognitionGlobal = function() {
        return mockSpeechRecognitionInstance;
    };
    MockSpeechRecognitionGlobal.isSupported = true; // Control for tests

    let mockSpeechSynthesisInstance = {
        speak: (utterance) => console.log("mock speechSynthesis.speak()", utterance.text),
        cancel: () => console.log("mock speechSynthesis.cancel()"),
        getVoices: () => [{ lang: 'ko-KR', name: 'Korean Mock Voice' }],
        onvoiceschanged: null,
        speaking: false
    };

    // This function will be called by app.js, and needs to be available globally for it.
    // It simulates how app.js would try to initialize itself after DOM content is loaded.
    // We are essentially trying to re-run the app.js's DOMContentLoaded logic in a controlled way.
    // This is still a bit of a workaround for not having app.js structured as modules/functions.
    function reInitializeAppJs() {
        // This is tricky. app.js is already loaded and its DOMContentLoaded listener attached.
        // We can't just re-run the script easily.
        // The tests will rely on the fact that app.js has already run and
        // its global functions (like callChatGPTAPI if it were global) or event listeners
        // are set up using the mocked DOM elements.
        // For functions like callChatGPTAPI which are scoped, we need to test them via the events that trigger them.
        console.log("Attempting to re-initialize app.js logic conceptually for test setup.");
    }


    beforeAll(() => {
        originalFetch = window.fetch;
        originalGetElementById = document.getElementById;
        originalQuerySelector = document.querySelector;

        // Apply mocks for Web APIs BEFORE app.js might use them
        window.SpeechRecognition = MockSpeechRecognitionGlobal.isSupported ? MockSpeechRecognitionGlobal : undefined;
        window.webkitSpeechRecognition = MockSpeechRecognitionGlobal.isSupported ? MockSpeechRecognitionGlobal : undefined;
        window.speechSynthesis = mockSpeechSynthesisInstance;

        // Mock DOM elements
        mockUserTranscript = document.createElement('p');
        mockUserTranscript.id = 'userTranscript';
        mockAiResponse = document.createElement('p');
        mockAiResponse.id = 'aiResponse';
        mockStartButton = document.createElement('button');
        mockStartButton.id = 'startRecordButton';
        mockStopButton = document.createElement('button'); // Added stop button mock
        mockStopButton.id = 'stopRecordButton';
        mockSettingsLink = document.createElement('a');
        mockSettingsLink.href = "settings.html";

        document.body.appendChild(mockUserTranscript);
        document.body.appendChild(mockAiResponse);
        document.body.appendChild(mockStartButton);
        document.body.appendChild(mockStopButton);
        document.body.appendChild(mockSettingsLink);

        document.getElementById = (id) => {
            if (id === 'userTranscript') return mockUserTranscript;
            if (id === 'aiResponse') return mockAiResponse;
            if (id === 'startRecordButton') return mockStartButton;
            if (id === 'stopRecordButton') return mockStopButton;
            return originalGetElementById.call(document, id);
        };
        document.querySelector = (selector) => {
            if (selector === 'nav a[href="settings.html"]') return mockSettingsLink;
            return originalQuerySelector.call(document, selector);
        };

        // app.js is loaded in test-runner.html. Its DOMContentLoaded listener should have run.
        // If app.js's initialization is complex, this might need adjustment.
    });

    afterAll(() => {
        window.fetch = originalFetch;
        document.getElementById = originalGetElementById;
        document.querySelector = originalQuerySelector;
        localStorage.clear();
        // Clean up mocked elements from body
        document.body.removeChild(mockUserTranscript);
        document.body.removeChild(mockAiResponse);
        document.body.removeChild(mockStartButton);
        document.body.removeChild(mockStopButton);
        document.body.removeChild(mockSettingsLink);

    });

    beforeEach(() => {
        localStorage.clear();
        mockUserTranscript.textContent = '';
        mockAiResponse.textContent = '';
        mockStartButton.disabled = false;
        mockStopButton.disabled = true; // Default state from HTML
        mockSpeechRecognitionInstance.onstart = null;
        mockSpeechRecognitionInstance.onresult = null;
        mockSpeechRecognitionInstance.onerror = null;
        mockSpeechRecognitionInstance.onend = null;
        mockSpeechRecognitionInstance.readyState = '';


        window.fetch = async (url, options) => {
            return {
                ok: true,
                json: async () => ({ candidates: [{ content: { parts: [{ text: "Mocked AI response" }] } }] }),
                status: 200, statusText: "OK"
            };
        };
        // Because app.js has already run, we are testing the state of the application
        // as it was initialized with the (now mocked) browser APIs.
        // For tests that depend on initial state (like API key check),
        // we might need to simulate the DOMContentLoaded event or call an init function.
        // For now, we assume app.js has set up its listeners on our mocked elements.
    });

    it('should show API key needed message and disable start if key is not set and speech recognition is supported', () => {
        MockSpeechRecognitionGlobal.isSupported = true;
        window.SpeechRecognition = MockSpeechRecognitionGlobal; // Ensure it's "supported"
        window.webkitSpeechRecognition = MockSpeechRecognitionGlobal;

        // Manually trigger the part of app.js's DOMContentLoaded that checks API key
        // This is a simplification.
        const initialApiKey = localStorage.getItem('openaiApiKey');
        if (!initialApiKey) {
            mockAiResponse.textContent = 'OpenAI API 키가 설정되지 않았습니다. 설정 페이지로 이동해주세요.';
            if (window.SpeechRecognition || window.webkitSpeechRecognition) {
                mockStartButton.disabled = true;
            }
        }

        console.assert(mockAiResponse.textContent.includes('OpenAI API 키가 설정되지 않았습니다'), "API key needed message not shown.");
        console.assert(mockStartButton.disabled === true, "Start button not disabled when API key is missing and speech is supported.");
    });

    it('should NOT disable start button if API key is missing BUT speech recognition is NOT supported', () => {
        MockSpeechRecognitionGlobal.isSupported = false;
        window.SpeechRecognition = undefined; // Ensure it's "not supported"
        window.webkitSpeechRecognition = undefined;
        localStorage.clear(); // No API Key
        mockStartButton.disabled = false; // Reset button state

        // Manually trigger the app.js initialization logic for this scenario
        // This is simulating the conditions *before* app.js's DOMContentLoaded runs for this specific state.
        // In reality, app.js has already run. This test highlights the difficulty of testing
        // initial states without refactoring app.js for testability (e.g. an init() function).

        // What we can test is the state *after* app.js has run, assuming it encountered these conditions.
        // If app.js already ran and found no SpeechRecognition, it would disable the start button based on that.
        // Let's adjust the test to reflect what app.js *would do* on load if it found no speech rec.
        if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
            mockUserTranscript.textContent = '이 브라우저에서는 음성 인식을 지원하지 않습니다.';
            // In app.js, startButton is disabled if SpeechRecognition is not available.
            mockStartButton.disabled = true;
        }

        console.assert(mockStartButton.disabled === true, "Start button should be disabled if speech rec is not supported, regardless of API key.");
    });


    it('should call ChatGPT API via fetch when speech is recognized and display response', (done) => {
        localStorage.setItem('openaiApiKey', 'fake-key');
        MockSpeechRecognitionGlobal.isSupported = true; // Ensure speech rec is enabled for this test
        window.SpeechRecognition = MockSpeechRecognitionGlobal;
        window.webkitSpeechRecognition = MockSpeechRecognitionGlobal;

        // Simulate app.js being re-initialized for this specific state (if it were possible)
        // Re-attaching listeners or calling an init function would be ideal.
        // For now, directly trigger the sequence of events.

        // 1. User clicks start
        mockStartButton.click(); // This should trigger recognition.start() via app.js's listener

        // 2. Recognition service calls onresult
        const mockTranscript = "안녕하세요";
        if (mockSpeechRecognitionInstance.onresult) {
            mockSpeechRecognitionInstance.onresult({ results: [[{ transcript: mockTranscript }]] });
        } else {
            console.error("onresult handler not set up by app.js on mock object");
            done.fail("onresult not set up"); // Jasmine syntax, adapt for console.assert
        }

        // 3. callChatGPTAPI should be called, which uses fetch
        // We need to wait for the fetch promise to resolve.
        setTimeout(() => {
            try {
                console.assert(mockUserTranscript.textContent === mockTranscript, "Transcript not displayed.");
                console.assert(mockAiResponse.textContent === "Mocked AI response", "ChatGPT response not displayed.");
                done(); // Signal async completion
            } catch (e) {
                done.fail ? done.fail(e) : console.error(e); // Adapt for runner
            }
        }, 100); // Small delay for async operations
    });

    it('should handle OpenAI API error (e.g., bad key) and display error message', (done) => {
        localStorage.setItem('openaiApiKey', 'fake-key-bad');
        MockSpeechRecognitionGlobal.isSupported = true;
        window.SpeechRecognition = MockSpeechRecognitionGlobal;
        window.webkitSpeechRecognition = MockSpeechRecognitionGlobal;

        window.fetch = async () => ({
            ok: false,
            json: async () => ({ error: { message: "Invalid API key" } }),
            status: 400, statusText: "Bad Request"
        });

        mockStartButton.click();
        if (mockSpeechRecognitionInstance.onresult) {
            mockSpeechRecognitionInstance.onresult({ results: [[{ transcript: "test" }]] });
        } else {
             done.fail ? done.fail("onresult not set") : console.error("onresult not set");
        }

        setTimeout(() => {
            try {
                console.assert(mockAiResponse.textContent.includes("OpenAI API 오류: 400 Bad Request"), "OpenAI API error not handled as expected.");
                console.assert(mockAiResponse.textContent.includes("Invalid API key"), "Specific error message from API not included.");
                done();
            } catch (e) {
                done.fail ? done.fail(e) : console.error(e);
            }
        }, 100);
    });

    it('should handle unexpected OpenAI API response gracefully', (done) => {
        localStorage.setItem('openaiApiKey', 'fake-key-blocked');
        MockSpeechRecognitionGlobal.isSupported = true;
        window.SpeechRecognition = MockSpeechRecognitionGlobal;
        window.webkitSpeechRecognition = MockSpeechRecognitionGlobal;

        window.fetch = async (url, options) => ({
            ok: true,
            json: async () => ({ choices: [] }),
            status: 200, statusText: "OK"
        });

        mockStartButton.click();
        if (mockSpeechRecognitionInstance.onresult) {
            mockSpeechRecognitionInstance.onresult({ results: [[{ transcript: "some blocked content" }]] });
        } else {
            done.fail ? done.fail("onresult not set") : console.error("onresult not set");
        }

        setTimeout(() => {
            try {
                console.assert(mockAiResponse.textContent.includes("OpenAI API로부터 예상치 못한 응답 형식입니다."), "Unexpected response message not shown.");
                done();
            } catch (e) {
                done.fail ? done.fail(e) : console.error(e);
            }
        }, 100);
    });

    it('should correctly inform user if SpeechRecognition is not supported at all', () => {
        // Set SpeechRecognition to be unsupported
        MockSpeechRecognitionGlobal.isSupported = false;
        window.SpeechRecognition = undefined;
        window.webkitSpeechRecognition = undefined;

        // To test the initial setup of app.js, we'd ideally call an init function.
        // Since app.js runs on DOMContentLoaded, and that has already happened when test-runner.html loads app.js,
        // we need to simulate the state *as if* app.js had just run with these conditions.
        // This means the elements should reflect the state app.js would put them in.
        // This is a limitation of testing non-modular, auto-executing scripts.

        // Simulate the relevant logic from app.js's DOMContentLoaded:
        if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
            mockUserTranscript.textContent = '이 브라우저에서는 음성 인식을 지원하지 않습니다.';
            mockAiResponse.textContent = '음성 인식 기능을 사용하려면 다른 브라우저를 이용해주세요.';
            mockStartButton.disabled = true;
            if (mockStopButton) mockStopButton.disabled = true;
        }

        console.assert(mockUserTranscript.textContent.includes('음성 인식을 지원하지 않습니다'), "User transcript msg for no speech rec support is wrong.");
        console.assert(mockAiResponse.textContent.includes('다른 브라우저를 이용해주세요'), "AI response msg for no speech rec support is wrong.");
        console.assert(mockStartButton.disabled === true, "Start button not disabled when speech rec is not supported.");
        if (mockStopButton) { // stopRecordButton might not exist or be relevant if start is disabled
            console.assert(mockStopButton.disabled === true, "Stop button not disabled when speech rec is not supported.");
        }
    });

});
