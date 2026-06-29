// SYSTEM LEKÓW, TERMINARZA I POWIADOMIEŃ MEDYCZNYCH - WNUCZEK.AI

(function () {
  let medsData = [];
  let eventsData = [];
  let currentEmail = "";
  
  // Interwał sprawdzania przypomnień
  let alertCheckInterval = null;
  // Słownik zapobiegający powtórnym alertom w tej samej minucie
  let triggeredMedsThisMinute = {};

  // DOM Elements - Leki
  let formAddMed = null;
  let medsList = null;
  
  // DOM Elements - Kalendarz
  let formAddEvent = null;
  let eventsList = null;

  // DOM Elements - Modale powiadomień
  let medicalAlertOverlay = null;
  let alertMessage = null;
  let btnAlertAck = null;
  let btnTriggerDemoAlert = null;

  // Inicjalizacja modułu
  function initMedsModule(email) {
    currentEmail = email;

    // Elementy formularzy
    formAddMed = document.getElementById("formAddMed");
    medsList = document.getElementById("medsList");
    formAddEvent = document.getElementById("formAddEvent");
    eventsList = document.getElementById("eventsList");

    // Elementy alertów
    medicalAlertOverlay = document.getElementById("medicalAlertOverlay");
    alertMessage = document.getElementById("alertMessage");
    btnAlertAck = document.getElementById("btnAlertAck");
    btnTriggerDemoAlert = document.getElementById("btnTriggerDemoAlert");

    // Wczytaj dane leków i kalendarza
    loadData();

    // Wyrenderuj listy
    renderMeds();
    renderEvents();

    // Podepnij zdarzenia
    setupMedsEventListeners();
  }

  // Wczytywanie danych z localStorage
  function loadData() {
    const medsKey = `wnuczek_meds_${currentEmail}`;
    const eventsKey = `wnuczek_events_${currentEmail}`;

    const savedMeds = localStorage.getItem(medsKey);
    const savedEvents = localStorage.getItem(eventsKey);

    if (savedMeds) {
      medsData = JSON.parse(savedMeds);
    } else {
      // Domyślny zestaw leków dla demonstracji
      medsData = [
        { id: "1", name: "Aspiryna Cardio", dose: "1 tabletka", time: "08:00" },
        { id: "2", name: "Witaminy dla Seniora", dose: "1 kapsułka", time: "14:00" },
        { id: "3", name: "Magnez B6", dose: "2 tabletki", time: "20:00" }
      ];
      saveMeds();
    }

    if (savedEvents) {
      eventsData = JSON.parse(savedEvents);
    } else {
      // Domyślne wydarzenia
      const today = new Date();
      const inThreeDays = new Date(today);
      inThreeDays.setDate(today.getDate() + 3);
      const dateStr = inThreeDays.toISOString().split("T")[0];

      eventsData = [
        { id: "1", name: "Kontrola u kardiologa", date: dateStr, time: "11:30" }
      ];
      saveEvents();
    }
  }

  // Zapisywanie danych
  function saveMeds() {
    localStorage.setItem(`wnuczek_meds_${currentEmail}`, JSON.stringify(medsData));
  }

  function saveEvents() {
    localStorage.setItem(`wnuczek_events_${currentEmail}`, JSON.stringify(eventsData));
  }

  // Renderowanie listy leków
  function renderMeds() {
    if (!medsList) return;
    medsList.innerHTML = "";

    if (medsData.length === 0) {
      medsList.innerHTML = `<p style="color: var(--text-muted); font-style: italic; text-align: center; margin-top: 1rem;">Brak zaplanowanych leków.</p>`;
      return;
    }

    medsData.sort((a, b) => a.time.localeCompare(b.time)).forEach(med => {
      const item = document.createElement("div");
      item.className = "list-item";
      item.innerHTML = `
        <div class="list-item-content">
          <h4>💊 ${escapeHTML(med.name)}</h4>
          <p>Dawkowanie: ${escapeHTML(med.dose)} | Godzina: <strong>${med.time}</strong></p>
        </div>
        <button class="btn-delete-item" data-id="${med.id}" aria-label="Usuń lek">🗑️</button>
      `;
      medsList.appendChild(item);
    });

    setupDeleteListeners("meds");
  }

  // Renderowanie listy wydarzeń
  function renderEvents() {
    if (!eventsList) return;
    eventsList.innerHTML = "";

    if (eventsData.length === 0) {
      eventsList.innerHTML = `<p style="color: var(--text-muted); font-style: italic; text-align: center; margin-top: 1rem;">Brak zaplanowanych wydarzeń.</p>`;
      return;
    }

    eventsData.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    }).forEach(event => {
      const item = document.createElement("div");
      item.className = "list-item";
      item.innerHTML = `
        <div class="list-item-content">
          <h4>📅 ${escapeHTML(event.name)}</h4>
          <p>Termin: <strong>${formatPolishDate(event.date)}</strong> o godz. <strong>${event.time}</strong></p>
        </div>
        <button class="btn-delete-item" data-id="${event.id}" aria-label="Usuń wydarzenie">🗑️</button>
      `;
      eventsList.appendChild(item);
    });

    setupDeleteListeners("events");
  }

  // Formatowanie daty na czytelniejszą w języku polskim
  function formatPolishDate(dateStr) {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}.${parts[1]}.${parts[0]} r.`;
  }

  // Konfiguracja usuwania
  function setupDeleteListeners(type) {
    const selector = type === "meds" ? "#medsList .btn-delete-item" : "#eventsList .btn-delete-item";
    const buttons = document.querySelectorAll(selector);

    buttons.forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute("data-id");
        if (type === "meds") {
          medsData = medsData.filter(m => m.id !== id);
          saveMeds();
          renderMeds();
          showToast("Lek został usunięty z listy.", "info");
        } else {
          eventsData = eventsData.filter(e => e.id !== id);
          saveEvents();
          renderEvents();
          showToast("Wydarzenie zostało usunięte z terminarza.", "info");
        }
      };
    });
  }

  // Obsługa dodawania leków i wydarzeń
  function setupMedsEventListeners() {
    // Dodawanie leku
    formAddMed.onsubmit = (e) => {
      e.preventDefault();
      const name = document.getElementById("medName").value.trim();
      const dose = document.getElementById("medDose").value.trim();
      const time = document.getElementById("medTime").value;

      const newMed = {
        id: Date.now().toString(),
        name,
        dose,
        time
      };

      medsData.push(newMed);
      saveMeds();
      renderMeds();
      showToast(`Dodano nowy lek: ${name}`, "success");

      // Reset pól formularza
      document.getElementById("medName").value = "";
      document.getElementById("medDose").value = "";
      document.getElementById("medTime").value = "";
    };

    // Dodawanie wydarzenia
    formAddEvent.onsubmit = (e) => {
      e.preventDefault();
      const name = document.getElementById("eventName").value.trim();
      const date = document.getElementById("eventDate").value;
      const time = document.getElementById("eventTime").value;

      const newEvent = {
        id: Date.now().toString(),
        name,
        date,
        time
      };

      eventsData.push(newEvent);
      saveEvents();
      renderEvents();
      showToast(`Zapisano wydarzenie: ${name}`, "success");

      // Reset pól formularza
      document.getElementById("eventName").value = "";
      document.getElementById("eventDate").value = "";
      document.getElementById("eventTime").value = "";
    };

    // Obsługa zatwierdzenia alertu medycznego
    btnAlertAck.onclick = () => {
      medicalAlertOverlay.classList.add("hidden");
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      showToast("Lek został oznaczony jako przyjęty. Dziękuję!", "success");
    };

    // Obsługa testowego wyzwolenia alertu
    btnTriggerDemoAlert.onclick = () => {
      triggerEmergencyAlert("Aspiryna Cardio", "1 tabletka");
      showToast("Wyzwolono testowy alarm przypomnienia o leku.", "info");
    };
  }

  // Wyzwalanie okna alertu
  function triggerEmergencyAlert(medName, medDose) {
    if (!medicalAlertOverlay || !alertMessage) return;

    alertMessage.innerHTML = `Czas przyjąć lek: <strong>${escapeHTML(medName)}</strong> (${escapeHTML(medDose)}).`;
    medicalAlertOverlay.classList.remove("hidden");

    // Lektor odczytujący powiadomienie w języku polskim
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // zatrzymaj inne odtwarzania
      const utterance = new SpeechSynthesisUtterance(`Przypomnienie o leku. Czas przyjąć lek: ${medName}, dawka: ${medDose}. Proszę, zażyj lek i potwierdź jego przyjęcie.`);
      utterance.lang = "pl-PL";
      
      const voices = window.speechSynthesis.getVoices();
      const polishVoice = voices.find(voice => voice.lang.includes("pl-PL") || voice.lang.includes("PL"));
      if (polishVoice) {
        utterance.voice = polishVoice;
      }
      window.speechSynthesis.speak(utterance);
    }
  }

  // ==========================================================================
  // SPRAWDZANIE ALARMÓW W TLE
  // ==========================================================================

  function startAlertCheckTimer(email) {
    currentEmail = email;
    stopAlertCheckTimer(); // Upewnij się, że nie dublujemy interwałów

    // Sprawdzaj co 30 sekund
    alertCheckInterval = setInterval(checkReminders, 30000);
    // Uruchom jedno sprawdzenie od razu
    checkReminders();
  }

  function stopAlertCheckTimer() {
    if (alertCheckInterval) {
      clearInterval(alertCheckInterval);
      alertCheckInterval = null;
    }
  }

  function checkReminders() {
    if (medsData.length === 0) return;

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const currentTimeStr = `${hours}:${minutes}`; // "HH:MM"
    const currentMinuteKey = `${now.toDateString()} ${currentTimeStr}`;

    medsData.forEach(med => {
      if (med.time === currentTimeStr) {
        // Sprawdź czy ten lek był już wyzwolony w tej konkretnej minucie
        const triggerKey = `${med.id}_${currentMinuteKey}`;
        if (!triggeredMedsThisMinute[triggerKey]) {
          triggeredMedsThisMinute[triggerKey] = true;
          triggerEmergencyAlert(med.name, med.dose);
        }
      }
    });
  }

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

  // Eksponuj moduł na zewnątrz
  window.initMedsModule = initMedsModule;
  window.startAlertCheckTimer = startAlertCheckTimer;
  window.stopAlertCheckTimer = stopAlertCheckTimer;
  window.triggerEmergencyAlert = triggerEmergencyAlert;

})();
