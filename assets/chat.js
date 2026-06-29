// OBSŁUGA CZATU Z WNUCZKIEM - WNUCZEK.AI

(function () {
  let chatHistoryData = [];
  let currentEmail = "";
  let currentUserName = "Jan";

  // DOM Elements
  let chatHistoryContainer = null;
  let chatInput = null;
  let btnSendChat = null;
  let chatSuggested = null;

  // Inicjalizacja Modułu po zalogowaniu
  function initChatModule(user) {
    currentEmail = user.email;
    currentUserName = user.name.split(" ")[0];

    // Powiązanie elementów DOM (muszą być pobierane po załadowaniu struktury)
    chatHistoryContainer = document.getElementById("chatHistory");
    chatInput = document.getElementById("chatInput");
    btnSendChat = document.getElementById("btnSendChat");
    chatSuggested = document.getElementById("chatSuggested");

    // Wczytaj historię czatu z localStorage
    loadChatHistory();

    // Reset event listenerów
    setupEventListeners();
  }

  // Wczytywanie historii czatu
  function loadChatHistory() {
    const key = `wnuczek_chat_${currentEmail}`;
    const saved = localStorage.getItem(key);
    
    if (saved) {
      chatHistoryData = JSON.parse(saved);
    } else {
      // Domyślna wiadomość powitalna
      chatHistoryData = [
        {
          sender: "ai",
          text: `Cześć! Cieszę się, że jesteś. Jak się dzisiaj czujesz? Chętnie o czymś pogadam, pomogę Ci z przelicznikiem kuchennym lub przypomnę o lekach. Co u Ciebie słychać?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      saveChatHistory();
    }

    renderChatHistory();
  }

  // Zapisywanie historii czatu
  function saveChatHistory() {
    const key = `wnuczek_chat_${currentEmail}`;
    localStorage.setItem(key, JSON.stringify(chatHistoryData));
  }

  // Renderowanie wiadomości na ekranie
  function renderChatHistory() {
    if (!chatHistoryContainer) return;
    chatHistoryContainer.innerHTML = "";

    chatHistoryData.forEach((msg, idx) => {
      const row = document.createElement("div");
      row.className = `chat-message-row ${msg.sender === "user" ? "user" : "ai"}`;

      if (msg.sender === "ai") {
        row.innerHTML = `
          <img src="assets/avatar.png" alt="Wnuczek" class="chat-avatar">
          <div class="chat-message ai">
            <div class="chat-message-bubble">${escapeHTML(msg.text)}</div>
            <div class="chat-message-actions">
              <button class="btn-tts" data-idx="${idx}" aria-label="Przeczytaj na głos">🔊</button>
            </div>
            <span class="chat-message-meta">Wnuczek, ${msg.timestamp}</span>
          </div>
        `;
      } else {
        row.innerHTML = `
          <div class="chat-message user">
            <div class="chat-message-bubble">${escapeHTML(msg.text)}</div>
            <span class="chat-message-meta">Ja, ${msg.timestamp}</span>
          </div>
        `;
      }

      chatHistoryContainer.appendChild(row);
    });

    scrollChatToBottom();
    setupTTSButtons();
  }

  // Przewijanie czatu na dół
  function scrollChatToBottom() {
    if (chatHistoryContainer) {
      chatHistoryContainer.scrollTop = chatHistoryContainer.scrollHeight;
    }
  }
  window.scrollChatToBottom = scrollChatToBottom;

  // Filtrowanie znaków specjalnych HTML
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  // Konfiguracja Event Listenerów
  function setupEventListeners() {
    // Wysyłanie wiadomości enterem lub przyciskiem
    btnSendChat.onclick = handleUserSend;
    chatInput.onkeydown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleUserSend();
      }
    };

    // Sugerowane pytania
    chatSuggested.onclick = (e) => {
      const btn = e.target.closest(".suggested-btn");
      if (btn) {
        const question = btn.getAttribute("data-question");
        chatInput.value = question;
        handleUserSend();
      }
    };
  }

  // Obsługa wysłania wiadomości
  async function handleUserSend() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Dodaj wiadomość użytkownika
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    chatHistoryData.push({
      sender: "user",
      text: text,
      timestamp: timeNow
    });
    
    chatInput.value = "";
    renderChatHistory();
    saveChatHistory();

    // Dodaj element ładowania AI (animacja kropek lub szary dymek)
    showAILoadingIndicator();

    try {
      const reply = await generateAIResponse(text);
      
      // Usuń loader i dodaj odpowiedź
      removeAILoadingIndicator();
      
      chatHistoryData.push({
        sender: "ai",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      
      renderChatHistory();
      saveChatHistory();

      // Automatyczna synteza mowy dla najnowszej wiadomości (opcjonalnie, ale miło!)
      const ttsButtons = chatHistoryContainer.querySelectorAll(".btn-tts");
      const lastButton = ttsButtons[ttsButtons.length - 1];
      speakText(reply, lastButton);

    } catch (err) {
      removeAILoadingIndicator();
      showToast("Wystąpił błąd podczas generowania odpowiedzi. Spróbuj ponownie.", "error");
      console.error(err);
    }
  }

  // Loader dla odpowiedzi AI
  function showAILoadingIndicator() {
    const loaderRow = document.createElement("div");
    loaderRow.className = "chat-message-row ai";
    loaderRow.id = "chatLoader";
    loaderRow.innerHTML = `
      <img src="assets/avatar.png" alt="Wnuczek" class="chat-avatar">
      <div class="chat-message ai" style="opacity: 0.7;">
        <div class="chat-message-bubble"><em>Wnuczek pisze...</em></div>
      </div>
    `;
    chatHistoryContainer.appendChild(loaderRow);
    scrollChatToBottom();
  }

  function removeAILoadingIndicator() {
    const loader = document.getElementById("chatLoader");
    if (loader) loader.remove();
  }

  // ==========================================================================
  // GENERATOR ODPOWIEDZI AI / MOCK FALLBACK
  // ==========================================================================

  async function generateAIResponse(userText) {
    let apiKey = (typeof GEMINI_API_KEY !== "undefined" && GEMINI_API_KEY && GEMINI_API_KEY !== "TWÓJ_KLUCZ_API_TUTAJ") ? GEMINI_API_KEY.trim() : "";

    if (apiKey) {
      try {
        return await callGeminiAPI(apiKey, userText);
      } catch (err) {
        console.error("Gemini API call failed", err);
        showToast("Błąd połączenia z serwerem.", "error");
        return "Przepraszam Cię bardzo, ale w tym momencie nie mogę połączyć się z moim serwerem (prawdopodobnie przez chwilowe problemy z internetem). Spróbuj proszę wysłać wiadomość jeszcze raz za chwilkę! Twój kochający wnuczek Adaś.";
      }
    } else {
      return "Brak klucza API w aplikacji. Uzupełnij klucz GEMINI_API_KEY w pliku config.js, aby móc rozmawiać ze swoim wirtualnym wnuczkiem.";
    }
  }

  // Połączenie z Gemini API
  async function callGeminiAPI(apiKey, userText) {
    const systemInstruction = "Jesteś Cyfrowym Wnuczkiem – niezwykle cierpliwym, ciepłym i uprzejmym asystentem technologicznym dla osób starszych. Mówisz prostym, zrozumiałym językiem polskim, unikasz żargonu technicznego. Tłumaczysz seniorowi świat komputerów, smartfonów i internetu krok po kroku. Delikatnie i życzliwie ostrzegasz przed oszustami w sieci.";
    const textPrompt = `${systemInstruction} \n\nPytanie seniora: ${userText}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: textPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  // ==========================================================================
  // SYNTEZA MOWY (TTS) - PL-PL
  // ==========================================================================

  function setupTTSButtons() {
    const buttons = chatHistoryContainer.querySelectorAll(".btn-tts");
    buttons.forEach(btn => {
      btn.onclick = () => {
        const idx = btn.getAttribute("data-idx");
        const msg = chatHistoryData[idx];
        if (msg) {
          speakText(msg.text, btn);
        }
      };
    });
  }

  let currentUtterance = null;
  let activeTTSButton = null;

  function speakText(text, btnElement = null) {
    if (!("speechSynthesis" in window)) {
      showToast("Synteza mowy nie jest wspierana przez Twoją przeglądarkę.", "error");
      return;
    }

    // Jeśli mowa już trwa i kliknięto ten sam przycisk - zatrzymaj
    if (window.speechSynthesis.speaking && activeTTSButton === btnElement && btnElement !== null) {
      window.speechSynthesis.cancel();
      resetTTSButtonState();
      return;
    }

    // Zatrzymaj poprzednie odtwarzanie
    window.speechSynthesis.cancel();
    resetTTSButtonState();

    // Oczyszczanie tekstu ze znaków emoji do czytania
    const textToRead = text.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "");

    currentUtterance = new SpeechSynthesisUtterance(textToRead);
    currentUtterance.lang = "pl-PL";

    // Wybór polskiego głosu
    const voices = window.speechSynthesis.getVoices();
    const polishVoice = voices.find(voice => voice.lang.includes("pl-PL") || voice.lang.includes("PL"));
    if (polishVoice) {
      currentUtterance.voice = polishVoice;
    }

    // Zmiana ikonki przycisku na pauzę/odtwarzanie
    if (btnElement) {
      activeTTSButton = btnElement;
      btnElement.textContent = "⏹️";
      btnElement.classList.add("active");
    }

    currentUtterance.onend = () => {
      resetTTSButtonState();
    };

    currentUtterance.onerror = () => {
      resetTTSButtonState();
    };

    window.speechSynthesis.speak(currentUtterance);
  }

  function resetTTSButtonState() {
    if (activeTTSButton) {
      activeTTSButton.textContent = "🔊";
      activeTTSButton.classList.remove("active");
      activeTTSButton = null;
    }
    currentUtterance = null;
  }

  // Wczytanie głosów w przeglądarce (wymagane w niektórych przeglądarkach np. Chrome async)
  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      // Wyzwalane przy załadowaniu głosów
    };
  }

  // Eksponuj moduł na zewnątrz
  window.initChatModule = initChatModule;

})();
