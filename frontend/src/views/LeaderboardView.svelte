<script>
  import { onMount } from 'svelte';
  import { fetchLeaderboardData } from '../services/leaderboardService.js';
  import { escapeHTML } from '../utils/sanitize.js';

  const MODE_CONFIGS = {
    time: ['10', '20', '60', '100'],
    words: ['10', '35', '70', '100'],
  };

  let currentTimeframe = $state('all_time');
  let currentMode = $state('time');
  let currentModeInfo = $state('60');

  let scores = $state(null);
  let loadError = $state(false);
  let countdownSeconds = $state(300);

  const availableLimits = $derived(MODE_CONFIGS[currentMode]);

  const formattedTime = $derived.by(() => {
    const minutes = Math.floor(countdownSeconds / 60);
    const seconds = countdownSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  });

  function formatRank(index) {
    if (index === 0) return '🥇 1';
    if (index === 1) return '🥈 2';
    if (index === 2) return '🥉 3';
    return `#${index + 1}`;
  }

  function formatMetric(value) {
    return value !== undefined ? Number(value).toFixed(1) : '0.0';
  }

  async function loadScores(mode, modeInfo) {
    scores = null;
    loadError = false;
    try {
      const data = await fetchLeaderboardData(mode, modeInfo);
      scores = data;
    } catch {
      loadError = true;
      scores = [];
    }
  }

  function selectTimeframe(timeframe) {
    if (timeframe !== currentTimeframe) {
      currentTimeframe = timeframe;
    }
  }

  function selectMode(mode) {
    if (mode !== currentMode) {
      currentMode = mode;
      currentModeInfo = MODE_CONFIGS[mode][0];
    }
  }

  function selectModeInfo(limit) {
    if (limit !== currentModeInfo) {
      currentModeInfo = limit;
    }
  }

  $effect(() => {
    loadScores(currentMode, currentModeInfo);
  });

  onMount(() => {
    countdownSeconds = 300;
    const timerInterval = setInterval(() => {
      countdownSeconds = countdownSeconds <= 1 ? 300 : countdownSeconds - 1;
    }, 1000);

    return () => {
      clearInterval(timerInterval);
    };
  });
</script>

<div class="leaderboard-layout">
  <aside class="leaderboard-sidebar">
    <div class="menu-group">
      <button
        type="button"
        class="menu-item"
        class:active={currentTimeframe === 'all_time'}
        onclick={() => selectTimeframe('all_time')}
      >
        🌐 all-time english
      </button>
      <button
        type="button"
        class="menu-item"
        class:active={currentTimeframe === 'daily'}
        onclick={() => selectTimeframe('daily')}
      >
        📅 daily
      </button>
    </div>

    <div class="menu-group">
      <div class="menu-label">Mode</div>
      <button
        type="button"
        class="menu-item"
        class:active={currentMode === 'time'}
        onclick={() => selectMode('time')}
      >
        ⏱️ time mode
      </button>
      <button
        type="button"
        class="menu-item"
        class:active={currentMode === 'words'}
        onclick={() => selectMode('words')}
      >
        ✍️ words mode
      </button>
    </div>

    <div class="menu-group">
      <div class="menu-label">{currentMode === 'time' ? 'Time Limit' : 'Word Count'}</div>
      <div class="submode-grid">
        {#each availableLimits as limit (limit)}
          <button
            type="button"
            class="submode-btn"
            class:active={currentModeInfo === limit}
            onclick={() => selectModeInfo(limit)}
          >
            {limit}{currentMode === 'time' ? 's' : 'w'}
          </button>
        {/each}
      </div>
    </div>
  </aside>

  <main class="leaderboard-main">
    <div class="leaderboard-top-bar">
      <span class="cache-timer">Next cache update in: <strong>{formattedTime}</strong></span>
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
          {#if scores === null}
            <tr><td colspan="7" class="loading">Loading rankings...</td></tr>
          {:else if loadError}
            <tr><td colspan="7" class="error">Failed to load leaderboard data.</td></tr>
          {:else if scores.length === 0}
            <tr><td colspan="7" class="no-data">No scores recorded yet for this filter! Be the first!</td></tr>
          {:else}
            {#each scores as score, index (score.id ?? `${score.username}-${score.created_at}-${index}`)}
              {@const safeUsername = escapeHTML(score.username)}
              <tr>
                <td class="rank">{formatRank(index)}</td>
                <td class="username"><a href="#/profile/{safeUsername}">{safeUsername}</a></td>
                <td class="wpm"><strong>{formatMetric(score.wpm)}</strong></td>
                <td class="raw">{formatMetric(score.raw)}</td>
                <td class="accuracy">{formatMetric(score.accuracy)}%</td>
                <td class="consistency">{formatMetric(score.consistency)}%</td>
                <td class="date">{new Date(score.created_at).toLocaleDateString()}</td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </main>
</div>