// pvp.js
import { connectPvpRoom, sendPvpMessage, disconnectPvpRoom } from '../services/pvpService.js';
import { DATASET_REGISTRY } from '../services/testConfigService.js';

let currentRoomId = null;
let currentUsername = 'Player_' + Math.floor(Math.random() * 1000); // Or pull from user auth profile
let roomHost = null;
let currentDatasetKey = 'english-200'; // Default dataset key
let isDropdownOpen = false;

// PvP Test Configuration State
let testMode = 'words'; // 'time' or 'words'
let testLimit = 35;     // 10, 35, 70, 100 or custom

// 1. COMPACT TEMPLATE FUNCTION WITH CONFIG VIEW, DATASET SELECTOR, AND TIME/WORDS LIMITS
export function renderPvp() {
  const currentDatasetName = DATASET_REGISTRY[currentDatasetKey]?.name || currentDatasetKey;
  const standardOptions = testMode === 'time' ? [10, 20, 60, 100] : [10, 35, 70, 100];
  const isCustom = !standardOptions.includes(testLimit);

  return `
    <div class="pvp-card-compact">
      <h2>PvP Mode ⚔</h2>
      <p>Multiplayer live typing battle (Max 6)</p>
      
      <!-- MODE SELECTION TABS -->
      <div class="pvp-mode-tabs" style="display: flex; gap: 8px; margin-bottom: 14px;">
        <button id="tab-quick-match" class="btn-primary" style="padding: 6px 12px; font-size: 0.85rem;">Quick Match</button>
        <button id="tab-custom-rooms" class="btn-secondary" style="padding: 6px 12px; font-size: 0.85rem;">Custom Room</button>
      </div>

      <!-- QUICK MATCH VIEW -->
      <div id="view-quick-match" class="pvp-section" style="margin-top: 0;">
        <button id="find-match-btn" class="btn-primary" style="width: 100%; padding: 8px;">Find Public Match</button>
      </div>

      <!-- CUSTOM ROOMS VIEW (Main Custom Menu) -->
      <div id="view-custom-rooms" class="pvp-section" style="display: none; margin-top: 0;">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          
          <!-- Join with code input bar -->
          <div class="compact-input-group" style="display: flex; gap: 6px;">
            <input type="text" id="room-code-input" placeholder="ENTER ROOM CODE" style="flex: 1; padding: 6px 8px; font-size: 0.85rem; background: transparent; border: 1px solid #333; color: #fff; border-radius: 4px;" />
            <button id="submit-join-btn" class="btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;">Join Room</button>
          </div>

          <!-- Divider text -->
          <div style="text-align: center; font-size: 0.75rem; color: #888; margin: 2px 0;">- OR -</div>

          <!-- Triggers DOM manipulation to show config view -->
          <button id="show-create-config-btn" class="btn-primary" style="width: 100%; padding: 7px; font-size: 0.8rem;">Create New Room</button>
          
        </div>
      </div>

      <!-- CREATE ROOM CONFIGURATION VIEW (DOM view inside same rectangle) -->
      <div id="view-create-config" class="pvp-section" style="display: none; margin-top: 0;">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="font-size: 0.85rem; color: #fbbf24; font-weight: bold; margin-bottom: 2px;">Configure Room Settings</div>
          
          <!-- WORDSET / DATASET PICKER -->
          <div style="font-size: 0.75rem; color: #aaa;">Wordlist:</div>
          <div class="config-group dataset-group" style="position: relative;">
            <button id="dataset-picker-btn" class="config-btn" style="width: 100%; text-align: left; padding: 6px 8px; background: #222; border: 1px solid #444; color: #fff; border-radius: 4px; font-size: 0.8rem; cursor: pointer;">
              🌐 <span id="current-dataset-label">${currentDatasetName}</span>
            </button>
            <div id="dataset-dropdown" class="config-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: #1a1a1a; border: 1px solid #444; border-radius: 4px; z-index: 10; margin-top: 4px; max-height: 150px; overflow-y: auto;">
              <div class="dropdown-search" style="padding: 6px; border-bottom: 1px solid #333;">
                <input type="text" id="modal-search-input" placeholder="search wordlist..." autocomplete="off" style="width: 100%; padding: 4px; background: #111; border: 1px solid #333; color: #fff; font-size: 0.75rem; border-radius: 3px;" />
              </div>
              <div class="dropdown-list" id="modal-dataset-list"></div>
            </div>
          </div>

          <!-- TEST MODE (time / words) -->
          <div style="font-size: 0.75rem; color: #aaa; margin-top: 2px;">Test Mode & Limit:</div>
          <div style="display: flex; gap: 6px; align-items: center;">
            <div class="config-group mode-group" style="display: flex; gap: 4px;">
              <button class="config-option-btn mode-btn ${testMode === 'time' ? 'btn-primary' : 'btn-secondary'}" data-mode="time" style="padding: 4px 8px; font-size: 0.75rem;">time</button>
              <button class="config-option-btn mode-btn ${testMode === 'words' ? 'btn-primary' : 'btn-secondary'}" data-mode="words" style="padding: 4px 8px; font-size: 0.75rem;">words</button>
            </div>
            
            <!-- SUB-OPTIONS CONTAINER -->
            <div id="suboptions-container" style="display: flex; gap: 4px; flex-wrap: wrap; flex: 1; justify-content: flex-end;"></div>
          </div>

          <div style="display: flex; gap: 6px; margin-top: 6px;">
            <button id="back-to-custom-btn" class="btn-secondary" style="flex: 1; padding: 6px; font-size: 0.8rem;">Back</button>
            <button id="confirm-create-btn" class="btn-primary" style="flex: 2; padding: 6px; font-size: 0.8rem; background-color: #22c55e;">Create & Launch 🚀</button>
          </div>
        </div>
      </div>

      <!-- WAITING / ACTIVE LOBBY VIEW -->
      <div id="pvp-room-view" style="display: none;">
        <div style="display: flex; flex-direction: column; gap: 8px; background: rgba(0,0,0,0.3); padding: 10px 12px; border-radius: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.80rem; color: #3bce16;">Room: <strong id="display-room-code" style="color:#fbbf24">----</strong></span>
            <span style="font-size: 0.80rem; color: #ccc;">Players: <strong id="player-count" style="color: #fbbf24;">1/6</strong></span>
          </div>

          <!-- Room settings badge -->
          <div style="font-size: 0.75rem; color: #93c5fd; background: rgba(59,130,246,0.1); padding: 4px 8px; border-radius: 4px; text-align: center;">
            Config: <strong id="display-config" style="color: #fff;">${currentDatasetName} (${testMode}: ${testLimit})</strong>
          </div>

          <!-- HOST START BUTTON -->
          <button id="start-match-btn" class="btn-primary" style="display: none; width: 100%; padding: 6px; font-size: 0.8rem; background-color: #22c55e;">Start Match 🚀</button>
          <div id="waiting-host-msg" style="font-size: 0.75rem; color: #aaa; text-align: center;">Waiting for host to start...</div>

          <button id="leave-room-btn" class="btn-danger" style="padding: 5px; font-size: 0.75rem; width: 100%;">Leave Room</button>
        </div>
      </div>

      <!-- LIVE TYPING RACE VIEW -->
      <div id="pvp-race-view" style="display: none; margin-top: 10px;">
        <div style="background: rgba(0,0,0,0.4); padding: 12px; border-radius: 6px; text-align: center;">
          <h3 style="color: #fbbf24; margin-bottom: 8px; font-size: 0.9rem;">Race in Progress! 🏁</h3>
          <div id="pvp-typing-container" style="font-family: monospace; font-size: 0.9rem; text-align: left; background: #111; padding: 8px; border-radius: 4px; min-height: 60px;">
            Race starting... Type your text here!
          </div>
          <div id="pvp-scoreboard" style="margin-top: 10px;"></div>
        </div>
      </div>

    </div>
  `;
}

// 2. EVENT BINDER
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
  const raceView = container.querySelector('#pvp-race-view');
  const displayRoomCode = container.querySelector('#display-room-code');
  const displayConfig = container.querySelector('#display-config');
  const playerCountDisplay = container.querySelector('#player-count');
  const startMatchBtn = container.querySelector('#start-match-btn');
  const waitingHostMsg = container.querySelector('#waiting-host-msg');
  const leaveRoomBtn = container.querySelector('#leave-room-btn');
  const findMatchBtn = container.querySelector('#find-match-btn');

  // Render Sub-options dynamically whenever view is initialized
  renderSubOptions();

  function renderSubOptions() {
    if (!suboptionsContainer) return;
    suboptionsContainer.innerHTML = '';

    const standardOptions = testMode === 'time' ? [10, 20, 60, 100] : [10, 35, 70, 100];
    const isCustom = !standardOptions.includes(testLimit);
    const fragment = document.createDocumentFragment();

    standardOptions.forEach(val => {
      const btn = document.createElement('button');
      btn.className = `config-option-btn ${testLimit === val ? 'btn-primary' : 'btn-secondary'}`;
      btn.style.cssText = 'padding: 4px 8px; font-size: 0.75rem;';
      btn.innerText = val;
      btn.addEventListener('click', () => {
        testLimit = val;
        renderSubOptions();
      });
      fragment.appendChild(btn);
    });

    const customBtn = document.createElement('button');
    customBtn.className = `config-option-btn ${isCustom ? 'btn-primary' : 'btn-secondary'}`;
    customBtn.style.cssText = 'padding: 4px 8px; font-size: 0.75rem;';
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

  // Mode button listener (time vs words)
  modeGroup?.addEventListener('click', (e) => {
    const btn = e.target.closest('.config-option-btn');
    if (!btn) return;
    const newMode = btn.getAttribute('data-mode');
    if (newMode === testMode) return;

    testMode = newMode;
    testLimit = testMode === 'words' ? 35 : 30;

    // Update active mode button styling
    modeGroup.querySelectorAll('.config-option-btn').forEach(b => {
      b.className = 'config-option-btn mode-btn btn-secondary';
      b.style.cssText = 'padding: 4px 8px; font-size: 0.75rem;';
    });
    btn.className = 'config-option-btn mode-btn btn-primary';
    btn.style.cssText = 'padding: 4px 8px; font-size: 0.75rem;';

    renderSubOptions();
  });

  // Tab Switching
  if (tabQuickMatch && tabCustomRooms) {
    tabQuickMatch.addEventListener('click', () => {
      viewQuickMatch.style.display = 'block';
      viewCustomRooms.style.display = 'none';
      viewCreateConfig.style.display = 'none';
      closeDropdown();
      tabQuickMatch.className = 'btn-primary';
      tabCustomRooms.className = 'btn-secondary';
    });
    tabCustomRooms.addEventListener('click', () => {
      viewCustomRooms.style.display = 'block';
      viewQuickMatch.style.display = 'none';
      viewCreateConfig.style.display = 'none';
      tabCustomRooms.className = 'btn-primary';
      tabQuickMatch.className = 'btn-secondary';
    });
  }

  // DOM Navigation for Create Room Config Flow
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

  // Dataset Dropdown Handlers
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

  function enterRoom(roomId, action, configSummary = '') {
    currentRoomId = roomId;
    connectPvpRoom(roomId, currentUsername, action, {
      onOpen: () => {
        viewQuickMatch.style.display = 'none';
        viewCustomRooms.style.display = 'none';
        viewCreateConfig.style.display = 'none';
        closeDropdown();
        if (roomView) roomView.style.display = 'block';
        if (displayRoomCode) displayRoomCode.textContent = roomId;
        if (configSummary && displayConfig) displayConfig.textContent = configSummary;
      },
      onMessage: (data) => {
        if (data.host) {
          roomHost = data.host;
          if (roomHost === currentUsername) {
            if (startMatchBtn) startMatchBtn.style.display = 'block';
            if (waitingHostMsg) waitingHostMsg.style.display = 'none';
          } else {
            if (startMatchBtn) startMatchBtn.style.display = 'none';
            if (waitingHostMsg) waitingHostMsg.style.display = 'block';
          }
        }

        if (data.total_players !== undefined && data.max_players !== undefined) {
          if (playerCountDisplay) {
            playerCountDisplay.textContent = `${data.total_players}/${data.max_players}`;
          }
        }

        if (data.event === 'start_game') {
          if (roomView) roomView.style.display = 'none';
          if (raceView) raceView.style.display = 'block';
        }
      },
      onError: () => leaveRoomStateOnly(),
      onClose: () => leaveRoomStateOnly()
    });
  }

  function leaveRoomStateOnly() {
    currentRoomId = null;
    if (roomView) roomView.style.display = 'none';
    if (raceView) raceView.style.display = 'none';
    if (viewCreateConfig) viewCreateConfig.style.display = 'none';
    if (viewCustomRooms) viewCustomRooms.style.display = 'block';
    if (roomCodeInput) roomCodeInput.value = '';
    if (playerCountDisplay) playerCountDisplay.textContent = '1/6';
    if (startMatchBtn) startMatchBtn.style.display = 'none';
    closeDropdown();
  }

  if (confirmCreateBtn) {
    confirmCreateBtn.addEventListener('click', () => {
      const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
      const datasetName = DATASET_REGISTRY[currentDatasetKey]?.name || currentDatasetKey;
      const configSummary = `${datasetName} (${testMode}: ${testLimit})`;
      
      enterRoom(randomCode, 'create', configSummary);
      
      setTimeout(() => {
        sendPvpMessage({ 
          event: 'update_config', 
          dataset_key: currentDatasetKey,
          test_mode: testMode,
          test_limit: testLimit
        });
      }, 500);
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
    startMatchBtn.addEventListener('click', () => {
      sendPvpMessage({ event: 'start_game' });
    });
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