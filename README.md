# ELECTRA - Election Process Education Assistant

**Prompt Wars Hackathon | Google Developer Groups | 2026**

## 🌟 Executive Summary
ELECTRA (Election Literacy & Civic Training Resource Assistant) is an AI-powered conversational assistant built on Google Antigravity that helps citizens of all backgrounds understand democratic election processes clearly, interactively, and without confusion. 

This repository contains a fully functional prototype designed for the **Prompt Wars hackathon**, demonstrating how complex electoral knowledge can be transformed into friendly, step-by-step conversations powered by Google Gemini and NVIDIA NIM APIs.

## 🎯 Chosen Vertical
**Civic Tech & Education** - Empowering voters through accessible, neutral, and accurate election information.

## 💡 Approach and Logic
ELECTRA utilizes a **Multi-Agent System** to route topics seamlessly. The logic is built upon combining powerful foundational models (like Gemini 1.5 Pro) with specialized NVIDIA models (OCR, safety, voice) to handle different aspects of the voter education journey. 

The application ensures **Strict Political Neutrality**, avoiding candidate endorsements and focusing purely on factual, public data to educate users.

---

## 🚀 Features (From PRD)
ELECTRA is organized into 6 core modules and several advanced power features:

### Core Modules:
1. **Interactive Welcome & Topic Menu**: Warm greeting with clear navigation to various election topics.
2. **Voter Registration Guide**: Step-by-step, personalized registration walkthrough based on user location and status.
3. **Election Timeline Visualizer**: A clear, chronological breakdown of the election cycle with personal deadline reminders.
4. **Ballot Decoder**: Plain-language explanations of complex down-ballot races, referendums, and propositions.
5. **Candidate Comparison Tool**: Neutral, factual comparison of candidates based on official platforms and voting records.
6. **Election Day Guide & Rights Protector**: A real-time polling day checklist and "Know Your Rights" guide.

### Advanced Power Features (MAESTRO Architecture):
*   **Live Election Fact-Check Engine (VERITAS)**: Real-time monitoring and correction of election misinformation using Google Search grounding.
*   **Upload Your Ballot (DECODER)**: Uses OCR to read a user's sample ballot and generate a plain-language prep sheet.
*   **Empath (Emotional Intelligence)**: Dynamically adjusts tone based on voter anxiety or frustration.
*   **VoteSim (Practice Voting)**: Interactive branching narrative simulating Election Day.
*   **Civic DNA Profile**: Personalizes interactions based on the user's relationship to civic life.
*   **Debate Arena**: Interactive "devil's advocate" feature for analyzing ballot measures from multiple angles.
*   **Classroom Mode**: Scalable platform for teachers to generate civic curricula and quizzes.
*   **Trust Engine**: Educates users on the factual security mechanisms in modern elections (chain of custody, audits).

---

## 🛠️ How the Solution Works
The prototype is a sleek, web-based chat interface built using vanilla HTML, CSS, and JavaScript. It communicates with backend logic (simulated or API-driven) to respond to user inputs. 

1. **User Interface**: A premium, glassmorphism-inspired dark mode UI with smooth micro-animations.
2. **State Management**: Tracks the conversation flow, user persona, and active module.
3. **AI Integration**: Designed to plug into Google Gemini via Antigravity and NVIDIA NIM APIs (see `API_INSTRUCTIONS.md`).

## 📌 Assumptions Made
*   Users have access to a modern web browser.
*   The API endpoints (Google & NVIDIA) will be configured locally by the evaluators using the provided `.env.example` structure.
*   For the sake of this prototype, if API keys are missing, the system falls back to a locally simulated "mock" AI to demonstrate the UI and conversational flows without breaking.

---

## 🏆 Evaluation Focus Areas Addressed
*   **Code Quality**: Clean, modular Vanilla JS structure. Clear separation of concerns (HTML/CSS/JS).
*   **Security**: API keys are isolated. A strict `.gitignore` prevents secret leaks. 
*   **Efficiency**: Lightweight vanilla web app with zero heavy dependencies for lightning-fast loading.
*   **Testing**: Includes a simulated mock mode to easily test all 6 modules even offline.
*   **Accessibility**: High-contrast UI, readable typography (Inter font), and keyboard-navigable chat.
*   **Google Services**: Designed around Google Antigravity & Gemini 1.5 Pro architecture.

---

## 💻 Getting Started
1. Clone this repository.
2. Open `index.html` in any modern web browser to view the prototype.
3. To configure live APIs, please refer to `API_INSTRUCTIONS.md`.