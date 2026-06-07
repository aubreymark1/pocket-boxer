function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function wsSend(ws, message) {
  if (!ws || ws.readyState !== ws.OPEN) return;
  ws.send(JSON.stringify(message));
}

export function createPvpClient({ onEvent, onStatus } = {}) {
  const state = {
    url: '',
    status: 'idle',
    roomCode: '',
    role: '',
    room: null,
    lastError: '',
  };

  let ws = null;

  function emitStatus() {
    onStatus?.({
      url: state.url,
      status: state.status,
      roomCode: state.roomCode,
      role: state.role,
      room: state.room ? { ...state.room } : null,
      lastError: state.lastError,
    });
  }

  function setError(message) {
    state.lastError = message;
    emitStatus();
  }

  function setStatus(status) {
    state.status = status;
    emitStatus();
  }

  function connect(url) {
    const normalized = String(url || '').trim();
    if (!normalized) {
      setError('缺少服务器地址。');
      return;
    }

    if (ws) {
      try {
        ws.close();
      } catch {
        // ignore
      }
      ws = null;
    }

    state.url = normalized;
    state.status = 'connecting';
    state.lastError = '';
    emitStatus();

    ws = new WebSocket(normalized);

    ws.addEventListener('open', () => {
      setStatus('connected');
    });

    ws.addEventListener('close', () => {
      state.room = null;
      state.roomCode = '';
      state.role = '';
      setStatus('disconnected');
    });

    ws.addEventListener('error', () => {
      setError('连接失败。');
    });

    ws.addEventListener('message', (event) => {
      const payload = safeJsonParse(String(event.data || ''));
      if (!payload || typeof payload !== 'object') return;
      const type = String(payload.type || '');
      const data = payload.data;

      if (type === 'error') {
        setError(String(data?.message || '发生错误。'));
      }

      if (type === 'joined') {
        state.roomCode = String(data?.roomCode || '');
        state.role = String(data?.role || '');
        state.room = data?.state || null;
        emitStatus();
      }

      if (type === 'room') {
        state.room = data || null;
        emitStatus();
      }

      onEvent?.({ type, data });
    });
  }

  function ensureConnected() {
    if (!ws || ws.readyState !== ws.OPEN) {
      setError('尚未连接到服务器。');
      return false;
    }
    return true;
  }

  function createRoom(name) {
    if (!ensureConnected()) return;
    wsSend(ws, { type: 'create', data: { name } });
  }

  function joinRoom(roomCode, name) {
    if (!ensureConnected()) return;
    wsSend(ws, { type: 'join', data: { roomCode, name } });
  }

  function ready() {
    if (!ensureConnected()) return;
    wsSend(ws, { type: 'ready', data: {} });
  }

  function sendPunch({ round, score, peakDelta, source }) {
    if (!ensureConnected()) return;
    wsSend(ws, { type: 'punch', data: { round, score, peakDelta, source } });
  }

  function leave() {
    if (!ensureConnected()) return;
    wsSend(ws, { type: 'leave', data: {} });
  }

  function getSnapshot() {
    return {
      url: state.url,
      status: state.status,
      roomCode: state.roomCode,
      role: state.role,
      room: state.room ? { ...state.room } : null,
      lastError: state.lastError,
    };
  }

  return {
    connect,
    createRoom,
    joinRoom,
    ready,
    sendPunch,
    leave,
    getSnapshot,
  };
}
