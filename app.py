import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from io import BytesIO
# from PIL import Image

app = Flask(__name__)
CORS(app)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("CRITICAL ERROR: GEMINI_API_KEY environment variable not set.")
else:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
    except Exception as e:
        print(f"Error configuring Gemini API: {e}")


@app.route('/api/chatbot', methods=['POST'])
def chatbot_api():
    if not GEMINI_API_KEY:
        return jsonify({"error": "API key not configured on the server."}), 500

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        user_question = data.get('question')
        base64_image_data = data.get('image_data')

        if not user_question:
            return jsonify({"error": "No question provided"}), 400

        print(f"Received question: {user_question}")

        model_name = "gemini-1.5-flash-latest"
        model = genai.GenerativeModel(model_name)

        prompt_parts = []

        # Corrected multiline string
        prompt_text = f'''You are a helpful AI assistant integrated into a health kiosk.
An image of the kiosk screen the user is currently viewing may be provided. The user's question is: "{user_question}".

Instructions:
1. If the question seems directly related to the provided image of the kiosk screen (e.g., asking about a button, text, or information on the screen), answer based on the image.
2. If the question is a general knowledge question (e.g., "What is the capital of France?", "How does photosynthesis work?", "Tell me a joke"), answer it as a general AI assistant.
3. If the question asks for real-time, unanswerable information (e.g., "What is the current weather?", "What are today's news headlines?"), or information beyond your capabilities (like performing actions outside the chat), politely state that you cannot provide that specific type of information and suggest where the user might find it if appropriate.
4. If no image is provided, or if the image is not relevant to the question, focus on answering as a general AI assistant based on the text of the question.

Please provide a comprehensive and helpful answer in Korean.'''
        prompt_parts.append(prompt_text)

        if base64_image_data:
            try:
                image_bytes = base64.b64decode(base64_image_data)
                img_blob = {"mime_type": "image/jpeg", "data": image_bytes}
                # Insert image before text for multimodal models
                prompt_parts.insert(0, img_blob)
                print("Image data successfully decoded and prepared for API.")
            except Exception as e:
                print(f"Error processing image data: {e}")
                return jsonify({"error": f"Invalid image data: {e}"}), 400

        api_response_object = None # To store the full response object for feedback checking
        try:
            api_response_object = model.generate_content(prompt_parts)
            bot_response = api_response_object.text
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            # Check for blockages if the response object exists
            if api_response_object and api_response_object.prompt_feedback and api_response_object.prompt_feedback.block_reason:
                error_message = f"Blocked by API for reason: {api_response_object.prompt_feedback.block_reason}"
                print(error_message)
                return jsonify({"error": error_message}), 500

            return jsonify({"error": f"Failed to get response from AI service: {str(e)}"}), 503

        return jsonify({"response": bot_response})

    except Exception as e:
        print(f"Error in /api/chatbot: {e}")
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    if not GEMINI_API_KEY:
        print("Warning: GEMINI_API_KEY is not set. The application will run but AI features will fail.")
    app.run(debug=True, port=5001)
