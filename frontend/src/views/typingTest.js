import { DATASET_REGISTRY, getWordlist } from '../services/testConfigService.js';
import { renderResultsScreen } from './resultsView.js';
import { recordTestResult, getLocalTestHistory, saveToLocalStorage } from '../services/historyService.js';

// ==========================================
// CONFIGURATION & GLOBAL STATE VARIABLES
// ==========================================
let currentDatasetKey = 'english-200';
let testMode = 'words'; // 'time' or 'words'
let testLimit = 35;     // 10, 35, 70, 100 or 0 for infinite
let activeWordsPool = [];

// ==========================================
// GAME RUNTIME & DOM REFERENCE VARIABLES
// ==========================================
let currentWordIndex = 0;
let currentLetterIndex = 0;
let keydownHandler = null;

let cursorEl = null;
let gameBoxEl = null;
let wordsWrapperEl = null;
let mobileInputEl = null;
let wordElements = [];
let hasStarted = false;
let isDropdownOpen = false;

// ==========================================
// TIMER & TELEMETRY VARIABLES
// ==========================================
let timerInterval = null;
let timeLeft = 30; 
let timeElapsed = 0;

let charsCorrect = 0;
let charsIncorrect = 0;
let charsExtra = 0;
let charsMissed = 0;
let perSecondWpmLog = [];

/**
 * Main initialization called by navigation.js
 */
export async function initTypingGame() {
    cleanupTypingGame();

    gameBoxEl = document.querySelector('#view-container');
    if (!gameBoxEl) return;

    currentWordIndex = 0;
    currentLetterIndex = 0;
    hasStarted = false;
    isDropdownOpen = false;

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
    const currentDatasetName = DATASET_REGISTRY[currentDatasetKey]?.name || currentDatasetKey;

    gameBoxEl.innerHTML = `
        <!-- HIDDEN INPUT FOR MOBILE KEYBOARD TRIGGER -->
        <textarea id="mobile-keyboard-input" aria-label="Mobile typing input" autocapitalize="off" autocorrect="off" autocomplete="off" spellcheck="false" style="position: absolute; opacity: 0; pointer-events: none; height: 0; width: 0;"></textarea>

        <!-- TOP CONFIG BAR -->
        <div id="test-config-bar" class="test-config-bar">
            <div class="config-group dataset-group">
                <button id="dataset-picker-btn" class="config-btn">
                    🌐 <span id="current-dataset-label">${currentDatasetName}</span>
                </button>
                <div id="dataset-dropdown" class="config-dropdown" style="display: none;">
                    <div class="dropdown-search">
                        <input type="text" id="modal-search-input" placeholder="search wordlist..." autocomplete="off" />
                    </div>
                    <div class="dropdown-list" id="modal-dataset-list"></div>
                </div>
            </div>

            <div class="config-group mode-group">
                <button class="config-option-btn ${testMode === 'time' ? 'active' : ''}" data-mode="time">time</button>
                <button class="config-option-btn ${testMode === 'words' ? 'active' : ''}" data-mode="words">words</button>
            </div>

            <div class="config-group suboptions-group" id="suboptions-container"></div>
        </div>

        <!-- LIVE TEST HUD -->
        <div id="live-hud" class="live-hud">
            <span id="hud-counter">0 / 35</span>
        </div>

        <!-- SPLIT VIEWPORT ARCHITECTURE -->
        <div id="typing-viewport" class="typing-viewport">
            <div id="words-wrapper" class="words-wrapper">
                <div id="cursor" class="cursor blink"></div>
            </div>
        </div>
    `;

    cursorEl = document.getElementById('cursor');
    wordsWrapperEl = document.getElementById('words-wrapper');
    mobileInputEl = document.getElementById('mobile-keyboard-input');

    setupConfigBarListeners();
    renderSubOptions();

    const initialWordCount = testMode === 'words' ? (testLimit === 0 ? 60 : Math.min(testLimit, 60)) : 60;
    appendWords(initialWordCount);

    wordElements = Array.from(wordsWrapperEl.querySelectorAll('.word'));
    wordElements[0]?.classList.add('active');

    updateLiveHUD();

    // Event listeners for physical & mobile keyboards
    keydownHandler = handleKeyDown;
    window.addEventListener('keydown', keydownHandler);

    gameBoxEl.addEventListener('click', () => {
        mobileInputEl?.focus();
    });

    mobileInputEl?.addEventListener('input', (e) => {
        const val = e.target.value;
        if (!val) return;
        const char = val[val.length - 1];
        e.target.value = '';
        processTypedKey(char);
    });

    mobileInputEl?.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            processTypedKey('Backspace');
        }
    });

    checkLineShift();
    setTimeout(() => updateCursor(), 50);
}

export function cleanupTypingGame() {
    stopTimer();
    if (keydownHandler) {
        window.removeEventListener('keydown', keydownHandler);
        keydownHandler = null;
    }
    closeDropdown();
    wordElements = [];
    cursorEl = null;
    gameBoxEl = null;
    wordsWrapperEl = null;
    mobileInputEl = null;
}

function setupConfigBarListeners() {
    const datasetBtn = document.getElementById('dataset-picker-btn');
    const dropdown = document.getElementById('dataset-dropdown');
    const searchInput = document.getElementById('modal-search-input');

    datasetBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        isDropdownOpen = !isDropdownOpen;
        dropdown.style.display = isDropdownOpen ? 'block' : 'none';
        if (isDropdownOpen) {
            renderOptions('');
            setTimeout(() => searchInput?.focus(), 50);
        }
    });

    document.addEventListener('click', (e) => {
        if (!document.getElementById('test-config-bar')?.contains(e.target)) {
            closeDropdown();
        }
    });

    searchInput?.addEventListener('input', (e) => renderOptions(e.target.value));

    document.querySelector('.mode-group')?.addEventListener('click', async (e) => {
        const btn = e.target.closest('.config-option-btn');
        if (!btn) return;
        
        const newMode = btn.getAttribute('data-mode');
        if (newMode === testMode) return;
        
        testMode = newMode;
        testLimit = testMode === 'words' ? 35 : 30; 
        await initTypingGame();
    });
}

function renderSubOptions() {
    const container = document.getElementById('suboptions-container');
    if (!container) return;
    container.innerHTML = '';

    const standardOptions = testMode === 'time' ? [10, 20, 60, 100] : [10, 35, 70, 100];
    const isCustom = !standardOptions.includes(testLimit);
    const fragment = document.createDocumentFragment();

    standardOptions.forEach(val => {
        const btn = document.createElement('button');
        btn.className = `config-option-btn ${testLimit === val ? 'active' : ''}`;
        btn.innerText = val;
        btn.addEventListener('click', async () => {
            testLimit = val;
            await initTypingGame();
        });
        fragment.appendChild(btn);
    });

    const customBtn = document.createElement('button');
    customBtn.className = `config-option-btn ${isCustom ? 'active' : ''}`;
    customBtn.innerHTML = `🛠️ ${isCustom ? (testLimit === 0 ? '∞' : testLimit) : ''}`;
    customBtn.title = "Set custom limit (0 = infinite)";

    customBtn.addEventListener('click', async () => {
        const input = prompt(`Enter custom ${testMode} limit (Enter 0 for infinite):`, testLimit);
        if (input !== null) {
            const parsed = parseInt(input.trim(), 10);
            if (!isNaN(parsed) && parsed >= 0) {
                testLimit = parsed;
                await initTypingGame();
            }
        }
    });
    fragment.appendChild(customBtn);
    container.appendChild(fragment);
}

function closeDropdown() {
    isDropdownOpen = false;
    const dropdown = document.getElementById('dataset-dropdown');
    if (dropdown) dropdown.style.display = 'none';
}

function renderOptions(filterQuery = '') {
    const listContainer = document.getElementById('modal-dataset-list');
    if (!listContainer) return;
    
    const query = filterQuery.toLowerCase().trim();
    const fragment = document.createDocumentFragment();

    const matchedKeys = Object.keys(DATASET_REGISTRY).filter((key) => {
        const item = DATASET_REGISTRY[key];
        return item.name.toLowerCase().includes(query) || key.toLowerCase().includes(query);
    });

    if (matchedKeys.length === 0) {
        listContainer.innerHTML = `<div class="dropdown-empty">No wordlists found</div>`;
        return;
    }
    
    listContainer.innerHTML = '';
    matchedKeys.forEach((key) => {
        const item = DATASET_REGISTRY[key];
        const isSelected = key === currentDatasetKey;

        const row = document.createElement('div');
        row.className = `dropdown-item ${isSelected ? 'selected' : ''}`;
        row.innerHTML = `
            <span class="item-check">${isSelected ? '✓' : ''}</span>
            <span class="item-title">${item.name}</span>
        `;

        row.addEventListener('click', async () => {
            currentDatasetKey = key;
            closeDropdown();
            await initTypingGame();
        });
        fragment.appendChild(row);
    });
    listContainer.appendChild(fragment);
}

function appendWords(count = 30) {
    if (!wordsWrapperEl || !activeWordsPool || activeWordsPool.length === 0) return;
    if (testMode === 'words' && testLimit > 0 && wordElements.length >= testLimit) return;

    const fragment = document.createDocumentFragment();
    const loopCount = (testMode === 'words' && testLimit > 0) ? testLimit : count;

    for (let i = 0; i < loopCount; i++) {
        const randomIndex = Math.floor(Math.random() * activeWordsPool.length);
        const word = activeWordsPool[randomIndex];

        const wordDiv = document.createElement('div');
        wordDiv.classList.add('word');

        for (let char of word) {
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
        const currentRawWpm = minutesSoFar > 0 ? Math.round(((charsCorrect + charsIncorrect) / 5) / minutesSoFar) : 0;
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
        hudCounter.textContent = testLimit === 0 ? `Time: ${timeElapsed}s (∞)` : `Time: ${timeLeft}s`;
    }
}

function handleKeyDown(event) {
    if (isDropdownOpen) return;
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(event.key)) return;
    if (event.key === ' ') event.preventDefault();
    processTypedKey(event.key);
}

function processTypedKey(key) {
    if (!hasStarted) {
        hasStarted = true;
        cursorEl?.classList.remove('blink');
        startTimer();
    }

    const activeWord = wordElements[currentWordIndex];
    if (!activeWord) return;
    const letters = activeWord.children;

    if (key === ' ') {
        if (currentLetterIndex === 0) return;

        if (currentLetterIndex < letters.length) {
            charsMissed += (letters.length - currentLetterIndex);
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

    if (key === 'Backspace') {
        if (currentLetterIndex > 0) {
            currentLetterIndex--;
            const target = letters[currentLetterIndex];
            if (target.classList.contains('correct')) charsCorrect--;
            if (target.classList.contains('incorrect')) charsIncorrect--;
            target.classList.remove('correct', 'incorrect');
        } else if (currentWordIndex > 0) {
            const prevWord = wordElements[currentWordIndex - 1];
            const prevLetters = prevWord.children;

            const hasActivity = prevWord.querySelector('.letter.incorrect, .letter.correct') !== null || 
                                prevWord.dataset.typedIndex !== undefined;

            if (hasActivity) {
                activeWord.classList.remove('active');
                currentWordIndex--;
                currentLetterIndex = prevWord.dataset.typedIndex !== undefined 
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

    if (key.length === 1) {
        if (currentLetterIndex < letters.length) {
            const targetLetter = letters[currentLetterIndex];
            if (key === targetLetter.textContent) {
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

function finishTest() {
    stopTimer();
    window.removeEventListener('keydown', keydownHandler);

    const actualTimeMinutes = Math.max(timeElapsed, 1) / 60;
    const totalTypedChars = charsCorrect + charsIncorrect + charsExtra;

    const rawWpm = Math.round(((totalTypedChars / 5) / actualTimeMinutes));
    const netWpm = Math.max(0, Math.round(((charsCorrect / 5) - charsIncorrect) / actualTimeMinutes));
    const accuracy = totalTypedChars > 0 ? Math.round((charsCorrect / totalTypedChars) * 100) : 100;

    let consistency = 100;
    if (perSecondWpmLog.length > 1) {
        const mean = perSecondWpmLog.reduce((a, b) => a + b, 0) / perSecondWpmLog.length;
        const variance = perSecondWpmLog.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / perSecondWpmLog.length;
        const stdDev = Math.sqrt(variance);
        consistency = Math.max(0, Math.round(100 - (stdDev / (mean || 1)) * 100));
    }

    const statsData = {
        wpm: netWpm,
        rawWpm: rawWpm,
        accuracy: accuracy,
        consistency: consistency,
        timeElapsed: timeElapsed,
        charsCorrect,
        charsIncorrect,
        charsExtra,
        charsMissed,
        testMode,
        testLimit,
        datasetName: DATASET_REGISTRY[currentDatasetKey]?.name || currentDatasetKey,
        perSecondWpmLog
    };

    recordTestResult(statsData);
    const currentHistory = getLocalTestHistory();
    console.log(`Test completed! Total records now in local storage: ${currentHistory.length}`);
    renderResultsScreen(statsData);
}

export function updateCursor() {
    const activeWord = wordElements[currentWordIndex];
    if (!activeWord || !cursorEl || !wordsWrapperEl) return;

    const letters = activeWord.children;
    if (letters.length === 0) return;

    const wrapperRect = wordsWrapperEl.getBoundingClientRect();
    let targetLetter;
    let left, top;

    if (currentLetterIndex >= letters.length) {
        targetLetter = letters[letters.length - 1];
        const letterRect = targetLetter.getBoundingClientRect();
        left = letterRect.right - wrapperRect.left;
        top = letterRect.top - wrapperRect.top;
    } else {
        targetLetter = letters[currentLetterIndex];
        const letterRect = targetLetter.getBoundingClientRect();
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