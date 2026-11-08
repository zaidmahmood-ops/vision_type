// user-profile.js
import { fetchUserProfile } from '../services/user-profileService.js';

export function renderProfile() {
  return `
    <div class="profile-wrapper">
      
      <!-- USER HEADER BANNER -->
      <div class="profile-card profile-user-card">
        <div class="profile-user-main">
          <div class="profile-avatar" id="profile-avatar-initial">?</div>
          <div class="profile-user-info">
            <h2 id="profile-username">Loading...</h2>
            <p class="profile-joined" id="profile-joined-date">Joined --</p>
          </div>
        </div>

        <div class="profile-header-stats">
          <div class="profile-stat-item">
            <span class="profile-stat-label">tests started</span>
            <h3 class="profile-stat-val" id="stat-tests-started">0</h3>
          </div>
          <div class="profile-stat-item">
            <span class="profile-stat-label">tests completed</span>
            <h3 class="profile-stat-val" id="stat-tests-completed">0</h3>
          </div>
          <div class="profile-stat-item">
            <span class="profile-stat-label">time typing</span>
            <h3 class="profile-stat-val" id="stat-time-typing">0:00:00</h3>
          </div>
        </div>
      </div>

      <!-- ALL-TIME ENGLISH LEADERBOARDS BANNER -->
      <div class="profile-card profile-lb-card">
        <span class="profile-lb-title">All-Time English Leaderboard Ranks</span>
        <div class="profile-lb-ranks-container" id="profile-lb-container">
          <!-- Dynamically injected leaderboard summary positions -->
        </div>
      </div>

      <!-- TIME MODES PBS -->
      <div>
        <div class="profile-section-title">⏱ time modes (10, 20, 60, 100)</div>
        <div class="profile-pb-grid" id="pb-grid-time"></div>
      </div>

      <!-- WORD MODES PBS -->
      <div>
        <div class="profile-section-title">📝 word modes (10, 35, 70, 100)</div>
        <div class="profile-pb-grid" id="pb-grid-words"></div>
      </div>

      <!-- ACTIVITY HEATMAP -->
      <div class="profile-card">
        <div class="profile-heatmap-header">
          <span class="profile-section-title" style="margin:0;">activity history (days online)</span>
          <span class="profile-stat-label" id="heatmap-total-tests">0 tests</span>
        </div>
        <div class="profile-heatmap-grid" id="activity-heatmap"></div>
      </div>

      <!-- EXTENDED TELEMETRY BLOCK -->
      <div class="profile-card profile-telemetry-container">
        <div class="profile-words-typed-hero">
          <div class="profile-words-typed-label">estimated words typed</div>
          <div class="profile-words-typed-val" id="stat-estimated-words">0</div>
        </div>

        <div class="profile-telemetry-grid">
          <!-- COLUMN 1: HIGHEST METRICS -->
          <div class="profile-telemetry-col">
            <div class="profile-telemetry-item">
              <span class="profile-telemetry-label">highest wpm</span>
              <div class="profile-telemetry-val" id="stat-highest-wpm">0</div>
            </div>
            <div class="profile-telemetry-item">
              <span class="profile-telemetry-label">highest raw wpm</span>
              <div class="profile-telemetry-val" id="stat-highest-raw">0</div>
            </div>
            <div class="profile-telemetry-item">
              <span class="profile-telemetry-label">highest acc</span>
              <div class="profile-telemetry-val" id="stat-highest-acc">0%</div>
            </div>
            <div class="profile-telemetry-item">
              <span class="profile-telemetry-label">highest consistency</span>
              <div class="profile-telemetry-val" id="stat-highest-cons">0%</div>
            </div>
          </div>

          <!-- COLUMN 2: ALL-TIME AVERAGES -->
          <div class="profile-telemetry-col">
            <div class="profile-telemetry-item">
              <span class="profile-telemetry-label">average wpm</span>
              <div class="profile-telemetry-val" id="stat-avg-wpm">0</div>
            </div>
            <div class="profile-telemetry-item">
              <span class="profile-telemetry-label">average raw wpm</span>
              <div class="profile-telemetry-val" id="stat-avg-raw">0</div>
            </div>
            <div class="profile-telemetry-item">
              <span class="profile-telemetry-label">average acc</span>
              <div class="profile-telemetry-val" id="stat-avg-acc">0%</div>
            </div>
            <div class="profile-telemetry-item">
              <span class="profile-telemetry-label">average consistency</span>
              <div class="profile-telemetry-val" id="stat-avg-cons">0%</div>
            </div>
          </div>

          <!-- COLUMN 3: RECENT 10 TESTS AVERAGES -->
          <div class="profile-telemetry-col">
            <div class="profile-telemetry-item">
              <span class="profile-telemetry-label">average wpm (last 10 tests)</span>
              <div class="profile-telemetry-val" id="stat-recent-wpm">0</div>
            </div>
            <div class="profile-telemetry-item">
              <span class="profile-telemetry-label">average raw wpm (last 10 tests)</span>
              <div class="profile-telemetry-val" id="stat-recent-raw">0</div>
            </div>
            <div class="profile-telemetry-item">
              <span class="profile-telemetry-label">average acc (last 10 tests)</span>
              <div class="profile-telemetry-val" id="stat-recent-acc">0%</div>
            </div>
            <div class="profile-telemetry-item">
              <span class="profile-telemetry-label">average consistency (last 10 tests)</span>
              <div class="profile-telemetry-val" id="stat-recent-cons">0%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- LOGOUT ACTION -->
      <div style="margin-top: 2rem; display: flex; justify-content: flex-end;">
        <button id="logout-button" class="auth-action-btn">Logout</button>
      </div>

    </div>
  `;
}

export async function setupProfileEvents(container, username = null) {
  const data = await fetchUserProfile(username);
  if (!data) return;

  // Header Data
  container.querySelector('#profile-username').textContent = data.username;
  container.querySelector('#profile-avatar-initial').textContent = data.username.charAt(0).toUpperCase();
  container.querySelector('#profile-joined-date').textContent = `Member since ${new Date(data.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  
  // Lifetime Aggregates
  container.querySelector('#stat-tests-started').textContent = data.tests_started;
  container.querySelector('#stat-tests-completed').textContent = data.completed_tests;
  container.querySelector('#stat-time-typing').textContent = formatSeconds(data.time_typing);

  // Populate All-Time Leaderboard Banner for 10, 20, 60, 100 time modes
  const lbContainer = container.querySelector('#profile-lb-container');
  const timeCategories = [10, 20, 60, 100];
  lbContainer.innerHTML = timeCategories.map(sec => {
    const stats = data.pbs?.time?.[sec] || { rank: "-", percentile: "-" };
    return `
      <div class="profile-lb-item">
        <div class="profile-lb-mode">${sec}s time<span>${stats.percentile}</span></div>
        <div class="profile-lb-val">${stats.rank}</div>
      </div>
    `;
  }).join('');

  // Render PB Grids (Time: 10, 20, 60, 100 | Words: 10, 35, 70, 100)
  renderPbs(container.querySelector('#pb-grid-time'), [10, 20, 60, 100], data.pbs?.time, 's');
  renderPbs(container.querySelector('#pb-grid-words'), [10, 35, 70, 100], data.pbs?.words, 'words');

  // Heatmap
  renderHeatmap(container.querySelector('#activity-heatmap'), data.activity_days);
  container.querySelector('#heatmap-total-tests').textContent = `${data.completed_tests} tests`;

  // Extended Telemetry Block
  container.querySelector('#stat-estimated-words').textContent = data.estimated_words_typed || 0;
  
  container.querySelector('#stat-highest-wpm').textContent = Math.round(data.highest_wpm || 0);
  container.querySelector('#stat-highest-raw').textContent = Math.round(data.highest_raw_wpm || 0);
  container.querySelector('#stat-highest-acc').textContent = `${Math.round(data.highest_acc || 0)}%`;
  container.querySelector('#stat-highest-cons').textContent = `${Math.round(data.highest_consistency || 0)}%`;

  container.querySelector('#stat-avg-wpm').textContent = data.avg_wpm || 0;
  container.querySelector('#stat-avg-raw').textContent = data.avg_raw_wpm || 0;
  container.querySelector('#stat-avg-acc').textContent = `${data.avg_acc || 0}%`;
  container.querySelector('#stat-avg-cons').textContent = `${data.avg_consistency || 0}%`;

  container.querySelector('#stat-recent-wpm').textContent = data.recent_10_avg_wpm || 0;
  container.querySelector('#stat-recent-raw').textContent = data.recent_10_avg_raw || 0;
  container.querySelector('#stat-recent-acc').textContent = `${data.recent_10_avg_acc || 0}%`;
  container.querySelector('#stat-recent-cons').textContent = `${data.recent_10_avg_cons || 0}%`;
}

function renderPbs(targetElement, keys, dataset, unit) {
  if (!targetElement) return;
  targetElement.innerHTML = keys.map(key => {
    const stats = dataset?.[key] || { wpm: 0, raw: 0, acc: 0, consistency: 0, rank: "-", percentile: "-" };
    return `
      <div class="profile-pb-card">
        <div>
          <div class="profile-pb-header">
            <span class="profile-pb-mode">${key} ${unit}</span>
            <span class="profile-pb-rank">#${stats.rank} (${stats.percentile})</span>
          </div>
          <div class="profile-pb-wpm">${Math.round(stats.wpm)}</div>
        </div>
        <div class="profile-pb-substats">
          <div>raw: <span>${Math.round(stats.raw)}</span></div>
          <div>acc: <span>${Math.round(stats.acc)}%</span></div>
          <div>cons: <span>${Math.round(stats.consistency)}%</span></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderHeatmap(targetElement, days) {
  if (!targetElement) return;
  if (!days || days.length === 0) {
    targetElement.innerHTML = `<span style="color: #64748b; font-size: 0.8rem;">Complete tests to record activity history.</span>`;
    return;
  }
  targetElement.innerHTML = days.map(d => {
    let lvl = '';
    if (d.tests_count > 10) lvl = 'level-4';
    else if (d.tests_count > 5) lvl = 'level-3';
    else if (d.tests_count > 2) lvl = 'level-2';
    else if (d.tests_count > 0) lvl = 'level-1';
    return `<div class="profile-heatmap-cell ${lvl}" title="${d.date}: ${d.tests_count} tests"></div>`;
  }).join('');
}

function formatSeconds(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}