// pvp.js
import { connectPvpRoom, sendPvpMessage, disconnectPvpRoom } from '../services/pvpService.js';

let currentRoomId = null;

// 1. COMPACT TEMPLATE FUNCTION (Integrated into media controls style)
export function renderPvp() {
  return `
    <div class="pvp-card-compact">
      <h2>PvP Mode ⚔</h2>
      <p>Head-to-head live typing battle</p>
      
      <!-- MODE SELECTION TABS -->
      <div class="pvp-mode-tabs" style="display: flex; gap: 8px; margin-bottom: 14px;">
        <button id="tab-quick-match" class="btn-primary" style="padding: 6px 12px; font-size: 0.85rem;">Quick Match</button>
        <button id="tab-custom-rooms" class="btn-secondary" style="padding: 6px 12px; font-size: 0.85rem;">Custom Room</button>
      </div>

      <!-- QUICK MATCH VIEW -->
      <div id="view-quick-match" class="pvp-section" style="margin-top: 0;">
        <button id="find-match-btn" class="btn-primary" style="width: 100%; padding: 8px;">Find Public Match</button>
      </div>

      <!-- CUSTOM ROOMS VIEW (Hidden initially) -->
      <div id="view-custom-rooms" class="pvp-section" style="display: none; margin-top: 0;">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          
          <!-- Join with code input bar -->
          <div class="compact-input-group" style="display: flex; gap: 6px;">
            <input type="text" id="room-code-input" placeholder="Enter Room Code" style="flex: 1; padding: 6px 8px; font-size: 0.85rem;" />
            <button id="submit-join-btn" class="btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;">Join Room</button>
          </div>

          <!-- Divider text -->
          <div style="text-align: center; font-size: 0.75rem; color: #888; margin: 2px 0;">- OR -</div>

          <!-- Create new room button -->
          <button id="create-custom-btn" class="btn-primary" style="width: 100%; padding: 7px; font-size: 0.8rem;">Create New Room</button>
          
        </div>
      </div>

      <!-- WAITING / ACTIVE ROOM VIEW -->
      <div id="pvp-room-view" style="display: none;">
        <div style="display: flex; flex-direction: column; gap: 8px; background: rgba(0,0,0,0.3); padding: 10px 12px; border-radius: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.8rem; color: #3bce16;">Room: <strong id="display-room-code" style="color:#fbbf24">----</strong></span>
            <span style="font-size: 0.8rem; color: #ccc;">Players: <strong id="player-count" style="color: #fbbf24;">1/6</strong></span>
          </div>
          <button id="leave-room-btn" class="btn-danger" style="padding: 5px; font-size: 0.75rem; width: 100%;">Leave Room</button>
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
  const createCustomBtn = container.querySelector('#create-custom-btn');
  const submitJoinBtn = container.querySelector('#submit-join-btn');
  const roomCodeInput = container.querySelector('#room-code-input');
  const roomView = container.querySelector('#pvp-room-view');
  const displayRoomCode = container.querySelector('#display-room-code');
  const playerCountDisplay = container.querySelector('#player-count');
  const leaveRoomBtn = container.querySelector('#leave-room-btn');
  const findMatchBtn = container.querySelector('#find-match-btn');

  if (tabQuickMatch && tabCustomRooms) {
    tabQuickMatch.addEventListener('click', () => {
      viewQuickMatch.style.display = 'block';
      viewCustomRooms.style.display = 'none';
      tabQuickMatch.className = 'btn-primary';
      tabCustomRooms.className = 'btn-secondary';
    });
    tabCustomRooms.addEventListener('click', () => {
      viewCustomRooms.style.display = 'block';
      viewQuickMatch.style.display = 'none';
      tabCustomRooms.className = 'btn-primary';
      tabQuickMatch.className = 'btn-secondary';
    });
  }

  function enterRoom(roomId, action) {
    currentRoomId = roomId;
    connectPvpRoom(roomId, 'TestUser', action, {
      onOpen: () => {
        if (viewQuickMatch) viewQuickMatch.style.display = 'none';
        if (viewCustomRooms) viewCustomRooms.style.display = 'none';
        if (roomView) roomView.style.display = 'block';
        if (displayRoomCode) displayRoomCode.textContent = roomId;
      },
      onMessage: (data) => {
        // Automatically updates the counter when player_joined or player_left events come from FastAPI
        if (data.total_players !== undefined && data.max_players !== undefined) {
          if (playerCountDisplay) {
            playerCountDisplay.textContent = `${data.total_players}/${data.max_players}`;
          }
        }
      },
      onError: () => leaveRoomStateOnly(),
      onClose: () => leaveRoomStateOnly()
    });
  }

  function leaveRoomStateOnly() {
    currentRoomId = null;
    if (roomView) roomView.style.display = 'none';
    if (viewCustomRooms) viewCustomRooms.style.display = 'block';
    if (roomCodeInput) roomCodeInput.value = '';
    if (playerCountDisplay) playerCountDisplay.textContent = '1/6';
  }

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
    findMatchBtn.addEventListener('click', () => alert('Matchmaking queue starting...'));
  }

  if (leaveRoomBtn) {
    leaveRoomBtn.addEventListener('click', () => {
      disconnectPvpRoom();
      leaveRoomStateOnly();
    });
  }
}