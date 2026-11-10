// pvpService.js

let socket = null;

/**
 * Establish a persistent WebSocket connection to a specific PvP room on the FastAPI backend
 * @param {string} roomId - Room code (e.g., 'X9Y2')
 * @param {string} username - Current user's username
 * @param {string} action - 'create' or 'join'
 * @param {Object} callbacks - Event handlers (onOpen, onMessage, onError, onClose)
 */
export function connectPvpRoom(roomId, username, action = 'join', callbacks) {
  // Always use secure wss:// for the cloud backend
  const protocol = 'wss:';
  
  // Hardcoded to your Render cloud backend host (without the protocol prefix)
  const backendHost = 'vision-type.onrender.com'; 
  
  const wsUrl = `${protocol}//${backendHost}/ws/pvp/${roomId}?username=${encodeURIComponent(username)}&action=${action}`;

  console.log(`Connecting to WebSocket: ${wsUrl}`);
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    if (callbacks.onOpen) callbacks.onOpen();
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      // Check if backend returned an error (e.g. room full, doesn't exist, code taken)
      if (data.error) {
        alert(data.error);
        if (callbacks.onError) callbacks.onError(data.error);
        socket.close();
        return;
      }

      if (callbacks.onMessage) {
        callbacks.onMessage(data);
      }
    } catch (err) {
      console.error('Failed to parse incoming WebSocket JSON:', err);
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error encountered:', error);
    if (callbacks.onError) callbacks.onError(error);
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed.');
    if (callbacks.onClose) callbacks.onClose();
  };
}

export function sendPvpMessage(eventType, payload) {
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

export function disconnectPvpRoom() {
  if (socket) {
    socket.close();
    socket = null;
  }
}