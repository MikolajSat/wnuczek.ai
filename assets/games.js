// MODUŁ TRENINGU PAMIĘCI I UMYSŁU - WNUCZEK.AI
// ZINTEGROWANY Z GOOGLE GEMINI API (GEMINI-2.5-FLASH)

(function () {
  let currentUser = null;
  let currentPuzzleText = "";
  let currentCorrectAnswer = "";
  let activePuzzleType = ""; // 'ai'

  // Elementy DOM
  let btnStartGame = null;
  let gameLoading = null;
  let gamePuzzleBox = null;
  let gamePuzzleText = null;
  let gameAnswerInput = null;
  let btnSubmitAnswer = null;
  let gameCheckingLoading = null;
  let gameFeedbackBox = null;
  let gameScorePercent = null;
  let gameFeedbackStatus = null;
  let gameFeedbackText = null;
  let gameFeedbackHeader = null;

  function initGamesModule(user) {
    currentUser = user;

    // Pobranie elementów DOM
    btnStartGame = document.getElementById("btnStartGame");
    gameLoading = document.getElementById("gameLoading");
    gamePuzzleBox = document.getElementById("gamePuzzleBox");
    gamePuzzleText = document.getElementById("gamePuzzleText");
    gameAnswerInput = document.getElementById("gameAnswerInput");
    btnSubmitAnswer = document.getElementById("btnSubmitAnswer");
    gameCheckingLoading = document.getElementById("gameCheckingLoading");
    gameFeedbackBox = document.getElementById("gameFeedbackBox");
    gameScorePercent = document.getElementById("gameScorePercent");
    gameFeedbackStatus = document.getElementById("gameFeedbackStatus");
    gameFeedbackText = document.getElementById("gameFeedbackText");
    gameFeedbackHeader = document.getElementById("gameFeedbackHeader");

    // Obsługa przycisków
    if (btnStartGame) {
      btnStartGame.onclick = handleStartNewGame;
    }

    if (btnSubmitAnswer) {
      btnSubmitAnswer.onclick = handleSubmitAnswer;
    }

    // Ukryj zbędne panele na starcie
    if (gamePuzzleBox) gamePuzzleBox.classList.add("hidden");
    if (gameFeedbackBox) gameFeedbackBox.classList.add("hidden");
    if (gameLoading) gameLoading.classList.add("hidden");
    if (gameCheckingLoading) gameCheckingLoading.classList.add("hidden");
  }

  // Rozpoczęcie nowej gry
  async function handleStartNewGame() {
    if (!gameLoading || !gamePuzzleBox || !gameFeedbackBox) return;

    // Pokaż loader, ukryj resztę
    gameLoading.classList.remove("hidden");
    gamePuzzleBox.classList.add("hidden");
    gameFeedbackBox.classList.add("hidden");
    if (gameAnswerInput) gameAnswerInput.value = "";

    const apiKey = (typeof GEMINI_API_KEY !== "undefined" && GEMINI_API_KEY && GEMINI_API_KEY !== "TWÓJ_KLUCZ_API_TUTAJ") ? GEMINI_API_KEY.trim() : "";
    const cleanKey = apiKey ? apiKey : null;

    try {
      if (!cleanKey) {
        throw new Error("Brak klucza API w aplikacji. Uzupełnij zmienną GEMINI_API_KEY w pliku config.js przed rozpoczęciem gry.");
      }

      // Upewniamy się, że formularz odpowiedzi jest widoczny
      const answerForm = document.getElementById("gameAnswerForm");
      if (answerForm) answerForm.classList.remove("hidden");

      activePuzzleType = "ai";
      const puzzleData = await generateAIPuzzle(cleanKey);

      gameLoading.classList.add("hidden");

      // Wyświetlanie pytania
      let textToShow = puzzleData.question;
      if (puzzleData.hint) {
        textToShow += `\n\n💡 Podpowiedź: ${puzzleData.hint}`;
      }

      gamePuzzleText.textContent = textToShow;
      gamePuzzleBox.classList.remove("hidden");
      
      showToast("Wnuczek obmyślił nową zagadkę! Czas na Twoją odpowiedź.", "success");

    } catch (err) {
      console.error(err);
      gameLoading.classList.add("hidden");
      showToast("Nie udało się pobrać zagadki.", "error");

      gamePuzzleText.textContent = `Błąd: ${err.message || "Problem z połączeniem z Gemini API."}\n\nUpewnij się, że wkleiłeś poprawny klucz API w pliku config.js lub panelu SOS.`;
      gamePuzzleBox.classList.remove("hidden");
      
      const answerForm = document.getElementById("gameAnswerForm");
      if (answerForm) answerForm.classList.add("hidden");
    }
  }

  // Wysłanie zapytania po zagadkę do Gemini (gemini-2.5-flash)
  async function generateAIPuzzle(apiKey) {
    // 1. Pobiera rok urodzenia seniora z user_profile (jeśli jest dostępny)
    let birthYear = 1950;
    const profile = currentUser || JSON.parse(localStorage.getItem("logged_in_senior"));
    if (profile && profile.age) {
      birthYear = new Date().getFullYear() - profile.age;
    }

    // 2. Generuje unikalny token losowości
    const randomToken = Date.now() + "_" + Math.random().toString(36).substr(2, 9);

    // 3. Prompt systemowy
    const systemPrompt = `Jesteś trenerem pamięci dla seniorów. Wygeneruj jedną, unikalną zagadkę (logiczną, językową lub historyczną z czasów młodości użytkownika urodzonego w okolicach roku ${birthYear}). Odpowiedź na zagadkę musi być krótka i jednoznaczna. Zwróć wynik WYŁĄCZNIE w formacie JSON:
{
  "type": "Typ zagadki",
  "question": "Treść unikalnego pytania historycznego lub logicznego...",
  "hint": "Mała podpowiedź",
  "correct_answer": "Prawidłowa odpowiedź"
}
Unikalny token sesji zapobiegający powtórzeniom: ${randomToken}`;

    const responseText = await callGeminiAPI(apiKey, systemPrompt);
    const parsed = JSON.parse(responseText);

    // 4. Zapisuje poprawną odpowiedź w pamięci sesji (ale jej nie pokazuje)
    currentCorrectAnswer = parsed.correct_answer || "";
    currentPuzzleText = parsed.question || "";

    return parsed;
  }

  // Obsługa kliknięcia "Sprawdź odpowiedź"
  async function handleSubmitAnswer() {
    const answer = gameAnswerInput.value.trim();
    if (!answer) {
      showToast("Wpisz swoją odpowiedź przed sprawdzeniem.", "error");
      return;
    }

    if (!gameCheckingLoading || !gameFeedbackBox) return;

    // Pokazanie loadera, ukrycie starego feedbacku
    gameCheckingLoading.classList.remove("hidden");
    gameFeedbackBox.classList.add("hidden");

    const apiKey = (typeof GEMINI_API_KEY !== "undefined" && GEMINI_API_KEY && GEMINI_API_KEY !== "TWÓJ_KLUCZ_API_TUTAJ") ? GEMINI_API_KEY.trim() : "";
    const cleanKey = apiKey ? apiKey : null;

    try {
      if (!cleanKey) {
        throw new Error("Brak klucza API w aplikacji. Uzupełnij zmienną GEMINI_API_KEY w pliku config.js.");
      }

      // Wywołanie weryfikacji przez Gemini
      const assessment = await verifyUserAnswer(cleanKey, answer);

      const score = assessment.score !== undefined ? assessment.score : 80;
      const status = assessment.status || "Wynik sprawdzony";
      const feedback = assessment.feedback || "Dziękuję za Twoją odpowiedź!";

      // Ukryj loader, wyrenderuj wynik
      gameCheckingLoading.classList.add("hidden");
      
      // Wyświetlenie komunikatu zwrotnego wielką czcionką
      if (gameFeedbackText) {
        gameFeedbackText.style.fontSize = "1.45rem";
        gameFeedbackText.style.lineHeight = "1.7";
      }

      // Dopasuj kolorystykę ramki i tekstu w zależności od wyniku
      updateFeedbackStyles(score, status, feedback);
      gameFeedbackBox.classList.remove("hidden");
      
      showToast("Odpowiedź została sprawdzona!", "success");

    } catch (err) {
      console.error(err);
      gameCheckingLoading.classList.add("hidden");
      showToast("Błąd podczas weryfikacji odpowiedzi.", "error");

      if (gameFeedbackText) {
        gameFeedbackText.textContent = `Nie udało się sprawdzić odpowiedzi przy użyciu AI. Błąd: ${err.message}`;
        gameFeedbackText.style.fontSize = "1.2rem";
      }
      gameFeedbackBox.style.borderColor = "var(--danger)";
      gameScorePercent.textContent = "--%";
      gameFeedbackStatus.textContent = "Błąd";
      gameFeedbackHeader.textContent = "⚠️ Coś poszło nie tak";
      gameFeedbackBox.classList.remove("hidden");
    }
  }

  // Wywołanie Gemini API do oceny odpowiedzi
  async function verifyUserAnswer(apiKey, answer) {
    const systemPrompt = `Jesteś kochającym i cierpliwym wnuczkiem Adasiem, który jest trenerem pamięci dla seniora. Oceń odpowiedź seniora na zagadkę.
Czy odpowiedź seniora jest merytorycznie poprawna? Odpowiedz niezwykle ciepłym, pełnym szacunku i cierpliwości językiem. Pochwal go za wysiłek intelektualny i napisz, jak brzmi pełne rozwiązanie.

Zwróć wynik WYŁĄCZNIE w formacie JSON:
{
  "score": 100, // ocena od 0 do 100 w zależności od poprawności (np. 100 za w pełni poprawną, 50-80 za częściową, 30 za błędną ale z szacunkiem za wysiłek)
  "status": "krótki status, np. Wspaniale!, Blisko!, Dobra próba!",
  "feedback": "Twój wygenerowany ciepły i motywujący komentarz dla seniora zawierający pełne rozwiązanie"
}

Dane do oceny:
Treść pytania: "${currentPuzzleText}"
Pierwotna intencja poprawnej odpowiedzi: "${currentCorrectAnswer}"
Odpowiedź wpisana przez seniora: "${answer}"`;

    const responseText = await callGeminiAPI(apiKey, systemPrompt);
    return JSON.parse(responseText);
  }

  // Pomocnicza funkcja do wywoływania Gemini API (gemini-2.5-flash)
  async function callGeminiAPI(apiKey, promptText) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: promptText
          }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 1.0
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API zwróciło status ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text.trim();
  }

  // Zmiana kolorystyki feedbacku na podstawie wyniku
  function updateFeedbackStyles(score, status, comment) {
    gameScorePercent.textContent = `${score}%`;
    gameFeedbackStatus.textContent = status;
    gameFeedbackText.textContent = comment;

    if (score >= 80) {
      gameFeedbackBox.style.borderColor = "var(--success)";
      gameScorePercent.style.color = "var(--success)";
      gameFeedbackHeader.style.color = "var(--success)";
      gameFeedbackHeader.textContent = "🌟 Wspaniały Wynik!";
    } else if (score >= 50) {
      gameFeedbackBox.style.borderColor = "var(--warning)";
      gameScorePercent.style.color = "var(--warning)";
      gameFeedbackHeader.style.color = "var(--warning)";
      gameFeedbackHeader.textContent = "⭐ Dobry wysiłek!";
    } else {
      gameFeedbackBox.style.borderColor = "var(--accent)";
      gameScorePercent.style.color = "var(--accent)";
      gameFeedbackHeader.style.color = "var(--accent)";
      gameFeedbackHeader.textContent = "💪 Trening czyni mistrza!";
    }
  }

  // Eksponuj na zewnątrz
  window.initGamesModule = initGamesModule;

})();
