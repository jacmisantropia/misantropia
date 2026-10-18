// =========================================
// 1. MENU & INTERFACE BASE
// =========================================
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.topbar nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const opened = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(opened));
    menuToggle.textContent = opened ? '×' : '☰';
  });

  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = '☰';
  }));
}

const overlay = document.getElementById('secretOverlay');
const toast = document.getElementById('toast');
let toastTimer;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function openSecret() {
  if (overlay) {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
  }
}

function closeSecret() {
  if (overlay) {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  }
}

const secretBtn = document.getElementById('secretButton');
const closeSecretBtn = document.getElementById('closeSecret');

if (secretBtn) secretBtn.addEventListener('click', openSecret);
if (closeSecretBtn) closeSecretBtn.addEventListener('click', closeSecret);

if (overlay) {
  overlay.addEventListener('click', e => { if (e.target === overlay) closeSecret(); });
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSecret(); });

// =========================================
// 2. EASTER EGGS DA LANDING PAGE
// =========================================

// Easter egg 1: clique cinco vezes no título/logo da peça.
let logoClicks = 0, logoReset;
const mainLogo = document.querySelector('.main-logo');
if (mainLogo) {
  mainLogo.addEventListener('click', () => {
    logoClicks++;
    clearTimeout(logoReset);
    logoReset = setTimeout(() => logoClicks = 0, 1800);
    if (logoClicks >= 5) {
      logoClicks = 0;
      showToast('VOCÊ OLHOU DE PERTO DEMAIS.');
      openSecret();
    }
  });
}

// Easter egg 2: a pequena cruz escondida no hero.
const deathMark = document.getElementById('deathMark');
if (deathMark) {
  deathMark.addEventListener('click', () => showToast('ELA ESTAVA AQUI O TEMPO TODO.'));
}

// Easter egg 3: digite NADINE em qualquer lugar da página.
let typed = '';
document.addEventListener('keydown', e => {
  if (e.key.length === 1 && /[a-z]/i.test(e.key)) {
    typed = (typed + e.key.toLowerCase()).slice(-12);
    if (typed.endsWith('nadine')) {
      showToast('NADINE NÃO É A RESPOSTA.');
      typed = '';
    }
  }
});

// Easter egg 4: clique três vezes na frase do manifesto.
let manifestoClicks = 0;
const redline = document.querySelector('.redline');
if (redline) {
  redline.addEventListener('click', () => {
    manifestoClicks++;
    if (manifestoClicks >= 3) {
      manifestoClicks = 0;
      showToast('A CULPA NUNCA FICA ONDE VOCÊ DEIXOU.');
    }
  });
}

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

  if (recordDisplay) recordDisplay.textContent = String(record).padStart(2, "0");

  function hideTarget() {
    appearanceId++;
    clearTimeout(appearance);
    if (target) target.hidden = true;
  }

  function showTarget() {
    if (!active || !target || !arena) return;

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

    if (message) message.textContent = "ELA ESTÁ AQUI. NÃO PISQUE.";

    appearance = setTimeout(() => {
      if (!active || id !== appearanceId) return;

      target.hidden = true;
      if (message) message.textContent = "VOCÊ DEMOROU.";

      appearance = setTimeout(showTarget, 450);
    }, 850);
  }

  function finishGame() {
    active = false;
    clearInterval(countdown);
    hideTarget();

    if (result) result.hidden = false;
    
    const resTitle = $("#result-title");
    const resDesc = $("#result-description");

    if (resTitle) {
      resTitle.textContent =
        score >= 15 ? "VOCÊ VIU DEMAIS." :
        score >= 7 ? "ELA AINDA ESTÁ AQUI." :
        "ELA VIU VOCÊ.";
    }

    if (resDesc) {
      resDesc.textContent =
        `Você encontrou a Morte ${score} vez(es). ` +
        (score >= 15
          ? "Mas será que ela deixou você vencer?"
          : "Talvez seja melhor não olhar para trás.");
    }

    if (message) message.textContent = "VIGÍLIA ENCERRADA.";
    if (startButton) startButton.hidden = true;
  }

  function startGame() {
    clearInterval(countdown);
    clearTimeout(appearance);

    timeLeft = 20;
    score = 0;
    active = true;

    if (timeDisplay) timeDisplay.textContent = "20";
    if (scoreDisplay) scoreDisplay.textContent = "00";
    if (result) result.hidden = true;
    if (intro) intro.hidden = true;
    if (startButton) startButton.hidden = true;
    if (message) message.textContent = "PROCURANDO SINAL...";
    
    showTarget();

    countdown = setInterval(() => {
      timeLeft--;
      if (timeDisplay) timeDisplay.textContent = String(timeLeft).padStart(2, "0");

      if (timeLeft <= 0) finishGame();
    }, 1000);
  }

  if (target) {
    target.addEventListener("click", () => {
      if (!active || target.hidden) return;

      score++;
      if (scoreDisplay) scoreDisplay.textContent = String(score).padStart(2, "0");

      if (score > record) {
        record = score;
        if (recordDisplay) recordDisplay.textContent = String(record).padStart(2, "0");

        try {
          localStorage.setItem(RECORD_KEY, String(record));
        } catch (_) {}
      }

      hideTarget();
      if (message) message.textContent = "VOCÊ A ENCONTROU. POR ENQUANTO.";

      appearance = setTimeout(showTarget, 300);
    });
  }

  if (startButton) startButton.addEventListener("click", startGame);
  if (restartButton) restartButton.addEventListener("click", startGame);
})();

// Revelar o Jogo da Morte ao clicar 3 vezes no símbolo '†' dos personagens
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
// 4. MISANTROPIA — O JULGAMENTO
//    Motor narrativo avançado
// =========================================
(() => {
  "use strict";

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const content = $("#story-content");
  const sceneLabel = $("#story-scene-label");
  const saveLabel = $("#story-save-label");
  const chapterLabel = $("#story-chapter");
  const footerCode = $("#story-footer-code");
  const clueLabel = $("#story-clues");
  const progressBar = $("#story-progress");
  const inventoryButton = $("#story-inventory");
  const inventoryDialog = $("#story-evidence-dialog");
  const inventoryList = $("#story-evidence-list");
  const inventoryEmpty = $("#story-inventory-empty");
  const closeInventory = $("#story-close-inventory");

  if (
    !content || !sceneLabel || !saveLabel ||
    !chapterLabel || !footerCode || !clueLabel ||
    !progressBar || !inventoryButton ||
    !inventoryDialog || !inventoryList ||
    !inventoryEmpty || !closeInventory
  ) {
    return;
  }

  const SAVE_KEY = "misantropia-julgamento-v1";

  const initialState = () => ({
    scene: "letter",
    chapter: 0,
    clues: [],
    choices: [],
    trust: {
      celimene: 0,
      alceste: 0,
      oronte: 0
    },
    flags: {
      acceptedLetter: false,
      readEvidence: false,
      confrontedCelimene: false,
      protectedWitness: false,
      exposedEvidence: false,
      destroyedLetter: false
    },
    ending: null
  });

  let state = initialState();
  let toastTimer;
  let toastElement;

  const clueData = {
    seal: {
      title: "O selo rompido",
      description:
        "O envelope foi aberto antes de chegar às suas mãos. " +
        "Alguém teve acesso à carta.",
      selector: ".hero-stamp"
    },

    margin: {
      title: "A anotação na margem",
      description:
        "Uma nota sugere que o depoimento oficial não corresponde " +
        "ao que foi dito nos bastidores.",
      selector: ".character-note"
    },

    witness: {
      title: "A última declaração",
      description:
        "A declaração final contém uma informação que só uma " +
        "testemunha presente poderia conhecer.",
      selector: ".finale-small"
    },

    mark: {
      title: "A marca escondida",
      description:
        "Uma marca quase invisível indica que alguém tentou " +
        "direcionar sua investigação.",
      selector: ".hidden-mark"
    }
  };

  const scenes = {
    letter: {
      chapter: 1,
      label: "ATO I / A CARTA",
      kicker: "DOCUMENTO RECEBIDO ÀS 23:17",
      title: "Alguém quer que você julgue.",
      text: [
        "O envelope não tem remetente. Dentro, há uma carta " +
        "e uma transcrição incompleta de um julgamento.",
        "No final da página, uma frase foi escrita à mão: " +
        "\"Não procure quem mentiu. Procure quem precisava da mentira.\""
      ],
      choices: [
        {
          id: "accept",
          label: "Abrir o arquivo e investigar.",
          detail: "Você aceita conhecer as versões.",
          next: "depositions",
          effects: {
            acceptedLetter: true
          }
        },
        {
          id: "destroy",
          label: "Destruir a carta e recusar o julgamento.",
          detail: "Talvez ignorar também seja uma escolha.",
          next: "destroyed",
          effects: {
            destroyedLetter: true
          }
        },
        {
          id: "inspect",
          label: "Examinar o envelope antes de abri-lo.",
          detail: "O menor detalhe pode mudar tudo.",
          next: "envelope",
          effects: {
            acceptedLetter: true
          },
          requires: {
            clue: "seal"
          },
          lockedText: "Encontre primeiro a pista do selo no site."
        }
      ]
    },

    destroyed: {
      chapter: 1,
      label: "ATO I / RECUSA",
      kicker: "REGISTRO INTERROMPIDO",
      title: "Você não abriu o arquivo.",
      text: [
        "A carta desaparece da sua mesa. Você decide que não é " +
        "responsável por resolver os problemas dos outros.",
        "Mas, antes de sair, percebe uma anotação no verso: " +
        "\"A omissão também será registrada.\""
      ],
      choices: [
        {
          id: "return",
          label: "Voltar atrás e investigar.",
          next: "depositions",
          effects: {
            acceptedLetter: true
          }
        },
        {
          id: "leave",
          label: "Encerrar a investigação.",
          next: "endingSilence"
        }
      ]
    },

    envelope: {
      chapter: 1,
      label: "ATO I / VESTÍGIOS",
      kicker: "ANÁLISE DO DOCUMENTO",
      title: "O envelope já foi aberto.",
      text: [
        "O selo está rompido por dentro. Isso significa que a carta " +
        "foi aberta e fechada novamente antes de chegar até você.",
        "No canto, alguém escreveu as iniciais C. A. Você não sabe " +
        "se identificam uma testemunha ou quem preparou a armadilha."
      ],
      choices: [
        {
          id: "follow",
          label: "Seguir para os depoimentos.",
          next: "depositions",
          effects: {
            readEvidence: true
          }
        }
      ]
    },

    depositions: {
      chapter: 1,
      label: "ATO I / DEPOIMENTOS",
      kicker: "TRÊS VERSÕES REGISTRADAS",
      title: "Ninguém conta a mesma história.",
      text: [
        "Alceste afirma que todos mentem para proteger os próprios " +
        "interesses. Celimene diz que ele confunde sinceridade com " +
        "crueldade. Oronte garante que não tem nada a esconder.",
        "Você precisa decidir quem ouvir primeiro. O julgamento ainda " +
        "não começou, mas as alianças já estão sendo formadas."
      ],
      choices: [
        {
          id: "talkAlceste",
          label: "Ouvir Alceste.",
          detail: "O homem que não confia em ninguém.",
          next: "alceste",
          effects: {
            trust: { alceste: 1 }
          }
        },
        {
          id: "talkCelimene",
          label: "Ouvir Celimene.",
          detail: "A pessoa que conhece os bastidores.",
          next: "celimene",
          effects: {
            trust: { celimene: 1 }
          }
        },
        {
          id: "talkOronte",
          label: "Ouvir Oronte.",
          detail: "O homem que deseja encerrar o caso.",
          next: "oronte",
          effects: {
            trust: { oronte: 1 }
          }
        }
      ]
    },

    alceste: {
      chapter: 2,
      label: "ATO II / ALCESTE",
      kicker: "DEPOIMENTO Nº 01",
      title: "A sinceridade tem um preço.",
      text: [
        "Alceste afirma que não quer salvar ninguém. Diz que o problema " +
        "não é uma mentira isolada, mas uma sociedade que prefere " +
        "uma versão conveniente à realidade.",
        "Quando você pergunta sobre a carta, ele olha para o envelope " +
        "e diz: \"Eu reconheço a letra. Não reconheço a intenção.\""
      ],
      choices: [
        {
          id: "believeAlceste",
          label: "Acreditar que ele quer revelar a verdade.",
          next: "celimene",
          effects: {
            trust: { alceste: 2 }
          }
        },
        {
          id: "challengeAlceste",
          label: "Questionar por que ele reconhece a letra.",
          next: "contradiction",
          effects: {
            trust: { alceste: -1 }
          }
        },
        {
          id: "protectAlceste",
          label: "Não revelar que ele reconheceu a letra.",
          next: "celimene",
          effects: {
            protectedWitness: true
          }
        }
      ]
    },

    celimene: {
      chapter: 2,
      label: "ATO II / CELIMENE",
      kicker: "DEPOIMENTO Nº 02",
      title: "Toda versão tem uma plateia.",
      text: [
        "Celimene admite que algumas pessoas mudaram seus depoimentos. " +
        "Ela diz que não foi a única e pergunta por que todos estão " +
        "interessados em descobrir quem começou.",
        "Ela oferece uma informação em troca de uma promessa: " +
        "você não vai usar o nome de uma testemunha para encerrar " +
        "o caso rapidamente."
      ],
      choices: [
        {
          id: "promise",
          label: "Prometer proteger a testemunha.",
          next: "oronte",
          effects: {
            trust: { celimene: 2 },
            protectedWitness: true
          }
        },
        {
          id: "refusePromise",
          label: "Recusar promessas antes de conhecer as provas.",
          next: "oronte",
          effects: {
            trust: { celimene: -1 }
          }
        },
        {
          id: "confront",
          label: "Confrontá-la com a anotação encontrada.",
          next: "contradiction",
          requires: {
            clue: "margin"
          },
          lockedText: "Encontre a anotação escondida na página."
        }
      ]
    },

    oronte: {
      chapter: 2,
      label: "ATO II / ORONTE",
      kicker: "DEPOIMENTO Nº 03",
      title: "Ele quer que o caso termine.",
      text: [
        "Oronte afirma que um julgamento precisa de uma conclusão. " +
        "Segundo ele, prolongar a investigação só aumenta o dano.",
        "Quando você pergunta quem se beneficia com o encerramento, " +
        "ele responde que ninguém. A resposta vem depressa demais."
      ],
      choices: [
        {
          id: "acceptOronte",
          label: "Aceitar a explicação e avançar.",
          next: "contradiction",
          effects: {
            trust: { oronte: 1 }
          }
        },
        {
          id: "suspectOronte",
          label: "Perguntar por que ele tem tanta pressa.",
          next: "contradiction",
          effects: {
            trust: { oronte: -1 }
          }
        },
        {
          id: "showEvidence",
          label: "Mostrar a evidência da carta.",
          next: "contradiction",
          requires: {
            clue: "seal"
          },
          effects: {
            exposedEvidence: true
          },
          lockedText: "Você precisa descobrir a pista do selo primeiro."
        }
      ]
    },

    contradiction: {
      chapter: 2,
      label: "ATO II / CONTRADIÇÃO",
      kicker: "NOVO ELEMENTO NO PROCESSO",
      title: "A cronologia não faz sentido.",
      text: [
        "Os depoimentos indicam horários diferentes. Uma testemunha " +
        "diz que a carta chegou depois da reunião. Outra afirma que " +
        "ela já estava sobre a mesa antes do encontro.",
        "Você pode reunir as provas disponíveis, proteger quem falou " +
        "ou levar a contradição diretamente ao julgamento."
      ],
      choices: [
        {
          id: "gather",
          label: "Registrar a contradição no processo.",
          next: "evidenceReview",
          effects: {
            readEvidence: true
          }
        },
        {
          id: "protect",
          label: "Proteger a testemunha e guardar o detalhe.",
          next: "evidenceReview",
          effects: {
            protectedWitness: true
          }
        },
        {
          id: "accuse",
          label: "Acusar alguém imediatamente.",
          next: "trial",
          effects: {
            exposedEvidence: true,
            trust: { oronte: -1 }
          }
        }
      ]
    },

    evidenceReview: {
      chapter: 2,
      label: "ATO II / REVISÃO",
      kicker: "AS PROVAS NÃO SE EXPLICAM SOZINHAS",
      title: "Você tem uma escolha a fazer.",
      text: [
        "A carta, a anotação e os depoimentos apontam para mais de " +
        "uma interpretação. Nenhuma evidência, sozinha, identifica " +
        "quem decidiu alterar a história.",
        "Uma marca escondida no material da peça pode ajudar. " +
        "Você também pode prosseguir sem encontrar todas as pistas."
      ],
      choices: [
        {
          id: "investigateMore",
          label: "Procurar mais pistas na landing page.",
          next: "evidenceReview",
          requires: {
            allClues: true
          },
          effects: {
            readEvidence: true
          },
          lockedText: "Ainda faltam pistas escondidas no site."
        },
        {
          id: "goToTrial",
          label: "Levar o caso ao julgamento.",
          next: "trial"
        }
      ]
    },

    trial: {
      chapter: 3,
      label: "ATO III / JULGAMENTO",
      kicker: "DECISÃO IRREVERSÍVEL",
      title: "O que você fará com a verdade?",
      text: [
        "O salão está cheio. Cada pessoa espera que você confirme " +
        "uma versão diferente. Você sabe que revelar uma prova " +
        "pode expor uma testemunha. Escondê-la pode proteger alguém, " +
        "mas também preservar uma mentira.",
        "O julgamento não pergunta apenas quem mentiu. Pergunta " +
        "o que você está disposto a fazer com aquilo que descobriu."
      ],
      choices: [
        {
          id: "reveal",
          label: "Revelar todas as evidências ao público.",
          detail: "A verdade acima das consequências.",
          next: "endingTruth",
          effects: {
            exposedEvidence: true
          }
        },
        {
          id: "protectWitness",
          label: "Proteger a testemunha e manter parte do arquivo fechado.",
          detail: "Nem toda verdade precisa ser pública.",
          next: "endingMercy",
          effects: {
            protectedWitness: true
          }
        },
        {
          id: "closeCase",
          label: "Encerrar o caso sem apontar um culpado.",
          detail: "Você se recusa a transformar suspeitas em sentença.",
          next: "endingSilence"
        },
        {
          id: "accuseOronte",
          label: "Acusar Oronte com base nas contradições.",
          detail: "Esta opção exige evidências suficientes.",
          next: "endingAccusation",
          requires: {
            clueCount: 2,
            flag: "readEvidence"
          },
          lockedText:
            "Você precisa de pelo menos duas pistas e de registrar " +
            "as contradições antes de sustentar essa acusação."
        }
      ]
    },

    endingTruth: {
      chapter: 3,
      label: "DESFECHO / A VERDADE",
      kicker: "ARQUIVO CONCLUÍDO",
      title: "A verdade não absolve ninguém.",
      ending: true,
      text: [
        "As provas são reveladas. Os depoimentos são confrontados " +
        "e o julgamento deixa de ter uma resposta simples.",
        "Você descobriu que a mentira não pertencia a uma única pessoa. " +
        "Ela foi mantida por todos que tinham algo a perder.",
        "Você expôs o caso. Agora precisa conviver com as consequências."
      ]
    },

    endingMercy: {
      chapter: 3,
      label: "DESFECHO / A COMPAIXÃO",
      kicker: "ARQUIVO CONCLUÍDO",
      title: "Você escolheu quem não seria exposto.",
      ending: true,
      text: [
        "A testemunha permanece protegida. Parte do processo não " +
        "chega ao público, e algumas perguntas continuam sem resposta.",
        "Você impediu que alguém fosse condenado por uma informação " +
        "incompleta. Mas também aceitou que a história oficial " +
        "continuasse incompleta."
      ]
    },

    endingSilence: {
      chapter: 3,
      label: "DESFECHO / O SILÊNCIO",
      kicker: "ARQUIVO CONCLUÍDO",
      title: "O processo foi encerrado.",
      ending: true,
      text: [
        "Você se recusa a transformar suspeitas em sentença. " +
        "O arquivo é fechado, e cada testemunha retorna à própria vida.",
        "O silêncio evita uma condenação precipitada. Também deixa " +
        "intacta a estrutura que tornou a mentira possível."
      ]
    },

    endingAccusation: {
      chapter: 3,
      label: "DESFECHO / A ACUSAÇÃO",
      kicker: "ARQUIVO CONCLUÍDO",
      title: "Você apontou um culpado.",
      ending: true,
      text: [
        "A acusação muda o rumo do julgamento. As contradições " +
        "são suficientes para levantar suspeitas, mas não provam " +
        "que uma única pessoa controlou todos os acontecimentos.",
        "Você conseguiu uma resposta para o público. Não necessariamente " +
        "a resposta que o caso merecia."
      ]
    }
  };

  toastElement = document.createElement("div");
  toastElement.className = "story-toast";
  toastElement.setAttribute("role", "status");
  toastElement.setAttribute("aria-live", "polite");
  document.body.appendChild(toastElement);

  function notify(message) {
    toastElement.textContent = message;
    toastElement.classList.add("visible");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastElement.classList.remove("visible");
    }, 3000);
  }

  function hasClue(id) {
    return state.clues.includes(id);
  }

  function hasAllClues() {
    return Object.keys(clueData).every(hasClue);
  }

  function meetsRequirements(requirements = {}) {
    if (
      requirements.clue &&
      !hasClue(requirements.clue)
    ) return false;

    if (
      requirements.allClues &&
      !hasAllClues()
    ) return false;

    if (
      requirements.clueCount &&
      state.clues.length < requirements.clueCount
    ) return false;

    if (
      requirements.flag &&
      !state.flags[requirements.flag]
    ) return false;

    return true;
  }

  function applyEffects(effects = {}) {
    Object.entries(effects).forEach(([key, value]) => {
      if (key === "trust") {
        Object.entries(value).forEach(([person, amount]) => {
          if (person in state.trust) {
            state.trust[person] += amount;
          }
        });
      } else if (key in state.flags) {
        state.flags[key] = value;
      }
    });
  }

  function recordChoice(sceneId, choiceId) {
    state.choices.push({
      scene: sceneId,
      choice: choiceId
    });
  }

  function updateSidebar() {
    clueLabel.textContent =
      `${String(state.clues.length).padStart(2, "0")} / 04`;

    progressBar.style.width =
      `${(state.clues.length / 4) * 100}%`;

    const scene = scenes[state.scene];
    chapterLabel.textContent =
      String(scene?.chapter || state.chapter).padStart(2, "0");

    footerCode.textContent =
      `REGISTRO ${String(state.choices.length).padStart(3, "0")}`;
  }

  function renderInventory() {
    inventoryList.replaceChildren();

    const discovered = state.clues
      .map((id) => clueData[id])
      .filter(Boolean);

    inventoryEmpty.hidden = discovered.length > 0;

    discovered.forEach((clue) => {
      const item = document.createElement("li");
      const title = document.createElement("strong");
      const description = document.createElement("p");

      title.textContent = clue.title;
      description.textContent = clue.description;

      item.append(title, description);
      inventoryList.appendChild(item);
    });
  }

  function renderScene(sceneId) {
    const scene = scenes[sceneId];

    if (!scene) {
      notify("Não foi possível carregar esta cena.");
      return;
    }

    state.scene = sceneId;
    state.chapter = scene.chapter;

    sceneLabel.textContent = scene.label;
    content.replaceChildren();

    const kicker = document.createElement("p");
    kicker.className = "story-kicker";
    kicker.textContent = scene.kicker;

    const title = document.createElement("h3");
    title.textContent = scene.title;

    content.append(kicker, title);

    scene.text.forEach((paragraphText) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = paragraphText;
      content.appendChild(paragraph);
    });

    if (scene.ending) {
      renderEnding(scene);
      updateSidebar();
      saveProgress();
      return;
    }

    const choicesContainer = document.createElement("div");
    choicesContainer.className = "story-choices";

    scene.choices.forEach((choice, index) => {
      const available = meetsRequirements(choice.requires);
      const button = document.createElement("button");

      button.type = "button";
      button.className = "story-choice";
      button.disabled = !available;

      const number = document.createElement("span");
      number.className = "choice-number";
      number.textContent = `0${index + 1}.`;

      const label = document.createElement("span");
      label.textContent = choice.label;

      button.append(number, label);

      if (choice.detail && available) {
        const detail = document.createElement("small");
        detail.textContent = choice.detail;
        button.appendChild(detail);
      }

      if (!available) {
        const lockText = document.createElement("small");
        lockText.textContent =
          choice.lockedText || "Evidências insuficientes.";
        button.appendChild(lockText);
      }

      button.addEventListener("click", () => {
        selectChoice(sceneId, choice);
      });

      choicesContainer.appendChild(button);
    });

    content.appendChild(choicesContainer);

    if (state.clues.length > 0) {
      const note = document.createElement("div");
      note.className = "story-note";
      note.textContent =
        `Você reuniu ${state.clues.length} de 4 pistas. ` +
        "Consulte o arquivo para revisar as evidências.";
      content.appendChild(note);
    }

    updateSidebar();
    saveProgress();
  }

  function selectChoice(sceneId, choice) {
    if (!meetsRequirements(choice.requires)) {
      notify(choice.lockedText || "Ainda faltam evidências.");
      return;
    }

    recordChoice(sceneId, choice.id);
    applyEffects(choice.effects);

    if (choice.next.startsWith("ending")) {
      state.ending = choice.next;
    }

    renderScene(choice.next);
  }

  function renderEnding(scene) {
    state.ending = state.scene;

    const endingBox = document.createElement("div");
    endingBox.className = "story-ending";

    const endingTitle = document.createElement("strong");
    endingTitle.textContent = getEndingLabel(scene);

    const endingText = document.createElement("p");
    endingText.textContent = getEndingAnalysis();

    endingBox.append(endingTitle, endingText);
    content.appendChild(endingBox);

    const restartButton = document.createElement("button");
    restartButton.className = "story-action";
    restartButton.type = "button";
    restartButton.textContent = "RECOMEÇAR A HISTÓRIA ↻";

    restartButton.addEventListener("click", restartStory);
    content.appendChild(restartButton);

    const endingCode = document.createElement("p");
    endingCode.className = "story-kicker";
    endingCode.textContent =
      `PISTAS: ${state.clues.length}/4 · ` +
      `DECISÕES: ${state.choices.length}`;

    content.appendChild(endingCode);

    saveLabel.textContent = "CASO CONCLUÍDO";
    notify("O julgamento terminou. Seu desfecho foi registrado.");
  }

  function getEndingLabel(scene) {
    const labels = {
      endingTruth: "DESFECHO I — EXPOSIÇÃO",
      endingMercy: "DESFECHO II — PROTEÇÃO",
      endingSilence: "DESFECHO III — SILÊNCIO",
      endingAccusation: "DESFECHO IV — ACUSAÇÃO"
    };

    return labels[state.scene] || scene.label;
  }

  function getEndingAnalysis() {
    const clueCount = state.clues.length;
    const alceste = state.trust.alceste;
    const celimene = state.trust.celimene;
    const oronte = state.trust.oronte;

    let analysis;

    if (clueCount === 4) {
      analysis =
        "Você encontrou todas as pistas. Sua versão dos fatos " +
        "considerou detalhes que as testemunhas tentaram deixar de fora.";
    } else if (clueCount >= 2) {
      analysis =
        "Você reuniu evidências importantes, mas algumas partes " +
        "da história permaneceram fora do seu alcance.";
    } else {
      analysis =
        "Você tomou decisões com informações limitadas. " +
        "O resultado mostra o risco de julgar antes de conhecer o processo.";
    }

    if (celimene > alceste && celimene > oronte) {
      analysis += " Você deu mais peso à perspectiva de Celimene.";
    } else if (alceste > oronte) {
      analysis += " Você deu mais peso à desconfiança de Alceste.";
    } else if (oronte > 0) {
      analysis += " Você considerou a versão de Oronte.";
    }

    if (state.flags.protectedWitness) {
      analysis += " Uma testemunha foi protegida pelas suas decisões.";
    }

    if (state.flags.exposedEvidence) {
      analysis += " Você decidiu expor parte das evidências.";
    }

    return analysis;
  }

  function installClues() {
    Object.entries(clueData).forEach(([id, clue]) => {
      const element = $(clue.selector);

      if (!element) return;

      element.dataset.storyClue = id;
      element.title = "Há algo escondido neste elemento.";
      element.setAttribute("aria-label", "Investigar pista escondida");

      if (!element.matches(
        "button, a, input, select, textarea, [tabindex]"
      )) {
        element.tabIndex = 0;
      }
    });
  }

  function collectClue(id) {
    const clue = clueData[id];

    if (!clue) return;

    if (hasClue(id)) {
      notify("Esta evidência já está no arquivo.");
      return;
    }

    state.clues.push(id);
    updateSidebar();
    renderInventory();
    saveProgress();

    notify(`EVIDÊNCIA REGISTRADA: ${clue.title}`);
  }

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-story-clue]");
    if (!target) return;

    collectClue(target.dataset.storyClue);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    const target = event.target.closest("[data-story-clue]");
    if (!target || target.matches("button, a")) return;

    event.preventDefault();
    collectClue(target.dataset.storyClue);
  });

  inventoryButton.addEventListener("click", () => {
    renderInventory();
    inventoryDialog.showModal();
  });

  closeInventory.addEventListener("click", () => {
    inventoryDialog.close();
  });

  inventoryDialog.addEventListener("click", (event) => {
    if (event.target === inventoryDialog) {
      inventoryDialog.close();
    }
  });

  function saveProgress() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      saveLabel.textContent = "PROGRESSO SALVO";
    } catch {
      saveLabel.textContent = "SESSÃO LOCAL";
    }
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;

      const saved = JSON.parse(raw);

      if (
        !saved ||
        !scenes[saved.scene] ||
        !Array.isArray(saved.clues) ||
        !Array.isArray(saved.choices) ||
        !saved.trust ||
        !saved.flags
      ) {
        return false;
      }

      const fresh = initialState();

      state = {
        ...fresh,
        ...saved,
        trust: { ...fresh.trust, ...saved.trust },
        flags: { ...fresh.flags, ...saved.flags },
        clues: saved.clues.filter((id) => id in clueData),
        choices: saved.choices
      };

      return true;
    } catch {
      return false;
    }
  }

  function restartStory() {
    state = initialState();

    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      // O jogo continua funcionando sem armazenamento local.
    }

    saveLabel.textContent = "NOVA INVESTIGAÇÃO";
    renderScene("letter");
    notify("Uma nova investigação começou.");
  }

  const beginBtn = $("#story-begin");
  if (beginBtn) {
    beginBtn.addEventListener("click", () => {
      if (loadProgress()) {
        renderScene(state.scene);
        renderInventory();
        notify("Seu progresso anterior foi recuperado.");
      } else {
        restartStory();
      }
    });
  }

  installClues();
  updateSidebar();
  renderInventory();
})();
// =========================================
// CONTROLE DO EASTER EGG DE ACESSO (P4INFORMATICA)
// =========================================
(() => {
  const navJulgamento = document.getElementById("nav-julgamento");
  const lockContainer = document.getElementById("julgamento-lock");
  const secaoJulgamento = document.getElementById("julgamento");
  const form = document.getElementById("julgamento-form");
  const input = document.getElementById("julgamento-input");
  const erroMsg = document.getElementById("julgamento-erro");

  if (!navJulgamento || !lockContainer || !secaoJulgamento || !form) return;

  // 1. Ao clicar em "Julgamento" no menu, exibe a caixa de senha
  navJulgamento.addEventListener("click", (e) => {
    // Se o jogo já estiver liberado, navega direto
    if (secaoJulgamento.classList.contains("revelado")) return;

    e.preventDefault();
    lockContainer.classList.add("ativo");
    lockContainer.scrollIntoView({ behavior: "smooth" });
    input.focus();
  });

  // 2. Valida a senha ao enviar o formulário
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Converte para minúsculas para aceitar p4informatica, P4INFORMATICA, P4Informatica, etc.
    const senhaDigitada = input.value.trim().toLowerCase();

    if (senhaDigitada === "p4informatica") {
      // Oculta a caixa de senha e revela o jogo
      lockContainer.classList.remove("ativo");
      secaoJulgamento.classList.add("revelado");
      secaoJulgamento.scrollIntoView({ behavior: "smooth" });

      if (typeof showToast === "function") {
        showToast("ACESSO CONCEDIDO: ARQUIVO 017 LIBERADO.");
      }
    } else {
      // Exibe mensagem de erro
      erroMsg.hidden = false;
      input.value = "";
      input.focus();
      
      setTimeout(() => {
        erroMsg.hidden = true;
      }, 3000);
    }
  });
})();