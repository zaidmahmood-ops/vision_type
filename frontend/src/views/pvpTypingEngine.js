// src/views/pvpTypingEngine.js
const IGNORED_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape']);

/**
 * @param {Object}      opts
 * @param {HTMLElement} opts.container   Element to render the words into
 * @param {string[]}    opts.words       Pre-generated word list (same for all players)
 * @param {'words'|'time'} opts.mode
 * @param {number}      opts.limit       Word count or seconds
 * @param {(p:Object)=>void} opts.onProgress  Called on every keystroke (consumer throttles)
 * @param {(stats:Object)=>void} opts.onFinish
 */
export function createTypingEngine({
  container,
  words,
  mode = 'words',
  limit = 35,
  onProgress = () => {},
  onFinish = () => {},
}) {
  const targetWords = mode === 'words' ? words.slice(0, limit) : words;

  // Cumulative char counts so progress is smooth at letter level
  const charsBefore = [0];
  targetWords.forEach((w, i) => charsBefore.push(charsBefore[i] + w.length + 1));
  const totalChars = charsBefore[targetWords.length];

  const s = {
    locked: true,
    started: false,
    finished: false,
    wordIndex: 0,
    letterIndex: 0,
    correct: 0,
    incorrect: 0,
    extra: 0,
    missed: 0,
    startTs: 0,
    finalElapsed: null,
    ticker: null,
    lastLoggedSec: 0,
    wpmLog: [],
    lineHeight: 0,
  };

  // ---------- DOM ----------
  container.innerHTML = `
    <div class="live-hud"><span class="pvp-hud-counter"></span></div>
    <div class="typing-viewport">
      <div class="words-wrapper"><div class="cursor blink"></div></div>
    </div>`;
  container.classList.add('pvp-locked'); // hook for CSS (dim/blur while locked)

  const hudEl = container.querySelector('.pvp-hud-counter');
  const wrapperEl = container.querySelector('.words-wrapper');
  const cursorEl = container.querySelector('.cursor');

  const frag = document.createDocumentFragment();
  const wordEls = targetWords.map((word) => {
    const div = document.createElement('div');
    div.className = 'word';
    for (const ch of word) {
      const span = document.createElement('span');
      span.className = 'letter';
      span.textContent = ch;
      div.appendChild(span);
    }
    frag.appendChild(div);
    return div;
  });
  wrapperEl.appendChild(frag);
  wordEls[0]?.classList.add('active');

  // ---------- Stats ----------
  const getElapsed = () => {
    if (s.finalElapsed !== null) return s.finalElapsed;
    return s.started ? (performance.now() - s.startTs) / 1000 : 0;
  };

  const liveWpm = () => {
    const minutes = Math.max(getElapsed(), 1) / 60;
    return Math.max(0, Math.round(s.correct / 5 / minutes));
  };

  function consistency() {
    const log = s.wpmLog;
    if (log.length < 2) return 100;
    const mean = log.reduce((a, b) => a + b, 0) / log.length;
    const variance = log.reduce((sum, v) => sum + (v - mean) ** 2, 0) / log.length;
    return Math.max(0, Math.round(100 - (Math.sqrt(variance) / (mean || 1)) * 100));
  }

  function getStats() {
    const elapsed = getElapsed();
    const minutes = Math.max(elapsed, 1) / 60;
    const typed = s.correct + s.incorrect + s.extra;
    return {
      wpm: liveWpm(),
      rawWpm: Math.round(typed / 5 / minutes),
      accuracy: typed > 0 ? Math.round((s.correct / typed) * 100) : 100,
      consistency: consistency(),
      timeElapsed: Math.round(elapsed * 100) / 100,
      charsCorrect: s.correct,
      charsIncorrect: s.incorrect,
      charsExtra: s.extra,
      charsMissed: s.missed,
      perSecondWpmLog: s.wpmLog,
    };
  }

  function snapshot() {
    let progress;
    if (mode === 'time') {
      progress = Math.min(getElapsed() / limit, 1);
    } else if (s.finished) {
      progress = 1;
    } else {
      progress = totalChars ? (charsBefore[s.wordIndex] + s.letterIndex) / totalChars : 0;
    }
    return {
      progress: Math.round(Math.min(progress, 1) * 1000) / 1000,
      wpm: liveWpm(),
      wordIndex: s.wordIndex,
      finished: s.finished,
    };
  }

  const emit = () => onProgress(snapshot());

  // ---------- HUD / cursor / scrolling ----------
  function updateHud() {
    hudEl.textContent =
      mode === 'words'
        ? `${s.wordIndex} / ${targetWords.length}`
        : `Time: ${Math.max(0, Math.ceil(limit - getElapsed()))}s`;
  }

  function updateCursor() {
    const active = wordEls[s.wordIndex];
    if (!active) return;
    const letters = active.children;
    const wrapperRect = wrapperEl.getBoundingClientRect();
    const atEnd = s.letterIndex >= letters.length;
    const rect = letters[atEnd ? letters.length - 1 : s.letterIndex].getBoundingClientRect();
    cursorEl.style.left = `${(atEnd ? rect.right : rect.left) - wrapperRect.left}px`;
    cursorEl.style.top = `${rect.top - wrapperRect.top}px`;
  }

  function checkLineShift() {
    const active = wordEls[s.wordIndex];
    if (!active) return;
    const top1 = wordEls[0].offsetTop;
    if (!s.lineHeight) {
      const second = wordEls.find((w) => w.offsetTop > top1);
      if (!second) return; // not laid out yet (or only one line)
      s.lineHeight = second.offsetTop - top1;
    }
    const line = Math.round((active.offsetTop - top1) / s.lineHeight);
    wrapperEl.style.transform = `translateY(-${Math.max(0, line - 1) * s.lineHeight}px)`;
  }

  // ---------- Clock ----------
  function startClock() {
    if (s.started) return;
    s.started = true;
    s.startTs = performance.now();
    cursorEl.classList.remove('blink');
    s.ticker = setInterval(tick, 100);
  }

  function tick() {
    const elapsed = getElapsed();
    const sec = Math.floor(elapsed);
    if (sec > s.lastLoggedSec) {
      s.lastLoggedSec = sec;
      s.wpmLog.push(Math.round((s.correct + s.incorrect) / 5 / (elapsed / 60)));
    }
    if (mode === 'time' && elapsed >= limit) return finish();
    updateHud();
    if (mode === 'time') emit(); // bar advances with time even if idle
  }

  function finish() {
    if (s.finished) return;
    s.finished = true;
    s.locked = true;
    clearInterval(s.ticker);
    s.ticker = null;
    s.finalElapsed = mode === 'time' ? limit : (performance.now() - s.startTs) / 1000;
    container.classList.add('pvp-locked');
    updateHud();
    emit();
    onFinish(getStats());
  }

  // ---------- Input ----------
  function onKeyDown(e) {
    const t = e.target;
    if (t instanceof HTMLElement && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;

    // INPUT LOCK: while locked (countdown / finished) ignore everything
    if (s.locked || s.finished) {
      if (e.key === ' ') e.preventDefault(); // stop page scroll
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey || IGNORED_KEYS.has(e.key)) return;

    const active = wordEls[s.wordIndex];
    if (!active) return;
    const letters = active.children;

    if (e.key === ' ') {
      e.preventDefault();
      if (s.letterIndex === 0) return;
      if (s.letterIndex < letters.length) s.missed += letters.length - s.letterIndex;

      active.dataset.typedIndex = s.letterIndex;
      active.classList.remove('active');
      s.wordIndex++;
      s.letterIndex = 0;

      if (s.wordIndex >= targetWords.length) return finish();
      wordEls[s.wordIndex].classList.add('active');
    } else if (e.key === 'Backspace') {
      if (s.letterIndex > 0) {
        s.letterIndex--;
        const target = letters[s.letterIndex];
        if (target.classList.contains('correct')) s.correct--;
        if (target.classList.contains('incorrect')) s.incorrect--;
        target.classList.remove('correct', 'incorrect');
      } else if (s.wordIndex > 0) {
        const prev = wordEls[s.wordIndex - 1];
        if (prev.dataset.typedIndex !== undefined) {
          active.classList.remove('active');
          s.wordIndex--;
          s.letterIndex = parseInt(prev.dataset.typedIndex, 10);
          prev.classList.add('active');
        }
      }
    } else if (e.key.length === 1) {
      if (s.letterIndex < letters.length) {
        const letter = letters[s.letterIndex];
        if (e.key === letter.textContent) {
          letter.classList.add('correct');
          s.correct++;
        } else {
          letter.classList.add('incorrect');
          s.incorrect++;
        }
        s.letterIndex++;

        // Race finish: last word fully typed with no mistakes
        const isLastWord = s.wordIndex === targetWords.length - 1;
        if (mode === 'words' && isLastWord && s.letterIndex === letters.length && !active.querySelector('.incorrect')) {
          return finish();
        }
      } else {
        s.extra++;
      }
    } else {
      return;
    }

    checkLineShift();
    updateCursor();
    updateHud();
    emit();
  }

  const onResize = () => { s.lineHeight = 0; checkLineShift(); updateCursor(); };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('resize', onResize);
  requestAnimationFrame(() => { checkLineShift(); updateCursor(); updateHud(); });

  // ---------- Public API ----------
  return {
    lock() {
      s.locked = true;
      container.classList.add('pvp-locked');
    },
    unlock() {
      if (s.finished) return;
      s.locked = false;
      container.classList.remove('pvp-locked');
      startClock(); // race clock starts at GO
    },
    getStats,
    destroy() {
      clearInterval(s.ticker);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
      container.classList.remove('pvp-locked');
      container.innerHTML = '';
    },
  };
}