// leaderboard.js
import { fetchLeaderboardData } from '../services/leaderboardService.js';
import { escapeHTML } from '../utils/sanitize.js';
let currentTimeframe = 'all_time'; 
let currentMode = 'time';          
let currentModeInfo = '60';        

const MODE_CONFIGS = {
  time: ['10', '20', '60', '100'],
  words: ['10', '35', '70', '100']
};

// Countdown timer state (5 minutes = 300 seconds)
let countdownSeconds = 300;
let timerInterval = null;

// ==========================================
// 1. PURE TEMPLATE FUNCTION (Returns HTML string)
// ==========================================
export function renderLeaderboard(scores = null) {
  const availableLimits = MODE_CONFIGS[currentMode];
  const minutes = Math.floor(countdownSeconds / 60);
  const seconds = countdownSeconds % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return `
    <div class="leaderboard-layout">
      <!-- LEFT SIDEBAR MENU -->
      <aside class="leaderboard-sidebar">
        
        <!-- Group 1: Timeframe -->
        <div class="menu-group">
          <div class="menu-item ${currentTimeframe === 'all_time' ? 'active' : ''}" data-timeframe="all_time">
            🌐 all-time english
          </div>
          <div class="menu-item ${currentTimeframe === 'daily' ? 'active' : ''}" data-timeframe="daily">
            📅 daily
          </div>
        </div>

        <!-- Group 2: Mode Category (Time vs Words) -->
        <div class="menu-group">
          <div class="menu-label">Mode</div>
          <div class="menu-item ${currentMode === 'time' ? 'active' : ''}" data-switch-mode="time">
            ⏱️ time mode
          </div>
          <div class="menu-item ${currentMode === 'words' ? 'active' : ''}" data-switch-mode="words">
            ✍️ words mode
          </div>
        </div>

        <!-- Group 3: Mode Limits / Submode Grid -->
        <div class="menu-group">
          <div class="menu-label">${currentMode === 'time' ? 'Time Limit' : 'Word Count'}</div>
          <div class="submode-grid">
            ${availableLimits.map(limit => `
              <button class="submode-btn ${currentModeInfo === limit ? 'active' : ''}" data-mode-info="${limit}">
                ${limit}${currentMode === 'time' ? 's' : 'w'}
              </button>
            `).join('')}
          </div>
        </div>

      </aside>

      <!-- MAIN CONTENT TABLE -->
      <main class="leaderboard-main">
        <div class="leaderboard-top-bar">
          <span class="cache-timer">Next cache update in: <strong>${formattedTime}</strong></span>
        </div>

        <div class="table-wrapper">
          <table class="leaderboard-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>WPM</th>
                <th>Raw</th>
                <th>Accuracy</th>
                <th>Consistency</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody id="leaderboard-body">
              ${renderTableRows(scores)}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  `;
}

function renderTableRows(scores) {
  if (!scores) {
    return `<tr><td colspan="7" class="loading">Loading rankings...</td></tr>`;
  }
  if (scores.length === 0) {
    return `<tr><td colspan="7" class="no-data">No scores recorded yet for this filter! Be the first!</td></tr>`;
  }

  return scores.map((score, index) => {
    let rank = `#${index + 1}`;
    if (index === 0) rank = `🥇 1`;
    if (index === 1) rank = `🥈 2`;
    if (index === 2) rank = `🥉 3`;

    const safeUsername = escapeHTML(score.username);

    // Ensure floats display up to 1 decimal place safely (fallback to 0 if undefined)
    const wpm = score.wpm !== undefined ? Number(score.wpm).toFixed(1) : '0.0';
    const raw = score.raw !== undefined ? Number(score.raw).toFixed(1) : '0.0';
    const accuracy = score.accuracy !== undefined ? Number(score.accuracy).toFixed(1) : '0.0';
    const consistency = score.consistency !== undefined ? Number(score.consistency).toFixed(1) : '0.0';

    return `
      <tr>
        <td class="rank">${rank}</td>
        <td class="username"><a href="#/profile/${safeUsername}">${safeUsername}</a></td>
        <td class="wpm"><strong>${wpm}</strong></td>
        <td class="raw">${raw}</td>
        <td class="accuracy">${accuracy}%</td>
        <td class="consistency">${consistency}%</td>
        <td class="date">${new Date(score.created_at).toLocaleDateString()}</td>
      </tr>
    `;
  }).join('');
}

// ==========================================
// 2. SETUP & DATA FETCHER (Called after injection)
// ==========================================
export async function setupLeaderboardEvents(container) {
  attachEventListeners(container);
  startCountdownTimer(container);

  try {
    const scores = await fetchLeaderboardData(currentMode, currentModeInfo);
    container.innerHTML = renderLeaderboard(scores);
    attachEventListeners(container);
  } catch (err) {
    const tbody = container.querySelector('#leaderboard-body');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="7" class="error">Failed to load leaderboard data.</td></tr>`;
    }
  }
}

function startCountdownTimer(container) {
  if (timerInterval) clearInterval(timerInterval);
  countdownSeconds = 300; // Reset to 5 minutes

  timerInterval = setInterval(() => {
    countdownSeconds--;
    if (countdownSeconds <= 0) {
      countdownSeconds = 300; // Reset loop when cache refreshes
    }
    
    // Update just the timer element in the DOM to avoid re-rendering the whole table every second
    const timerSpan = container.querySelector('.cache-timer strong');
    if (timerSpan) {
      const minutes = Math.floor(countdownSeconds / 60);
      const seconds = countdownSeconds % 60;
      timerSpan.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    } else {
      clearInterval(timerInterval);
    }
  }, 1000);
}

function attachEventListeners(container) {
  container.querySelectorAll('[data-timeframe]').forEach(item => {
    item.addEventListener('click', async () => {
      const timeframe = item.dataset.timeframe;
      if (timeframe !== currentTimeframe) {
        currentTimeframe = timeframe;
        container.innerHTML = renderLeaderboard(null);
        await setupLeaderboardEvents(container);
      }
    });
  });

  container.querySelectorAll('[data-switch-mode]').forEach(item => {
    item.addEventListener('click', async () => {
      const mode = item.dataset.switchMode;
      if (mode !== currentMode) {
        currentMode = mode;
        currentModeInfo = MODE_CONFIGS[currentMode][0];
        container.innerHTML = renderLeaderboard(null);
        await setupLeaderboardEvents(container);
      }
    });
  });

  container.querySelectorAll('[data-mode-info]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const info = btn.dataset.modeInfo;
      if (info !== currentModeInfo) {
        currentModeInfo = info;
        container.innerHTML = renderLeaderboard(null);
        await setupLeaderboardEvents(container);
      }
    });
  });
}