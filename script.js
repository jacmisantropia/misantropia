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

// Lógica do Minigame (Misantropia)
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

// Easter Egg: Revelar o minigame ao clicar 3 vezes na cruz designada (#death-easter-egg)
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
      
      // Adiciona a classe '.ativo' para exibir o minigame que estava oculto no CSS
      game.classList.add("ativo");
      
      // Rola a página suavemente até o minigame
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
