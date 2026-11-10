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
        <div style="display: flex; gap: 8px; margin-bottom: 10px;">
          <button id="btn-1v1-mode" class="btn-secondary" style="flex:1; padding: 6px; font-size: 0.8rem;">1v1</button>
          <button id="btn-party-mode" class="btn-secondary" style="flex:1; padding: 6px; font-size: 0.8rem;">Party</button>
        </div>
        
        <div class="compact-input-group">
          <input type="text" id="room-code-input" placeholder="Room Code" />
          <button id="create-custom-btn" class="btn-primary" style="padding: 6px 12px; font-size: 0.8rem;">Create</button>
          <button id="submit-join-btn" class="btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;">Join</button>
        </div>
      </div>

      <!-- WAITING / ACTIVE ROOM VIEW -->
      <div id="pvp-room-view" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 6px;">
          <span style="font-size: 0.8rem; color: #3bce16;">Connected: <strong id="display-room-code" style="color:#fbbf24">----</strong></span>
          <button id="leave-room-btn" class="btn-danger" style="padding: 4px 8px; font-size: 0.75rem; width: auto;">Leave</button>
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
  const leaveRoomBtn = container.querySelector('#leave-room-btn');
  const findMatchBtn = container.querySelector('#find-match-btn');

  let selectedSubMode = '1v1';

  if (tabQuickMatch && tabCustomRooms) {
    tabQuickMatch.addEventListener('click', () => {
      viewQuickMatch.style.display = 'block';
      viewCustomRooms.style.display = 'none';
    });
    tabCustomRooms.addEventListener('click', () => {
      viewCustomRooms.style.display = 'block';
      viewQuickMatch.style.display = 'none';
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
      onError: () => leaveRoomStateOnly(),
      onClose: () => leaveRoomStateOnly()
    });
  }

  function leaveRoomStateOnly() {
    currentRoomId = null;
    if (roomView) roomView.style.display = 'none';
    if (viewQuickMatch) viewQuickMatch.style.display = 'block';
    if (roomCodeInput) roomCodeInput.value = '';
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
      if (code) enterRoom(code, 'join');
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