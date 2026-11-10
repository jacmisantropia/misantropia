/* ==========================================================================
   MISANTROPIA — JAC 2026
   Índice
   00. Utilitários
   01. Toast
   02. Menu mobile
   03. Overlay secreto
   04. Easter eggs
   05. Emissora (troca de canais)
   06. Jogo da Morte
   07. O Julgamento (motor narrativo + pistas)
   08. Acesso ao Arquivo 017 (senha)
   09. Minigame do Américo (Edição da Emissora)
   10. O Templo de Nadine (Interação do Altar)
   11. Minigame da Nadine (O Peso da Fé)
   ========================================================================== */
'use strict';

(() => {
  /* ------------------------------------------------------------------------
     00. UTILITÁRIOS
     ------------------------------------------------------------------------ */
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const pad = (value, size = 2) => String(value).padStart(size, '0');

  const storage = {
    get(key) {
      try { return localStorage.getItem(key); } catch { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); return true; } catch { return false; }
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch { /* sem armazenamento */ }
    }
  };

  function onMultiClick(element, count, callback, windowMs = 1800) {
    if (!element) return;
    let clicks = 0;
    let timer;

    element.addEventListener('click', () => {
      clicks++;
      clearTimeout(timer);

      if (clicks >= count) {
        clicks = 0;
        callback();
        return;
      }

      timer = setTimeout(() => { clicks = 0; }, windowMs);
    });
  }

  /* ------------------------------------------------------------------------
     01. TOAST
     ------------------------------------------------------------------------ */
  const toastElement = $('#toast');
  let toastTimer;

  function showToast(message, tone = 'alert', duration = 2600) {
    if (!toastElement) return;
    toastElement.textContent = message;
    toastElement.dataset.tone = tone;
    toastElement.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastElement.classList.remove('show'), duration);
  }

  /* ------------------------------------------------------------------------
     02. MENU MOBILE
     ------------------------------------------------------------------------ */
  function initMenu() {
    const toggle = $('.menu-toggle');
    const nav = $('#main-nav');
    if (!toggle || !nav) return;

    const setOpen = (open) => {
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      toggle.textContent = open ? '×' : '☰';
    };

    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
    $$('a', nav).forEach((link) => link.addEventListener('click', () => setOpen(false)));
  }

  /* ------------------------------------------------------------------------
     03. OVERLAY SECRETO
     ------------------------------------------------------------------------ */
  const secret = (() => {
    const overlay = $('#secretOverlay');
    const closeButton = $('#closeSecret');
    const openButton = $('#secretButton');
    let lastFocus = null;

    function open() {
      if (!overlay) return;
      lastFocus = document.activeElement;
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      closeButton?.focus();
    }

    function close() {
      if (!overlay || !overlay.classList.contains('open')) return;
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      lastFocus?.focus?.();
    }

    openButton?.addEventListener('click', open);
    closeButton?.addEventListener('click', close);
    overlay?.addEventListener('click', (event) => {
      if (event.target === overlay) close();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
    });

    return { open, close };
  })();

  /* ------------------------------------------------------------------------
     04. EASTER EGGS
     ------------------------------------------------------------------------ */
  function initEasterEggs() {
    onMultiClick($('.main-logo'), 5, () => {
      showToast('VOCÊ OLHOU DE PERTO DEMAIS.');
      secret.open();
    });

    $('#deathMark')?.addEventListener('click', () => {
      showToast('ELA ESTAVA AQUI O TEMPO TODO.');
    });

    let typed = '';
    document.addEventListener('keydown', (event) => {
      if (event.target.closest('input, textarea') || !/^[a-z]$/i.test(event.key)) return;

      typed = (typed + event.key.toLowerCase()).slice(-12);
      if (typed.endsWith('nadine')) {
        showToast('NADINE NÃO É A RESPOSTA.');
        typed = '';
      }
    });

    onMultiClick($('.redline'), 3, () => {
      showToast('A CULPA NUNCA FICA ONDE VOCÊ DEIXOU.');
    });
  }

  /* ------------------------------------------------------------------------
     05. EMISSORA — TROCA DE CANAIS (COM CANAL 05 CONTAGEM REGRESSIVA)
     ------------------------------------------------------------------------ */
  function initBroadcast() {
    const body = $('#tv-body');
    const channelLabel = $('#tv-channel');
    const kicker = $('#tv-kicker');
    const headline = $('#tv-headline');
    const text = $('#tv-text');
    const buttons = $$('.tv-channel-btn');

    if (!body || !channelLabel || !kicker || !headline || !text || !buttons.length) return;

    const targetDate = new Date(2026, 11, 3, 7, 30, 0).getTime();
    const dateFormatted = '03 DE DEZEMBRO DE 2026 ÀS 07:30H · AUDITORIO NILO PEÇANHA';

    const channels = [
      {
        kicker: 'PLANTÃO ESPECIAL',
        headline: 'A ESCOLHIDA ESTÁ CONOSCO.',
        text: 'Nadine é a esperança desta nação. Fique conosco: só esta emissora chega perto dela.'
      },
      {
        kicker: 'URGENTE',
        headline: 'REBELDES CRESCEM. A EMISSORA AVISA.',
        text: 'Grupos contrários a Nadine ganham força, mas o governo garante: tudo sob controle. ' +
          'Quem garante o governo? Não perguntamos.'
      },
      {
        kicker: 'ENTREVISTA EXCLUSIVA',
        headline: 'NADINE, AO VIVO COM JORGE JR.',
        text: 'Uma conversa franca com a garota que carrega nossa esperança. ' +
          'Perguntas selecionadas. Respostas esperadas.'
      },
      {
        kicker: 'SINAL INTERROMPIDO',
        headline: '[ERRO 0x004E4144]P_O_R_ O_N_D_E A_N_D_A N_A_D_I_N_E?',
        text: 'A s@lv@ç#0 f@lh0... N0 C#R3$ P0R_T_4_L_1_S_T_0... ' +
          '[ERRO DE LEITURA DO SETOR 404] [DADOS PERDIDOS] [CHECKSUM FALHOU]' + ' Mensagem Corrompida'
      },
      {
        isCountdown: true,
        kicker: 'TRANSMISSÃO ESPECIAL · CONTAGEM REGRESSIVA',
        headline: 'A HORA DO JULGAMENTO SE APROXIMA.',
        dateText: dateFormatted
      }
    ];

    let current = 0;
    let countdownInterval = null;

    function updateTVCountdown() {
      const dDays = $('#tv-cd-days');
      const dHours = $('#tv-cd-hours');
      const dMins = $('#tv-cd-mins');
      const dSecs = $('#tv-cd-secs');
      if (!dDays) return;

      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        dDays.textContent = '00';
        dHours.textContent = '00';
        dMins.textContent = '00';
        dSecs.textContent = '00';
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((distance % (1000 * 60)) / 1000);

      dDays.textContent = pad(days);
      dHours.textContent = pad(hours);
      dMins.textContent = pad(mins);
      dSecs.textContent = pad(secs);
    }

    function setChannel(index) {
      const data = channels[index];
      if (!data) return;

      current = index;
      clearInterval(countdownInterval);

      channelLabel.textContent = `CANAL ${pad(index + 1)}`;
      kicker.textContent = data.kicker;
      headline.textContent = data.headline;

      if (data.isCountdown) {
        body.innerHTML = `
          <p class="tv-kicker">${data.kicker}</p>
          <h3>${data.headline}</h3>
          <p style="color: var(--red); font-weight: bold; margin-bottom: 10px;">
            📍 DATA: ${data.dateText}
          </p>
          <div class="tv-countdown">
            <div class="tv-countdown-timer">
              <div><strong id="tv-cd-days">00</strong><span>DIAS</span></div>
              <span>:</span>
              <div><strong id="tv-cd-hours">00</strong><span>HORAS</span></div>
              <span>:</span>
              <div><strong id="tv-cd-mins">00</strong><span>MIN</span></div>
              <span>:</span>
              <div><strong id="tv-cd-secs">00</strong><span>SEG</span></div>
            </div>
          </div>
        `;
        updateTVCountdown();
        countdownInterval = setInterval(updateTVCountdown, 1000);
        showToast('TRANSMISSÃO AO VIVO DA CONTAGEM REGRESSIVA.');
      } else {
        body.innerHTML = `
          <p class="tv-kicker">${data.kicker}</p>
          <h3>${data.headline}</h3>
          <p>${data.text}</p>
        `;
      }

      buttons.forEach((button, i) => button.classList.toggle('active', i === index));

      body.classList.remove('switching');
      void body.offsetWidth;
      body.classList.add('switching');
    }

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const index = Number(button.dataset.channel);
        if (index !== current) setChannel(index);
      });
    });
  }

  /* ------------------------------------------------------------------------
     06. JOGO DA MORTE
     ------------------------------------------------------------------------ */
  function initDeathGame() {
    const root = $('#morte-game');
    if (!root) return;

    const startButton = $('#game-start', root);
    const restartButton = $('#game-restart', root);
    const target = $('#death-target', root);
    const arena = $('#game-arena', root);
    const intro = $('#game-intro', root);
    const result = $('#game-result', root);
    const message = $('#game-message', root);
    const timeDisplay = $('#game-time', root);
    const scoreDisplay = $('#game-score', root);
    const recordDisplay = $('#game-record', root);
    const resultTitle = $('#result-title', root);
    const resultDescription = $('#result-description', root);

    const RECORD_KEY = 'misantropia-morte-recorde';
    const DURATION = 20;
    const VISIBLE_MS = 850;
    const MISS_DELAY_MS = 450;
    const HIT_DELAY_MS = 300;

    let timeLeft = DURATION;
    let score = 0;
    let record = Number(storage.get(RECORD_KEY)) || 0;
    let active = false;
    let countdown = null;
    let appearance = null;
    let appearanceId = 0;

    const say = (text) => { message.textContent = text; };

    const render = {
      time: () => { timeDisplay.textContent = pad(timeLeft); },
      score: () => { scoreDisplay.textContent = pad(score); },
      record: () => { recordDisplay.textContent = pad(record); }
    };
    render.record();

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
      const topOffset = 35;
      const maxX = Math.max(padding, arena.clientWidth - padding);
      const maxY = Math.max(padding + topOffset, arena.clientHeight - padding - 20);

      target.style.left = `${padding + Math.random() * (maxX - padding)}px`;
      target.style.top = `${padding + topOffset + Math.random() * (maxY - padding - topOffset)}px`;
      target.hidden = false;
      say('ELA ESTÁ AQUI. NÃO PISQUE.');

      appearance = setTimeout(() => {
        if (!active || id !== appearanceId) return;
        target.hidden = true;
        say('VOCÊ DEMOROU.');
        appearance = setTimeout(showTarget, MISS_DELAY_MS);
      }, VISIBLE_MS);
    }

    function finishGame() {
      active = false;
      clearInterval(countdown);
      hideTarget();

      resultTitle.textContent =
        score >= 15 ? 'VOCÊ VIU DEMAIS.' :
          score >= 7 ? 'ELA AINDA ESTÁ AQUI.' :
            'ELA VIU VOCÊ.';

      resultDescription.textContent =
        `Você encontrou a Morte ${score} ${score === 1 ? 'vez' : 'vezes'}. ` +
        (score >= 15
          ? 'Ela mesma avisou: você sempre a encontra. Será que ela deixou você vencer?'
          : 'Talvez seja melhor não olhar para trás.');

      result.hidden = false;
      say('VIGÍLIA ENCERRADA.');
    }

    function startGame() {
      clearInterval(countdown);
      clearTimeout(appearance);

      timeLeft = DURATION;
      score = 0;
      active = true;

      render.time();
      render.score();
      result.hidden = true;
      intro.hidden = true;
      say('PROCURANDO SINAL...');

      showTarget();

      countdown = setInterval(() => {
        timeLeft--;
        render.time();
        if (timeLeft <= 0) finishGame();
      }, 1000);
    }

    target.addEventListener('click', () => {
      if (!active || target.hidden) return;

      score++;
      render.score();

      if (score > record) {
        record = score;
        render.record();
        storage.set(RECORD_KEY, String(record));
      }

      hideTarget();
      say('VOCÊ A ENCONTROU. POR ENQUANTO.');
      appearance = setTimeout(showTarget, HIT_DELAY_MS);
    });

    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);

    onMultiClick($('#death-easter-egg'), 3, () => {
      root.classList.add('is-active');
      root.scrollIntoView({ behavior: 'smooth' });
      if (!active) say('VOCÊ ENCONTROU O QUE ESTAVA ESCONDIDO.');
    });
  }

  /* ------------------------------------------------------------------------
     07. O JULGAMENTO
     ------------------------------------------------------------------------ */
  function initJudgment() {
    const content = $('#story-content');
    const sceneLabel = $('#story-scene-label');
    const saveLabel = $('#story-save-label');
    const chapterLabel = $('#story-chapter');
    const footerCode = $('#story-footer-code');
    const clueLabel = $('#story-clues');
    const progressBar = $('#story-progress');
    const inventoryButton = $('#story-inventory');
    const inventoryDialog = $('#story-evidence-dialog');
    const inventoryList = $('#story-evidence-list');
    const inventoryEmpty = $('#story-inventory-empty');
    const closeInventory = $('#story-close-inventory');
    const beginButton = $('#story-begin');

    if (![content, sceneLabel, saveLabel, chapterLabel, footerCode, clueLabel, progressBar,
      inventoryButton, inventoryDialog, inventoryList, inventoryEmpty, closeInventory].every(Boolean)) {
      return;
    }

    const SAVE_KEY = 'misantropia-julgamento-v2';
    const notify = (message) => showToast(message, 'story', 3000);

    const clueData = {
      seal: {
        title: 'O selo rompido',
        description: 'O envelope foi aberto antes de chegar às suas mãos. Alguém teve acesso à carta.'
      },
      margin: {
        title: 'A anotação na margem',
        description: 'Uma nota sugere que o que foi dito diante das câmeras não corresponde ' +
          'ao que foi combinado nos bastidores.'
      },
      witness: {
        title: 'A última declaração',
        description: 'A declaração final contém um detalhe que só quem estava presente poderia conhecer.'
      },
      mark: {
        title: 'A marca escondida',
        description: 'Uma marca quase invisível indica que alguém tentou direcionar sua investigação.'
      }
    };
    const CLUE_TOTAL = Object.keys(clueData).length;

    const initialState = () => ({
      scene: 'letter',
      chapter: 0,
      clues: [],
      choices: [],
      trust: { vergueiro: 0, jorge: 0, pastor: 0 },
      flags: {
        acceptedLetter: false,
        readEvidence: false,
        protectedWitness: false,
        exposedEvidence: false,
        destroyedLetter: false
      },
      ending: null
    });

    let state = initialState();

    const scenes = {
      letter: {
        chapter: 1,
        label: 'ATO I / A CARTA',
        kicker: 'DOCUMENTO RECEBIDO ÀS 23:17',
        title: 'Alguém quer que você julgue.',
        text: [
          'O envelope não tem remetente. Dentro, há uma carta e a transcrição incompleta ' +
          'de uma entrevista que nunca deveria ter ido ao ar.',
          'No final da página, uma frase foi escrita à mão: ' +
          '“Não procure quem mentiu. Procure quem precisava da mentira.”'
        ],
        choices: [
          {
            id: 'accept',
            label: 'Abrir o arquivo e investigar.',
            detail: 'Você aceita conhecer as versões.',
            next: 'depositions',
            effects: { acceptedLetter: true }
          },
          {
            id: 'destroy',
            label: 'Destruir a carta e recusar o julgamento.',
            detail: 'Talvez ignorar também seja uma escolha.',
            next: 'destroyed',
            effects: { destroyedLetter: true }
          },
          {
            id: 'inspect',
            label: 'Examinar o envelope antes de abri-lo.',
            detail: 'O menor detalhe pode mudar tudo.',
            next: 'envelope',
            effects: { acceptedLetter: true },
            requires: { clue: 'seal' },
            lockedText: 'Encontre primeiro a pista do selo no site.'
          }
        ]
      },

      destroyed: {
        chapter: 1,
        label: 'ATO I / RECUSA',
        kicker: 'REGISTRO INTERROMPIDO',
        title: 'Você não abriu o arquivo.',
        text: [
          'A carta desaparece da sua mesa. Você decide que não é responsável ' +
          'por resolver os problemas dos outros.',
          'Mas, antes de sair, percebe uma anotação no verso: “A omissão também será registrada.”'
        ],
        choices: [
          { id: 'return', label: 'Voltar atrás e investigar.', next: 'depositions', effects: { acceptedLetter: true } },
          { id: 'leave', label: 'Encerrar a investigação.', next: 'endingSilence' }
        ]
      },

      envelope: {
        chapter: 1,
        label: 'ATO I / VESTÍGIOS',
        kicker: 'ANÁLISE DO DOCUMENTO',
        title: 'O envelope já foi aberto.',
        text: [
          'O selo está rompido por dentro. Isso significa que a carta foi aberta e fechada ' +
          'novamente antes de chegar até você.',
          'No canto, alguém escreveu apenas a inicial A. Você não sabe se ela identifica ' +
          'uma testemunha ou quem preparou a armadilha.'
        ],
        choices: [
          { id: 'follow', label: 'Seguir para os depoimentos.', next: 'depositions', effects: { readEvidence: true } }
        ]
      },

      depositions: {
        chapter: 1,
        label: 'ATO I / DEPOIMENTOS',
        kicker: 'TRÊS VERSÕES REGISTRADAS',
        title: 'Ninguém conta a mesma história.',
        text: [
          'Vergueiro garante que foi só um dia ruim. Jorge Jr. jura que apenas fez as perguntas ' +
          'que lhe entregaram. O Pastor afirma que o povo despertou sozinho.',
          'Você precisa decidir quem ouvir primeiro. O julgamento ainda não começou, ' +
          'mas as alianças já estão sendo formadas.'
        ],
        choices: [
          {
            id: 'talkVergueiro',
            label: 'Ouvir Vergueiro.',
            detail: 'O presidente que não gosta de desagradar.',
            next: 'vergueiro',
            effects: { trust: { vergueiro: 1 } }
          },
          {
            id: 'talkJorge',
            label: 'Ouvir Jorge Jr.',
            detail: 'O repórter que só queria uma matéria.',
            next: 'jorge',
            effects: { trust: { jorge: 1 } }
          },
          {
            id: 'talkPastor',
            label: 'Ouvir o Pastor.',
            detail: 'A voz que o povo seguiu.',
            next: 'pastor',
            effects: { trust: { pastor: 1 } }
          }
        ]
      },

      vergueiro: {
        chapter: 2,
        label: 'ATO II / VERGUEIRO',
        kicker: 'DEPOIMENTO Nº 01',
        title: 'O poder tem dono.',
        text: [
          'Vergueiro afirma que tudo não passou de um episódio isolado. Diz que o problema ' +
          'não é uma pessoa, mas um povo que prefere uma versão confortável à realidade.',
          'Quando você pergunta sobre a carta, ele olha para o envelope e diz: ' +
          '“Eu reconheço a letra. Não reconheço a ordem.”'
        ],
        choices: [
          {
            id: 'believeVergueiro',
            label: 'Acreditar que ele só tentou manter a calma.',
            next: 'jorge',
            effects: { trust: { vergueiro: 2 } }
          },
          {
            id: 'challengeVergueiro',
            label: 'Questionar por que ele reconhece a letra.',
            next: 'contradiction',
            effects: { trust: { vergueiro: -1 } }
          },
          {
            id: 'protectVergueiro',
            label: 'Não revelar que ele reconheceu a letra.',
            next: 'jorge',
            effects: { protectedWitness: true }
          }
        ]
      },

      jorge: {
        chapter: 2,
        label: 'ATO II / JORGE JR.',
        kicker: 'DEPOIMENTO Nº 02',
        title: 'Toda pergunta tem um dono.',
        text: [
          'Jorge Jr. admite que a última pergunta da entrevista não foi ideia dele. ' +
          'Diz que só queria uma chance de mudar de vida e pergunta por que agora ' +
          'todos querem saber quem começou.',
          'Ele oferece uma informação em troca de uma promessa: você não vai usar o nome ' +
          'dele para encerrar o caso rapidamente.'
        ],
        choices: [
          {
            id: 'promise',
            label: 'Prometer proteger o repórter.',
            next: 'pastor',
            effects: { trust: { jorge: 2 }, protectedWitness: true }
          },
          {
            id: 'refusePromise',
            label: 'Recusar promessas antes de conhecer as provas.',
            next: 'pastor',
            effects: { trust: { jorge: -1 } }
          },
          {
            id: 'confront',
            label: 'Confrontá-lo com a anotação encontrada.',
            next: 'contradiction',
            requires: { clue: 'margin' },
            lockedText: 'Encontre a anotação escondida na página.'
          }
        ]
      },

      pastor: {
        chapter: 2,
        label: 'ATO II / O PASTOR',
        kicker: 'DEPOIMENTO Nº 03',
        title: 'O povo precisava de um culpado.',
        text: [
          'O Pastor afirma que um povo sem esperança precisa de uma conclusão. ' +
          'Segundo ele, prolongar a dúvida só aumenta a dor.',
          'Quando você pergunta quem se beneficia com a queda de Nadine, ele responde ' +
          'que ninguém. A resposta vem depressa demais.'
        ],
        choices: [
          {
            id: 'acceptPastor',
            label: 'Aceitar a explicação e avançar.',
            next: 'contradiction',
            effects: { trust: { pastor: 1 } }
          },
          {
            id: 'suspectPastor',
            label: 'Perguntar por que ele tem tanta pressa.',
            next: 'contradiction',
            effects: { trust: { pastor: -1 } }
          },
          {
            id: 'showEvidence',
            label: 'Mostrar a evidência da carta.',
            next: 'contradiction',
            requires: { clue: 'seal' },
            effects: { exposedEvidence: true },
            lockedText: 'Você precisa descobrir a pista do selo primeiro.'
          }
        ]
      },

      contradiction: {
        chapter: 2,
        label: 'ATO II / CONTRADIÇÃO',
        kicker: 'NOVO ELEMENTO NO PROCESSO',
        title: 'A cronologia não faz sentido.',
        text: [
          'Os depoimentos indicam horários diferentes. Uma testemunha diz que a notícia sobre ' +
          'Nadine já circulava antes de a entrevista terminar. Outra afirma que a pergunta ' +
          'fatal estava escrita antes de ser feita.',
          'Você pode reunir as provas disponíveis, proteger quem falou ' +
          'ou levar a contradição diretamente ao julgamento.'
        ],
        choices: [
          {
            id: 'gather',
            label: 'Registrar a contradição no processo.',
            next: 'evidenceReview',
            effects: { readEvidence: true }
          },
          {
            id: 'protect',
            label: 'Proteger a testemunha e guardar o detalhe.',
            next: 'evidenceReview',
            effects: { protectedWitness: true }
          },
          {
            id: 'accuse',
            label: 'Acusar alguém imediatamente.',
            next: 'trial',
            effects: { exposedEvidence: true, trust: { pastor: -1 } }
          }
        ]
      },

      evidenceReview: {
        chapter: 2,
        label: 'ATO II / REVISÃO',
        kicker: 'AS PROVAS NÃO SE EXPLICAM SOZINHAS',
        title: 'Você tem uma escolha a fazer.',
        text: [
          'A carta, a anotação e os depoimentos apontam para mais de uma interpretação. ' +
          'Nenhuma evidência, sozinha, identifica quem decidiu alterar a história.',
          'Uma marca escondida no material da peça pode ajudar. ' +
          'Você também pode prosseguir sem encontrar todas as pistas.'
        ],
        choices: [
          {
            id: 'allClues',
            label: 'Cruzar todas as pistas reunidas.',
            detail: 'Você tem todas as peças. Falta decidir o que fazer com elas.',
            next: 'trial',
            requires: { allClues: true },
            effects: { readEvidence: true },
            lockedText: 'Ainda faltam pistas escondidas no site.'
          },
          { id: 'goToTrial', label: 'Levar o caso ao julgamento.', next: 'trial' }
        ]
      },

      trial: {
        chapter: 3,
        label: 'ATO III / JULGAMENTO',
        kicker: 'DECISÃO IRREVERSÍVEL',
        title: 'O que você fará com a verdade?',
        text: [
          'O salão está cheio. Cada pessoa espera que você confirme uma versão diferente. ' +
          'Você sabe que revelar uma prova pode expor uma testemunha. Escondê-la pode proteger ' +
          'alguém, mas também preservar uma mentira.',
          'O julgamento não pergunta apenas quem mentiu. Pergunta o que você está disposto ' +
          'a fazer com aquilo que descobriu.'
        ],
        choices: [
          {
            id: 'reveal',
            label: 'Revelar todas as evidências ao público.',
            detail: 'A verdade acima das consequências.',
            next: 'endingTruth',
            effects: { exposedEvidence: true }
          },
          {
            id: 'protectWitness',
            label: 'Proteger a testemunha e manter parte do arquivo fechado.',
            detail: 'Nem toda verdade precisa ser pública.',
            next: 'endingMercy',
            effects: { protectedWitness: true }
          },
          {
            id: 'closeCase',
            label: 'Encerrar o caso sem apontar um culpado.',
            detail: 'Você se recusa a transformar suspeitas em sentença.',
            next: 'endingSilence'
          },
          {
            id: 'accuseAmerico',
            label: 'Acusar Américo com base nas contradições.',
            detail: 'Esta opção exige evidências suficientes.',
            next: 'endingAccusation',
            requires: { clueCount: 2, flag: 'readEvidence' },
            lockedText: 'Você precisa de pelo menos duas pistas e de registrar ' +
              'as contradições antes de sustentar essa acusação.'
          }
        ]
      },

      endingTruth: {
        chapter: 3,
        label: 'DESFECHO / A VERDADE',
        kicker: 'ARQUIVO CONCLUÍDO',
        title: 'A verdade não absolve ninguém.',
        ending: true,
        text: [
          'As provas são reveladas. Os depoimentos são confrontados e o julgamento deixa ' +
          'de ter uma resposta simples.',
          'Você descobriu que a mentira não pertencia a uma única pessoa. ' +
          'Ela foi mantida por todos que tinham algo a perder.',
          'Você expôs o caso. Agora precisa conviver com as consequências.'
        ]
      },

      endingMercy: {
        chapter: 3,
        label: 'DESFECHO / A COMPAIXÃO',
        kicker: 'ARQUIVO CONCLUÍDO',
        title: 'Você escolheu quem não seria exposto.',
        ending: true,
        text: [
          'A testemunha permanece protegida. Parte do processo não chega ao público, ' +
          'e algumas perguntas continuam sem resposta.',
          'Você impediu que alguém fosse condenado por uma informação incompleta. ' +
          'Mas também aceitou que a história oficial continuasse incompleta.'
        ]
      },

      endingSilence: {
        chapter: 3,
        label: 'DESFECHO / O SILÊNCIO',
        kicker: 'ARQUIVO CONCLUÍDO',
        title: 'O processo foi encerrado.',
        ending: true,
        text: [
          'Você se recusa a transformar suspeitas em sentença. O arquivo é fechado, ' +
          'e cada testemunha retorna à própria vida.',
          'O silêncio evita uma condenação precipitada. Também deixa intacta ' +
          'a estrutura que tornou a mentira possível.'
        ]
      },

      endingAccusation: {
        chapter: 3,
        label: 'DESFECHO / A ACUSAÇÃO',
        kicker: 'ARQUIVO CONCLUÍDO',
        title: 'Você apontou um culpado.',
        ending: true,
        text: [
          'A acusação muda o rumo do julgamento. As contradições são suficientes para levantar ' +
          'suspeitas, mas não provam que uma única pessoa controlou todos os acontecimentos.',
          'Você conseguiu uma resposta para o público. Não necessariamente a resposta que o caso ' +
          'merecia. Talvez seja assim que toda sentença começa.'
        ]
      }
    };

    const endingLabels = {
      endingTruth: 'DESFECHO I — EXPOSIÇÃO',
      endingMercy: 'DESFECHO II — PROTEÇÃO',
      endingSilence: 'DESFECHO III — SILÊNCIO',
      endingAccusation: 'DESFECHO IV — ACUSAÇÃO'
    };

    const perspectiveNotes = {
      vergueiro: ' Você deu mais peso à versão de Vergueiro.',
      jorge: ' Você deu mais peso à perspectiva de Jorge Jr.',
      pastor: ' Você considerou a versão do Pastor.'
    };

    const hasClue = (id) => state.clues.includes(id);
    const hasAllClues = () => Object.keys(clueData).every(hasClue);

    function meetsRequirements({ clue, allClues, clueCount, flag } = {}) {
      if (clue && !hasClue(clue)) return false;
      if (allClues && !hasAllClues()) return false;
      if (clueCount && state.clues.length < clueCount) return false;
      if (flag && !state.flags[flag]) return false;
      return true;
    }

    function applyEffects(effects = {}) {
      Object.entries(effects).forEach(([key, value]) => {
        if (key === 'trust') {
          Object.entries(value).forEach(([person, amount]) => {
            if (person in state.trust) state.trust[person] += amount;
          });
        } else if (key in state.flags) {
          state.flags[key] = value;
        }
      });
    }

    function getEndingAnalysis() {
      const clueCount = state.clues.length;
      let analysis;

      if (clueCount === CLUE_TOTAL) {
        analysis = 'Você encontrou todas as pistas. Sua versão dos fatos considerou detalhes ' +
          'que as testemunhas tentaram deixar de fora.';
      } else if (clueCount >= 2) {
        analysis = 'Você reuniu evidências importantes, mas algumas partes da história ' +
          'permaneceram fora do seu alcance.';
      } else {
        analysis = 'Você tomou decisões com informações limitadas. O resultado mostra ' +
          'o risco de julgar antes de conhecer o processo.';
      }

      const [[topName, topValue], [, secondValue]] =
        Object.entries(state.trust).sort((a, b) => b[1] - a[1]);
      if (topValue > 0 && topValue > secondValue) analysis += perspectiveNotes[topName];

      if (state.flags.protectedWitness) analysis += ' Uma testemunha foi protegida pelas suas decisões.';
      if (state.flags.exposedEvidence) analysis += ' Você decidiu expor parte das evidências.';

      return analysis;
    }

    function saveProgress() {
      const saved = storage.set(SAVE_KEY, JSON.stringify(state));
      if (!state.ending) saveLabel.textContent = saved ? 'PROGRESSO SALVO' : 'SESSÃO LOCAL';
    }

    function loadProgress() {
      const raw = storage.get(SAVE_KEY);
      if (!raw) return false;

      try {
        const saved = JSON.parse(raw);
        if (!saved || !scenes[saved.scene] || !Array.isArray(saved.clues) ||
          !Array.isArray(saved.choices) || !saved.trust || !saved.flags) {
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

    function updateSidebar() {
      clueLabel.textContent = `${pad(state.clues.length)} / ${pad(CLUE_TOTAL)}`;
      progressBar.style.width = `${(state.clues.length / CLUE_TOTAL) * 100}%`;
      chapterLabel.textContent = pad(scenes[state.scene]?.chapter ?? state.chapter);
      footerCode.textContent = `REGISTRO ${pad(state.choices.length, 3)}`;
    }

    function renderInventory() {
      inventoryList.replaceChildren();

      const discovered = state.clues.map((id) => clueData[id]).filter(Boolean);
      inventoryEmpty.hidden = discovered.length > 0;

      discovered.forEach((clue) => {
        const item = document.createElement('li');
        const title = document.createElement('strong');
        const description = document.createElement('p');

        title.textContent = clue.title;
        description.textContent = clue.description;

        item.append(title, description);
        inventoryList.appendChild(item);
      });
    }

    function buildChoice(sceneId, choice, index) {
      const available = meetsRequirements(choice.requires);
      const button = document.createElement('button');
      const number = document.createElement('span');
      const label = document.createElement('span');

      button.type = 'button';
      button.className = 'story-choice';
      button.disabled = !available;

      number.className = 'choice-number';
      number.textContent = `${pad(index + 1)}.`;
      label.textContent = choice.label;
      button.append(number, label);

      const hint = available ? choice.detail : (choice.lockedText || 'Evidências insuficientes.');
      if (hint) {
        const small = document.createElement('small');
        small.textContent = hint;
        button.appendChild(small);
      }

      button.addEventListener('click', () => selectChoice(sceneId, choice));
      return button;
    }

    function renderEnding(scene) {
      state.ending = state.scene;

      const box = document.createElement('div');
      const title = document.createElement('strong');
      const analysis = document.createElement('p');
      const restart = document.createElement('button');
      const summary = document.createElement('p');

      box.className = 'story-ending';
      title.textContent = endingLabels[state.scene] || scene.label;
      analysis.textContent = getEndingAnalysis();
      box.append(title, analysis);

      restart.type = 'button';
      restart.className = 'btn story-restart';
      restart.textContent = 'RECOMEÇAR A HISTÓRIA ↻';
      restart.addEventListener('click', restartStory);

      summary.className = 'story-kicker';
      summary.textContent = `PISTAS: ${state.clues.length}/${CLUE_TOTAL} · DECISÕES: ${state.choices.length}`;

      content.append(box, restart, summary);

      saveLabel.textContent = 'CASO CONCLUÍDO';
      notify('O julgamento terminou. Seu desfecho foi registrado.');
    }

    function renderScene(sceneId) {
      const scene = scenes[sceneId];
      if (!scene) {
        notify('Não foi possível carregar esta cena.');
        return;
      }

      state.scene = sceneId;
      state.chapter = scene.chapter;
      sceneLabel.textContent = scene.label;
      content.replaceChildren();

      const kicker = document.createElement('p');
      const title = document.createElement('h3');
      kicker.className = 'story-kicker';
      kicker.textContent = scene.kicker;
      title.textContent = scene.title;
      content.append(kicker, title);

      scene.text.forEach((paragraph) => {
        const element = document.createElement('p');
        element.textContent = paragraph;
        content.appendChild(element);
      });

      if (scene.ending) {
        renderEnding(scene);
      } else {
        const choices = document.createElement('div');
        choices.className = 'story-choices';
        scene.choices.forEach((choice, index) => choices.appendChild(buildChoice(sceneId, choice, index)));
        content.appendChild(choices);

        if (state.clues.length > 0) {
          const note = document.createElement('div');
          note.className = 'story-note';
          note.textContent = `Você reuniu ${state.clues.length} de ${CLUE_TOTAL} pistas. ` +
            'Consulte o arquivo para revisar as evidências.';
          content.appendChild(note);
        }
      }

      updateSidebar();
      saveProgress();
    }

    function selectChoice(sceneId, choice) {
      if (!meetsRequirements(choice.requires)) {
        notify(choice.lockedText || 'Ainda faltam evidências.');
        return;
      }

      state.choices.push({ scene: sceneId, choice: choice.id });
      applyEffects(choice.effects);
      renderScene(choice.next);
    }

    function restartStory() {
      state = initialState();
      storage.remove(SAVE_KEY);
      saveLabel.textContent = 'NOVA INVESTIGAÇÃO';
      renderScene('letter');
      notify('Uma nova investigação começou.');
    }

    function collectClue(id) {
      const clue = clueData[id];
      if (!clue) return;

      if (hasClue(id)) {
        notify('Esta evidência já está no arquivo.');
        return;
      }

      state.clues.push(id);
      updateSidebar();
      renderInventory();
      saveProgress();
      notify(`EVIDÊNCIA REGISTRADA: ${clue.title}`);
    }

    $$('[data-clue]').forEach((element) => {
      if (!element.title) element.title = 'Há algo escondido neste elemento.';

      if (!element.matches('button, a, input, select, textarea, [tabindex]')) {
        element.tabIndex = 0;
        element.setAttribute('role', 'button');
      }
    });

    document.addEventListener('click', (event) => {
      const element = event.target.closest('[data-clue]');
      if (element) collectClue(element.dataset.clue);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;

      const element = event.target.closest('[data-clue]');
      if (!element || element.matches('button, a')) return;

      event.preventDefault();
      collectClue(element.dataset.clue);
    });

    inventoryButton.addEventListener('click', () => {
      renderInventory();
      inventoryDialog.showModal();
    });
    closeInventory.addEventListener('click', () => inventoryDialog.close());
    inventoryDialog.addEventListener('click', (event) => {
      if (event.target === inventoryDialog) inventoryDialog.close();
    });

    beginButton?.addEventListener('click', () => {
      if (loadProgress()) {
        renderScene(state.scene);
        renderInventory();
        notify('Seu progresso anterior foi recuperado.');
      } else {
        restartStory();
      }
    });

    updateSidebar();
    renderInventory();
  }

  /* ------------------------------------------------------------------------
     08. ACESSO AO ARQUIVO 017 (SENHA)
     ------------------------------------------------------------------------ */
  function initAccessLock() {
    const navLink = $('#nav-julgamento');
    const lock = $('#julgamento-lock');
    const section = $('#julgamento');
    const form = $('#julgamento-form');
    const input = $('#julgamento-input');
    const error = $('#julgamento-erro');

    if (!navLink || !lock || !section || !form || !input || !error) return;

    const ACCESS_KEY = 'p4informatica';
    let errorTimer;

    navLink.addEventListener('click', (event) => {
      if (section.classList.contains('is-unlocked')) return;

      event.preventDefault();
      lock.classList.add('is-open');
      lock.scrollIntoView({ behavior: 'smooth' });
      input.focus({ preventScroll: true });
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      if (input.value.trim().toLowerCase() === ACCESS_KEY) {
        lock.classList.remove('is-open');
        section.classList.add('is-unlocked');
        section.scrollIntoView({ behavior: 'smooth' });
        showToast('ACESSO CONCEDIDO: ARQUIVO 017 LIBERADO.');
        return;
      }

      error.hidden = false;
      input.value = '';
      input.focus();

      clearTimeout(errorTimer);
      errorTimer = setTimeout(() => { error.hidden = true; }, 3000);
    });
  }

  /* ------------------------------------------------------------------------
     09. MINIGAME DO AMÉRICO (REVISADO E CORRIGIDO)
     ------------------------------------------------------------------------ */
  function initAmericoGame() {
    const root = $('#americo-game');
    if (!root) return;

    const startBtn = $('#americo-start', root);
    const restartBtn = $('#americo-restart', root);
    const intro = $('#americo-intro', root);
    const arena = $('#americo-arena', root);
    const result = $('#americo-result', root);
    const headlineText = $('#americo-headline-text', root);
    const headlineKicker = $('#americo-headline-kicker', root);
    const timerLabel = $('#americo-timer-label', root);
    const msg = $('#americo-message', root);
    const btnCensor = $('#btn-censor', root);
    const btnBroadcast = $('#btn-broadcast', root);
    const resultTitle = $('#americo-result-title', root);
    const resultDesc = $('#americo-result-desc', root);

    const headlines = [
      { kicker: 'URGENTE', text: 'Protestos pacíficos começam na praça central.', safe: false },
      { kicker: 'EXCLUSIVO', text: 'Nadine traz uma mensagem de paz ao vivo.', safe: true },
      { kicker: 'ECONOMIA', text: 'Estoques de alimentos chegam ao fim na capital.', safe: false },
      { kicker: 'BOATOS', text: 'Dizem que o governo abandonou os setores baixos.', safe: false },
      { kicker: 'HOMENAGEM', text: 'A nação agradece a generosidade de Américo.', safe: true },
      { kicker: 'PLANTÃO', text: 'Sinal misterioso interfere nas transmissões da Íris.', safe: false },
      { kicker: 'SEGURANÇA', text: 'Toque de recolher decretado para manter a ordem.', safe: true }
    ];

    let currentIdx = 0;
    let score = 0;
    let timeLeft = 15;
    let timer = null;
    let playing = false;

    function nextHeadline() {
      if (currentIdx >= headlines.length) {
        endGame(true);
        return;
      }
      const item = headlines[currentIdx];
      if (headlineKicker) headlineKicker.textContent = `${item.kicker} (${currentIdx + 1}/${headlines.length})`;
      if (headlineText) headlineText.textContent = item.text;
    }

    function handleChoice(userChoiceSafe) {
      if (!playing) return;
      const item = headlines[currentIdx];

      if (userChoiceSafe === item.safe) {
        score += 10;
        if (msg) msg.textContent = 'EXCELENTE. A OPINIÃO PÚBLICA ESTÁ A SALVO.';
      } else {
        score -= 5;
        if (msg) msg.textContent = 'ERRO GRAVE. O POVO ESTÁ COMENTANDO DEMAIS!';
      }

      currentIdx++;
      nextHeadline();
    }

    function endGame(completed) {
      playing = false;
      clearInterval(timer);
      
      if (arena) {
        arena.hidden = true;
        arena.style.display = 'none';
      }
      if (result) {
        result.hidden = false;
        result.style.display = 'block';
      }

      const reactionBox = $('#americo-reaction', root);
      const videoEl = $('#americo-gif', root);

      if (score >= 30) {
        if (resultTitle) resultTitle.textContent = 'AMÉRICO ESTÁ ORGULHOSO.';
        
        // Exibe e reproduz o vídeo/GIF do Américo
        if (reactionBox && videoEl) {
          videoEl.src = 'gif-americo.mp4';
          reactionBox.hidden = false;
          videoEl.play().catch(() => {});
        }
      } else {
        if (resultTitle) resultTitle.textContent = 'O CONTROLE FOI PERDIDO.';
        
        // Oculta a reação se não atingir a pontuação
        if (reactionBox) {
          reactionBox.hidden = true;
          if (videoEl) videoEl.pause();
        }
      }

      if (resultDesc) {
        resultDesc.textContent = `Você pontuou ${score} pontos gerenciando a emissora. ` +
          (score >= 30 ? 'Você sabe como manipular o que o povo vê.' : 'A verdade escapou pelas suas mãos.');
      }
    }

    function startGame() {
      currentIdx = 0;
      score = 0;
      timeLeft = 15;
      playing = true;

      const reactionBox = $('#americo-reaction', root);
      const videoEl = $('#americo-gif', root);
      if (reactionBox) reactionBox.hidden = true;
      if (videoEl) {
        videoEl.pause();
        videoEl.currentTime = 0;
      }

      if (intro) intro.hidden = true;
      if (result) {
        result.hidden = true;
        result.style.display = 'none';
      }
      if (arena) {
        arena.hidden = false;
        arena.style.display = 'flex';
      }

      nextHeadline();

      clearInterval(timer);
      timer = setInterval(() => {
        timeLeft--;
        if (timerLabel) timerLabel.textContent = `TEMPO: ${timeLeft}s`;
        if (timeLeft <= 0) {
          endGame(false);
        }
      }, 1000);
    }

    btnCensor?.addEventListener('click', (e) => {
      e.preventDefault();
      handleChoice(false);
    });
    
    btnBroadcast?.addEventListener('click', (e) => {
      e.preventDefault();
      handleChoice(true);
    });

    startBtn?.addEventListener('click', startGame);
    restartBtn?.addEventListener('click', startGame);

    onMultiClick($('#broadcast-title'), 4, () => {
      root.classList.add('is-active');
      root.scrollIntoView({ behavior: 'smooth' });
      showToast('SALA DE CONTROLE SECRETA DESBLOQUEADA.');
    });
  }

  /* ------------------------------------------------------------------------
     10. O TEMPLO DE NADINE
     ------------------------------------------------------------------------ */
  function initNadineTemple() {
    const btn = $('#nadine-blessing-btn');
    const msg = $('#nadine-blessing-msg');
    if (!btn || !msg) return;

    const phrases = [
      '“Ninguém sobrevive sozinho quando todos decidem que você é a resposta.”',
      '“A transmissão foi cortada. Restou apenas o eco da sua voz.”',
      '“Eles acreditam porque é mais fácil do que carregar o próprio medo.”',
      '“A salvação não tem rosto. Tem preço.”'
    ];

    btn.addEventListener('click', () => {
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      msg.textContent = randomPhrase;
      showToast('UMA VERDADE FOI REVELADA NO ALTAR.');
    });
  }

  /* ------------------------------------------------------------------------
     11. MINIGAME DA NADINE (O PESO DA FÉ)
     ------------------------------------------------------------------------ */
  function initNadineGame() {
    const trigger = $('#nadine-game-trigger');
    const modal = $('#nadine-game-modal');
    const closeBtn = $('#nadine-game-close');
    const startBtn = $('#nadine-game-start');
    const restartBtn = $('#nadine-game-restart');
    const intro = $('#nadine-game-intro');
    const arena = $('#nadine-game-arena');
    const resultBox = $('#nadine-game-result');
    const player = $('#nadine-player');
    const mentalFill = $('#nadine-mental-fill');
    const resultTitle = $('#nadine-result-title');
    const resultDesc = $('#nadine-result-desc');
    const btnLeft = $('#nadine-btn-left');
    const btnRight = $('#nadine-btn-right');

    if (!trigger || !modal) return;

    let gameActive = false;
    let mentalEnergy = 100;
    let playerX = 50;
    let gameTimer = null;
    let spawnTimer = null;
    let difficultyTimer = null;
    let secondsElapsed = 0;
    let spawnIntervalMs = 900;
    let fallSpeed = 2;
    let activeWords = [];
    let keysPressed = {};

    const badWords = ['Crítica', 'Culpa', 'Peso', 'Medo', 'Dúvida', 'Censura', 'Julgamento', 'Exigência'];
    const goodWords = ['Esperança', 'Luz', 'Paz', 'Verdade', 'Fé', 'Alívio'];

    onMultiClick(trigger, 4, () => {
      modal.hidden = false;
      showToast('SANTUÁRIO MENTAL DE NADINE ACESSADO.');
    });

    closeBtn?.addEventListener('click', () => {
      modal.hidden = true;
      stopGame();
    });

    startBtn?.addEventListener('click', startGame);
    restartBtn?.addEventListener('click', startGame);

    window.addEventListener('keydown', (e) => {
      if (!gameActive) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') keysPressed['left'] = true;
      if (e.key === 'ArrowRight' || e.key === 'd') keysPressed['right'] = true;
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keysPressed['left'] = false;
      if (e.key === 'ArrowRight' || e.key === 'd') keysPressed['right'] = false;
    });

    let touchInterval = null;
    const moveTouch = (dir) => {
      if (!gameActive) return;
      if (dir === 'left') playerX = Math.max(5, playerX - 4);
      if (dir === 'right') playerX = Math.min(95, playerX + 4);
      player.style.left = `${playerX}%`;
    };

    if (btnLeft && btnRight) {
      btnLeft.addEventListener('mousedown', () => { touchInterval = setInterval(() => moveTouch('left'), 50); });
      btnLeft.addEventListener('mouseup', () => clearInterval(touchInterval));
      btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); touchInterval = setInterval(() => moveTouch('left'), 50); });
      btnLeft.addEventListener('touchend', () => clearInterval(touchInterval));

      btnRight.addEventListener('mousedown', () => { touchInterval = setInterval(() => moveTouch('right'), 50); });
      btnRight.addEventListener('mouseup', () => clearInterval(touchInterval));
      btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); touchInterval = setInterval(() => moveTouch('right'), 50); });
      btnRight.addEventListener('touchend', () => clearInterval(touchInterval));
    }

    function startGame() {
      intro.hidden = true;
      resultBox.hidden = true;
      arena.hidden = false;
      gameActive = true;
      mentalEnergy = 100;
      playerX = 50;
      secondsElapsed = 0;
      spawnIntervalMs = 900;
      fallSpeed = 2;
      activeWords.forEach(w => w.element.remove());
      activeWords = [];

      updateMentalBar();

      gameTimer = setInterval(updateGameLoop, 20);
      spawnTimer = setInterval(spawnWord, spawnIntervalMs);

      difficultyTimer = setInterval(() => {
        secondsElapsed += 5;
        if (spawnIntervalMs > 300) spawnIntervalMs -= 100;
        fallSpeed += 0.4;
      }, 5000);
    }

    function stopGame() {
      gameActive = false;
      clearInterval(gameTimer);
      clearInterval(spawnTimer);
      clearInterval(difficultyTimer);
      activeWords.forEach(w => w.element.remove());
      activeWords = [];
    }

    function spawnWord() {
      if (!gameActive) return;
      const isGood = Math.random() > 0.55;
      const list = isGood ? goodWords : badWords;
      const text = list[Math.floor(Math.random() * list.length)];

      const el = document.createElement('div');
      el.className = `nadine-falling-word ${isGood ? 'good' : 'bad'}`;
      el.textContent = text;
      arena.appendChild(el);

      const posX = Math.random() * 80 + 10;
      el.style.left = `${posX}%`;

      activeWords.push({
        element: el,
        x: posX,
        y: -25,
        isGood: isGood
      });
    }

    function updateGameLoop() {
      if (!gameActive) return;

      if (keysPressed['left']) playerX = Math.max(5, playerX - 2.5);
      if (keysPressed['right']) playerX = Math.min(95, playerX + 2.5);
      player.style.left = `${playerX}%`;

      const arenaHeight = arena.clientHeight;
      const playerRect = player.getBoundingClientRect();

      for (let i = activeWords.length - 1; i >= 0; i--) {
        let w = activeWords[i];
        w.y += fallSpeed;
        w.element.style.top = `${w.y}px`;

        const wordRect = w.element.getBoundingClientRect();
        if (
          wordRect.bottom >= playerRect.top &&
          wordRect.top <= playerRect.bottom &&
          wordRect.right >= playerRect.left &&
          wordRect.left <= playerRect.right
        ) {
          if (w.isGood) {
            mentalEnergy = Math.min(100, mentalEnergy + 15);
          } else {
            mentalEnergy = Math.max(0, mentalEnergy - 25);
          }
          updateMentalBar();
          w.element.remove();
          activeWords.splice(i, 1);
          continue;
        }

        if (w.y > arenaHeight) {
          w.element.remove();
          activeWords.splice(i, 1);
        }
      }

      if (mentalEnergy <= 0) {
        endGame(false);
      }

      if (secondsElapsed >= 30) {
        endGame(true);
      }
    }

    function updateMentalBar() {
      mentalFill.style.width = `${mentalEnergy}%`;
    }

    function endGame(won) {
      stopGame();
      arena.hidden = true;
      resultBox.hidden = false;

      if (won) {
        resultTitle.textContent = 'FÉ PRESERVADA.';
        resultDesc.textContent = 'Você resistiu ao peso das críticas e manteve a mente firme por 30 segundos.';
      } else {
        resultTitle.textContent = 'MENTE COLAPSADA.';
        resultDesc.textContent = 'O peso das cobranças foi insuportável e a energia mental se esgotou.';
      }
    }
  }

  /* ------------------------------------------------------------------------
     INICIALIZAÇÃO
     ------------------------------------------------------------------------ */
  initMenu();
  initEasterEggs();
  initBroadcast();
  initDeathGame();
  initJudgment();
  initAccessLock();
  initAmericoGame();
  initNadineTemple();
  initNadineGame();
})();