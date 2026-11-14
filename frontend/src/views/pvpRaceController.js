// src/views/pvpRaceController.js
import { sendPvpMessage } from '../services/pvpService.js';
import { getWordlist } from '../services/testConfigService.js';
import { createTypingEngine } from './pvpTypingEngine.js';
import { generateWords } from '../utils/seededWords.js';
import { throttle } from '../utils/throttle.js';

const PROGRESS_INTERVAL_MS = 150;
const INTERMISSION_MS = 4000;

export function createRaceController({ username, els, onMatchOver }) {
  let engine = null;
  let config = null;
  let wordPool = [];
  let countdownTimer = null;
  let intermissionTimer = null;
  const bars = new Map();

  const sendProgress = throttle(
    (p) => sendPvpMessage('progress', { progress: p.progress, wpm: p.wpm }),
    PROGRESS_INTERVAL_MS
  );

  function handle(data) {
    switch (data.event) {
      case 'start_game':      return onStartGame(data);
      case 'start_countdown': return onStartCountdown(data);
      case 'progress':        return updateBar(data.username, data.progress, data.wpm);
      case 'player_finished': return updateBar(data.username, 1, data.wpm, `#${data.place}`);
      case 'round_end':       return onRoundEnd(data);
      case 'player_left':     return removeBar(data.username);
    }
  }

  async function onStartGame(data) {
    config = data.config;
    renderBars(data.players);
    els.roundLabel.textContent = 'Loading wordlist…';

    wordPool = await getWordlist(config.dataset_key);
    if (!wordPool.length) {
      els.roundLabel.textContent = 'Failed to load wordlist. Leave and retry.';
      return;
    }
    els.roundLabel.textContent = 'Waiting for other players…';
    sendPvpMessage('player_ready');
  }

  function onStartCountdown({ seconds, seed, round, total_rounds }) {
    destroyEngine();
    resetBars();
    els.roundLabel.textContent = `Round ${round} / ${total_rounds}`;

    const wordCount =
      config.test_mode === 'words' ? config.test_limit : Math.max(150, config.test_limit * 6);
    const words = generateWords(wordPool, wordCount, seed);

    engine = createTypingEngine({
      container: els.typingContainer,
      words,
      mode: config.test_mode,
      limit: config.test_limit,
      onProgress: (snap) => {
        updateBar(username, snap.progress, snap.wpm);
        if (snap.finished) {
          sendProgress.cancel();
          sendPvpMessage('progress', { progress: 1, wpm: snap.wpm });
        } else {
          sendProgress(snap);
        }
      },
      onFinish: (stats) => {
        sendPvpMessage('finish', {
          wpm: stats.wpm,
          accuracy: stats.accuracy,
          time: stats.timeElapsed,
        });
      },
    });

    runCountdown(seconds, () => engine?.unlock());
  }

  function runCountdown(seconds, onDone) {
    clearInterval(countdownTimer);
    let remaining = seconds;
    els.countdown.style.display = 'flex';
    els.countdown.textContent = remaining;

    countdownTimer = setInterval(() => {
      remaining--;
      els.countdown.textContent = remaining > 0 ? remaining : 'GO!';
      if (remaining <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        onDone();
        setTimeout(() => { els.countdown.style.display = 'none'; }, 600);
      }
    }, 1000);
  }

  function onRoundEnd(data) {
    sendProgress.cancel();
    engine?.lock();

    const winner = data.results.find((r) => !r.dnf);
    els.roundLabel.textContent = winner
      ? `Round ${data.round} won by ${winner.username} (${winner.wpm} wpm)`
      : `Round ${data.round} finished`;

    if (data.match_over) {
      const top = Object.entries(data.scores).sort((a, b) => b[1] - a[1])[0];
      alert(`Match over! ${top ? `${top[0]} wins with ${top[1]} round(s).` : ''}`);
      destroy();
      onMatchOver?.(data);
    } else {
      intermissionTimer = setTimeout(() => sendPvpMessage('player_ready'), INTERMISSION_MS);
    }
  }

  function renderBars(players) {
    els.scoreboard.innerHTML = '';
    bars.clear();
    players.forEach((name) => {
      const row = document.createElement('div');
      row.className = 'pvp-score-row';

      const label = document.createElement('span');
      label.className = 'pvp-score-name';
      label.textContent = name === username ? `${name} (you)` : name;

      const track = document.createElement('div');
      track.className = 'pvp-score-track';
      
      const fill = document.createElement('div');
      fill.className = `pvp-score-fill ${name === username ? 'self' : 'opponent'}`;
      track.appendChild(fill);

      const wpm = document.createElement('span');
      wpm.className = 'pvp-score-wpm';
      wpm.textContent = '0 wpm';

      row.append(label, track, wpm);
      els.scoreboard.appendChild(row);
      bars.set(name, { row, fill, wpm });
    });
  }

  function updateBar(name, progress = 0, wpm = 0, suffix = '') {
    const bar = bars.get(name);
    if (!bar) return;
    bar.fill.style.width = `${Math.round(progress * 100)}%`;
    bar.wpm.textContent = `${Math.round(wpm)} wpm ${suffix}`.trim();
  }

  function resetBars() {
    bars.forEach((_, name) => updateBar(name, 0, 0));
  }

  function removeBar(name) {
    bars.get(name)?.row.remove();
    bars.delete(name);
  }

  function destroyEngine() {
    engine?.destroy();
    engine = null;
  }

  function destroy() {
    clearInterval(countdownTimer);
    clearTimeout(intermissionTimer);
    sendProgress.cancel();
    destroyEngine();
    if (els.countdown) els.countdown.style.display = 'none';
  }

  return { handle, destroy };
}