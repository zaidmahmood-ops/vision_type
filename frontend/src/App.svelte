<script>
  import TypingView from './views/TypingView.svelte';
  import LoginView from './views/LoginView.svelte';
  import LeaderboardView from './views/LeaderboardView.svelte';
  import PvpView from './views/PvpView.svelte';
  import SettingsView from './views/SettingsView.svelte';
  import InfoView from './views/InfoView.svelte';
  import ProfileView from './views/ProfileView.svelte';

  function readAuthState() {
    const token = localStorage.getItem('auth_token');
    const savedUsername = localStorage.getItem('visiontype_username') || 'User';
    return {
      isLoggedIn: Boolean(token),
      username: token ? savedUsername : 'User',
    };
  }

  const initialAuth = readAuthState();

  let currentRoute = $state('typing');
  let isLoggedIn = $state(initialAuth.isLoggedIn);
  let username = $state(initialAuth.username);
  let dropdownOpen = $state(false);

  function syncAuthFromStorage() {
    const next = readAuthState();
    isLoggedIn = next.isLoggedIn;
    username = next.username;
  }

  function navigateTo(route) {
    syncAuthFromStorage();
    currentRoute = route;
    dropdownOpen = false;
  }

  function handleAuthSuccess() {
    syncAuthFromStorage();
    navigateTo('typing');
  }

  function handleLogout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('visiontype_username');
    syncAuthFromStorage();
    navigateTo('typing');
  }
</script>

<header id="site-header">
  <h1 id="title">VisionType</h1>

  <nav id="nav-links">
    <button id="shuffle-button" type="button" aria-label="Shuffle / Wordsets" onclick={() => navigateTo('typing')}>
      ⌨&#xFE0E;
    </button>
    <button id="leaderboard-button" type="button" aria-label="Leaderboard" onclick={() => navigateTo('leaderboard')}>
      ♜&#xFE0E;
    </button>
    <button id="pvp-button" type="button" aria-label="PvP Multiplayer" onclick={() => navigateTo('pvp')}>
      ⚔&#xFE0E;
    </button>
    <button id="settings-button" type="button" aria-label="Settings" onclick={() => navigateTo('settings')}>
      ⚙&#xFE0E;
    </button>
    <button id="i-button" type="button" aria-label="Information" onclick={() => navigateTo('info')}>
      ℹ&#xFE0E;
    </button>
  </nav>

  <div id="auth-slot">
    {#if !isLoggedIn}
      <button
        id="login-button"
        type="button"
        class="auth-action-btn"
        onclick={() => navigateTo('login')}
      >
        Login
      </button>
    {:else}
      <div id="user-profile-slot" class="user-profile-slot">
        <button
          id="profile-button"
          type="button"
          class="auth-action-btn"
          onclick={() => (dropdownOpen = !dropdownOpen)}
        >
          👤 <span id="nav-username">{username}</span>
        </button>

        <button
          id="notification-button"
          type="button"
          class="icon-btn"
          title="Notifications"
          onclick={() => navigateTo('notifications')}
        >
          ✧
        </button>

        <div
          id="profile-dropdown-modal"
          class="profile-dropdown-modal"
          class:hidden={!dropdownOpen}
        >
          <div class="profile-dropdown-header">
            <span class="dropdown-user-label">Signed in as</span>
            <strong id="dropdown-username-display">{username}</strong>
          </div>
          <div class="profile-dropdown-divider"></div>
          <button
            type="button"
            class="profile-dropdown-item"
            id="dropdown-profile-link"
            onclick={() => navigateTo('user-profile')}
          >
            Profile Dashboard
          </button>
          <button
            type="button"
            class="profile-dropdown-item"
            id="dropdown-settings-link"
            onclick={() => navigateTo('settings')}
          >
            Settings
          </button>
          <div class="profile-dropdown-divider"></div>
          <button
            type="button"
            class="profile-dropdown-item logout-item"
            id="dropdown-logout-btn"
            onclick={handleLogout}
          >
            Log out
          </button>
        </div>
      </div>
    {/if}
  </div>
</header>

<section id="view-container" class="view" class:typing-mode={currentRoute === 'typing'}>
  {#if currentRoute === 'typing'}
    <TypingView />
  {:else if currentRoute === 'pvp'}
    <PvpView {username} />
  {:else if currentRoute === 'login'}
    <LoginView initialMode="login" onAuthSuccess={handleAuthSuccess} />
  {:else if currentRoute === 'register'}
    <LoginView initialMode="register" onAuthSuccess={handleAuthSuccess} />
  {:else if currentRoute === 'leaderboard'}
    <LeaderboardView />
  {:else if currentRoute === 'settings'}
    <SettingsView />
  {:else if currentRoute === 'info'}
    <InfoView />
  {:else if currentRoute === 'user-profile'}
    <ProfileView {username} onLogout={handleLogout} />
  {:else if currentRoute === 'notifications'}
    <div class="info-container">
      <section class="info-section">
        <h2>Notifications</h2>
        <p>No new notifications.</p>
      </section>
    </div>
  {/if}
</section>