document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const typingIndicator = document.getElementById('typing-indicator');
    const navItems = document.querySelectorAll('.nav-item');
    const sidebar = document.getElementById('sidebar');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const clearBtn = document.getElementById('clear-btn');
    const homeDashboard = document.getElementById('home-dashboard');
    const inputArea = document.getElementById('input-area');
    const countdownTimer = document.getElementById('countdown-timer');
    
    // Settings Elements
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const saveSettingsBtn = document.getElementById('save-settings');
    const geminiKeyInput = document.getElementById('gemini-key');
    const nvidiaKeyInput = document.getElementById('nvidia-key');
    const simModeToggle = document.getElementById('sim-mode');
    const modelStatus = document.getElementById('model-status');

    // Advanced Feature Elements
    const veritasToggle = document.getElementById('veritas-toggle');
    const uploadBtn = document.getElementById('upload-btn');
    const ballotUploadInput = document.getElementById('ballot-upload');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const removeImageBtn = document.getElementById('remove-image-btn');
    const scoreText = document.getElementById('score-text');
    const scoreFill = document.getElementById('score-fill');
    
    // Voice and Lang
    const langSelect = document.getElementById('lang-select');
    const voiceTtsBtn = document.getElementById('voice-tts-btn');

    // --- State ---
    let currentModule = 'welcome';
    let isSimMode = true;
    let geminiApiKey = '';
    let isVeritasActive = true;
    let isVoiceActive = false;
    let currentLang = 'en';
    let base64Image = null;
    let civicScore = 150;
    
    // Core conversation memory for AI
    let conversationHistory = [];

    // --- Initialize ---
    loadSettings().then(() => {
        updateCountdown();
        setInterval(updateCountdown, 60000); // update every minute
        
        // Set initial view
        handleViewSwitch(currentModule);
    });

    // --- Event Listeners ---
    sendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Mobile Sidebar Toggle
    mobileMenuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Clear Chat
    clearBtn.addEventListener('click', () => {
        chatContainer.innerHTML = '';
        conversationHistory = [];
        addSystemMessage('Chat history cleared. Context reset.');
        setTimeout(() => addBotMessage(getWelcomeMessage(), true), 500);
    });

    // Navigation Modules
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            navItems.forEach(n => n.classList.remove('active'));
            const target = e.currentTarget;
            target.classList.add('active');
            currentModule = target.dataset.module;
            
            if(window.innerWidth <= 768) sidebar.classList.remove('open');
            handleViewSwitch(currentModule);
        });
    });

    // Dashboard Cards Click
    document.querySelectorAll('.dash-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const trigger = e.currentTarget.dataset.trigger;
            navItems.forEach(n => {
                n.classList.remove('active');
                if(n.dataset.module === trigger) n.classList.add('active');
            });
            currentModule = trigger;
            handleViewSwitch(trigger);
        });
    });

    // Fact Check Toggle
    veritasToggle.addEventListener('change', (e) => {
        isVeritasActive = e.target.checked;
        addSystemMessage(`VERITAS Fact-Check Engine is now ${isVeritasActive ? '<span class="badge success">ACTIVE</span>' : '<span class="badge warning">OFF</span>'}`);
    });

    // Language Change
    langSelect.addEventListener('change', (e) => {
        currentLang = e.target.value;
        addSystemMessage(`Language updated. ELECTRA will now respond in your preferred language.`);
    });

    // Voice Toggle
    voiceTtsBtn.addEventListener('click', () => {
        isVoiceActive = !isVoiceActive;
        voiceTtsBtn.classList.toggle('active-voice', isVoiceActive);
        if (isVoiceActive) {
            addSystemMessage('TTS Voice Output <span class="badge success">ENABLED</span>');
        } else {
            addSystemMessage('TTS Voice Output <span class="badge warning">DISABLED</span>');
            window.speechSynthesis.cancel();
        }
    });

    // File Upload (Ballot Decoder)
    uploadBtn.addEventListener('click', () => ballotUploadInput.click());
    
    ballotUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            base64Image = event.target.result;
            imagePreview.src = base64Image;
            imagePreviewContainer.classList.remove('hidden');
            addSystemMessage('Ballot image attached. Ask ELECTRA to decode it!');
            // Auto switch to ballot module
            document.querySelector('[data-module="ballot"]').click();
        };
        reader.readAsDataURL(file);
    });

    removeImageBtn.addEventListener('click', () => {
        base64Image = null;
        imagePreviewContainer.classList.add('hidden');
        ballotUploadInput.value = '';
    });

    // Settings Modal
    settingsBtn.addEventListener('click', () => {
        sidebar.classList.remove('open');
        settingsModal.classList.remove('hidden');
    });
    closeModalBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
    
    saveSettingsBtn.addEventListener('click', () => {
        geminiApiKey = geminiKeyInput.value.trim();
        const nvidiaKey = nvidiaKeyInput.value.trim();
        isSimMode = simModeToggle.checked || geminiApiKey === '';
        
        localStorage.setItem('electra_gemini_key', geminiApiKey);
        localStorage.setItem('electra_nvidia_key', nvidiaKey);
        localStorage.setItem('electra_sim_mode', isSimMode);
        
        updateStatusDisplay();
        settingsModal.classList.add('hidden');
        addSystemMessage(`Settings saved. Simulated Mode: ${isSimMode ? 'ON' : 'OFF'}`);
    });

    // --- Core Functions ---
    async function loadSettings() {
        // Try to load from localStorage first
        geminiApiKey = localStorage.getItem('electra_gemini_key') || '';
        const simModeStorage = localStorage.getItem('electra_sim_mode');
        isSimMode = simModeStorage === null ? true : simModeStorage === 'true';
        
        // If no key in localStorage, try to fetch from .env file
        if (!geminiApiKey) {
            try {
                const response = await fetch('.env');
                if (response.ok) {
                    const text = await response.text();
                    const match = text.match(/GOOGLE_API_KEY=(.+)/);
                    if (match && match[1]) {
                        geminiApiKey = match[1].trim();
                        if (geminiApiKey !== 'your_google_api_key_here') {
                            isSimMode = false;
                            localStorage.setItem('electra_gemini_key', geminiApiKey);
                            localStorage.setItem('electra_sim_mode', 'false');
                            addSystemMessage('API Key auto-loaded from .env file. Live mode active!');
                        } else {
                            geminiApiKey = '';
                        }
                    }
                }
            } catch (e) {
                console.log('Could not fetch .env (likely running via file:// protocol)');
            }
        }
        
        geminiKeyInput.value = geminiApiKey;
        simModeToggle.checked = isSimMode;
        
        updateStatusDisplay();
    }

    function updateStatusDisplay() {
        if (isSimMode) {
            modelStatus.innerText = "Simulated Mock Mode";
            modelStatus.style.color = "#fbbf24";
        } else {
            modelStatus.innerText = "Gemini API Connected";
            modelStatus.style.color = "#10b981";
        }
    }

    function updateScore(points) {
        civicScore += points;
        if (civicScore > 1000) civicScore = 1000;
        let rank = "Beginner Voter";
        let width = (civicScore / 1000) * 100;
        
        if (civicScore >= 400) rank = "Informed Citizen";
        if (civicScore >= 700) rank = "Civic Leader";
        if (civicScore >= 900) rank = "Election Expert";
        
        scoreText.innerText = `${rank} (${civicScore} pts)`;
        scoreFill.style.width = `${width}%`;
    }

    async function handleSend() {
        const text = chatInput.value.trim();
        if (!text && !base64Image) return;

        chatInput.value = '';
        chatInput.style.height = 'auto';
        
        const hasImage = base64Image !== null;
        const currentBase64 = base64Image; // capture for closure
        
        addUserMessage(text, currentBase64);
        
        // Clear image preview after sending
        if (hasImage) {
            base64Image = null;
            imagePreviewContainer.classList.add('hidden');
            ballotUploadInput.value = '';
        }
        
        showTyping();
        updateScore(10); // Reward interaction

        if (isSimMode) {
            setTimeout(() => {
                hideTyping();
                const response = getSimulatedResponse(text, currentModule, hasImage);
                addBotMessage(response);
            }, 1500);
        } else {
            try {
                const response = await callGeminiAPI(text, currentBase64);
                hideTyping();
                addBotMessage(response);
            } catch (error) {
                hideTyping();
                addBotMessage(`**Error:** Unable to reach API. Check your connection or API key. \n\n*Details: ${error.message}*`);
            }
        }
    }

    function addUserMessage(text, imgBase64 = null) {
        let contentHtml = text ? `<p>${escapeHTML(text)}</p>` : '';
        if (imgBase64) {
            contentHtml += `<img src="${imgBase64}" style="max-width: 100%; border-radius: 8px; margin-top: 8px; max-height: 200px; object-fit: cover;">`;
        }
        
        const html = `
            <div class="message user-message">
                <div class="avatar"><i class="fa-solid fa-user"></i></div>
                <div class="message-content">${contentHtml}</div>
            </div>
        `;
        chatContainer.insertAdjacentHTML('beforeend', html);
        scrollToBottom();
        
        let parts = [];
        if (text) parts.push({ text });
        conversationHistory.push({ role: 'user', parts: [{ text: text || "[Attached Image]" }] });
    }

    function addBotMessage(text, isHtml = false) {
        const formattedText = isHtml ? text : (window.marked ? marked.parse(text) : text);
        
        const html = `
            <div class="message bot-message">
                <div class="avatar"><i class="fa-solid fa-bolt"></i></div>
                <div class="message-content">${formattedText}</div>
            </div>
        `;
        chatContainer.insertAdjacentHTML('beforeend', html);
        scrollToBottom();
        conversationHistory.push({ role: 'model', parts: [{ text }] });
        attachActionListeners();

        if (isVoiceActive) {
            speakText(text);
        }
    }

    function speakText(text) {
        if (!('speechSynthesis' in window)) return;
        const plainText = text.replace(/[#_*\[\]]/g, ''); // strip markdown
        const utterance = new SpeechSynthesisUtterance(plainText);
        
        utterance.lang = currentLang === 'zh' ? 'zh-CN' : (currentLang === 'es' ? 'es-ES' : (currentLang === 'te' ? 'te-IN' : 'en-US'));
        utterance.rate = 1.05;
        
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    }

    function addSystemMessage(text) {
        const html = `
            <div class="message system-message">
                <div class="message-content">
                    <p><i class="fa-solid fa-microchip"></i> ${text}</p>
                </div>
            </div>
        `;
        chatContainer.insertAdjacentHTML('beforeend', html);
        scrollToBottom();
    }

    function showTyping() { typingIndicator.classList.remove('hidden'); scrollToBottom(); }
    function hideTyping() { typingIndicator.classList.add('hidden'); }
    function scrollToBottom() { chatContainer.scrollTop = chatContainer.scrollHeight; }

    // --- Simulated Content Generators ---
    
    function updateCountdown() {
        const electionDate = new Date("November 3, 2026 07:00:00").getTime();
        const now = new Date().getTime();
        const distance = electionDate - now;
        
        if (distance < 0) {
            countdownTimer.innerText = "Election Day is Here!";
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        countdownTimer.innerText = `${days} Days Away`;
    }

    function handleViewSwitch(module) {
        if (module === 'welcome') {
            homeDashboard.classList.remove('hidden');
            chatContainer.classList.add('hidden');
            inputArea.classList.add('hidden');
        } else {
            homeDashboard.classList.add('hidden');
            chatContainer.classList.remove('hidden');
            inputArea.classList.remove('hidden');
            
            // Only trigger welcome message if chat is empty
            if (chatContainer.children.length <= 1) {
                handleModuleSwitch(module);
            } else {
                let title = module.toUpperCase();
                addSystemMessage(`Switched to MAESTRO Agent: <strong>[${title}]</strong>`);
            }
        }
    }

    function handleModuleSwitch(module) {
        let title = module.toUpperCase();
        addSystemMessage(`Switched to MAESTRO Agent: <strong>[${title}]</strong>`);
        showTyping();
        
        setTimeout(() => {
            hideTyping();
            let msg = '';
            switch(module) {
                case 'registration':
                    msg = "Let's get you registered to vote! To give you the right steps, **what state do you live in?**";
                    break;
                case 'timeline':
                    msg = "I can build a personalized election timeline for you. Are you looking for dates for the **General Election**, **Primary Election**, or a **Local Election**?";
                    break;
                case 'ballot':
                    msg = "### DECODER Activated\nBallots can be confusing! You can click the **Camera Icon** below to upload a photo of your sample ballot, or just type in a proposition you need help decoding.";
                    break;
                case 'candidates':
                    msg = "I provide factual, neutral comparisons based purely on official platforms and voting records. Which race or candidates are you researching?";
                    break;
                case 'rights':
                    msg = "Knowing your rights at the polling place is crucial. Do you have a specific concern, or would you like to review the **Voter Bill of Rights**?";
                    break;
                case 'votesim':
                    msg = "### VoteSim: Interactive Election Day\nWelcome to the simulation. It's Tuesday morning, Election Day. You arrive at your polling place and the line is wrapping around the building. A poll worker tells you the wait is 2 hours.\n\n**What do you do?**\n1. Wait in line\n2. Leave and try to come back later\n3. Ask if there's a provisional ballot line";
                    break;
                case 'debate':
                    msg = "### Debate Arena\nLet's test your civic thinking. Here is a real ballot measure topic: **Universal Mail-in Voting**.\n\nState your position (For or Against) and give me your strongest argument. I will act as a respectful 'Devil's Advocate' to help you think critically about the opposing view. (Note: I have no personal opinion).";
                    break;
                default:
                    msg = "How can I help you today?";
            }
            addBotMessage(msg);
        }, 800);
    }

    function getSimulatedResponse(text, module, hasImage) {
        const lowerText = text.toLowerCase();
        
        // VERITAS Fact Check Engine Simulation
        if (isVeritasActive && (lowerText.includes('rigged') || lowerText.includes('fake votes') || lowerText.includes('dead people'))) {
            return `
<span class="badge success">VERITAS Fact Check</span>
It looks like you're mentioning a common concern regarding election integrity. 
**Fact Context:** Extensive audits and reviews by state election officials from both parties, as well as the Cybersecurity and Infrastructure Security Agency (CISA), have confirmed that modern U.S. elections have rigorous safeguards. While isolated instances of voter fraud occur, comprehensive studies show they are extremely rare and do not occur at a scale that affects national election outcomes.

*Would you like to learn about how mail-in ballots are verified (signature matching, barcodes) to ensure security?*
            `;
        }

        // Universal Neutrality Guardrail
        if (lowerText.includes('who should i vote for') || lowerText.includes('who is better')) {
            return "As a perfectly neutral civic assistant, **I cannot tell you who to vote for or endorse any candidate.** My role is to provide factual information so you can make your own informed decision. Would you like to use the **Candidate Comparison Tool** to view their stated policies?";
        }

        // Ballot Image Decoding Simulation
        if (module === 'ballot' && hasImage) {
            updateScore(50);
            return `
### DECODER: Ballot Analysis Complete 🔍
I've used OCR to read the ballot image you uploaded. Here is a plain-language breakdown of what's on it:

**1. City Council At-Large (Choose 2)**
*What this means:* You are voting for two people to represent the entire city on the council, rather than a specific district. They vote on local laws, budgets, and zoning.

**2. Proposition 14: School Bond Measure**
*What a YES vote means:* The state will issue $5 billion in bonds to repair and construct public school facilities. It does not directly raise income taxes, but is paid back over time from the general fund.
*What a NO vote means:* The state will not issue these bonds.

Would you like to dive deeper into either of these?
            `;
        }

        // Registration Flow Simulation
        if (module === 'registration') {
            if (lowerText.includes('california') || lowerText.includes('ca')) {
                return "Great! In **California**, the deadline to register online or by mail is 15 days before Election Day. However, California offers 'Same Day Voter Registration' at county elections offices. \n\n**Are you registering for the first time, or do you need to update an address?**";
            }
            if (lowerText.includes('first time') || lowerText.includes('first-time')) {
                updateScore(30);
                return "Congratulations on voting for the first time! 🎉 You can register online at \`registertovote.ca.gov\`. You will need your CA driver license or the last 4 digits of your SSN. Let me know if you need help filling out the form!";
            }
        }
        
        // VoteSim Simulation
        if (module === 'votesim') {
            if (lowerText.includes('1') || lowerText.includes('wait')) {
                updateScore(20);
                return "Good choice. **If you are in line before the polls close, you have the legal right to vote**, no matter how long it takes. \n\n*Simulation continues:* You finally reach the front, but the poll worker says your name is not on the voter roll. What do you do?\n1. Leave without voting\n2. Ask for a Provisional Ballot";
            }
            if (lowerText.includes('2') || lowerText.includes('provisional')) {
                updateScore(50);
                return "Excellent! You asked for a **Provisional Ballot**. This is your legal right. You fill it out, and election officials will verify your eligibility later before counting it. \n\n**Simulation Complete!** You successfully navigated Election Day and protected your rights.";
            }
        }
        
        // Debate Arena Simulation
        if (module === 'debate') {
            if (lowerText.includes('for') || lowerText.includes('support')) {
                updateScore(30);
                return "You've taken the position **FOR** Universal Mail-in Voting.\n\n*Devil's Advocate:* While mail-in voting increases turnout and convenience, critics argue it breaks the 'secret ballot' tradition since voting isn't done in a private booth, potentially exposing voters to coercion by family members. Furthermore, it complicates the chain of custody for the physical ballot.\n\n**How would you counter the argument about protecting voters from family coercion at the kitchen table?**";
            }
        }
        
        // Fallback
        return "I understand you're asking about **" + text + "**. I am currently running in prototype simulation mode. If you provide an API key in the settings, I will analyze this using the live Gemini model to provide a precise, customized answer.";
    }

    // --- API Integration (Google Gemini) ---
    async function callGeminiAPI(promptText, imgBase64) {
        if (!geminiApiKey) throw new Error("API Key missing");
        
        // Prepare content payload
        let currentMessageParts = [];
        if (promptText) {
            currentMessageParts.push({ text: promptText });
        } else if (imgBase64) {
            currentMessageParts.push({ text: "Please decode this ballot image and explain it simply." });
        }
        
        if (imgBase64) {
            const base64Data = imgBase64.split(',')[1];
            const mimeType = imgBase64.substring(imgBase64.indexOf(':') + 1, imgBase64.indexOf(';'));
            currentMessageParts.push({
                inline_data: { mime_type: mimeType, data: base64Data }
            });
        }
        
        let apiContents = [];
        if (currentMessageParts.length > 0) {
            apiContents = [{ role: 'user', parts: currentMessageParts }];
        }

        const systemInstructionText = `You are ELECTRA, a neutral Election Education AI. 
Current Module: ${currentModule}. 
Language Setting: Respond in ISO code: ${currentLang}.
Fact-checking (VERITAS): ${isVeritasActive ? 'ON. Correct any misinformation politely.' : 'OFF.'}
Rule: NEVER endorse a candidate. Be highly formatting with markdown, bolding, and bullet points. Keep answers concise and educational.`;

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
        
        const payload = {
            system_instruction: { parts: [{ text: systemInstructionText }] },
            contents: apiContents,
            generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
        };

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API request failed');
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    // --- Utilities ---
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag])
        );
    }

    function attachActionListeners() {
        const actionBtns = document.querySelectorAll('.module-action-btn');
        actionBtns.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', (e) => {
                const trigger = e.currentTarget.dataset.trigger;
                navItems.forEach(n => {
                    n.classList.remove('active');
                    if(n.dataset.module === trigger) n.classList.add('active');
                });
                currentModule = trigger;
                handleViewSwitch(trigger);
            });
        });
    }
});
