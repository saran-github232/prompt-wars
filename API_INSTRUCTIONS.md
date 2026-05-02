# API Integration Instructions

ELECTRA is designed to seamlessly integrate with **Google Gemini (via Antigravity)**. To make the prototype fully functional with live AI generation instead of the offline simulated mode, follow these instructions.

## Step 1: Environment Setup
1. Locate the `.env.example` file in the root directory.
2. Duplicate this file and rename the copy to `.env`.
   - *Note: The `.env` file is included in `.gitignore` to prevent you from accidentally committing your API keys to the public repository.*

## Step 2: Get Your API Keys

### Google Gemini API (Antigravity)
*   **Where to get it:** Go to [Google AI Studio](https://aistudio.google.com/) and create a new API key.
*   **Where to paste it:** In your `.env` file, replace `your_google_api_key_here` next to `GOOGLE_API_KEY=` with your actual key.

## Step 3: Connecting the Frontend to APIs
Because this is a vanilla HTML/JS prototype, exposing API keys directly in the frontend (`script.js`) is a security risk. 

To use the live AI in this repository:
1. Open the UI by launching `index.html`.
2. Open the **Settings Panel** (gear icon in the bottom left of the sidebar).
3. Paste your Google Gemini API key into the designated input field. 
4. The application will securely hold the key in your browser's local storage for the session and use it to make direct REST API calls to the Google Generative Language endpoints.

## Step 4: Selected Models Configuration
Because this is a Google-organized hackathon, we are exclusively utilizing the highest-tier Gemini models to maximize capability and ensure seamless integration with the Antigravity architecture:
*   **Chatbot & Core Reasoning**: `gemini-2.5-pro` (Industry-leading logic and reasoning capabilities)
*   **Multilingual Support**: `gemini-2.5-pro` (Natively handles flawless multi-language support)
*   **Ballot Decoder (OCR & Vision)**: `gemini-2.5-pro` (World-class image recognition and OCR)

*Note: If no API key is provided in the Settings Panel, the application will automatically fall back to "Simulation Mode," outputting predefined realistic responses based on the PRD's conversational flows, ensuring the prototype is always verifiable by judges.*
