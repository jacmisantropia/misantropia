// =========================================
// 1. MENU & INTERFACE BASE
// =========================================
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.topbar nav');
menuToggle.addEventListener('click', () => {
  const opened = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(opened));
  menuToggle.textContent = opened ? '×' : '☰';
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.textContent = '☰';
}));

const overlay = document.getElementById('secretOverlay');
const toast = document.getElementById('toast');
let toastTimer;
function showToast(message) {
  toast.textContent = message; toast.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}
function openSecret() { overlay.classList.add('open'); overlay.setAttribute('aria-hidden', 'false'); }
function closeSecret() { overlay.classList.remove('open'); overlay.setAttribute('aria-hidden', 'true'); }
document.getElementById('secretButton').addEventListener('click', openSecret);
document.getElementById('closeSecret').addEventListener('click', closeSecret);
overlay.addEventListener('click', e => { if (e.target === overlay) closeSecret(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSecret(); });

// =========================================
// 2. EASTER EGGS EXISTENTES
// =========================================

// Easter egg 1: clique cinco vezes no título/logo da peça.
let logoClicks = 0, logoReset;
document.querySelector('.main-logo').addEventListener('click', () => {
  logoClicks++; clearTimeout(logoReset);
  logoReset = setTimeout(() => logoClicks = 0, 1800);
  if (logoClicks >= 5) { logoClicks = 0; showToast('VOCÊ OLHOU DE PERTO DEMAIS.'); openSecret(); }
});

// Easter egg 2: a pequena cruz escondida no hero.
document.getElementById('deathMark').addEventListener('click', () => showToast('ELA ESTAVA AQUI O TEMPO TODO.'));

// Easter egg 3: digite NADINE em qualquer lugar da página.
let typed = '';
document.addEventListener('keydown', e => {
  if (e.key.length === 1 && /[a-z]/i.test(e.key)) {
    typed = (typed + e.key.toLowerCase()).slice(-12);
    if (typed.endsWith('nadine')) { showToast('NADINE NÃO É A RESPOSTA.'); typed = ''; }
  }
});

// Easter egg 4: clique três vezes na frase do manifesto.
let manifestoClicks = 0;
document.querySelector('.redline').addEventListener('click', () => {
  manifestoClicks++;
  if (manifestoClicks >= 3) { manifestoClicks = 0; showToast('A CULPA NUNCA FICA ONDE VOCÊ DEIXOU.'); }
});

// =========================================
// 3. JOGO DA MORTE (A VIGÍLIA)
// =========================================
(() => {
  const root = document.querySelector("#morte-game");
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = "true";

  const $ = (selector) => root.querySelector(selector);

  const startButton = $("#game-start");
  const restartButton = $("#game-restart");
  const target = $("#death-target");
  const arena = $("#game-arena");
  const intro = $("#game-intro");
  const result = $("#game-result");
  const message = $("#game-message");
  const timeDisplay = $("#game-time");
  const scoreDisplay = $("#game-score");
  const recordDisplay = $("#game-record");

  const RECORD_KEY = "misantropia-morte-recorde";

  let timeLeft = 20;
  let score = 0;
  let active = false;
  let countdown = null;
  let appearance = null;
  let appearanceId = 0;

  let record = 0;

  try {
    record = Number(localStorage.getItem(RECORD_KEY)) || 0;
  } catch (_) {}

  recordDisplay.textContent = String(record).padStart(2, "0");

  function hideTarget() {
    appearanceId++;
    clearTimeout(appearance);
    target.hidden = true;
  }

  function showTarget() {
    if (!active) return;

    hideTarget();

    const id = appearanceId;
    const padding = 38;
    const maxX = Math.max(padding, arena.clientWidth - padding);
    const maxY = Math.max(padding + 35, arena.clientHeight - padding - 20);

    const x = padding + Math.random() * (maxX - padding);
    const y = padding + 35 + Math.random() * (maxY - padding - 35);

    target.style.left = `${x}px`;
    target.style.top = `${y}px`;
    target.hidden = false;

    message.textContent = "ELA ESTÁ AQUI. NÃO PISQUE.";

    appearance = setTimeout(() => {
      if (!active || id !== appearanceId) return;

      target.hidden = true;
      message.textContent = "VOCÊ DEMOROU.";

      appearance = setTimeout(showTarget, 450);
    }, 850);
  }

  function finishGame() {
    active = false;
    clearInterval(countdown);
    hideTarget();

    result.hidden = false;
    $("#result-title").textContent =
      score >= 15 ? "VOCÊ VIU DEMAIS." :
      score >= 7 ? "ELA AINDA ESTÁ AQUI." :
      "ELA VIU VOCÊ.";

    $("#result-description").textContent =
      `Você encontrou a Morte ${score} vez(es). ` +
      (score >= 15
        ? "Mas será que ela deixou você vencer?"
        : "Talvez seja melhor não olhar para trás.");

    message.textContent = "VIGÍLIA ENCERRADA.";
    startButton.hidden = true;
  }

  function startGame() {
    clearInterval(countdown);
    clearTimeout(appearance);

    timeLeft = 20;
    score = 0;
    active = true;

    timeDisplay.textContent = "20";
    scoreDisplay.textContent = "00";
    result.hidden = true;
    intro.hidden = true;
    startButton.hidden = true;
    message.textContent = "PROCURANDO SINAL...";
    
    showTarget();

    countdown = setInterval(() => {
      timeLeft--;
      timeDisplay.textContent = String(timeLeft).padStart(2, "0");

      if (timeLeft <= 0) finishGame();
    }, 1000);
  }

  target.addEventListener("click", () => {
    if (!active || target.hidden) return;

    score++;
    scoreDisplay.textContent = String(score).padStart(2, "0");

    if (score > record) {
      record = score;
      recordDisplay.textContent = String(record).padStart(2, "0");

      try {
        localStorage.setItem(RECORD_KEY, String(record));
      } catch (_) {}
    }

    hideTarget();
    message.textContent = "VOCÊ A ENCONTROU. POR ENQUANTO.";

    appearance = setTimeout(showTarget, 300);
  });

  startButton.addEventListener("click", startGame);
  restartButton.addEventListener("click", startGame);
})();

// Easter Egg: Revelar o minigame ao clicar 3 vezes na cruz do personagem Morte
(() => {
  const trigger = document.querySelector("#death-easter-egg");
  const game = document.querySelector("#morte-game");

  if (!trigger || !game) return;

  let clicks = 0;
  let resetClick = null;

  trigger.addEventListener("click", () => {
    clicks++;
    clearTimeout(resetClick);

    if (clicks >= 3) {
      clicks = 0;
      game.classList.add("ativo");
      game.scrollIntoView({ behavior: "smooth" });

      const message = game.querySelector("#game-message");
      if (message) {
        message.textContent = "VOCÊ ENCONTROU O QUE ESTAVA ESCONDIDO.";
      }
    } else {
      resetClick = setTimeout(() => {
        clicks = 0;
      }, 1800);
    }
  });
})();

// =========================================
// 4. MINIJOGO DE INVESTIGAÇÃO — ARQUIVO 017
// =========================================
(() => {
  const content = document.querySelector("#game-content");
  const stageLabel = document.querySelector("#game-stage");
  const clueCount = document.querySelector("#clue-count");
  const clueTrack = document.querySelector("#clue-track");

  if (!content || !stageLabel || !clueCount || !clueTrack) {
    return;
  }

  const clues = [
    {
      id: "testimony",
      selector: ".hero-stamp",
      message: "PISTA 01 — O primeiro depoimento foi alterado."
    },
    {
      id: "contradiction",
      selector: ".character-note",
      message: "PISTA 02 — Alguém deixou uma contradição escapar."
    },
    {
      id: "witness",
      selector: ".finale-small",
      message: "PISTA 03 — A testemunha sabia mais do que revelou."
    }
  ];

  const foundClues = new Set();
  let suspicion = 0;
  let currentStage = 0;
  let finished = false;

  const stages = [
    {
      label: "ETAPA 01 / DEPOIMENTOS",
      eyebrow: "REGISTRO DE TESTEMUNHAS",
      title: "Três versões. Qual merece sua confiança?",
      text: "Uma pessoa afirma que não esteve no local. Outra diz que ouviu uma confissão. A terceira não se lembra de nada.",
      choices: [
        { text: "Investigar quem afirma não ter estado no local.", score: 1 },
        { text: "Confrontar quem diz ter ouvido a confissão.", score: 2 },
        { text: "Desconfiar de quem diz não se lembrar.", score: 0 }
      ]
    },
    {
      label: "ETAPA 02 / EVIDÊNCIAS",
      eyebrow: "ANÁLISE DO MATERIAL",
      title: "Uma informação não bate.",
      text: "O registro apresenta uma contradição. Você pode procurar outras evidências pela página ou interpretar o documento que já possui.",
      choices: [
        { text: "Buscar as pistas escondidas antes de concluir.", score: 2 },
        { text: "Usar apenas o primeiro depoimento.", score: 0 },
        { text: "Considerar que todos estão omitindo algo.", score: 1 }
      ]
    },
    {
      label: "ETAPA 03 / VEREDITO",
      eyebrow: "DECISÃO FINAL",
      title: "Quem é o verdadeiro responsável?",
      text: "Você já ouviu as versões. Agora precisa decidir o que fazer com aquilo que descobriu.",
      choices: [
        { text: "Revelar todas as contradições ao público.", score: 2, ending: "truth" },
        { text: "Guardar as provas e continuar investigando.", score: 1, ending: "investigator" },
        { text: "Encerrar o caso sem revelar os nomes.", score: 0, ending: "silence" }
      ]
    }
  ];

  // Cria o aviso específico do Arquivo 017
  const toast = document.createElement("div");
  toast.className = "mystery-toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  document.body.appendChild(toast);

  let toastTimeout;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }

  // Prepara os elementos da página que contêm pistas
  clues.forEach((clue) => {
    const element = document.querySelector(clue.selector);
    if (!element) return;

    element.dataset.mysteryClue = clue.id;
    element.title = "Há algo estranho aqui...";
    element.setAttribute("aria-label", "Investigar possível pista");

    if (!element.matches("button, a, input, select, textarea, [tabindex]")) {
      element.tabIndex = 0;
    }
  });

  function updateClueCounter() {
    clueCount.textContent = `${String(foundClues.size).padStart(2, "0")} / 03`;
    clueTrack.style.width = `${(foundClues.size / clues.length) * 100}%`;
  }

  // Registra as pistas coletadas ao clicar nos elementos
  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-mystery-clue]");
    if (!target || content.contains(target)) return;

    const clue = clues.find((item) => item.id === target.dataset.mysteryClue);
    if (!clue) return;

    if (foundClues.has(clue.id)) {
      showToast("Você já registrou esta evidência.");
      return;
    }

    foundClues.add(clue.id);
    updateClueCounter();
    showToast(clue.message);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    const target = event.target.closest("[data-mystery-clue]");
    if (!target || target.matches("button, a")) return;

    event.preventDefault();
    target.click();
  });

  function renderStage() {
    const stage = stages[currentStage];
    stageLabel.textContent = stage.label;

    content.innerHTML = `
      <p class="game-overline">${stage.eyebrow}</p>
      <h3>${stage.title}</h3>
      <p>${stage.text}</p>

      <div class="game-choices">
        ${stage.choices.map((choice, index) => `
          <button
            class="game-choice"
            type="button"
            data-choice="${index}"
          >
            <span>0${index + 1}.</span>${choice.text}
          </button>
        `).join("")}
      </div>

      <p class="case-hint">
        EVIDÊNCIAS LOCALIZADAS: ${foundClues.size} DE 3
      </p>
    `;
  }

  function showEnding(ending) {
    finished = true;
    stageLabel.textContent = "CASO ARQUIVADO";

    let title;
    let message;
    let code;

    if (ending === "truth" && foundClues.size >= 2) {
      title = "A VERDADE NÃO SE ESCONDE.";
      message = "Você reuniu evidências suficientes para questionar as versões oficiais. O caso foi exposto, mas nem todas as respostas vieram junto com ele.";
      code = "DESFECHO 03 — A REVELAÇÃO";
    } else if (ending === "investigator" || foundClues.size < 2) {
      title = "O CASO CONTINUA ABERTO.";
      message = "Você percebeu que havia algo errado, mas algumas peças ainda faltam. A investigação termina aqui. A verdade, não.";
      code = "DESFECHO 02 — A DÚVIDA";
    } else {
      title = "O SILÊNCIO TAMBÉM DECIDE.";
      message = "Você escolheu não revelar as provas. O arquivo foi fechado, mas as contradições continuam registradas nas margens.";
      code = "DESFECHO 01 — O SILÊNCIO";
    }

    content.innerHTML = `
      <p class="game-overline">${code}</p>
      <h3>${title}</h3>

      <p>${message}</p>

      <div class="game-result">
        <strong>${foundClues.size} / 3</strong>
        <p>PISTAS DESCOBERTAS</p>
      </div>

      <button class="game-button" id="game-restart" type="button">
        REABRIR O ARQUIVO <span>↻</span>
      </button>
    `;

    showToast("Investigação concluída. O que você descobriu?");
  }

  function chooseOption(index) {
    if (finished) return;

    const stage = stages[currentStage];
    const choice = stage.choices[index];
    if (!choice) return;

    suspicion += choice.score;

    if (currentStage === stages.length - 1) {
      let ending = choice.ending;

      if (foundClues.size >= 2 && suspicion >= 4) {
        ending = "truth";
      } else if (foundClues.size === 3 && ending === "silence") {
        ending = "investigator";
      }

      showEnding(ending);
      return;
    }

    currentStage += 1;
    renderStage();
  }

  function startGame() {
    suspicion = 0;
    currentStage = 0;
    finished = false;
    foundClues.clear();

    updateClueCounter();
    renderStage();
    showToast("Arquivo 017 aberto. A investigação começou.");
  }

  content.addEventListener("click", (event) => {
    const choiceButton = event.target.closest("[data-choice]");

    if (choiceButton) {
      chooseOption(Number(choiceButton.dataset.choice));
      return;
    }

    if (
      event.target.closest("#game-start") ||
      event.target.closest("#game-restart")
    ) {
      startGame();
    }
  });

  updateClueCounter();
})();
