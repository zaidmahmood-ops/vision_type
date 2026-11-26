<script>
  import { onMount } from 'svelte';
  import { DATASET_REGISTRY, getWordlist } from '../services/testConfigService.js';
  import { recordTestResult, getLocalTestHistory } from '../services/historyService.js';
  import ResultsView from './ResultsView.svelte';

  let completedStats = $state(null);

  let currentDatasetKey = $state('english-200');
  let testMode = $state('time');
  let testLimit = $state(10);
  let activeWordsPool = [];

  let currentWordIndex = 0;
  let currentLetterIndex = 0;
  let hasStarted = false;
  let isFinished = false;
  let isDropdownOpen = $state(false);
  let searchQuery = $state('');

  let wordsWrapperEl = $state(null);
  let cursorEl = $state(null);
  let wordElements = [];

  let timerInterval = null;
  let timeLeft = 30;
  let timeElapsed = 0;

  let charsCorrect = 0;
  let charsIncorrect = 0;
  let charsExtra = 0;
  let charsMissed = 0;
  let perSecondWpmLog = [];

  const currentDatasetName = $derived(
    DATASET_REGISTRY[currentDatasetKey]?.name || currentDatasetKey
  );

  const filteredDatasetKeys = $derived.by(() => {
    const query = searchQuery.toLowerCase().trim();
    return Object.keys(DATASET_REGISTRY).filter((key) => {
      const item = DATASET_REGISTRY[key];
      return (
        item.name.toLowerCase().includes(query) ||
        key.toLowerCase().includes(query)
      );
    });
  });

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function updateLiveHUD() {
    const hudCounter = document.getElementById('hud-counter');
    if (!hudCounter) return;

    if (testMode === 'words') {
      const limitDisplay = testLimit === 0 ? '∞' : testLimit;
      hudCounter.textContent = `${currentWordIndex} / ${limitDisplay}`;
    } else {
      hudCounter.textContent =
        testLimit === 0 ? `Time: ${timeElapsed}s (∞)` : `Time: ${timeLeft}s`;
    }
  }

  function updateCursor() {
    const activeWord = wordElements[currentWordIndex];
    if (!activeWord || !cursorEl || !wordsWrapperEl) return;

    const letters = activeWord.children;
    if (letters.length === 0) return;

    const wrapperRect = wordsWrapperEl.getBoundingClientRect();
    let left;
    let top;

    if (currentLetterIndex >= letters.length) {
      const letterRect = letters[letters.length - 1].getBoundingClientRect();
      left = letterRect.right - wrapperRect.left;
      top = letterRect.top - wrapperRect.top;
    } else {
      const letterRect = letters[currentLetterIndex].getBoundingClientRect();
      left = letterRect.left - wrapperRect.left;
      top = letterRect.top - wrapperRect.top;
    }

    cursorEl.style.left = `${left}px`;
    cursorEl.style.top = `${top}px`;
  }

  function checkLineShift() {
    const activeWord = wordElements[currentWordIndex];
    if (!activeWord || !wordsWrapperEl || wordElements.length === 0) return;

    const line1Top = wordElements[0].offsetTop;
    let line2Top = null;

    for (let i = 1; i < wordElements.length; i++) {
      if (wordElements[i].offsetTop > line1Top) {
        line2Top = wordElements[i].offsetTop;
        break;
      }
    }

    if (line2Top === null) {
      wordsWrapperEl.style.transform = 'translateY(0px)';
      return;
    }

    const lineHeight = line2Top - line1Top;
    const currentLineIndex = Math.round((activeWord.offsetTop - line1Top) / lineHeight);
    const linesToShift = Math.max(0, currentLineIndex - 1);

    wordsWrapperEl.style.transform = `translateY(-${linesToShift * lineHeight}px)`;
  }

  function appendWords(count = 30) {
    if (!wordsWrapperEl || !activeWordsPool || activeWordsPool.length === 0) return;
    if (testMode === 'words' && testLimit > 0 && wordElements.length >= testLimit) return;

    const fragment = document.createDocumentFragment();
    const loopCount = testMode === 'words' && testLimit > 0 ? testLimit : count;

    for (let i = 0; i < loopCount; i++) {
      const randomIndex = Math.floor(Math.random() * activeWordsPool.length);
      const word = activeWordsPool[randomIndex];

      const wordDiv = document.createElement('div');
      wordDiv.classList.add('word');

      for (const char of word) {
        const letterSpan = document.createElement('span');
        letterSpan.classList.add('letter');
        letterSpan.textContent = char;
        wordDiv.appendChild(letterSpan);
      }
      fragment.appendChild(wordDiv);
    }

    wordsWrapperEl.appendChild(fragment);
    wordElements = Array.from(wordsWrapperEl.querySelectorAll('.word'));
  }

  function startTimer() {
    if (timerInterval) return;

    timerInterval = setInterval(() => {
      timeElapsed++;

      const minutesSoFar = timeElapsed / 60;
      const currentRawWpm =
        minutesSoFar > 0
          ? Math.round((charsCorrect + charsIncorrect) / 5 / minutesSoFar)
          : 0;
      perSecondWpmLog.push(currentRawWpm);

      if (testMode === 'time') {
        if (testLimit > 0) {
          if (timeLeft > 0) timeLeft--;
          updateLiveHUD();
          if (timeLeft <= 0) {
            stopTimer();
            finishTest();
          }
        } else {
          updateLiveHUD();
        }
      }
    }, 1000);
  }

  function finishTest() {
    if (isFinished) return;
    isFinished = true;
    stopTimer();

    const actualTimeMinutes = Math.max(timeElapsed, 1) / 60;
    const totalTypedChars = charsCorrect + charsIncorrect + charsExtra;

    const rawWpm = Math.round(totalTypedChars / 5 / actualTimeMinutes);
    const netWpm = Math.max(
      0,
      Math.round((charsCorrect / 5 - charsIncorrect) / actualTimeMinutes)
    );
    const accuracy =
      totalTypedChars > 0 ? Math.round((charsCorrect / totalTypedChars) * 100) : 100;

    let consistency = 100;
    if (perSecondWpmLog.length > 1) {
      const mean =
        perSecondWpmLog.reduce((a, b) => a + b, 0) / perSecondWpmLog.length;
      const variance =
        perSecondWpmLog.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
        perSecondWpmLog.length;
      const stdDev = Math.sqrt(variance);
      consistency = Math.max(
        0,
        Math.round(100 - (stdDev / (mean || 1)) * 100)
      );
    }

    const statsData = {
      wpm: netWpm,
      rawWpm,
      accuracy,
      consistency,
      timeElapsed,
      charsCorrect,
      charsIncorrect,
      charsExtra,
      charsMissed,
      testMode,
      testLimit,
      datasetName: currentDatasetName,
      perSecondWpmLog,
    };

    recordTestResult(statsData);
    const currentHistory = getLocalTestHistory();
    console.log(
      `Test completed! Total records now in local storage: ${currentHistory.length}`
    );

    completedStats = statsData;
  }

  function handleKeyDown(event) {
    if (completedStats || isFinished || isDropdownOpen) return;
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(event.key)) {
      return;
    }

    if (!hasStarted) {
      hasStarted = true;
      cursorEl?.classList.remove('blink');
      startTimer();
    }

    const activeWord = wordElements[currentWordIndex];
    if (!activeWord) return;
    const letters = activeWord.children;

    if (event.key === ' ') {
      event.preventDefault();
      if (currentLetterIndex === 0) return;

      if (currentLetterIndex < letters.length) {
        charsMissed += letters.length - currentLetterIndex;
      }

      activeWord.dataset.typedIndex = currentLetterIndex;
      currentWordIndex++;
      currentLetterIndex = 0;

      if (testMode === 'words' && testLimit > 0 && currentWordIndex >= testLimit) {
        stopTimer();
        finishTest();
        return;
      }

      activeWord.classList.remove('active');
      wordElements[currentWordIndex]?.classList.add('active');

      if (wordElements.length - currentWordIndex < 25) {
        appendWords(30);
      }

      checkLineShift();
      updateCursor();
      updateLiveHUD();
      return;
    }

    if (event.key === 'Backspace') {
      if (currentLetterIndex > 0) {
        currentLetterIndex--;
        const target = letters[currentLetterIndex];
        if (target.classList.contains('correct')) charsCorrect--;
        if (target.classList.contains('incorrect')) charsIncorrect--;
        target.classList.remove('correct', 'incorrect');
      } else if (currentWordIndex > 0) {
        const prevWord = wordElements[currentWordIndex - 1];
        const prevLetters = prevWord.children;

        const hasActivity =
          prevWord.querySelector('.letter.incorrect, .letter.correct') !== null ||
          prevWord.dataset.typedIndex !== undefined;

        if (hasActivity) {
          activeWord.classList.remove('active');
          currentWordIndex--;
          currentLetterIndex =
            prevWord.dataset.typedIndex !== undefined
              ? parseInt(prevWord.dataset.typedIndex, 10)
              : prevLetters.length;

          prevWord.classList.add('active');
        }
      }

      checkLineShift();
      updateCursor();
      updateLiveHUD();
      return;
    }

    if (event.key.length === 1) {
      if (currentLetterIndex < letters.length) {
        const targetLetter = letters[currentLetterIndex];
        if (event.key === targetLetter.textContent) {
          targetLetter.classList.add('correct');
          charsCorrect++;
        } else {
          targetLetter.classList.add('incorrect');
          charsIncorrect++;
        }
        currentLetterIndex++;
      } else {
        charsExtra++;
      }
      updateCursor();
    }
  }

  async function setupGame() {
    stopTimer();
    completedStats = null;
    isFinished = false;
    currentWordIndex = 0;
    currentLetterIndex = 0;
    hasStarted = false;
    isDropdownOpen = false;
    searchQuery = '';
    wordElements = [];

    charsCorrect = 0;
    charsIncorrect = 0;
    charsExtra = 0;
    charsMissed = 0;
    perSecondWpmLog = [];
    timeElapsed = 0;

    const validOptions = [10, 20, 35, 60, 70, 100, 0];
    if (!validOptions.includes(testLimit)) {
      testLimit = testMode === 'words' ? 35 : 30;
    }
    timeLeft = testLimit;

    activeWordsPool = await getWordlist(currentDatasetKey);

    if (!wordsWrapperEl) return;
    wordsWrapperEl.innerHTML = '';
    wordsWrapperEl.style.transform = 'translateY(0px)';

    cursorEl = document.createElement('div');
    cursorEl.id = 'cursor';
    cursorEl.className = 'cursor blink';
    wordsWrapperEl.appendChild(cursorEl);

    const initialWordCount =
      testMode === 'words' ? (testLimit === 0 ? 60 : Math.min(testLimit, 60)) : 60;
    appendWords(initialWordCount);

    wordElements = Array.from(wordsWrapperEl.querySelectorAll('.word'));
    wordElements[0]?.classList.add('active');

    updateLiveHUD();
    checkLineShift();
    wordsWrapperEl?.focus({ preventScroll: true });
    setTimeout(() => updateCursor(), 50);
  }

  async function selectMode(newMode) {
    if (newMode === testMode) return;
    testMode = newMode;
    testLimit = testMode === 'words' ? 35 : 30;
    await setupGame();
  }

  async function selectLimit(val) {
    testLimit = val;
    await setupGame();
  }

  async function promptCustomLimit() {
    const input = prompt(
      `Enter custom ${testMode} limit (Enter 0 for infinite):`,
      testLimit
    );
    if (input !== null) {
      const parsed = parseInt(input.trim(), 10);
      if (!isNaN(parsed) && parsed >= 0) {
        testLimit = parsed;
        await setupGame();
      }
    }
  }

  async function selectDataset(key) {
    currentDatasetKey = key;
    isDropdownOpen = false;
    await setupGame();
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);
    setupGame();

    return () => {
      stopTimer();
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  const standardOptions = $derived(
    testMode === 'time' ? [10, 20, 60, 100] : [10, 35, 70, 100]
  );
  const isCustomLimit = $derived(!standardOptions.includes(testLimit));
</script>

{#if completedStats}
  <ResultsView stats={completedStats} onRestart={setupGame} />
{:else}
  <div id="test-config-bar" class="test-config-bar">
    <div class="config-group dataset-group">
      <button
        id="dataset-picker-btn"
        type="button"
        class="config-btn"
        onclick={(e) => {
          e.stopPropagation();
          isDropdownOpen = !isDropdownOpen;
        }}
      >
        🌐 <span id="current-dataset-label">{currentDatasetName}</span>
      </button>

      {#if isDropdownOpen}
        <div id="dataset-dropdown" class="config-dropdown" style="display: block;">
          <div class="dropdown-search">
            <input
              type="text"
              id="modal-search-input"
              placeholder="search wordlist..."
              autocomplete="off"
              bind:value={searchQuery}
            />
          </div>
          <div class="dropdown-list" id="modal-dataset-list">
            {#if filteredDatasetKeys.length === 0}
              <div class="dropdown-empty">No wordlists found</div>
            {:else}
              {#each filteredDatasetKeys as key (key)}
                <button
                  type="button"
                  class="dropdown-item"
                  class:selected={key === currentDatasetKey}
                  onclick={() => selectDataset(key)}
                >
                  <span class="item-check">{key === currentDatasetKey ? '✓' : ''}</span>
                  <span class="item-title">{DATASET_REGISTRY[key].name}</span>
                </button>
              {/each}
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <div class="config-group mode-group">
      <button
        type="button"
        class="config-option-btn"
        class:active={testMode === 'time'}
        onclick={() => selectMode('time')}
      >
        time
      </button>
      <button
        type="button"
        class="config-option-btn"
        class:active={testMode === 'words'}
        onclick={() => selectMode('words')}
      >
        words
      </button>
    </div>

    <div class="config-group suboptions-group" id="suboptions-container">
      {#each standardOptions as val (val)}
        <button
          type="button"
          class="config-option-btn"
          class:active={testLimit === val}
          onclick={() => selectLimit(val)}
        >
          {val}
        </button>
      {/each}
      <button
        type="button"
        class="config-option-btn"
        class:active={isCustomLimit}
        title="Set custom limit (0 = infinite)"
        onclick={promptCustomLimit}
      >
        🛠️ {isCustomLimit ? (testLimit === 0 ? '∞' : testLimit) : ''}
      </button>
    </div>
  </div>

  <div id="live-hud" class="live-hud">
    <span id="hud-counter">0 / 35</span>
  </div>

  <div id="typing-viewport" class="typing-viewport">
    <div id="words-wrapper" tabindex="0" class="words-wrapper" bind:this={wordsWrapperEl}>
      <div id="cursor" class="cursor blink"></div>
    </div>
  </div>

  <button
    id="shuffle-button2"
    type="button"
    aria-label="Shuffle / Wordsets"
    onclick={setupGame}
  >
    ↻&#xFE0E;
  </button>
{/if}