// pvp.js
import { connectPvpRoom, sendPvpMessage, disconnectPvpRoom } from '../services/pvpService.js';

let currentRoomId = null;

// 1. PURE TEMPLATE FUNCTION
export function renderPvp() {
  return `
    <div class="card pvp-card">
      <h2>PvP Mode ⚔</h2>
      <p>Race head-to-head or with a group in real-time typing battles.</p>
      
      <!-- MODE SELECTION TABS -->
      <div class="pvp-mode-tabs" style="display: flex; gap: 10px; margin-top: 20px; border-bottom: 1px solid #334155; padding-bottom: 12px;">
        <button id="tab-quick-match" class="btn-primary" style="flex: 1; cursor: pointer;">Quick Match</button>
        <button id="tab-custom-rooms" class="btn-secondary" style="flex: 1; cursor: pointer; background: #1e293b; color: #94a3b8; border: 1px solid #334155;">Custom Rooms</button>
      </div>

      <!-- QUICK MATCH VIEW (Default Visible) -->
      <div id="view-quick-match" class="pvp-section" style="margin-top: 20px; display: flex; flex-direction: column; gap: 12px;">
        <p style="color: #cbd5e1; font-size: 0.95rem; margin: 0;">Jump into a public matchmaking queue for a battle royale style race.</p>
        <button id="find-match-btn" class="btn-primary" style="padding: 12px; font-weight: bold;">Find Public Match</button>
      </div>

      <!-- CUSTOM ROOMS VIEW (Hidden by default) -->
      <div id="view-custom-rooms" class="pvp-section" style="margin-top: 20px; display: none; flex-direction: column; gap: 15px;">
        <p style="color: #cbd5e1; font-size: 0.95rem; margin: 0;">Play privately with friends using a custom room code.</p>
        
        <div style="display: flex; gap: 10px;">
          <button id="btn-1v1-mode" class="btn-secondary" style="flex: 1; padding: 10px;">1v1 Mode (Max 2)</button>
          <button id="btn-party-mode" class="btn-secondary" style="flex: 1; padding: 10px; background: #1e293b; color: #94a3b8;">Party Mode (Multi)</button>
        </div>

        <!-- Custom Room Action Inputs (Hidden until 1v1 or Party is selected) -->
        <div id="custom-action-container" style="display: none; background: rgba(15, 23, 42, 0.4); padding: 12px; border-radius: 8px; border: 1px solid #334155;">
          <p id="custom-mode-title" style="margin: 0 0 10px 0; font-size: 0.9rem; color: #38bdf8; font-weight: bold;"></p>
          <div style="display: flex; gap: 8px; margin-bottom: 10px;">
            <button id="create-custom-btn" class="btn-primary" style="flex: 1;">Create Room</button>
            <button id="toggle-join-input-btn" class="btn-secondary" style="flex: 1;">Join with Code</button>
          </div>

          <div id="join-input-wrapper" style="display: none; display: flex; gap: 8px;">
            <input type="text" id="room-code-input" placeholder="Enter Code (e.g. X9Y2)" style="padding: 8px; flex: 1; border-radius: 6px; border: 1px solid #334155; background: #0f172a; color: #fff; text-transform: uppercase;" />
            <button id="submit-join-btn" class="btn-primary" style="padding: 8px 16px;">Connect</button>
          </div>
        </div>
      </div>

      <!-- WAITING / ACTIVE ROOM VIEW (Hidden by default until connected) -->
      <div id="pvp-room-view" style="display: none; margin-top: 20px; text-align: center;">
        <div class="room-banner" style="background: rgba(15, 23, 42, 0.6); padding: 15px; border-radius: 8px; border: 1px solid #334155; margin-bottom: 15px;">
          <p style="margin: 0; font-size: 0.9rem; color: #94a3b8;">Room Code</p>
          <h3 id="display-room-code" style="margin: 5px 0 0 0; color: #38bdf8; font-size: 1.5rem; letter-spacing: 2px;">----</h3>
        </div>

        <p id="room-status-text" style="color: #cbd5e1; margin-bottom: 15px;">Waiting for players to join...</p>

        <button id="leave-room-btn" class="btn-danger" style="background: #ef4444; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; width: 100%;">
          Leave Room / Disconnect
        </button>
      </div>
    </div>
  `;
}

// 2. EVENT BINDER
export function setupPvpEvents(container) {
  // Tabs & Views
  const tabQuickMatch = container.querySelector('#tab-quick-match');
  const tabCustomRooms = container.querySelector('#tab-custom-rooms');
  const viewQuickMatch = container.querySelector('#view-quick-match');
  const viewCustomRooms = container.querySelector('#view-custom-rooms');

  // Custom sub-modes
  const btn1v1 = container.querySelector('#btn-1v1-mode');
  const btnParty = container.querySelector('#btn-party-mode');
  const customActionContainer = container.querySelector('#custom-action-container');
  const customModeTitle = container.querySelector('#custom-mode-title');
  const createCustomBtn = container.querySelector('#create-custom-btn');
  const toggleJoinInputBtn = container.querySelector('#toggle-join-input-btn');
  const joinInputWrapper = container.querySelector('#join-input-wrapper');
  const roomCodeInput = container.querySelector('#room-code-input');
  const submitJoinBtn = container.querySelector('#submit-join-btn');

  // Room view items
  const lobbyTabsAndViews = container.querySelector('.pvp-mode-tabs'); // We can hide tabs when inside a room
  const roomView = container.querySelector('#pvp-room-view');
  const displayRoomCode = container.querySelector('#display-room-code');
  const roomStatusText = container.querySelector('#room-status-text');
  const leaveRoomBtn = container.querySelector('#leave-room-btn');
  const findMatchBtn = container.querySelector('#find-match-btn');

  let selectedSubMode = '1v1'; // Default custom submode

  // Tab Switching Logic
  if (tabQuickMatch && tabCustomRooms) {
    tabQuickMatch.addEventListener('click', () => {
      tabQuickMatch.style.background = '#3b82f6';
      tabQuickMatch.style.color = '#fff';
      tabCustomRooms.style.background = '#1e293b';
      tabCustomRooms.style.color = '#94a3b8';
      
      viewQuickMatch.style.display = 'flex';
      viewCustomRooms.style.display = 'none';
    });

    tabCustomRooms.addEventListener('click', () => {
      tabCustomRooms.style.background = '#3b82f6';
      tabCustomRooms.style.color = '#fff';
      tabQuickMatch.style.background = '#1e293b';
      tabQuickMatch.style.color = '#94a3b8';

      viewCustomRooms.style.display = 'flex';
      viewQuickMatch.style.display = 'none';
    });
  }

  // Custom Sub-Mode Selection (1v1 vs Party)
  if (btn1v1 && btnParty) {
    btn1v1.addEventListener('click', () => {
      selectedSubMode = '1v1';
      btn1v1.style.background = '#3b82f6';
      btn1v1.style.color = '#fff';
      btnParty.style.background = '#1e293b';
      btnParty.style.color = '#94a3b8';
      
      customActionContainer.style.display = 'block';
      customModeTitle.textContent = '1v1 Mode Selected (Capacity: 2 Players)';
    });

    btnParty.addEventListener('click', () => {
      selectedSubMode = 'party';
      btnParty.style.background = '#3b82f6';
      btnParty.style.color = '#fff';
      btn1v1.style.background = '#1e293b';
      btn1v1.style.color = '#94a3b8';

      customActionContainer.style.display = 'block';
      customModeTitle.textContent = 'Party Mode Selected (Capacity: Up to 8 Players)';
    });
  }

  // Toggle join code text input visibility
  if (toggleJoinInputBtn && joinInputWrapper) {
    toggleJoinInputBtn.addEventListener('click', () => {
      joinInputWrapper.style.display = joinInputWrapper.style.display === 'none' ? 'flex' : 'none';
    });
  }

  // Helper to transition UI into active room session
  function enterRoom(roomId, action) {
    currentRoomId = roomId;

    connectPvpRoom(roomId, 'TestUser', action, {
      onOpen: () => {
        console.log(`Connected to room: ${roomId} [Mode: ${selectedSubMode}]`);
        if (viewQuickMatch) viewQuickMatch.style.display = 'none';
        if (viewCustomRooms) viewCustomRooms.style.display = 'none';
        if (tabQuickMatch) tabQuickMatch.parentElement.style.display = 'none'; // hide tabs banner
        if (roomView) roomView.style.display = 'block';
        if (displayRoomCode) displayRoomCode.textContent = roomId;
      },
      onMessage: (data) => {
        console.log('Room event:', data);
        if (data.event === 'player_joined') {
          if (roomStatusText) {
            const maxCap = selectedSubMode === '1v1' ? '2' : '8';
            roomStatusText.textContent = `Players in room: ${data.total_players}/${maxCap} (${data.username} joined)`;
          }
        } else if (data.event === 'player_left') {
          if (roomStatusText) {
            roomStatusText.textContent = `Player left. Total players: ${data.total_players}`;
          }
        }
      },
      onError: (err) => {
        console.error('Connection error:', err);
        leaveRoomStateOnly();
      },
      onClose: () => {
        console.log('Disconnected.');
      }
    });
  }

  function leaveRoomStateOnly() {
    currentRoomId = null;
    if (roomView) roomView.style.display = 'none';
    if (tabQuickMatch && tabQuickMatch.parentElement) tabQuickMatch.parentElement.style.display = 'flex';
    if (viewQuickMatch) viewQuickMatch.style.display = 'flex'; // Reset back to quick match tab
    if (roomCodeInput) roomCodeInput.value = '';
    if (roomStatusText) roomStatusText.textContent = 'Waiting for players to join...';
  }

  function leaveRoom() {
    disconnectPvpRoom();
    leaveRoomStateOnly();
  }

  // Action Button Triggers
  if (createCustomBtn) {
    createCustomBtn.addEventListener('click', () => {
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

  if (findMatchBtn) {
    findMatchBtn.addEventListener('click', () => {
      alert('Quick Match matchmaking queueing will be wired up next!');
    });
  }

  if (leaveRoomBtn) {
    leaveRoomBtn.addEventListener('click', () => {
      leaveRoom();
    });
  }
}