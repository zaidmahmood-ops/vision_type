// pvpService.js

let socket = null;

/**
 * Establish a persistent WebSocket connection to a specific PvP room on the FastAPI backend
 * @param {string} roomId - Room code (e.g., 'X9Y2')
 * @param {string} username - Current user's username
 * @param {string} action - 'create' or 'join'
 * @param {Object} callbacks - Event handlers (onOpen, onMessage, onError, onClose)
 */
export function connectPvpRoom(roomId, username, action = 'join', callbacks = {}) {
  // Make sure a previous connection can never fire callbacks into the new session
  disconnectPvpRoom();

  // Always use secure wss:// for the cloud backend
  const protocol = 'wss:';

  // Hardcoded to your Render cloud backend host (without the protocol prefix)
  const backendHost = 'vision-type.onrender.com';

  const wsUrl = `${protocol}//${backendHost}/ws/pvp/${roomId}?username=${encodeURIComponent(username)}&action=${action}`;

  console.log(`Connecting to WebSocket: ${wsUrl}`);
  const ws = new WebSocket(wsUrl);
  socket = ws;

  ws.onopen = () => {
    if (callbacks.onOpen) callbacks.onOpen();
  };

  ws.onmessage = (event) => {
    // Only the JSON parsing is guarded, so a crash inside a handler shows up
    // as its own real stack trace instead of "Failed to parse JSON".
    let data;
    try {
      data = JSON.parse(event.data);
    } catch (err) {
      console.error('Failed to parse incoming WebSocket JSON:', err);
      return;
    }

    // Backend error (room full, doesn't exist, code taken, name in use...)
    if (data.error) {
      alert(data.error);
      if (callbacks.onError) callbacks.onError(data.error);
      ws.close();
      return;
    }

    if (callbacks.onMessage) callbacks.onMessage(data);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error encountered:', error);
    if (callbacks.onError) callbacks.onError(error);
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed.');
    if (socket === ws) socket = null;
    if (callbacks.onClose) callbacks.onClose();
  };
}

/**
 * Send an event to the room.
 * @param {string} eventType - e.g. 'player_ready', 'progress', 'finish', 'start_game'
 * @param {Object} payload - extra fields merged into the message
 */
export function sendPvpMessage(eventType, payload = {}) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const message = JSON.stringify({
      event: eventType,
      ...payload,
      timestamp: Date.now()
    });
    socket.send(message);
  } else {
    console.warn('Cannot send message: WebSocket is not open.');
  }
}

/**
 * Close the connection WITHOUT firing the UI callbacks.
 * Callers (Leave button, route cleanup) update their own UI, so a late
 * onclose must not rebuild the lobby on top of whatever page is showing.
 */
export function disconnectPvpRoom() {
  if (socket) {
    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;
    socket.close();
    socket = null;
  }
}