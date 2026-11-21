(() => {
  const normalize = (value) => value.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase();

  function mount(id, initialize) {
    const card = document.getElementById(id);
    const open = card.querySelector('.word-game-start');
    const arena = card.querySelector('.game-arena-box');
    const reset = initialize(arena);
    open.addEventListener('click', () => {
      arena.hidden = false;
      open.hidden = true;
      reset();
    });
    arena.querySelector('.word-game-reset').addEventListener('click', reset);
  }

  function makeSearchPuzzle(words, size) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const axes = [[[0, 1], [0, -1]], [[1, 0], [-1, 0]], [[1, 1], [-1, 1], [-1, -1], [1, -1]]];
    const directions = axes.flat();
    const longestFirst = [...words].sort((left, right) => right.length - left.length);
    const letters = Array(size * size).fill('');

    function placeWord(word, allowedDirections) {
      const paths = [];
      for (const [dr, dc] of allowedDirections) {
        for (let row = 0; row < size; row += 1) {
          for (let col = 0; col < size; col += 1) {
            const endRow = row + dr * (word.length - 1);
            const endCol = col + dc * (word.length - 1);
            if (endRow < 0 || endCol < 0 || endRow >= size || endCol >= size) continue;
            const path = Array.from(word, (_, step) => (row + dr * step) * size + col + dc * step);
            if (path.every((cell, step) => !letters[cell] || letters[cell] === word[step])) paths.push(path);
          }
        }
      }
      if (!paths.length) return false;
      paths[Math.floor(Math.random() * paths.length)].forEach((cell, step) => {
        letters[cell] = word[step];
      });
      return true;
    }

    let complete = false;
    for (let attempt = 0; attempt < 24 && !complete; attempt += 1) {
      letters.fill('');
      const firstAxis = Math.floor(Math.random() * axes.length);
      complete = longestFirst.every((word, index) => {
        const allowed = index < axes.length ? axes[(firstAxis + index) % axes.length] : directions;
        return placeWord(word, allowed);
      });
    }

    if (!complete) {
      // All words in the vocabulary fit in the columns next to a reserved vertical word.
      letters.fill('');
      const edge = Math.random() < 0.5 ? 0 : size - 1;
      const vertical = [...longestFirst[0]];
      if (Math.random() < 0.5) vertical.reverse();
      const top = Math.floor(Math.random() * (size - vertical.length + 1));
      vertical.forEach((letter, row) => { letters[(top + row) * size + edge] = letter; });
      const firstCol = edge === 0 ? 1 : 0;
      const rowOffset = Math.floor(Math.random() * size);
      longestFirst.slice(1).forEach((word, index) => {
        const row = (rowOffset + index) % size;
        const start = firstCol + Math.floor(Math.random() * (size - word.length));
        const characters = [...word];
        if (Math.random() < 0.5) characters.reverse();
        characters.forEach((letter, col) => { letters[row * size + start + col] = letter; });
      });
    }

    return letters.map((letter) => letter || alphabet[Math.floor(Math.random() * alphabet.length)]);
  }

  mount('caca-palavras', (arena) => {
    const size = 10;
    const vocabulary = ['NADINE', 'ÍRIS', 'SALVAÇÃO', 'MORTE', 'CELEBRAR', 'MAIA', 'AMÉRICO', 'FÉ',
      'CENSURA', 'VIGÍLIA', 'SANTUÁRIO', 'VERGUEIRO', 'ESPERANÇA', 'CULPA', 'MEMÓRIA', 'VERDADE'];
    let labels = [];
    let words = [];
    const grid = arena.querySelector('.search-grid');
    const list = arena.querySelector('.search-words');
    const feedback = arena.querySelector('.word-feedback');
    const found = new Set();
    let first = null;
    let letters = [];
    let cells = [];

    function select(index) {
      if (found.size === words.length) return;
      if (first === null) {
        first = index;
        cells[index].setAttribute('aria-pressed', 'true');
        feedback.textContent = 'Agora selecione a última letra.';
        return;
      }
      const start = first;
      cells[start].setAttribute('aria-pressed', 'false');
      first = null;
      if (start === index) {
        feedback.textContent = 'Seleção cancelada.';
        return;
      }

      const dr = Math.floor(index / size) - Math.floor(start / size);
      const dc = index % size - start % size;
      if (dr && dc && Math.abs(dr) !== Math.abs(dc)) {
        feedback.textContent = 'Escolha duas letras na mesma linha, coluna ou diagonal.';
        return;
      }
      const stride = Math.sign(dr) * size + Math.sign(dc);
      const path = Array.from({ length: Math.max(Math.abs(dr), Math.abs(dc)) + 1 }, (_, step) => start + stride * step);
      const candidate = path.map((cell) => letters[cell]);
      const word = [candidate.join(''), candidate.reverse().join('')].find((entry) => words.includes(entry));
      if (!word || found.has(word)) {
        feedback.textContent = word ? 'Você já encontrou essa palavra.' : 'Essa sequência não está na lista.';
        return;
      }

      found.add(word);
      path.forEach((cell) => cells[cell].classList.add('is-found'));
      const wordIndex = words.indexOf(word);
      list.children[wordIndex].classList.add('is-found');
      list.children[wordIndex].textContent = labels[wordIndex] + ' ✓';
      feedback.textContent = found.size === words.length
        ? 'Você encontrou todas as palavras!'
        : `${labels[wordIndex]} encontrada. ${found.size} de ${words.length}.`;
    }

    grid.addEventListener('keydown', (event) => {
      const offsets = { ArrowUp: -size, ArrowDown: size, ArrowLeft: -1, ArrowRight: 1 };
      if (!(event.key in offsets)) return;
      const current = cells.indexOf(event.target);
      if (current === -1) return;
      event.preventDefault();
      if (event.key === 'ArrowLeft' && current % size === 0) return;
      if (event.key === 'ArrowRight' && current % size === size - 1) return;
      cells[current + offsets[event.key]]?.focus();
    });

    return () => {
      found.clear();
      first = null;
      const available = [...vocabulary];
      labels = Array.from({ length: size }, () => {
        const index = Math.floor(Math.random() * available.length);
        return available.splice(index, 1)[0];
      });
      words = labels.map(normalize);
      letters = makeSearchPuzzle(words, size);
      cells = letters.map((letter, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = letter;
        button.setAttribute('aria-label', `${letter}, linha ${Math.floor(index / size) + 1}, coluna ${index % size + 1}`);
        button.setAttribute('aria-pressed', 'false');
        button.addEventListener('focus', () => {
          grid.querySelector('[tabindex="0"]')?.setAttribute('tabindex', '-1');
          button.tabIndex = 0;
        });
        button.tabIndex = index === 0 ? 0 : -1;
        button.addEventListener('click', () => select(index));
        return button;
      });
      grid.replaceChildren(...cells);
      list.replaceChildren(...labels.map((label) => {
        const item = document.createElement('li');
        item.textContent = label;
        return item;
      }));
      feedback.textContent = `0 de ${words.length} palavras encontradas.`;
      cells[0].focus();
    };
  });

  mount('palavras-cruzadas', (arena) => {
    const entries = [
      { word: 'VERGUEIRO', row: 0, col: 1, down: false, clue: 'Sobrenome de um dos personagens apresentados no site.' },
      { word: 'ESPERANÇA', row: 0, col: 6, down: true, clue: 'O que Nadine reacende numa sociedade à beira do colapso.' },
      { word: 'CENSURA', row: 2, col: 1, down: true, clue: 'Prática de impedir que uma manchete chegue ao público.' },
      { word: 'VIGÍLIA', row: 2, col: 8, down: true, clue: 'Período em que se fica acordado, à espera de um sinal.' },
      { word: 'AMÉRICO', row: 3, col: 4, down: false, clue: 'Dono da emissora Íris.' },
      { word: 'SANTUÁRIO', row: 5, col: 1, down: false, clue: 'Lugar sagrado que dá nome ao cenário de Resista ao Peso.' },
      { word: 'NADINE', row: 5, col: 3, down: true, clue: 'Jovem cujas memórias foram fragmentadas.' },
      { word: 'MAIA', row: 8, col: 5, down: false, clue: 'Quem ajuda a reconstruir as memórias fragmentadas.' },
    ];
    const grid = arena.querySelector('.crossword-grid');
    const input = grid.querySelector('.crossword-entry');
    const clues = arena.querySelector('.crossword-clues');
    const feedback = arena.querySelector('.word-feedback');
    const cells = new Map();
    let active = null;
    let selected = null;

    function selectCell(cell, entry) {
      selected?.button.classList.remove('is-selected');
      selected = cell;
      active = entry;
      cell.button.classList.add('is-selected');
      entries.forEach((item) => item.button.setAttribute('aria-pressed', String(item === entry)));
      cells.forEach((item) => item.button.classList.toggle('in-clue', item.entries.includes(entry)));
      input.style.gridArea = cell.button.style.gridArea;
      input.setAttribute('aria-label', `Linha ${cell.row + 1}, coluna ${cell.col + 1}, ${entry.down ? 'vertical' : 'horizontal'}`);
      input.hidden = false;
      input.value = cell.value;
      input.focus({ preventScroll: true });
      input.select();
    }

    function writeLetter(cell, letter) {
      cell.value = letter;
      cell.text.textContent = letter;
      cell.button.classList.remove('is-wrong');
      cell.button.setAttribute('aria-label', `Linha ${cell.row + 1}, coluna ${cell.col + 1}, ${letter || 'vazia'}`);
    }

    entries.forEach((entry, index) => {
      entry.path = [...normalize(entry.word)].map((letter, step) => {
        const row = entry.row + (entry.down ? step : 0);
        const col = entry.col + (entry.down ? 0 : step);
        const key = `${row},${col}`;
        if (!cells.has(key)) {
          const button = document.createElement('button');
          const text = document.createElement('span');
          button.type = 'button';
          button.style.gridArea = `${row + 1} / ${col + 1}`;
          button.append(text);
          grid.append(button);
          cells.set(key, { letter, button, text, row, col, entries: [] });
        }
        const cell = cells.get(key);
        cell.entries.push(entry);
        if (step === 0) {
          const number = document.createElement('span');
          number.className = 'crossword-number';
          number.textContent = index + 1;
          number.setAttribute('aria-hidden', 'true');
          cell.button.append(number);
        }
        return cell;
      });

      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = `${index + 1}. ${entry.down ? 'Vertical' : 'Horizontal'} · ${entry.clue} (${entry.path.length})`;
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => {
        selectCell(entry.path.find((cell) => !cell.value) || entry.path[0], entry);
      });
      entry.button = button;
      item.append(button);
      clues.append(item);
    });

    cells.forEach((cell) => {
      writeLetter(cell, '');
      cell.button.addEventListener('click', () => {
        const direction = cell.entries.indexOf(active);
        const entry = selected === cell
          ? cell.entries[(direction + 1) % cell.entries.length]
          : cell.entries[Math.max(0, direction)];
        selectCell(cell, entry);
      });
    });

    function readLetters() {
      const letters = normalize(input.value).replace(/[^A-Z]/g, '');
      const index = active.path.indexOf(selected);
      if (!letters) writeLetter(selected, '');
      else {
        [...letters].forEach((letter, offset) => {
          const cell = active.path[index + offset];
          if (cell) writeLetter(cell, letter);
        });
      }
      feedback.textContent = '';
      selectCell(active.path[Math.min(index + letters.length, active.path.length - 1)], active);
    }

    input.addEventListener('input', (event) => {
      if (!event.isComposing) readLetters();
    });
    input.addEventListener('compositionend', readLetters);
    input.addEventListener('keydown', (event) => {
      if (event.isComposing) return;
      const offsets = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
      if (Object.hasOwn(offsets, event.key)) {
        const [dr, dc] = offsets[event.key];
        const next = cells.get(`${selected.row + dr},${selected.col + dc}`);
        event.preventDefault();
        if (next) selectCell(next, next.entries.find((entry) => entry.down === Boolean(dr)) || next.entries[0]);
      } else if (event.key === 'Backspace' && !input.value) {
        const previous = active.path[active.path.indexOf(selected) - 1];
        if (!previous) return;
        event.preventDefault();
        writeLetter(previous, '');
        feedback.textContent = '';
        selectCell(previous, active);
      }
    });

    arena.querySelector('.crossword-check').addEventListener('click', () => {
      let correct = 0;
      let blank = 0;
      cells.forEach(({ button, value, letter }) => {
        button.classList.toggle('is-wrong', Boolean(value) && value !== letter);
        if (!value) blank += 1;
        if (value === letter) correct += 1;
      });
      const wrong = cells.size - correct - blank;
      feedback.textContent = correct === cells.size
        ? 'Você completou todas as palavras!'
        : `${correct} de ${cells.size} letras corretas. ${blank} em branco, ${wrong} para corrigir.`;
    });

    return () => {
      cells.forEach((cell) => writeLetter(cell, ''));
      feedback.textContent = '';
      entries[0].button.click();
    };
  });

  function scoreGuess(guess, answer) {
    const remaining = [...answer];
    const marks = [...guess].map((letter, index) => {
      if (letter !== answer[index]) return 'absent';
      remaining[index] = '';
      return 'exact';
    });
    return marks.map((mark, index) => {
      if (mark === 'exact') return mark;
      const match = remaining.indexOf(guess[index]);
      if (match === -1) return mark;
      remaining[match] = '';
      return 'present';
    });
  }

  mount('termo-tematico', (arena) => {
    const words = ['MORTE', 'CULPA', 'RITOS', 'MEDOS', 'RAIVA', 'SINAL', 'PESAR', 'CRISE',
      'PACTO', 'PODER', 'PROVA', 'TEMOR', 'FARSA', 'GRITO', 'LUTAS', 'CLERO'];
    const marks = {
      exact: ['✓', 'casa certa'],
      present: ['↔', 'outra casa'],
      absent: ['×', 'letra ausente'],
    };
    const limit = 6;
    const history = arena.querySelector('.term-history');
    const form = arena.querySelector('.term-form');
    const input = form.querySelector('input');
    const submit = form.querySelector('button');
    const feedback = arena.querySelector('.word-feedback');
    const resetButton = arena.querySelector('.word-game-reset');
    const rows = Array.from({ length: limit }, () => {
      const row = document.createElement('li');
      const slots = Array.from({ length: 5 }, () => document.createElement('span'));
      row.append(...slots);
      history.append(row);
      return { row, slots };
    });
    let answer;
    let finished = false;
    const guesses = new Set();

    function showDraft() {
      const guess = normalize(input.value).replace(/[^A-Z]/g, '').slice(0, 5);
      if (input.value !== guess) input.value = guess;
      rows[guesses.size].slots.forEach((slot, index) => {
        slot.textContent = guess[index] || '';
        slot.classList.toggle('is-next', index === guess.length);
      });
    }

    function openRow() {
      const attempt = guesses.size;
      input.value = '';
      input.style.setProperty('--term-row', attempt);
      input.setAttribute('aria-label', `Palpite de cinco letras, tentativa ${attempt + 1} de ${limit}`);
      rows[attempt].row.classList.add('is-active');
      showDraft();
    }

    input.addEventListener('input', (event) => {
      if (!event.isComposing && !finished) showDraft();
    });
    input.addEventListener('compositionend', () => {
      if (!finished) showDraft();
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (finished) return;
      const guess = input.value;
      if (!/^[A-Z]{5}$/.test(guess) || guesses.has(guess)) {
        feedback.textContent = guesses.has(guess) ? 'Você já tentou esse palpite.' : 'Digite exatamente cinco letras.';
        input.focus({ preventScroll: true });
        return;
      }

      const { row, slots } = rows[guesses.size];
      row.classList.remove('is-active');
      guesses.add(guess);
      scoreGuess(guess, answer).forEach((mark, index) => {
        const [symbol, description] = marks[mark];
        const tile = slots[index];
        tile.classList.remove('is-next');
        tile.dataset.mark = mark;
        tile.innerHTML = `<span aria-hidden="true">${guess[index]}<small>${symbol}</small></span><span class="sr-only">${guess[index]} · ${description}</span>`;
      });
      const remaining = limit - guesses.size;
      if (guess === answer || remaining === 0) {
        finished = true;
        feedback.textContent = guess === answer
          ? `Você acertou ${answer}! Tentativas usadas: ${guesses.size} de ${limit}.`
          : `Fim das tentativas. A palavra era ${answer}.`;
        input.hidden = true;
        submit.hidden = true;
        resetButton.focus();
      } else {
        feedback.textContent = remaining === 1 ? 'Resta 1 tentativa.' : `Restam ${remaining} tentativas.`;
        openRow();
        input.focus({ preventScroll: true });
      }
    });

    return () => {
      const choices = words.filter((word) => word !== answer);
      answer = choices[Math.floor(Math.random() * choices.length)];
      finished = false;
      guesses.clear();
      rows.forEach(({ row, slots }) => {
        row.classList.remove('is-active');
        slots.forEach((slot) => {
          slot.textContent = '';
          slot.classList.remove('is-next');
          delete slot.dataset.mark;
        });
      });
      input.hidden = false;
      submit.hidden = false;
      openRow();
      feedback.textContent = '6 tentativas disponíveis.';
      input.focus({ preventScroll: true });
    };
  });
})();
