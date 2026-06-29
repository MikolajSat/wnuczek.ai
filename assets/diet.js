// ASYSTENT DIETY I PRZELICZNIK KUCHENNY - WNUCZEK.AI

(function () {
  let selectedIngredient = "flour"; // Domyślnie mąka
  let currentUser = null;
  let dailyCalorieTargetVal = 2000; // Domyślnie 2000 kcal

  // DOM Elements - Kafelki
  let ingredientTiles = null;

  // DOM Elements - Przelicznik
  let convertFromUnit = null;
  let convertToUnit = null;
  let convertAmount = null;
  let btnConvert = null;
  let converterResult = null;
  let dietCalorieTarget = null;

  // DOM Elements - Nowe funkcjonalności
  let dietConditionSelect = null;
  let dietPlanContainer = null;
  let fridgeIngredientsInput = null;
  let btnGenerateFridgeRecipe = null;
  let fridgeRecipeResult = null;
  let fridgeRecipeLoading = null;
  let fridgeRecipeTitle = null;
  let fridgeRecipeText = null;

  // Przeliczniki wagowe składników (w gramach za 1 sztukę pełnej miary)
  const conversionRates = {
    flour: { name: "Mąka", cups: 150, tbsp: 15, tsp: 5, grams: 1 },
    sugar: { name: "Cukier", cups: 220, tbsp: 20, tsp: 6, grams: 1 },
    water: { name: "Woda/Mleko", cups: 250, tbsp: 15, tsp: 5, grams: 1 },
    oil: { name: "Olej", cups: 225, tbsp: 15, tsp: 4, grams: 1 }
  };

  // Nazwy polskie jednostek
  const unitLabels = {
    cups: { singular: "szklanka", genitive: "szklanki", plural: "szklanek" },
    tbsp: { singular: "łyżka stołowa", genitive: "łyżki stołowe", plural: "łyżek stołowych" },
    tsp: { singular: "łyżeczka", genitive: "łyżeczki", plural: "łyżeczek" },
    grams: { singular: "gram", genitive: "gramy", plural: "gramów" }
  };

  // Baza przykładowych jadłospisów dla seniora na bazie dolegliwości
  const menusByCondition = {
    general: {
      title: "Zbilansowana Dieta Ogólna",
      guidelines: "Odpowiednia dla zdrowych seniorów. Skupia się na dostarczeniu wapnia, błonnika, witaminy D oraz odpowiednim nawodnieniu.",
      meals: [
        { type: "Śniadanie", name: "Jajecznica na parze i chleb graham", desc: "Jajecznica z 2 jajek na parze ze szczypiorkiem, kromka chleba graham z masłem, sałata, rzodkiewki." },
        { type: "Obiad", name: "Pieczone udko z kurczaka i purée z dyni", desc: "Pieczone podudzie drobiowe (bez skóry), aksamitne purée z dyni i ziemniaków, gotowana brukselka z koperkiem." },
        { type: "Podwieczorek", name: "Kefir naturalny i garść orzechów", desc: "Szklanka chłodnego kefiru (źródło wapnia) oraz garstka posiekanych orzechów włoskich." },
        { type: "Kolacja", name: "Twarożek ze szczypiorkiem i pomidorem", desc: "Chudy twaróg roztarty z jogurtem, szczypiorkiem i rzodkiewką. Podawany z pieczywem pszennym graham." }
      ]
    },
    diabetes: {
      title: "Dieta przy Cukrzycy (Niski IG)",
      guidelines: "Ogranicza cukry proste i produkty o wysokim indeksie glikemicznym. Bogata w węglowodany złożone, błonnik i zdrowe tłuszcze.",
      meals: [
        { type: "Śniadanie", name: "Owsianka z borówkami i chia", desc: "Płatki owsiane górskie ugotowane na wodzie lub chudym mleku, podawane z borówkami, nasionami chia i pestkami dyni." },
        { type: "Obiad", name: "Dorsz na parze z kaszą gryczaną", desc: "Filet z dorsza ugotowany na parze z cytryną, kasza gryczana, obfita surówka z kiszonej kapusty z marchewką i oliwą." },
        { type: "Podwieczorek", name: "Hummus z słupkami selera naciowego", desc: "Dwie łyżki domowego hummusu podane ze świeżym selerem naciowym lub ogórkiem zielonym." },
        { type: "Kolacja", name: sałatka = "Sałatka z ciecierzycą i fetą", desc: "Ciecierzyca z puszki, pomidorki koktajlowe, ogórek, lekki ser feta, posypane oregano i skropione oliwą." }
      ]
    },
    hypertension: {
      title: "Dieta przy Nadciśnieniu (Niskosodowa / DASH)",
      guidelines: "Wyeliminowanie soli kuchennej. Bogata w potas (redukuje ciśnienie), magnez i wapń. Dużo świeżych ziół, pomidorów, bananów i jogurtów.",
      meals: [
        { type: "Śniadanie", name: "Koktajl bananowo-kefirowy z płatkami", desc: "Kefir zblendowany z bananem i 3 łyżkami płatków owsianych. Kromka chleba bezsolnego z chudym twarogiem." },
        { type: "Obiad", name: "Pieczony pstrąg tęczowy w ziołach", desc: "Pstrąg pieczony w folii z czosnkiem, natką pietruszki i koperkiem (bez dodatku soli). Ziemniaki gotowane, mizeria z jogurtem." },
        { type: "Podwieczorek", name: "Pieczone jabłko z cynamonem", desc: "Ciepłe jabłko upieczone w piekarniku, oprószone cynamonem i posypane migdałami w płatkach." },
        { type: "Kolacja", name: "Pasta z makreli i twarogu (bez soli)", desc: "Wędzona makrela rozgnieciona z chudym twarogiem, szczypiorkiem i dużą ilością pieprzu. Podawana z pomidorem." }
      ]
    },
    digestive: {
      title: "Dieta Łatwostrawna",
      guidelines: "Oszczędza układ pokarmowy. Wyklucza potrawy smażone na tłuszczu, ostro przyprawione, wzdymające (strączki, kapusta) oraz twarde owoce.",
      meals: [
        { type: "Śniadanie", name: "Kasza manna na chudym mleku", desc: "Delikatna kasza manna podana z przetartym, duszonym jabłkiem bez skórki i odrobiną miodu." },
        { type: "Obiad", name: "Pulpety drobiowe w jasnym sosie", desc: "Pulpety z indyka gotowane w bulionie warzywnym, ryż biały, gotowana marchewka pokrojona w talarki z odrobiną masła." },
        { type: "Podwieczorek", name: "Budyń waniliowy domowy", desc: "Ciepły, delikatny budyń ugotowany na chudym mleku z naturalną wanilią, lekki dla żołądka." },
        { type: "Kolacja", name: "Ciepła bułka z szynką i masłem", desc: "Jasne pieczywo pszenne z masłem, chudą wędliną drobiową, bez skórki pomidora. Herbata z rumianku." }
      ]
    }
  };

  function initDietModule(user) {
    currentUser = user;

    // Pobranie elementów DOM
    ingredientTiles = document.querySelectorAll(".diet-quick-tile");
    convertFromUnit = document.getElementById("convertFromUnit");
    convertToUnit = document.getElementById("convertToUnit");
    convertAmount = document.getElementById("convertAmount");
    btnConvert = document.getElementById("btnConvert");
    converterResult = document.getElementById("converterResult");
    dietCalorieTarget = document.getElementById("dietCalorieTarget");

    dietConditionSelect = document.getElementById("dietConditionSelect");
    dietPlanContainer = document.getElementById("dietPlanContainer");
    fridgeIngredientsInput = document.getElementById("fridgeIngredientsInput");
    btnGenerateFridgeRecipe = document.getElementById("btnGenerateFridgeRecipe");
    fridgeRecipeResult = document.getElementById("fridgeRecipeResult");
    fridgeRecipeLoading = document.getElementById("fridgeRecipeLoading");
    fridgeRecipeTitle = document.getElementById("fridgeRecipeTitle");
    fridgeRecipeText = document.getElementById("fridgeRecipeText");

    // Obsługa kafelków przelicznika
    setupIngredientSelection();

    // Obsługa przycisku przeliczania
    if (btnConvert) btnConvert.onclick = calculateConversion;

    // Obliczenie zapotrzebowania kalorycznego (musi być przed renderowaniem jadłospisu, aby mieć prawidłowe kalorie)
    calculateCalorieTarget();

    // Obsługa wyboru diety i renderowania jadłospisu
    if (dietConditionSelect) {
      const savedCondition = localStorage.getItem(`wnuczek_diet_condition_${currentUser.email}`) || "general";
      dietConditionSelect.value = savedCondition;
      dietConditionSelect.onchange = () => {
        const cond = dietConditionSelect.value;
        localStorage.setItem(`wnuczek_diet_condition_${currentUser.email}`, cond);
        renderDietPlan(cond);

        // Zsynchronizuj z profilem
        const profileDiet = document.getElementById("profileDiet");
        if (profileDiet) {
          const dietLabels = {
            general: "Ogólna dieta seniora",
            diabetes: "Cukrzyca (Niski IG)",
            hypertension: "Nadciśnienie (Niskosodowa)",
            digestive: "Łatwostrawna"
          };
          profileDiet.textContent = dietLabels[cond] || "Ogólna";
        }
      };
      renderDietPlan(savedCondition);
    }

    // Obsługa przycisku lodówki
    if (btnGenerateFridgeRecipe) {
      btnGenerateFridgeRecipe.onclick = handleFridgeRecipeGeneration;
    }

    // Obsługa przycisku zamknięcia modalu przepisu
    const btnRecipeModalClose = document.getElementById("btnRecipeModalClose");
    if (btnRecipeModalClose) {
      btnRecipeModalClose.onclick = () => {
        const recipeModal = document.getElementById("recipeModal");
        if (recipeModal) recipeModal.classList.add("hidden");
      };
    }

    // Domyślne wywołanie przeliczenia jednostek
    calculateConversion();
  }

  // Obsługa kliknięć kafelków składników
  function setupIngredientSelection() {
    ingredientTiles.forEach(tile => {
      tile.onclick = () => {
        ingredientTiles.forEach(t => t.classList.remove("active"));
        tile.classList.add("active");
        selectedIngredient = tile.getAttribute("data-ingredient");
        calculateConversion();
      };
    });
  }

  // Obliczenie przeliczenia kuchennego
  function calculateConversion() {
    if (!convertAmount || !convertFromUnit || !convertToUnit || !converterResult) return;

    const amount = parseFloat(convertAmount.value);
    if (isNaN(amount) || amount <= 0) {
      converterResult.textContent = "Wprowadź prawidłową ilość (większą od zera).";
      converterResult.style.borderColor = "var(--danger)";
      return;
    }
    converterResult.style.borderColor = "";

    const fromUnit = convertFromUnit.value;
    const toUnit = convertToUnit.value;
    const ingredient = conversionRates[selectedIngredient];

    if (fromUnit === toUnit) {
      const label = getUnitLabel(amount, fromUnit);
      converterResult.textContent = `${amount} ${label} ${ingredient.name} = ${amount} ${label}`;
      return;
    }

    let grams = (fromUnit === "grams") ? amount : amount * ingredient[fromUnit];
    let result = (toUnit === "grams") ? grams : grams / ingredient[toUnit];

    const roundedResult = result >= 10 ? Math.round(result) : parseFloat(result.toFixed(2));
    const fromLabel = getUnitLabel(amount, fromUnit);
    const toLabel = getUnitLabel(roundedResult, toUnit);

    converterResult.textContent = `${amount} ${fromLabel} (${ingredient.name}) = ${roundedResult} ${toLabel}`;
  }

  // Gramatyka miar
  function getUnitLabel(number, unit) {
    const labels = unitLabels[unit];
    if (!labels) return unit;
    if (number === 1) return labels.singular;

    const lastDigit = Math.floor(number) % 10;
    const lastTwoDigits = Math.floor(number) % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return labels.plural;
    if (lastDigit >= 2 && lastDigit <= 4) return labels.genitive;
    return labels.plural;
  }

  // Obliczenie zapotrzebowania kalorycznego dla seniorów
  function calculateCalorieTarget() {
    if (!currentUser || !dietCalorieTarget) return;

    const firstName = currentUser.name.split(" ")[0].toLowerCase();
    const isFemale = firstName.endsWith("a") && firstName !== "kuba" && firstName !== "kosma";

    const w = currentUser.weight;
    const h = currentUser.height;
    const a = currentUser.age;

    let bmr = isFemale ? (10 * w + 6.25 * h - 5 * a - 161) : (10 * w + 6.25 * h - 5 * a + 5);
    const totalCalories = Math.round(bmr * 1.3);
    dailyCalorieTargetVal = totalCalories;

    dietCalorieTarget.innerHTML = `
      Twoje szacunkowe dzienne zapotrzebowanie kaloryczne wynosi ok. <strong>${totalCalories} kcal</strong>.
    `;
  }

  // Obliczenie kaloryczności dla poszczególnych posiłków
  function getMealCalories(mealType) {
    if (mealType === "Śniadanie") return Math.round(dailyCalorieTargetVal * 0.25);
    if (mealType === "Obiad") return Math.round(dailyCalorieTargetVal * 0.35);
    if (mealType === "Podwieczorek") return Math.round(dailyCalorieTargetVal * 0.20);
    if (mealType === "Kolacja") return Math.round(dailyCalorieTargetVal * 0.20);
    return Math.round(dailyCalorieTargetVal * 0.25);
  }

  // Dynamiczne renderowanie jadłospisu dobowego na ekranie
  function renderDietPlan(condition) {
    if (!dietPlanContainer) return;

    const plan = menusByCondition[condition] || menusByCondition.general;
    
    let html = `
      <p style="font-size: 0.95rem; color: var(--text-muted); font-style: italic; margin-bottom: 1.25rem; border-left: 4px solid var(--primary); padding-left: 0.75rem; line-height: 1.5;">
        <strong>Wytyczne diety:</strong> ${plan.guidelines}
      </p>
    `;

    plan.meals.forEach(meal => {
      const targetCalories = getMealCalories(meal.type);
      html += `
        <div class="list-item clickable-meal-item" 
             style="display: block; padding: 1.25rem; margin-bottom: 0.75rem; cursor: pointer;" 
             onclick="window.showRecipeFromAI('${meal.name.replace(/'/g, "\\'")}', ${targetCalories})"
             title="Kliknij, aby wygenerować przepis z Wnuczkiem">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
            <span style="font-size: 0.85rem; font-weight: 850; text-transform: uppercase; color: var(--accent); background-color: var(--accent-light); padding: 0.25rem 0.6rem; border-radius: 12px;">
              ${meal.type} (~${targetCalories} kcal)
            </span>
            <strong style="color: var(--primary); font-size: 1.1rem; font-family: 'Outfit', sans-serif;">${meal.name} 🍽️</strong>
          </div>
          <p style="font-size: 0.98rem; color: var(--text-muted); margin: 0; line-height: 1.4;">${meal.desc}</p>
          <small style="font-size: 0.85rem; color: var(--primary); font-weight: bold; display: block; margin-top: 0.5rem;">👉 Kliknij, aby zobaczyć przepis AI</small>
        </div>
      `;
    });

    dietPlanContainer.innerHTML = html;
  }

  // Funkcja pobierająca i wyświetlająca przepis przez Gemini API (gemini-2.5-flash)
  async function showRecipeFromAI(mealName, targetCalories) {
    const recipeModal = document.getElementById("recipeModal");
    const recipeModalTitle = document.getElementById("recipeModalTitle");
    const recipeModalContent = document.getElementById("recipeModalContent");

    if (!recipeModal || !recipeModalTitle || !recipeModalContent) return;

    // Otwarcie modalu i pokazanie kręciołka
    recipeModalTitle.textContent = mealName;
    recipeModalContent.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem;">
        <div class="spinner" style="margin: 0 auto 1.5rem auto; width: 48px; height: 48px; border-width: 4px;"></div>
        <p style="font-weight: 800; color: var(--primary); font-size: 1.15rem;">Wnuczek przygotowuje przepis dla Ciebie...</p>
      </div>
    `;
    recipeModal.classList.remove("hidden");

    const activeDietCode = localStorage.getItem(`wnuczek_diet_condition_${currentUser.email}`) || "general";
    const dietLabels = {
      general: "Ogólna dieta seniora",
      diabetes: "Cukrzyca (Niski indeks glikemiczny)",
      hypertension: "Nadciśnienie (Dieta niskosodowa / DASH)",
      digestive: "Łatwostrawna (Problemy trawienne)"
    };
    const userDiet = dietLabels[activeDietCode] || "Ogólna";
    const apiKey = (typeof GEMINI_API_KEY !== "undefined" && GEMINI_API_KEY && GEMINI_API_KEY !== "TWÓJ_KLUCZ_API_TUTAJ") ? GEMINI_API_KEY.trim() : "";
    const cleanKey = apiKey ? apiKey : null;

    try {
      let recipeText = "";
      if (cleanKey) {
        // Wywołanie Gemini API (gemini-2.5-flash)
        const prompt = `Jesteś ekspertem dietetykiem dla seniorów. Użytkownik wybrał danie: ${mealName}. Napisz dla niego prosty, tradycyjny przepis krok po kroku w języku polskim. Składniki i gramatury dopasuj tak, aby całe danie miało dokładnie około ${targetCalories} kcal. Uwzględnij ograniczenia zdrowotne i dietę użytkownika: ${userDiet}.`;
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${cleanKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Błąd połączenia: status ${response.status}`);
        }

        const data = await response.json();
        recipeText = data.candidates[0].content.parts[0].text.trim();
      } else {
        // Fallback dla trybu demonstracyjnego
        await new Promise(resolve => setTimeout(resolve, 1500));
        recipeText = `[TRYB DEMONSTRACYJNY - BRAK KLUCZA API]

Przepis na: ${mealName} (${targetCalories} kcal)
Dostosowany do diety: ${userDiet}

Składniki:
- Główne składniki dopasowane proporcjonalnie do ${targetCalories} kcal
- Świeże warzywa, nabiał lub chude mięso (zgodnie z profilem)

Sposób przygotowania:
1. Przygotuj składniki zgodnie z zasadami Twojej diety (${userDiet}).
2. Gotuj, duś lub piecz bez nadmiaru tłuszczu.
3. Podawaj ciepłe i dbaj o regularne nawodnienie!`;
      }

      recipeModalContent.textContent = recipeText;
    } catch (err) {
      console.error(err);
      recipeModalContent.innerHTML = `
        <p style="color: var(--danger); font-weight: bold; text-align: center; font-size: 1.1rem; margin-top: 2rem;">
          Nie udało się wygenerować przepisu. Błąd: ${err.message}
        </p>
      `;
    }
  }

  // Eksponujemy funkcję globalnie dla onclicków
  window.showRecipeFromAI = showRecipeFromAI;

  // ==========================================================================
  // GENEROWANIE PRZEPISU ZE SKŁADNIKÓW W LODÓWCE
  // ==========================================================================

  async function handleFridgeRecipeGeneration() {
    const ingredients = fridgeIngredientsInput.value.trim();
    if (!ingredients) {
      showToast("Wpisz przynajmniej jeden składnik z lodówki.", "error");
      return;
    }

    // Pokaż loader i kontener wyniku
    fridgeRecipeResult.classList.remove("hidden");
    fridgeRecipeLoading.classList.remove("hidden");
    fridgeRecipeTitle.textContent = "";
    fridgeRecipeText.textContent = "";

    const condition = dietConditionSelect ? dietConditionSelect.value : "general";
    const dietLabel = menusByCondition[condition]?.title || "Ogólna";
    const apiKey = (typeof GEMINI_API_KEY !== "undefined" && GEMINI_API_KEY && GEMINI_API_KEY !== "TWÓJ_KLUCZ_API_TUTAJ") ? GEMINI_API_KEY.trim() : "";

    try {
      let title = "";
      let recipe = "";

      if (apiKey) {
        // Generowanie przez Gemini API
        const apiResponse = await callGeminiFridgeAPI(apiKey, ingredients, dietLabel);
        
        // Parsowanie wyniku (zazwyczaj Gemini zwraca tytuł w pierwszej linii lub pogrubiony)
        const lines = apiResponse.split("\n").filter(l => l.trim() !== "");
        if (lines.length > 0) {
          title = lines[0].replace(/[#*]/g, "").replace("Tytuł:", "").trim();
          recipe = lines.slice(1).join("\n").trim();
        } else {
          title = "Przepis z Twojej lodówki";
          recipe = apiResponse;
        }
      } else {
        // Tryb demonstracyjny - Smart Fallback
        const result = generateMockFridgeRecipe(ingredients, condition);
        title = result.title;
        recipe = result.recipe;
        // Symulacja opóźnienia sieci
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Ukryj loader i renderuj
      fridgeRecipeLoading.classList.add("hidden");
      fridgeRecipeTitle.textContent = `🍳 ${title}`;
      fridgeRecipeText.textContent = recipe;
      
      showToast("Wnuczek wymyślił pyszne danie!", "success");

    } catch (err) {
      console.error(err);
      fridgeRecipeLoading.classList.add("hidden");
      fridgeRecipeResult.classList.add("hidden");
      showToast("Wystąpił błąd podczas wymyślania przepisu. Spróbuj ponownie.", "error");
    }
  }

  // Zapytanie do Gemini API dotyczące przepisu
  async function callGeminiFridgeAPI(apiKey, ingredients, dietLabel) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const name = currentUser ? currentUser.name.split(" ")[0] : "Dziadku/Babciu";

    const promptText = `Rozmawiasz ze swoim bliskim seniorów o imieniu ${name}. Użytkownik ma w lodówce następujące produkty: "${ingredients}". Jego zalecana dieta to: "${dietLabel}".
    Wymyśl jedno proste, zdrowe i łatwostrawne danie (np. obiad lub kolację) wykorzystujące te produkty. Możesz założyć, że w domu są podstawowe składniki (woda, sól w małej ilości, pieprz, odrobina oleju).
    Zwróć odpowiedź w dokładnie takim formacie po polsku:
    Tytuł: [Krótka apetyczna nazwa dania]
    Składniki dodatkowe: [1-2 podstawowe przyprawy lub woda]
    Przygotowanie: [Wypisz w 3-4 bardzo prostych krokach, ponumerowanych, jak to danie przyrządzić].
    Odpowiedź sformułuj z miłością i troską, jako kochający wnuczek Adaś.`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: promptText }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.6 }
      })
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  // Generowanie przepisu w trybie demo (mock)
  function generateMockFridgeRecipe(ingredientsInput, condition) {
    const input = ingredientsInput.toLowerCase();
    
    // Baza gotowych przepisów demonstracyjnych w zależności od składników i diety
    if (input.includes("jajk") || input.includes("jajecznica") || input.includes("jajo")) {
      return {
        title: "Puszysty Omlet Warzywny z Patelni",
        recipe: `Składniki dodatkowe: łyżeczka masła, szczypta ziół, odrobina wody.
        
        Przygotowanie:
        1. Roztrzep jajka w miseczce z łyżką wody i ulubionymi ziołami (np. koperkiem).
        2. Jeśli masz pomidora lub inne warzywa, pokrój je w drobną kostkę.
        3. Rozgrzej patelnię, rozpuść masło, wylej jajka i dorzuć składniki z lodówki.
        4. Smaż pod przykryciem na małym ogniu przez 4-5 minut, aż omlet ładnie się zetnie. Podawaj z chlebem.`
      };
    }

    if (input.includes("twarog") || input.includes("twaróg") || input.includes("ser")) {
      return {
        title: "Ziołowy Twarożek 'Czyszczenie Lodówki'",
        recipe: `Składniki dodatkowe: 2 łyżki jogurtu lub mleka, szczypta pieprzu.
        
        Przygotowanie:
        1. Rozgnieć twaróg widelcem w miseczce, dodając jogurt lub mleko, by uzyskać kremową konsystencję.
        2. Drobno posiekaj szczypiorek, rzodkiewki lub inne posiadane warzywa.
        3. Wymieszaj wszystko dokładnie z twarogiem, doprawiając szczyptą ziół i pieprzu (unikaj soli przy nadciśnieniu!).
        4. Zjedz z kromką pieczywa. To idealne, lekkie i bogate w wapń danie.`
      };
    }

    if (input.includes("kurczak") || input.includes("piers") || input.includes("pierś") || input.includes("indyk") || input.includes("mięso")) {
      return {
        title: "Delikatny Kurczak Duszony w Warzywach",
        recipe: `Składniki dodatkowe: szklanka bulionu warzywnego lub wody, łyżka oleju, majeranek.
        
        Przygotowanie:
        1. Pokrój pierś drobiową w małe paski i delikatnie oprósz majerankiem lub ziołami.
        2. Podduś mięso na patelni z odrobiną oleju przez 3 minuty.
        3. Dodaj pokrojone warzywa, które masz w lodówce (np. marchewkę, cukinię, paprykę).
        4. Podlej wodą i duś pod przykryciem przez 12-15 minut, aż mięso będzie miękkie i kruche. Podawaj z ryżem.`
      };
    }

    if (input.includes("jabłk") || input.includes("jablk") || input.includes("owoc")) {
      return {
        title: "Ciepłe Jabłka Pieczone z Cynamonem",
        recipe: `Składniki dodatkowe: łyżeczka miodu, szczypta cynamonu, garść płatków owsianych.
        
        Przygotowanie:
        1. Umyj jabłko, odetnij górę i delikatnie wydrąż gniazdo nasienne.
        2. Wymieszaj płatki owsiane z miodem i cynamonem, a następnie wypełnij nimi środek jabłka.
        3. Włóż jabłko do piekarnika nagrzanego do 180°C lub wstaw do kuchenki mikrofalowej na 3 minuty.
        4. Piecz w piekarniku przez ok. 20 minut, aż jabłko będzie miękkie. To pyszny, lekkostrawny podwieczorek.`
      };
    }

    if (input.includes("chleb") || input.includes("bułk") || input.includes("bulk")) {
      return {
        title: "Ciepłe Grzanki z Patelni z Ziołami",
        recipe: `Składniki dodatkowe: ząbek czosnku, łyżeczka oliwy, zioła prowansalskie.
        
        Przygotowanie:
        1. Pokrój chleb w kromki i skrop delikatnie oliwą z oliwek.
        2. Połóż na chlebie to, co masz w lodówce (ser, wędlinę, plasterki pomidora).
        3. Ułóż kromki na patelni i przykryj pokrywką, piecz na małym ogniu przez 5 minut, aż ser się rozpuści, a chleb stanie się chrupiący.
        4. Posyp ziołami i zjedz na ciepło.`
      };
    }

    // Default fallback recipe
    return {
      title: "Zapiekanka 'Lodówkowe Rozmaitości' dla Seniora",
      recipe: `Składniki dodatkowe: jedno jajko (jako spoiwo), odrobina mleka, szczypta ziół prowansalskich.
      
      Przygotowanie:
      1. Wszystkie twardsze składniki z lodówki (np. ziemniaki, warzywa, wędlinę) pokrój w kostkę i wymieszaj.
      2. W miseczce roztrzep jedno jajko z 2 łyżkami mleka i ulubionymi ziołami.
      3. Przełóż składniki do małego naczynia żaroodpornego i zalej roztrzepanym jajkiem.
      4. Piecz w temperaturze 180°C przez około 15-20 minut (lub na patelni pod przykryciem), aż jajko całkowicie się zetnie. Smacznego!`
    };
  }

  // Eksponuj na zewnątrz
  window.initDietModule = initDietModule;

})();
