// MODUŁ KREATORA KARTEK OKOLICZNOŚCIOWYCH - WNUCZEK.AI

(function () {
  let currentUserName = "Jan";

  // DOM Elements - Formularz
  let cardOccasion = null;
  let cardRecipient = null;
  let cardBackground = null;
  let cardText = null;
  let btnGenerateCard = null;

  // DOM Elements - Podgląd
  let cardContainer = null;
  let cardLoading = null;
  let cardImg = null;
  let cardPreviewTitle = null;
  let cardPreviewRecipient = null;
  let cardPreviewBody = null;
  let btnDownloadCard = null;

  // Mapowanie teł
  const backgroundMap = {
    flowers: "assets/card_flowers.png",
    birthday: "assets/card_birthday.png",
    christmas: "assets/card_christmas.png",
    easter: "assets/card_easter.png"
  };

  // Inicjalizacja modułu
  function initCardsModule(user) {
    currentUserName = user.name.split(" ")[0];

    // Pobranie elementów
    cardOccasion = document.getElementById("cardOccasion");
    cardRecipient = document.getElementById("cardRecipient");
    cardBackground = document.getElementById("cardBackground");
    cardText = document.getElementById("cardText");
    btnGenerateCard = document.getElementById("btnGenerateCard");

    cardContainer = document.getElementById("cardContainer");
    cardLoading = document.getElementById("cardLoading");
    cardImg = document.getElementById("cardImg");
    cardPreviewTitle = document.getElementById("cardPreviewTitle");
    cardPreviewRecipient = document.getElementById("cardPreviewRecipient");
    cardPreviewBody = document.getElementById("cardPreviewBody");
    btnDownloadCard = document.getElementById("btnDownloadCard");

    // Zdarzenia aktualizacji podglądu na żywo
    setupLivePreview();

    // Domyślne generowanie
    generateCardPreview(true);
  }

  function setupLivePreview() {
    // Szybkie odświeżanie tła
    cardBackground.onchange = () => {
      const bgKey = cardBackground.value;
      cardImg.src = backgroundMap[bgKey] || backgroundMap.flowers;
    };

    // Aktualizacja pól tekstowych w locie
    cardOccasion.oninput = () => {
      cardPreviewTitle.textContent = cardOccasion.value;
    };
    cardRecipient.oninput = () => {
      cardPreviewRecipient.textContent = cardRecipient.value;
    };
    cardText.oninput = () => {
      cardPreviewBody.textContent = cardText.value || getDefaultGreeting();
    };

    // Obsługa przycisku generowania
    btnGenerateCard.onclick = () => {
      generateCardPreview(false);
    };

    // Obsługa pobierania kartki
    btnDownloadCard.onclick = downloadCardAsPNG;
  }

  // Pobranie domyślnych życzeń na bazie okazji
  function getDefaultGreeting() {
    const occasionVal = cardOccasion.value;
    const recipientVal = cardRecipient.value || "Bliskiej Osoby";
    
    if (occasionVal.includes("urodzin") || occasionVal.includes("najlepszego")) {
      return `Z okazji Twojego święta, kochany/a ${recipientVal}, życzę Ci z całego serca dużo zdrowia, uśmiechu na twarzy, spokoju w duszy oraz mnóstwa powodów do radości każdego dnia! Życzy ${currentUserName}.`;
    }
    if (occasionVal.includes("Świąt") || occasionVal.includes("Narodzenia")) {
      return `Wesołych, spokojnych i błogosławionych Świąt Bożego Narodzenia. Niech ten wyjątkowy czas spędzony w gronie najbliższych przyniesie Ci pokój, odpoczynek i radość. Życzy ${currentUserName}.`;
    }
    if (occasionVal.includes("Radosnego") || occasionVal.includes("Wielkanoc")) {
      return `Wesołych i pełnych nadziei Świąt Wielkanocnych! Radosnego Alleluja, obfitego wiosennego słońca, zdrowia oraz odpoczynku przy rodzinnym stole życzy ${currentUserName}.`;
    }
    if (occasionVal.includes("Dziadkow") || occasionVal.includes("Babci")) {
      return `Dla najwspanialszych Dziadków na świecie! Dziękujemy za Waszą miłość, mądrość, ciepłe słowa oraz cierpliwość każdego dnia. Niech zdrowie zawsze Wam dopisuje! Życzy ${currentUserName}.`;
    }
    
    return `Z całego serca życzę Ci zdrowia, uśmiechu oraz pogody ducha. Niech każdy kolejny dzień przynosi Ci szczęście i spokój! Życzy ${currentUserName}.`;
  }

  // Generowanie podglądu kartki
  function generateCardPreview(isInitial = false) {
    if (!isInitial) {
      cardLoading.classList.remove("hidden");
    }

    setTimeout(() => {
      const occasion = cardOccasion.value;
      const recipient = cardRecipient.value || "Bliskiej Osoby";
      const customText = cardText.value.trim();
      const bgKey = cardBackground.value;

      // Zmień zdjęcie podglądu
      cardImg.src = backgroundMap[bgKey] || backgroundMap.flowers;

      // Zmień teksty podglądu
      cardPreviewTitle.textContent = occasion;
      cardPreviewRecipient.textContent = recipient;
      
      const textToUse = customText || getDefaultGreeting();
      cardPreviewBody.textContent = textToUse;

      if (!isInitial) {
        cardLoading.classList.add("hidden");
        showToast("Kartka okolicznościowa została pomyślnie wygenerowana!", "success");
      }
    }, isInitial ? 0 : 800);
  }

  // RENDEROWANIE KARTKI NA CANVAS I DOWNLOAD PNG
  function downloadCardAsPNG() {
    cardLoading.classList.remove("hidden");

    // Tworzenie tymczasowego płótna canvas o wysokiej rozdzielczości (600x800 - idealne proporcje 3:4)
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");

    // Ładowanie obrazka tła
    const bgImg = new Image();
    bgImg.crossOrigin = "anonymous";
    bgImg.src = cardImg.src;

    bgImg.onload = function () {
      // 1. Rysowanie obrazka w górnej połowie (wysokość 440px)
      ctx.drawImage(bgImg, 0, 0, 600, 440);

      // 2. Rysowanie dolnej papierowej kartki z gradientem alabastrowym
      const cardGrad = ctx.createLinearGradient(0, 440, 0, 800);
      cardGrad.addColorStop(0, "#ffffff");
      cardGrad.addColorStop(1, "#f9f7f2");
      ctx.fillStyle = cardGrad;
      ctx.fillRect(0, 440, 600, 360);

      // Drobny podział/cień pod obrazkiem
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 440, 600, 6);

      // Złote obramowanie ozdobne na dole
      ctx.strokeStyle = "#ea580c"; // Accent color
      ctx.lineWidth = 4;
      ctx.strokeRect(15, 455, 570, 330);

      // Cieńka wewnętrzna ramka
      ctx.strokeStyle = "rgba(79, 70, 229, 0.2)"; // Primary light border
      ctx.lineWidth = 1;
      ctx.strokeRect(20, 460, 560, 320);

      // 3. Pisanie tekstów
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      // Tytuł / Okazja (Outfit / Georgia serif style)
      ctx.font = "bold 26px Georgia, serif";
      ctx.fillStyle = "#c2410c"; // Accent hover color (ciemniejsza pomarańcz do czytania)
      ctx.fillText(cardPreviewTitle.textContent, 300, 485);

      // Odbiorca
      ctx.font = "bold italic 18px Arial, sans-serif";
      ctx.fillStyle = "#475569"; // Text muted
      ctx.fillText(cardPreviewRecipient.textContent, 300, 525);

      // Treść życzeń (Inter / Arial sans-serif style)
      ctx.font = "italic 18px Georgia, serif";
      ctx.fillStyle = "#0f172a"; // Text main
      
      const bodyText = cardPreviewBody.textContent;
      // Rysowanie życzeń z podziałem linii (zawijaniem)
      wrapTextOnCanvas(ctx, bodyText, 300, 565, 500, 26);

      // Stopka / Podpis na dole
      ctx.font = "12px Arial, sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("Wygenerowano w Wnuczek.AI", 300, 750);

      // 4. Pobieranie pliku
      try {
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `kartka_wnuczek_${cardPreviewTitle.textContent.toLowerCase().replace(/[^a-z0-9]/g, "_")}.png`;
        link.href = dataUrl;
        link.click();
        
        showToast("Kartka została pobrana na Twój dysk!", "success");
      } catch (err) {
        console.error("Canvas export failed: ", err);
        showToast("Błąd eksportu grafiki. Spróbuj kliknąć prawym przyciskiem myszy na podgląd.", "error");
      } finally {
        cardLoading.classList.add("hidden");
      }
    };

    bgImg.onerror = function () {
      showToast("Błąd ładowania obrazu tła.", "error");
      cardLoading.classList.add("hidden");
    };
  }

  // Funkcja pomocnicza do zawijania wierszy w Canvas
  function wrapTextOnCanvas(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + " ";
      let metrics = context.measureText(testLine);
      let testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, currentY);
        line = words[n] + " ";
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, currentY);
  }

  // Eksponuj na zewnątrz
  window.initCardsModule = initCardsModule;

})();
