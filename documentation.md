# Kiosk AI Chatbot: Frontend to Backend Communication

This document explains how clicking the "AI 챗봇" button in the kiosk's web interface leads to a request being sent to the Python backend, and how the frontend handles the response. It aims to make the process understandable even if you're not deeply familiar with all the JavaScript or Python (Flask) specifics.

## 1. Frontend JavaScript Interaction: From Button Click to API Request

The process starts when the user interacts with the AI chatbot elements on the `index.html` page.

**a. Invoking the Chatbot Modal:**

*   **The Button:** In `index.html`, there's a button designed to open the AI chatbot interface:
    ```html
    <button id="aiChatbotInvokeButton" class="ai-chatbot-invoke-button" title="AI 챗봇과 대화하기">
        <!-- SVG icon -->
    </button>
    ```
*   **JavaScript Event Listener:** In the `<script>` section of `index.html`, this button is linked to a JavaScript function:
    ```javascript
    const aiChatbotInvokeButton = document.getElementById('aiChatbotInvokeButton');
    // ...
    if(aiChatbotInvokeButton) aiChatbotInvokeButton.addEventListener('click', openAiChatbot);
    ```
    - `document.getElementById('aiChatbotInvokeButton')` finds the HTML button by its `id`.
    - `addEventListener('click', openAiChatbot)` tells the browser: "When this button is clicked, run the `openAiChatbot` function."

*   **The `openAiChatbot` function:**
    ```javascript
    function openAiChatbot() {
        aiChatbotModal.style.display = 'flex'; // Makes the chatbot window visible
        isChatbotOpen = true;
        startChatbotWebcam(); // Attempts to start the webcam
        initializeChatbotSpeechRecognition(); // Sets up voice input
        addMessageToChatbot("안녕하세요! 무엇을 도와드릴까요? 아래 마이크 버튼을 누르고 말씀해주세요.", "bot"); // Displays a welcome message
        resetTimerFunc();
    }
    ```
    This function primarily makes the chatbot modal (a pop-up window) appear on the screen.

**b. Sending the Question (The `askAiChatbot` function):**

Once the chatbot modal is open, the user can type a question or use the microphone. The key function responsible for sending this question to the backend is `askAiChatbot`. This function is typically called when the user clicks the microphone button (`aiChatbotMicButton`) and finishes speaking, or if text were submitted through an input field (though the current setup emphasizes voice).

Let's break down `askAiChatbot`:

```javascript
async function askAiChatbot(question) {
    if (!question) return; // Don't proceed if the question is empty
    addMessageToChatbot(question, 'user'); // Display user's question in the chat window
    aiChatbotUserInput.value = ''; // Clear the input field
    aiChatbotStatus.textContent = 'AI가 답변을 생성 중입니다...'; // Show a "waiting" message

    let base64ImageData = null;
    // This part tries to capture an image from the webcam
    if (chatbotStream && chatbotStream.active && aiChatbotWebcamElement.readyState >= 2) {
        // ... (canvas logic to capture and convert image to base64) ...
        base64ImageData = chatbotCaptureCanvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        // .split(',')[1] removes the "data:image/jpeg;base64," prefix from the image data string
    }

    // Prepare the data to be sent to the backend
    const payload = {
        question: question // The user's text question
    };
    if (base64ImageData) {
        payload.image_data = base64ImageData; // Add image data if available
    }

    // Define the backend API endpoint URL
    const backendApiUrl = 'http://localhost:5001/api/chatbot';

    try {
        // *** The Core Request to the Backend ***
        const response = await fetch(backendApiUrl, {
            method: 'POST', // Specifies the HTTP method: POST is used for sending data
            headers: {
                'Content-Type': 'application/json' // Tells the server that the data being sent is in JSON format
            },
            body: JSON.stringify(payload) // Converts the JavaScript 'payload' object into a JSON string
                                          // e.g., {"question": "Hello", "image_data": "..."}
        });

        // Process the response from the backend
        const result = await response.json(); // Converts the JSON string response from the server back into a JavaScript object

        if (!response.ok) { // Check if the server responded with an error (e.g., status 400 or 500)
            console.error('Backend API Error:', result);
            const errorMsg = result?.error || `AI 응답 오류 (코드: ${response.status})`;
            addMessageToChatbot(errorMsg, 'bot');
        } else if (result.response) { // If successful, the backend sends { "response": "AI message" }
            addMessageToChatbot(result.response, 'bot'); // Display AI's response
        } else {
            // Handle unexpected response structure
            addMessageToChatbot('백엔드로부터 예상치 못한 응답을 받았습니다.', 'bot');
        }
    } catch (error) { // Handle network errors or if the backend is down
        console.error('Fetch error to backend:', error);
        addMessageToChatbot(`AI 서비스 연결 중 오류 발생: ${error.message}. 백엔드 서버가 실행 중인지 확인하세요.`, 'bot');
    } finally {
        // Reset UI elements
        aiChatbotStatus.textContent = '마이크 버튼을 누르고 말씀해주세요.';
        if(aiChatbotMicButton) aiChatbotMicButton.disabled = false;
    }
}
```

**Key JavaScript `fetch` Concepts:**
*   **`fetch(backendApiUrl, { ... })`**: This is the modern JavaScript way to make web requests (similar to AJAX but simpler). It's asynchronous, meaning it doesn't freeze the browser while waiting for the server. The `await` keyword is used because `askAiChatbot` is an `async function`, making the asynchronous code easier to read.
*   **`method: 'POST'`**: Used when sending data to a server to create or update a resource. In this case, we're sending the user's question.
*   **`headers: { 'Content-Type': 'application/json' }`**: This header tells the backend server, "The data I'm sending you in the `body` is formatted as a JSON string."
*   **`body: JSON.stringify(payload)`**: The `payload` is a JavaScript object. `JSON.stringify()` converts this object into a string representation (e.g., `{"question":"안녕"}`). This string is then sent as the body of the request.
*   **`await response.json()`**: When the backend replies, this line takes the response (which is also a JSON string) and parses it back into a JavaScript object so it's easy to use in the frontend code (e.g., `result.response`).

(Note on JSON: JSON - JavaScript Object Notation - is a lightweight text-based format for data interchange. It's easy for humans to read and write, and easy for machines to parse and generate. It has become a standard "common language" for web services to talk to each other, regardless of whether they are written in JavaScript, Python, or another language.)

Next, we'll see how the Python backend receives this request.

## 2. Backend Python/Flask Interaction: Receiving the Request and Sending a Response

The JavaScript `fetch` call sends the user's question (and potentially an image) to our Python backend. The backend is built using Flask, a micro web framework for Python.

**a. What is Flask?**

Flask is a tool that makes it relatively simple to build web applications and APIs (Application Programming Interfaces) in Python. Think of an API as a waiter in a restaurant: the frontend (customer) gives an order (request) to the waiter (API), who then brings it to the kitchen (backend). The waiter then brings the food (response) back to the customer. This API is the set of rules for how the frontend and backend communicate. Our `app.py` file defines this backend API using Flask.

**b. Receiving the Request in `app.py`:**

The core of the backend logic for the chatbot is in the `chatbot_api()` function within `app.py`. The `@app.route(...)` line just above it is crucial:

```python
# app.py
# ... (imports and Flask app initialization: app = Flask(__name__)) ...

@app.route('/api/chatbot', methods=['POST'])
def chatbot_api():
    # ... function code ...
```

*   **`@app.route('/api/chatbot', methods=['POST'])`**: This line in Flask acts like a signpost for web requests.
    *   It tells Flask: "If a web request arrives for the path `/api/chatbot` using the `POST` method, then the function defined immediately below (`chatbot_api`) is the one that should handle it."
    *   `methods=['POST']` specifies that this function should only respond to HTTP POST requests. This matches the `method: 'POST'` used in our JavaScript `fetch` call.
    *   So, when the frontend sends a POST request to `http://localhost:5001/api/chatbot`, Flask automatically directs it to this `chatbot_api` function.

**c. Inside the `chatbot_api()` function:**

This function does the following:

```python
# app.py (inside chatbot_api function)
try:
    # 1. Get data from the request
    data = request.get_json()
    # 'request' is a Flask object holding incoming request data.
    # .get_json() parses the JSON string sent in the request body (from JavaScript's JSON.stringify)
    # back into a Python dictionary.

    if not data:
        return jsonify({"error": "No data provided"}), 400 # Send error if no data

    user_question = data.get('question') # Extract the question
    base64_image_data = data.get('image_data') # Extract image data (if sent)

    if not user_question:
        return jsonify({"error": "No question provided"}), 400 # Send error if no question

    print(f"Received question: {user_question}") # Log for the server admin

    # 2. Prepare prompt and (if image exists) image data for Gemini API
    model_name = "gemini-1.5-flash-latest"
    model = genai.GenerativeModel(model_name)
    prompt_parts = []
    prompt_text = f'''You are a helpful AI assistant... The user's question is: "{user_question}". ...''' # (Full prompt text)
    prompt_parts.append(prompt_text)

    if base64_image_data:
        try:
            image_bytes = base64.b64decode(base64_image_data)
            img_blob = {"mime_type": "image/jpeg", "data": image_bytes}
            prompt_parts.insert(0, img_blob)
            print("Image data successfully decoded and prepared for API.")
        except Exception as e:
            print(f"Error processing image data: {e}")
            return jsonify({"error": f"Invalid image data: {e}"}), 400

    # 3. Call the Google Gemini API
    # This is a simplified representation. The actual code involves error handling.
    api_response_object = model.generate_content(prompt_parts)
    bot_response_text = api_response_object.text

    # 4. Send the AI's response back to the frontend
    return jsonify({"response": bot_response_text})
    # jsonify() converts the Python dictionary {"response": bot_response_text}
    # into a JSON string, which is then sent back as the HTTP response.
    # The frontend's 'await response.json()' will parse this.

except Exception as e:
    # Handle any other errors during the process
    print(f"Error in /api/chatbot: {e}")
    return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500
```

**Key Flask Concepts:**
*   **`request.get_json()`**: Flask provides a global `request` object. When a request comes in with `Content-Type: application/json`, this method conveniently parses the JSON body into a Python dictionary. This is the reverse of JavaScript's `JSON.stringify()`.
*   **`jsonify({"response": bot_response_text})`**: This Flask helper function takes a Python dictionary and converts it into a JSON string. It also correctly sets the HTTP response header `Content-Type` to `application/json`. This resulting JSON string is what's sent back to the JavaScript `fetch` call. The status code will be 200 OK by default. If an error occurs, like `return jsonify({"error": "..."}), 400`, it sends a JSON error message with a 400 Bad Request status code.

(Note on JSON: As mentioned earlier, JSON serves as the "common language" that both the JavaScript frontend and the Python backend understand. `JSON.stringify()` in JavaScript and `jsonify()` in Python (or `request.get_json()`) are the tools used to translate data to and from this common format.)

This completes the round trip: JavaScript sends a JSON request, Python/Flask processes it and calls the Gemini API, and then Python/Flask sends a JSON response back to JavaScript.

## 3. Summary: End-to-End Data Flow

Here's a step-by-step summary of how information flows from the user clicking the AI button to the AI's response appearing on the screen:

1.  **User Action (Frontend - `index.html`)**:
    *   The user clicks the "AI 챗봇" (`aiChatbotInvokeButton`).
    *   JavaScript's `openAiChatbot()` function displays the chat interface.

2.  **User Input (Frontend - `index.html`)**:
    *   The user types a question or uses the microphone.
    *   Upon completion (e.g., clicking the mic button after speaking), the `askAiChatbot()` JavaScript function is triggered.

3.  **Request Preparation (Frontend - JavaScript in `index.html`)**:
    *   `askAiChatbot()` gathers the user's text question.
    *   It may also capture an image from the webcam and convert it to a Base64 encoded string.
    *   This data (question and optional image data) is packaged into a JavaScript object called `payload`.

4.  **HTTP POST Request (Frontend to Backend)**:
    *   JavaScript's `fetch()` function sends the `payload` to the Python backend.
        *   **URL:** `http://localhost:5001/api/chatbot`
        *   **Method:** `POST`
        *   **Headers:** `Content-Type: application/json`
        *   **Body:** The `payload` object is converted into a JSON string using `JSON.stringify()`.
        *   Think of this like sending a carefully packaged and addressed letter. The URL is the address, POST is the type of delivery service (indicating you're sending something to be processed), the headers are like notes on the envelope (e.g., "this package contains JSON"), and the body is the actual content of the letter (your data as a JSON string).

5.  **Request Received (Backend - Python/Flask in `app.py`)**:
    *   The Flask application, listening on port 5001, receives the POST request at the `/api/chatbot` endpoint.
    *   The `@app.route` decorator directs this request to the `chatbot_api()` Python function.

6.  **Data Processing (Backend - Python/Flask)**:
    *   Inside `chatbot_api()`:
        *   `request.get_json()` parses the JSON string from the request body back into a Python dictionary.
        *   The user's question and image data are extracted from this dictionary.

7.  **Gemini API Call (Backend - Python)**:
    *   The Python backend constructs a prompt using the user's question (and image, if provided).
    *   It then sends this prompt to the Google Gemini API for processing.

8.  **Response from Gemini (Backend - Python)**:
    *   The Gemini API returns a response (the AI-generated text) to the Python backend.

9.  **HTTP Response Preparation (Backend - Python/Flask)**:
    *   The `chatbot_api()` function takes the AI's text response and packages it into a Python dictionary (e.g., `{"response": "AI's answer"}`).
    *   `jsonify()` converts this dictionary into a JSON string and sends it back to the frontend as the HTTP response. This response typically has a 200 OK status code if successful.

10. **HTTP Response Received (Frontend - JavaScript in `index.html`)**:
    *   The JavaScript `fetch()` call in `askAiChatbot()` receives the HTTP response from the backend.
    *   `await response.json()` parses the JSON string from the backend's response back into a JavaScript object.

11. **Display AI Response (Frontend - JavaScript)**:
    *   The AI's message is extracted from the JavaScript object (e.g., `result.response`).
    *   The `addMessageToChatbot()` function is called to display the AI's answer in the chatbot window on the user's screen.

This cycle allows the user to have an interactive conversation with the AI, with the browser handling the user interface and the Python server managing the AI interaction securely and efficiently.
