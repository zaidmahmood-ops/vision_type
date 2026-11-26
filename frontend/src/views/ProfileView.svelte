<script>
  import { fetchUserProfile } from '../services/user-profileService.js';

  let { username = null, onLogout } = $props();

  let profile = $state(null);

  const timeCategories = [10, 20, 60, 100];
  const wordCategories = [10, 35, 70, 100];

  function formatSeconds(secs) {
    const safeSecs = Number(secs) || 0;
    const h = Math.floor(safeSecs / 3600);
    const m = Math.floor((safeSecs % 3600) / 60);
    const s = Math.floor(safeSecs % 60);
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function formatJoinedDate(createdAt) {
    if (!createdAt) return 'Joined --';
    const formatted = new Date(createdAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    return `Member since ${formatted}`;
  }

  function getHeatmapLevel(count) {
    if (count > 10) return 'level-4';
    if (count > 5) return 'level-3';
    if (count > 2) return 'level-2';
    if (count > 0) return 'level-1';
    return '';
  }

  $effect(() => {
    let active = true;
    profile = null;

    fetchUserProfile(username).then((data) => {
      if (active && data) {
        profile = data;
      }
    });

    return () => {
      active = false;
    };
  });

  const displayName = $derived(profile?.username || username || 'Loading...');
  const avatarInitial = $derived(
    profile?.username ? profile.username.charAt(0).toUpperCase() : '?'
  );
</script>

<div class="profile-wrapper">
  <!-- USER HEADER BANNER -->
  <div class="profile-card profile-user-card">
    <div class="profile-user-main">
      <div class="profile-avatar" id="profile-avatar-initial">{avatarInitial}</div>
      <div class="profile-user-info">
        <h2 id="profile-username">{displayName}</h2>
        <p class="profile-joined" id="profile-joined-date">
          {profile ? formatJoinedDate(profile.created_at) : 'Joined --'}
        </p>
      </div>
    </div>

    <div class="profile-header-stats">
      <div class="profile-stat-item">
        <span class="profile-stat-label">tests started</span>
        <h3 class="profile-stat-val" id="stat-tests-started">{profile?.tests_started ?? 0}</h3>
      </div>
      <div class="profile-stat-item">
        <span class="profile-stat-label">tests completed</span>
        <h3 class="profile-stat-val" id="stat-tests-completed">{profile?.completed_tests ?? 0}</h3>
      </div>
      <div class="profile-stat-item">
        <span class="profile-stat-label">time typing</span>
        <h3 class="profile-stat-val" id="stat-time-typing">
          {formatSeconds(profile?.time_typing)}
        </h3>
      </div>
    </div>
  </div>

  <!-- ALL-TIME ENGLISH LEADERBOARDS BANNER -->
  <div class="profile-card profile-lb-card">
    <span class="profile-lb-title">All-Time English Leaderboard Ranks</span>
    <div class="profile-lb-ranks-container" id="profile-lb-container">
      {#each timeCategories as sec (sec)}
        {@const stats = profile?.pbs?.time?.[sec] || { rank: '-', percentile: '-' }}
        <div class="profile-lb-item">
          <div class="profile-lb-mode">{sec}s time<span>{stats.percentile}</span></div>
          <div class="profile-lb-val">{stats.rank}</div>
        </div>
      {/each}
    </div>
  </div>

  <!-- TIME MODES PBS -->
  <div>
    <div class="profile-section-title">⏱ time modes (10, 20, 60, 100)</div>
    <div class="profile-pb-grid" id="pb-grid-time">
      {#each timeCategories as key (key)}
        {@const stats = profile?.pbs?.time?.[key] || {
          wpm: 0,
          raw: 0,
          acc: 0,
          consistency: 0,
          rank: '-',
          percentile: '-',
        }}
        <div class="profile-pb-card">
          <div>
            <div class="profile-pb-header">
              <span class="profile-pb-mode">{key} s</span>
              <span class="profile-pb-rank">#{stats.rank} ({stats.percentile})</span>
            </div>
            <div class="profile-pb-wpm">{Math.round(stats.wpm)}</div>
          </div>
          <div class="profile-pb-substats">
            <div>raw: <span>{Math.round(stats.raw)}</span></div>
            <div>acc: <span>{Math.round(stats.acc)}%</span></div>
            <div>cons: <span>{Math.round(stats.consistency)}%</span></div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- WORD MODES PBS -->
  <div>
    <div class="profile-section-title">📝 word modes (10, 35, 70, 100)</div>
    <div class="profile-pb-grid" id="pb-grid-words">
      {#each wordCategories as key (key)}
        {@const stats = profile?.pbs?.words?.[key] || {
          wpm: 0,
          raw: 0,
          acc: 0,
          consistency: 0,
          rank: '-',
          percentile: '-',
        }}
        <div class="profile-pb-card">
          <div>
            <div class="profile-pb-header">
              <span class="profile-pb-mode">{key} words</span>
              <span class="profile-pb-rank">#{stats.rank} ({stats.percentile})</span>
            </div>
            <div class="profile-pb-wpm">{Math.round(stats.wpm)}</div>
          </div>
          <div class="profile-pb-substats">
            <div>raw: <span>{Math.round(stats.raw)}</span></div>
            <div>acc: <span>{Math.round(stats.acc)}%</span></div>
            <div>cons: <span>{Math.round(stats.consistency)}%</span></div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- ACTIVITY HEATMAP -->
  <div class="profile-card">
    <div class="profile-heatmap-header">
      <span class="profile-section-title" style="margin:0;">activity history (days online)</span>
      <span class="profile-stat-label" id="heatmap-total-tests">
        {profile?.completed_tests ?? 0} tests
      </span>
    </div>
    <div class="profile-heatmap-grid" id="activity-heatmap">
      {#if !profile?.activity_days || profile.activity_days.length === 0}
        <span style="color: #64748b; font-size: 0.8rem;">
          Complete tests to record activity history.
        </span>
      {:else}
        {#each profile.activity_days as day (day.date)}
          <div
            class="profile-heatmap-cell {getHeatmapLevel(day.tests_count)}"
            title="{day.date}: {day.tests_count} tests"
          ></div>
        {/each}
      {/if}
    </div>
  </div>

  <!-- EXTENDED TELEMETRY BLOCK -->
  <div class="profile-card profile-telemetry-container">
    <div class="profile-words-typed-hero">
      <div class="profile-words-typed-label">estimated words typed</div>
      <div class="profile-words-typed-val" id="stat-estimated-words">
        {profile?.estimated_words_typed ?? 0}
      </div>
    </div>

    <div class="profile-telemetry-grid">
      <div class="profile-telemetry-col">
        <div class="profile-telemetry-item">
          <span class="profile-telemetry-label">highest wpm</span>
          <div class="profile-telemetry-val" id="stat-highest-wpm">
            {Math.round(profile?.highest_wpm || 0)}
          </div>
        </div>
        <div class="profile-telemetry-item">
          <span class="profile-telemetry-label">highest raw wpm</span>
          <div class="profile-telemetry-val" id="stat-highest-raw">
            {Math.round(profile?.highest_raw_wpm || 0)}
          </div>
        </div>
        <div class="profile-telemetry-item">
          <span class="profile-telemetry-label">highest acc</span>
          <div class="profile-telemetry-val" id="stat-highest-acc">
            {Math.round(profile?.highest_acc || 0)}%
          </div>
        </div>
        <div class="profile-telemetry-item">
          <span class="profile-telemetry-label">highest consistency</span>
          <div class="profile-telemetry-val" id="stat-highest-cons">
            {Math.round(profile?.highest_consistency || 0)}%
          </div>
        </div>
      </div>

      <div class="profile-telemetry-col">
        <div class="profile-telemetry-item">
          <span class="profile-telemetry-label">average wpm</span>
          <div class="profile-telemetry-val" id="stat-avg-wpm">{profile?.avg_wpm ?? 0}</div>
        </div>
        <div class="profile-telemetry-item">
          <span class="profile-telemetry-label">average raw wpm</span>
          <div class="profile-telemetry-val" id="stat-avg-raw">{profile?.avg_raw_wpm ?? 0}</div>
        </div>
        <div class="profile-telemetry-item">
          <span class="profile-telemetry-label">average acc</span>
          <div class="profile-telemetry-val" id="stat-avg-acc">{profile?.avg_acc ?? 0}%</div>
        </div>
        <div class="profile-telemetry-item">
          <span class="profile-telemetry-label">average consistency</span>
          <div class="profile-telemetry-val" id="stat-avg-cons">
            {profile?.avg_consistency ?? 0}%
          </div>
        </div>
      </div>

      <div class="profile-telemetry-col">
        <div class="profile-telemetry-item">
          <span class="profile-telemetry-label">average wpm (last 10 tests)</span>
          <div class="profile-telemetry-val" id="stat-recent-wpm">
            {profile?.recent_10_avg_wpm ?? 0}
          </div>
        </div>
        <div class="profile-telemetry-item">
          <span class="profile-telemetry-label">average raw wpm (last 10 tests)</span>
          <div class="profile-telemetry-val" id="stat-recent-raw">
            {profile?.recent_10_avg_raw ?? 0}
          </div>
        </div>
        <div class="profile-telemetry-item">
          <span class="profile-telemetry-label">average acc (last 10 tests)</span>
          <div class="profile-telemetry-val" id="stat-recent-acc">
            {profile?.recent_10_avg_acc ?? 0}%
          </div>
        </div>
        <div class="profile-telemetry-item">
          <span class="profile-telemetry-label">average consistency (last 10 tests)</span>
          <div class="profile-telemetry-val" id="stat-recent-cons">
            {profile?.recent_10_avg_cons ?? 0}%
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- LOGOUT ACTION -->
  <div style="margin-top: 2rem; display: flex; justify-content: flex-end;">
    <button
      id="logout-button"
      type="button"
      class="auth-action-btn"
      onclick={() => onLogout?.()}
    >
      Logout
    </button>
  </div>
</div>