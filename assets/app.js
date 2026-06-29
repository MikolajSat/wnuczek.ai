// GŁÓWNA LOGIKA APLIKACJI - WNUCZEK.AI

document.addEventListener("DOMContentLoaded", () => {
  // Stan aplikacji
  let currentUser = null;
  let baseFontSize = 18;

  // DOM Elements - Ekrany i Nawigacja
  const authScreen = document.getElementById("authScreen");
  const appContainer = document.getElementById("appContainer");
  const navItems = document.querySelectorAll(".nav-item");
  const sections = {
    profile: document.getElementById("viewProfile"),
    schedule: document.getElementById("viewSchedule"),
    chat: document.getElementById("viewChat"),
    cards: document.getElementById("viewCards"),
    diet: document.getElementById("viewDiet"),
    settings: document.getElementById("viewSettings"),
    games: document.getElementById("viewGames"),
    links: document.getElementById("viewLinks")
  };

  // DOM Elements - Auth Taby i Formularze
  const tabLogin = document.getElementById("tabLogin");
  const tabRegister = document.getElementById("tabRegister");
  const formLogin = document.getElementById("formLogin");
  const formRegister = document.getElementById("formRegister");

  // DOM Elements - Header i A11y
  const btnA11yDown = document.getElementById("btnA11yDown");
  const btnA11yUp = document.getElementById("btnA11yUp");
  const fontSizeIndicator = document.getElementById("fontSizeIndicator");
  const btnThemeToggle = document.getElementById("btnThemeToggle");
  const themeToggleIcon = document.getElementById("themeToggleIcon");
  const themeToggleText = document.getElementById("themeToggleText");
  const userAvatar = document.getElementById("userAvatar");
  const profileAvatar = document.getElementById("profileAvatar");
  const userWelcomeText = document.getElementById("userWelcomeText");
  const btnLogout = document.getElementById("btnLogout");

  // DOM Elements - Profil
  const profileName = document.getElementById("profileName");
  const profileEmail = document.getElementById("profileEmail");
  const profileAge = document.getElementById("profileAge");
  const profileHeight = document.getElementById("profileHeight");
  const profileWeight = document.getElementById("profileWeight");
  const profileEmergency = document.getElementById("profileEmergency");
  const profileDiet = document.getElementById("profileDiet");

  // DOM Elements - BMI
  const bmiNumber = document.getElementById("bmiNumber");
  const bmiBadge = document.getElementById("bmiBadge");
  const bmiMarker = document.getElementById("bmiMarker");
  const healthTipText = document.getElementById("healthTipText");

  // DOM Elements - Panel Testowania / Ustawienia
  const btnClearAllData = document.getElementById("btnClearAllData");

  // DOM Elements - SOS
  const btnSosAlert = document.getElementById("btnSosAlert");
  const sosDetailsBox = document.getElementById("sosDetailsBox");
  const sosEmergencyPhone = document.getElementById("sosEmergencyPhone");
  const sosEmergencyName = document.getElementById("sosEmergencyName");

  // Inicializacja Ustawień Lokalnych (A11y i Motyw)
  initA11ySettings();

  // Sprawdzenie sesji w localStorage
  checkSession();

  // ==========================================================================
  // NAWIGACJA SPA & TABY AUTORYZACJI
  // ==========================================================================

  // Przełączanie zakładki logowania / rejestracji
  tabLogin.addEventListener("click", () => {
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
    formLogin.classList.remove("hidden");
    formRegister.classList.add("hidden");
  });

  tabRegister.addEventListener("click", () => {
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");
    formRegister.classList.remove("hidden");
    formLogin.classList.add("hidden");
  });

  // Obsługa menu bocznego (Routing SPA)
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const view = item.getAttribute("data-view");
      
      // Ukryj wszystkie sekcje i odznacz menu
      navItems.forEach(i => i.classList.remove("active"));
      Object.values(sections).forEach(s => s.classList.add("hidden"));

      // Aktywuj wybraną sekcję
      item.classList.add("active");
      if (sections[view]) {
        sections[view].classList.remove("hidden");
        // Uruchomienie specyficznych akcji dla widoku, jeśli są zdefiniowane
        if (view === "chat" && typeof window.scrollChatToBottom === "function") {
          window.scrollChatToBottom();
        }
      }
    });
  });

  // ==========================================================================
  // AUTORYZACJA (MOCK SYSTEM)
  // ==========================================================================

  // Obsługa logowania
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    const users = JSON.parse(localStorage.getItem("wnuczek_users")) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      loginUser(user);
      showToast(`Pomyślnie zalogowano. Witaj, ${user.name}!`, "success");
    } else {
      // Spróbuj zalogować użytkownika demo
      if (email === "jan.kowalski@email.pl" && password === "senior123") {
        const demoUser = getDemoUser();
        loginUser(demoUser);
        showToast("Zalogowano na konto demonstracyjne.", "success");
      } else {
        showToast("Błędny e-mail lub hasło. Spróbuj ponownie lub zarejestruj się.", "error");
      }
    }
  });

  // Obsługa rejestracji
  formRegister.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("regName").value.trim();
    const age = parseInt(document.getElementById("regAge").value);
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const password = document.getElementById("regPassword").value;
    const weight = parseFloat(document.getElementById("regWeight").value);
    const height = parseFloat(document.getElementById("regHeight").value);
    const emergencyNumber = document.getElementById("regEmergency").value.trim();

    const users = JSON.parse(localStorage.getItem("wnuczek_users")) || [];
    if (users.some(u => u.email === email) || email === "jan.kowalski@email.pl") {
      showToast("Ten adres e-mail jest już zajęty.", "error");
      return;
    }

    const newUser = {
      name,
      age,
      email,
      password,
      weight,
      height,
      emergencyNumber
    };

    users.push(newUser);
    localStorage.setItem("wnuczek_users", JSON.stringify(users));
    
    showToast("Konto zostało pomyślnie utworzone! Zaloguj się teraz.", "success");
    
    // Przełącz na logowanie i uzupełnij e-mail
    tabLogin.click();
    document.getElementById("loginEmail").value = email;
    document.getElementById("loginPassword").value = "";
  });

  // Obsługa wylogowania
  btnLogout.addEventListener("click", () => {
    logoutUser();
    showToast("Pomyślnie wylogowano z aplikacji.", "info");
  });

  // Funkcja logowania użytkownika
  function loginUser(user) {
    currentUser = user;
    localStorage.setItem("wnuczek_currentUser", JSON.stringify(user));
    
    // Zmień widoczność ekranów
    authScreen.classList.add("hidden");
    appContainer.classList.remove("hidden");
    
    // Ustaw dane w nagłówku
    userWelcomeText.textContent = `Witaj, ${getFirstName(user.name)}!`;
    
    // Ustaw dane profilu
    updateProfileView(user);
    
    // Ustaw dane SOS
    updateSosView(user);
    
    // Inicjalizacja modułów zależnych od zalogowanego użytkownika
    if (typeof window.initMedsModule === "function") window.initMedsModule(user.email);
    if (typeof window.initDietModule === "function") window.initDietModule(user);
    if (typeof window.initChatModule === "function") window.initChatModule(user);
    if (typeof window.initCardsModule === "function") window.initCardsModule(user);
    if (typeof window.initGamesModule === "function") window.initGamesModule(user);
    if (typeof window.startAlertCheckTimer === "function") window.startAlertCheckTimer(user.email);

    // Domyślnie pokaż profil
    document.querySelector('[data-view="profile"]').click();
  }

  // Funkcja wylogowania
  function logoutUser() {
    currentUser = null;
    localStorage.removeItem("wnuczek_currentUser");
    
    authScreen.classList.remove("hidden");
    appContainer.classList.add("hidden");
    
    // Zatrzymaj timer powiadomień
    if (typeof window.stopAlertCheckTimer === "function") window.stopAlertCheckTimer();
  }

  // Sprawdzanie czy użytkownik jest zalogowany
  function checkSession() {
    const sessionUser = JSON.parse(localStorage.getItem("wnuczek_currentUser"));
    if (sessionUser) {
      loginUser(sessionUser);
    } else {
      logoutUser();
    }
  }

  // Zwraca obiekt demo użytkownika
  function getDemoUser() {
    return {
      name: "Jan Kowalski",
      age: 72,
      email: "jan.kowalski@email.pl",
      password: "senior123",
      weight: 75,
      height: 172,
      emergencyNumber: "+48 123 456 789"
    };
  }

  // Pobranie pierwszego imienia
  function getFirstName(fullName) {
    return fullName.split(" ")[0];
  }

  // ==========================================================================
  // PROFIL & KALKULATOR BMI
  // ==========================================================================

  function updateProfileView(user) {
    profileName.textContent = user.name;
    profileEmail.textContent = user.email;
    profileAge.textContent = `${user.age} ${getAgeLabel(user.age)}`;
    profileHeight.textContent = `${user.height} cm`;
    profileWeight.textContent = `${user.weight} kg`;
    profileEmergency.textContent = user.emergencyNumber;

    // Ustaw dietę w profilu
    if (profileDiet) {
      const savedCondition = localStorage.getItem(`wnuczek_diet_condition_${user.email}`) || "general";
      const dietLabels = {
        general: "Ogólna dieta seniora",
        diabetes: "Cukrzyca (Niski IG)",
        hypertension: "Nadciśnienie (Niskosodowa)",
        digestive: "Łatwostrawna"
      };
      profileDiet.textContent = dietLabels[savedCondition] || "Ogólna";
    }

    // Oblicz BMI
    calculateAndRenderBMI(user.weight, user.height);
  }

  function getAgeLabel(age) {
    if (age === 1) return "rok";
    const lastDigit = age % 10;
    const lastTwoDigits = age % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return "lat";
    if (lastDigit >= 2 && lastDigit <= 4) return "lata";
    return "lat";
  }

  function calculateAndRenderBMI(weight, height) {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    const roundedBmi = bmi.toFixed(1);
    
    bmiNumber.textContent = roundedBmi;

    let badgeText = "";
    let badgeColor = "";
    let tipText = "";
    let markerPercent = 50;

    // Klasyfikacja BMI oraz procenty dla wskaźnika (zakres 15 - 35)
    // 15 -> 0%, 35 -> 100%
    markerPercent = ((bmi - 15) / 20) * 100;
    markerPercent = Math.min(Math.max(markerPercent, 2), 98); // zabezpieczenie przed wypadnięciem poza pasek

    if (bmi < 18.5) {
      badgeText = "Niedowaga";
      badgeColor = "var(--warning)";
      tipText = "Twój wskaźnik BMI wskazuje na niedowagę. Dla seniorów niedowaga bywa bardziej niebezpieczna niż lekka nadwaga. Postaraj się wzbogacić dietę o pełnowartościowe posiłki bogate w białko (twaróg, ryby, chude mięso) oraz zdrowe tłuszcze (olej lniany, oliwa z oliwek). Skonsultuj się z lekarzem, jeśli spadek wagi nastąpił nagle.";
    } else if (bmi >= 18.5 && bmi < 25) {
      badgeText = "W normie";
      badgeColor = "var(--success)";
      tipText = "Gratulacje! Twoja waga jest w normie. Staraj się utrzymać ten stan poprzez zrównoważone odżywianie oraz umiarkowaną aktywność fizyczną (np. codzienne spacery po 30 minut, gimnastyka dla seniorów). Pamiętaj o piciu przynajmniej 1.5 litra wody dziennie.";
    } else if (bmi >= 25 && bmi < 30) {
      badgeText = "Lekka nadwaga";
      badgeColor = "var(--accent)";
      tipText = "Masz lekką nadwagę. U seniorów niewielka nadwyżka wagowa nie stanowi zagrożenia, a wręcz może być rezerwą energetyczną w czasie choroby. Warto jednak ograniczyć słodycze oraz tłuszcze nasycone na rzecz warzyw i ryb. Dbaj o codzienne, spokojne spacery.";
    } else {
      badgeText = "Otyłość";
      badgeColor = "var(--danger)";
      tipText = "Twój wskaźnik BMI wskazuje na otyłość. Stan ten obciąża serce, stawy oraz zwiększa ryzyko cukrzycy. Skonsultuj się z lekarzem lub dietetykiem w celu ustalenia bezpiecznego planu żywieniowego. Wprowadzaj aktywność fizyczną stopniowo, np. pod postacią spokojnych marszów lub ćwiczeń w wodzie.";
    }

    bmiBadge.textContent = badgeText;
    bmiBadge.style.backgroundColor = badgeColor;
    healthTipText.textContent = tipText;

    // Przesuń marker z drobnym opóźnieniem dla ładnego efektu
    setTimeout(() => {
      bmiMarker.style.left = `${markerPercent}%`;
    }, 150);
  }

  // Expose BMI calculation for other modules (e.g. dynamic weight change)
  window.recalculateBMI = calculateAndRenderBMI;

  // ==========================================================================
  // UŁATWIENIA DOSTĘPU (A11Y) I MOTYWY
  // ==========================================================================

  // Inicjalizacja i wczytanie z localStorage
  function initA11ySettings() {
    // 1. Rozmiar czcionki
    const savedFontSize = parseInt(localStorage.getItem("wnuczek_fontSize"));
    if (savedFontSize && savedFontSize >= 18 && savedFontSize <= 26) {
      baseFontSize = savedFontSize;
    } else {
      baseFontSize = 18;
    }
    applyFontSize();

    // 2. Motyw ciemny / jasny
    const savedTheme = localStorage.getItem("wnuczek_theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark-theme");
      updateThemeControls(true);
    } else {
      document.body.classList.remove("dark-theme");
      updateThemeControls(false);
    }
  }

  // Zastosowanie i zapis rozmiaru czcionki
  function applyFontSize() {
    document.documentElement.style.setProperty("--base-font-size", `${baseFontSize}px`);
    fontSizeIndicator.textContent = `${baseFontSize}px`;
    localStorage.setItem("wnuczek_fontSize", baseFontSize);
    
    // Dodawanie klasy active do przycisków
    btnA11yDown.classList.toggle("active", baseFontSize === 18);
    btnA11yUp.classList.toggle("active", baseFontSize === 26);
  }

  // Zwiększanie czcionki
  btnA11yUp.addEventListener("click", () => {
    if (baseFontSize < 26) {
      baseFontSize += 2;
      applyFontSize();
      showToast("Rozmiar czcionki został powiększony.", "info");
    } else {
      showToast("Osiągnięto maksymalny rozmiar czcionki.", "info");
    }
  });

  // Zmniejszanie czcionki
  btnA11yDown.addEventListener("click", () => {
    if (baseFontSize > 18) {
      baseFontSize -= 2;
      applyFontSize();
      showToast("Rozmiar czcionki został pomniejszony.", "info");
    } else {
      showToast("Osiągnięto minimalny rozmiar czcionki.", "info");
    }
  });

  // Obsługa przełącznika motywów
  btnThemeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-theme");
    localStorage.setItem("wnuczek_theme", isDark ? "dark" : "light");
    updateThemeControls(isDark);
    showToast(isDark ? "Włączono motyw nocny o wysokim kontraście." : "Włączono motyw jasny.", "info");
  });

  function updateThemeControls(isDark) {
    if (isDark) {
      themeToggleIcon.textContent = "☀️";
      themeToggleText.textContent = "Jasny Dzień";
    } else {
      themeToggleIcon.textContent = "🌙";
      themeToggleText.textContent = "Spokojna Noc";
    }
  }

  // ==========================================================================
  // PANEL TESTÓW (RESET DANYCH)
  // ==========================================================================

  btnClearAllData.addEventListener("click", () => {
    if (confirm("Czy na pewno chcesz usunąć wszystkie dane aplikacji? Spowoduje to usunięcie leków, kalendarza, klucza API i wylogowanie.")) {
      // Wyczyszczenie danych z prefiksem wnuczek_
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith("wnuczek_")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      
      showToast("Wszystkie dane zostały wyczyszczone. Aplikacja zostanie przeładowana.", "info");
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  });

  // Ustawienie widoku SOS
  function updateSosView(user) {
    if (sosEmergencyPhone) {
      sosEmergencyPhone.href = `tel:${user.emergencyNumber}`;
      sosEmergencyPhone.textContent = `📞 ${user.emergencyNumber}`;
    }
    if (sosEmergencyName) {
      sosEmergencyName.textContent = "Osoba bliska (Kontakt Alarmowy)";
    }
  }

  // Obsługa kliknięcia przycisku SOS
  if (btnSosAlert) {
    btnSosAlert.addEventListener("click", () => {
      if (sosDetailsBox) {
        const isHidden = sosDetailsBox.classList.toggle("hidden");
        if (!isHidden) {
          showToast("Wyświetlono numery pomocy SOS!", "info");
          // Jeśli lektor głosowy jest dostępny, odczytaj instrukcję
          if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance("Oto Twoje kontakty alarmowe. Numer na pogotowie to 112, a numer do bliskiej osoby znajdziesz na ekranie.");
            utterance.lang = "pl-PL";
            const voices = window.speechSynthesis.getVoices();
            const polishVoice = voices.find(voice => voice.lang.includes("pl-PL") || voice.lang.includes("PL"));
            if (polishVoice) utterance.voice = polishVoice;
            window.speechSynthesis.speak(utterance);
          }
        }
      }
    });
  }

});

// ==========================================================================
// TOAST NOTIFICATIONS (WSPÓLNY MODUŁ)
// ==========================================================================

function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  // Wybór ikonki na bazie typu
  let icon = "✔️";
  if (type === "error") icon = "❌";
  if (type === "info") icon = "ℹ️";

  toast.innerHTML = `
    <span style="display:flex; align-items:center; gap:0.5rem;">
      <span>${icon}</span>
      <span>${message}</span>
    </span>
    <button style="background:none; border:none; color:inherit; font-weight:800; cursor:pointer; margin-left:1rem; font-size:1.1rem;" onclick="this.parentElement.remove();">×</button>
  `;

  container.appendChild(toast);

  // Automatyczne usuwanie po 4 sekundach
  setTimeout(() => {
    toast.style.animation = "slideInRight 0.3s reverse forwards";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

// Udostępnij globalnie
window.showToast = showToast;
