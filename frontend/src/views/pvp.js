// pvp.js
import { connectPvpRoom, sendPvpMessage, disconnectPvpRoom } from '../services/pvpService.js';
import { DATASET_REGISTRY } from '../services/testConfigService.js';
import { createRaceController } from './pvpRaceController.js';

let currentRoomId = null;
let currentUsername = 'Player_' + Math.floor(Math.random() * 1000);
let roomHost = null;
let currentDatasetKey = 'english-200';
let isDropdownOpen = false;

let testMode = 'words';
let testLimit = 35;
const ROUND_PRESETS = [1, 3, 5, 7];
const MAX_CUSTOM_ROUNDS = 25;
let testRounds = 3;
let roundsCustomMode = false;

// Handle to the live race controller so navigation can tear it down
let activeRace = null;

/**
 * Call when leaving the PvP route (see navigation.js). Stops the engine's
 * keydown listener, timers and the WebSocket without triggering UI callbacks.
 */
export function cleanupPvp() {
  activeRace?.destroy();
  activeRace = null;
  currentRoomId = null;
  disconnectPvpRoom();
}

export function renderPvp() {
  const currentDatasetName = DATASET_REGISTRY[currentDatasetKey]?.name || currentDatasetKey;

  return `
    <div class="pvp-card-compact" id="pvp-main-wrapper">
      <h2>PvP Mode ⚔</h2>
      <p>Multiplayer live typing battle (Max 4)</p>
      
      <!-- MODE SELECTION TABS -->
      <div class="pvp-mode-tabs">
        <button id="tab-quick-match" class="btn-primary pvp-btn-sm">Quick Match</button>
        <button id="tab-custom-rooms" class="btn-secondary pvp-btn-sm">Custom Room</button>
      </div>

      <!-- QUICK MATCH VIEW -->
      <div id="view-quick-match" class="pvp-section">
        <button id="find-match-btn" class="btn-primary pvp-btn-full">Find Public Match</button>
      </div>

      <!-- CUSTOM ROOMS VIEW -->
      <div id="view-custom-rooms" class="pvp-section" style="display: none;">
        <div class="pvp-config-box">
          <div class="compact-input-group">
            <input type="text" id="room-code-input" class="pvp-input" placeholder="ENTER ROOM CODE" />
            <button id="submit-join-btn" class="btn-secondary pvp-btn-sm">Join Room</button>
          </div>
          <div class="pvp-divider-text">- OR -</div>
          <button id="show-create-config-btn" class="btn-primary pvp-btn-full">Create New Room</button>
        </div>
      </div>

      <!-- CREATE ROOM CONFIGURATION VIEW -->
      <div id="view-create-config" class="pvp-section" style="display: none;">
        <div class="pvp-config-box">
          <div class="pvp-config-heading">Configure Room Settings</div>
          
          <div class="pvp-label">Wordlist:</div>
          <div class="config-group dataset-group pvp-relative">
            <button id="dataset-picker-btn" class="config-btn pvp-dataset-picker">
              🌐 <span id="current-dataset-label">${currentDatasetName}</span>
            </button>
            <div id="dataset-dropdown" class="config-dropdown pvp-dropdown-menu">
              <div class="dropdown-search pvp-dropdown-search-wrap">
                <input type="text" id="modal-search-input" class="pvp-search-input" placeholder="search wordlist..." autocomplete="off" />
              </div>
              <div class="dropdown-list" id="modal-dataset-list"></div>
            </div>
          </div>

          <div class="pvp-label">Test Mode & Limit:</div>
          <div class="pvp-flex-row">
            <div class="config-group mode-group pvp-mode-buttons">
              <button class="config-option-btn mode-btn ${testMode === 'time' ? 'btn-primary' : 'btn-secondary'} pvp-config-pill" data-mode="time">time</button>
              <button class="config-option-btn mode-btn ${testMode === 'words' ? 'btn-primary' : 'btn-secondary'} pvp-config-pill" data-mode="words">words</button>
            </div>
            <div id="suboptions-container" class="pvp-suboptions"></div>
          </div>

          <div class="pvp-label">Rounds:</div>
          <div id="rounds-container" class="pvp-rounds-flex"></div>

          <div class="pvp-action-row">
            <button id="back-to-custom-btn" class="btn-secondary pvp-btn-flex1">Back</button>
            <button id="confirm-create-btn" class="btn-primary pvp-btn-success">Create & Launch 🚀</button>
          </div>
        </div>
      </div>

      <!-- WAITING / ACTIVE LOBBY VIEW -->
      <div id="pvp-room-view" style="display: none;">
        <div class="pvp-room-box">
          <div class="pvp-room-row">
            <span class="pvp-room-code-label">Room: <strong id="display-room-code" class="pvp-highlight">----</strong></span>
            <span class="pvp-player-count-label">Players: <strong id="player-count" class="pvp-highlight">1/4</strong></span>
          </div>

          <div class="pvp-config-badge">
            Config: <strong id="display-config" class="pvp-white-text">${currentDatasetName} (${testMode}: ${testLimit})</strong>
          </div>

          <button id="start-match-btn" class="btn-primary pvp-start-match-btn">Start Match 🚀</button>
          <div id="waiting-host-msg" class="pvp-text-muted-center">Waiting for host to start...</div>

          <button id="leave-room-btn" class="btn-danger pvp-leave-btn">Leave Room</button>
        </div>
      </div>
    </div>
  `;
}

export function setupPvpEvents(container) {
  const tabQuickMatch = container.querySelector('#tab-quick-match');
  const tabCustomRooms = container.querySelector('#tab-custom-rooms');
  const viewQuickMatch = container.querySelector('#view-quick-match');
  const viewCustomRooms = container.querySelector('#view-custom-rooms');
  const viewCreateConfig = container.querySelector('#view-create-config');
  
  const showCreateConfigBtn = container.querySelector('#show-create-config-btn');
  const backToCustomBtn = container.querySelector('#back-to-custom-btn');
  const confirmCreateBtn = container.querySelector('#confirm-create-btn');
  
  const datasetBtn = container.querySelector('#dataset-picker-btn');
  const dropdown = container.querySelector('#dataset-dropdown');
  const searchInput = container.querySelector('#modal-search-input');
  const datasetLabel = container.querySelector('#current-dataset-label');
  const modeGroup = container.querySelector('.mode-group');
  const suboptionsContainer = container.querySelector('#suboptions-container');
  
  const submitJoinBtn = container.querySelector('#submit-join-btn');
  const roomCodeInput = container.querySelector('#room-code-input');
  const roomView = container.querySelector('#pvp-room-view');
  const displayRoomCode = container.querySelector('#display-room-code');
  const displayConfig = container.querySelector('#display-config');
  const playerCountDisplay = container.querySelector('#player-count');
  const startMatchBtn = container.querySelector('#start-match-btn');
  const waitingHostMsg = container.querySelector('#waiting-host-msg');
  const leaveRoomBtn = container.querySelector('#leave-room-btn');
  const findMatchBtn = container.querySelector('#find-match-btn');

  const roundsContainer = container.querySelector('#rounds-container');

  let race = null;

  function initRaceController() {
    return createRaceController({
      username: currentUsername,
      els: {
        typingContainer: container.querySelector('#pvp-typing-viewport'),
        countdown: container.querySelector('#pvp-countdown'),
        scoreboard: container.querySelector('#pvp-scoreboard'),
        roundLabel: container.querySelector('#pvp-round-label'),
      },
      onMatchOver: () => {
        restoreLobbyView();
      },
    });
  }

  renderRoundOptions();

  function renderRoundOptions() {
    if (!roundsContainer) return;
    const isCustom = roundsCustomMode || !ROUND_PRESETS.includes(testRounds);
    roundsContainer.innerHTML = '';

    ROUND_PRESETS.forEach((n) => {
      const btn = document.createElement('button');
      btn.className = `config-option-btn ${!isCustom && testRounds === n ? 'btn-primary' : 'btn-secondary'} pvp-config-pill`;
      btn.textContent = n;
      btn.addEventListener('click', () => {
        roundsCustomMode = false;
        testRounds = n;
        renderRoundOptions();
      });
      roundsContainer.appendChild(btn);
    });

    const customBtn = document.createElement('button');
    customBtn.className = `config-option-btn ${isCustom ? 'btn-primary' : 'btn-secondary'} pvp-config-pill`;
    customBtn.textContent = 'Custom';
    customBtn.addEventListener('click', () => {
      roundsCustomMode = true;
      renderRoundOptions();
      roundsContainer.querySelector('input')?.focus();
    });
    roundsContainer.appendChild(customBtn);

    if (isCustom) {
      const input = document.createElement('input');
      input.type = 'number';
      input.min = '1';
      input.max = String(MAX_CUSTOM_ROUNDS);
      input.value = testRounds;
      input.className = 'pvp-input';
      input.style.width = '56px';
      input.style.padding = '3px 6px';
      input.style.fontSize = '0.75rem';
      input.addEventListener('input', () => {
        const v = parseInt(input.value, 10);
        if (!Number.isNaN(v)) testRounds = Math.min(MAX_CUSTOM_ROUNDS, Math.max(1, v));
      });
      input.addEventListener('change', () => { input.value = testRounds; });
      roundsContainer.appendChild(input);
    }
  }

  function buildRoomConfig() {
    return {
      dataset_key: currentDatasetKey,
      test_mode: testMode,
      test_limit: testLimit > 0 ? testLimit : (testMode === 'words' ? 35 : 30),
      rounds: testRounds,
    };
  }

  function applyRoomConfig(cfg) {
    const name = DATASET_REGISTRY[cfg.dataset_key]?.name || cfg.dataset_key;
    if (displayConfig) {
      displayConfig.textContent = `${name} (${cfg.test_mode}: ${cfg.test_limit} · ${cfg.rounds} round${cfg.rounds === 1 ? '' : 's'})`;
    }
  }

  renderSubOptions();

  function renderSubOptions() {
    if (!suboptionsContainer) return;
    suboptionsContainer.innerHTML = '';

    const standardOptions = testMode === 'time' ? [10, 20, 60, 100] : [10, 35, 70, 100];
    const isCustom = !standardOptions.includes(testLimit);
    const fragment = document.createDocumentFragment();

    standardOptions.forEach(val => {
      const btn = document.createElement('button');
      btn.className = `config-option-btn ${testLimit === val ? 'btn-primary' : 'btn-secondary'} pvp-config-pill`;
      btn.innerText = val;
      btn.addEventListener('click', () => {
        testLimit = val;
        renderSubOptions();
      });
      fragment.appendChild(btn);
    });

    const customBtn = document.createElement('button');
    customBtn.className = `config-option-btn ${isCustom ? 'btn-primary' : 'btn-secondary'} pvp-config-pill`;
    customBtn.innerHTML = `🛠️ ${isCustom ? (testLimit === 0 ? '∞' : testLimit) : ''}`;
    customBtn.title = "Set custom limit (0 = infinite)";

    customBtn.addEventListener('click', () => {
      const input = prompt(`Enter custom ${testMode} limit (Enter 0 for infinite):`, testLimit);
      if (input !== null) {
        const parsed = parseInt(input.trim(), 10);
        if (!isNaN(parsed) && parsed >= 0) {
          testLimit = parsed;
          renderSubOptions();
        }
      }
    });
    fragment.appendChild(customBtn);
    suboptionsContainer.appendChild(fragment);
  }

  modeGroup?.addEventListener('click', (e) => {
    const btn = e.target.closest('.config-option-btn');
    if (!btn) return;
    const newMode = btn.getAttribute('data-mode');
    if (newMode === testMode) return;

    testMode = newMode;
    testLimit = testMode === 'words' ? 35 : 30;

    modeGroup.querySelectorAll('.config-option-btn').forEach(b => {
      b.className = 'config-option-btn mode-btn btn-secondary pvp-config-pill';
    });
    btn.className = 'config-option-btn mode-btn btn-primary pvp-config-pill';

    renderSubOptions();
  });

  if (tabQuickMatch && tabCustomRooms) {
    tabQuickMatch.addEventListener('click', () => {
      viewQuickMatch.style.display = 'block';
      viewCustomRooms.style.display = 'none';
      viewCreateConfig.style.display = 'none';
      closeDropdown();
      tabQuickMatch.className = 'btn-primary pvp-btn-sm';
      tabCustomRooms.className = 'btn-secondary pvp-btn-sm';
    });
    tabCustomRooms.addEventListener('click', () => {
      viewCustomRooms.style.display = 'block';
      viewQuickMatch.style.display = 'none';
      viewCreateConfig.style.display = 'none';
      tabCustomRooms.className = 'btn-primary pvp-btn-sm';
      tabQuickMatch.className = 'btn-secondary pvp-btn-sm';
    });
  }

  if (showCreateConfigBtn) {
    showCreateConfigBtn.addEventListener('click', () => {
      viewCustomRooms.style.display = 'none';
      viewCreateConfig.style.display = 'block';
    });
  }

  if (backToCustomBtn) {
    backToCustomBtn.addEventListener('click', () => {
      closeDropdown();
      viewCreateConfig.style.display = 'none';
      viewCustomRooms.style.display = 'block';
    });
  }

  datasetBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    isDropdownOpen = !isDropdownOpen;
    dropdown.style.display = isDropdownOpen ? 'block' : 'none';
    if (isDropdownOpen) {
      renderOptions('');
      setTimeout(() => searchInput?.focus(), 50);
    }
  });

  container.addEventListener('click', (e) => {
    if (!container.querySelector('.dataset-group')?.contains(e.target)) {
      closeDropdown();
    }
  });

  searchInput?.addEventListener('input', (e) => renderOptions(e.target.value));

  function closeDropdown() {
    isDropdownOpen = false;
    if (dropdown) dropdown.style.display = 'none';
  }

  function renderOptions(filterQuery = '') {
    const listContainer = container.querySelector('#modal-dataset-list');
    if (!listContainer) return;
    
    const query = filterQuery.toLowerCase().trim();
    const fragment = document.createDocumentFragment();

    const matchedKeys = Object.keys(DATASET_REGISTRY).filter((key) => {
      const item = DATASET_REGISTRY[key];
      return item.name.toLowerCase().includes(query) || key.toLowerCase().includes(query);
    });

    if (matchedKeys.length === 0) {
      listContainer.innerHTML = `<div class="dropdown-empty" style="padding: 8px; font-size: 0.75rem; color: #888; text-align: center;">No wordlists found</div>`;
      return;
    }
    
    listContainer.innerHTML = '';
    matchedKeys.forEach((key) => {
      const item = DATASET_REGISTRY[key];
      const isSelected = key === currentDatasetKey;

      const row = document.createElement('div');
      row.className = `dropdown-item ${isSelected ? 'selected' : ''}`;
      row.style.cssText = `padding: 6px 8px; font-size: 0.75rem; cursor: pointer; display: flex; justify-content: space-between; color: ${isSelected ? '#fbbf24' : '#ccc'}; background: ${isSelected ? 'rgba(251,191,36,0.1)' : 'transparent'};`;
      row.innerHTML = `
        <span class="item-title">${item.name}</span>
        <span class="item-check">${isSelected ? '✓' : ''}</span>
      `;

      row.addEventListener('click', () => {
        currentDatasetKey = key;
        if (datasetLabel) datasetLabel.textContent = item.name;
        closeDropdown();
      });
      fragment.appendChild(row);
    });
    listContainer.appendChild(fragment);
  }

  function enterRoom(roomId, action) {
    currentRoomId = roomId;
    connectPvpRoom(roomId, currentUsername, action, {
      onOpen: () => {
        const modeTabs = container.querySelector('.pvp-mode-tabs');
        if (modeTabs) modeTabs.style.display = 'none';
        viewQuickMatch.style.display = 'none';
        viewCustomRooms.style.display = 'none';
        viewCreateConfig.style.display = 'none';
        
        closeDropdown();
        if (roomView) roomView.style.display = 'block';
        if (displayRoomCode) displayRoomCode.textContent = roomId;

        if (action === 'create') sendPvpMessage('update_config', buildRoomConfig());
      },
      onMessage: (data) => {
        if (data.host) {
          roomHost = data.host;
          const isHost = roomHost === currentUsername;
          if (startMatchBtn) startMatchBtn.style.display = isHost ? 'block' : 'none';
          if (waitingHostMsg) waitingHostMsg.style.display = isHost ? 'none' : 'block';
        }

        if (data.total_players !== undefined && data.max_players !== undefined && playerCountDisplay) {
          playerCountDisplay.textContent = `${data.total_players}/${data.max_players}`;
        }

        if (data.config) applyRoomConfig(data.config);

        if (data.event === 'start_game') {
          const mainWrapper = container.querySelector('#pvp-main-wrapper');
          if (mainWrapper) {
            mainWrapper.outerHTML = `
              <div style="width: 100%; max-width: 1100px; margin: 2rem auto 1rem; padding: 0 15px; box-sizing: border-box;" id="pvp-active-race-root">
                <div id="pvp-round-label" style="color: #fbbf24; font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem; text-align: center; font-family: 'JetBrains Mono', monospace;">Get ready…</div>
                <div id="pvp-scoreboard" style="width: 100%; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 10px;"></div>
              </div>
              <div class="pvp-live-hud" style="width: 100%; max-width: 1100px; margin: 0 auto 8px auto; box-sizing: border-box; padding: 0 15px;">
                <span class="pvp-hud-counter">0 / ${testLimit}</span>
              </div>
              <div style="position: relative; width: calc(100% - 30px); max-width: 1100px; margin: 0 auto;">
                <div class="pvp-typing-viewport" id="pvp-typing-viewport">
                  <div id="pvp-words-wrapper" class="pvp-words-wrapper">
                    <div class="pvp-cursor blink"></div>
                  </div>
                </div>
                <div id="pvp-countdown" class="pvp-countdown-box"></div>
              </div>
            `;
          }

          race = initRaceController();
          activeRace = race;
        }

        race?.handle(data);
      },
      onError: () => leaveRoomStateOnly(),
      onClose: () => leaveRoomStateOnly(),
    });
  }

  function restoreLobbyView() {
    race?.destroy();
    race = null;
    activeRace = null;
    currentRoomId = null;
    
    container.innerHTML = renderPvp();
    setupPvpEvents(container);
  }

  function leaveRoomStateOnly() {
    restoreLobbyView();
  }

  if (confirmCreateBtn) {
    confirmCreateBtn.addEventListener('click', () => {
      const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
      enterRoom(randomCode, 'create');
    });
  }

  if (submitJoinBtn) {
    submitJoinBtn.addEventListener('click', () => {
      const code = roomCodeInput.value.trim().toUpperCase();
      if (code) {
        enterRoom(code, 'join');
      } else {
        alert('Please enter a valid room code.');
      }
    });
  }

  if (startMatchBtn) {
    startMatchBtn.addEventListener('click', () => sendPvpMessage('start_game'));
  }

  if (findMatchBtn) {
    findMatchBtn.addEventListener('click', () => alert('Matchmaking queue starting...'));
  }

  if (leaveRoomBtn) {
    leaveRoomBtn.addEventListener('click', () => {
      disconnectPvpRoom();
      leaveRoomStateOnly();
    });
  }
}