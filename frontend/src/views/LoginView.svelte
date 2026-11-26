<script>
  import { loginUser, registerUser } from '../services/authService.js';

  let { initialMode = 'login', onAuthSuccess } = $props();

  let mode = $state(initialMode);
  let errorMessage = $state('');
  let isSubmitting = $state(false);

  let identifier = $state('');
  let loginPassword = $state('');

  let regUsername = $state('');
  let regEmail = $state('');
  let regPassword = $state('');
  let regConfirmPassword = $state('');

  function switchMode(nextMode) {
    mode = nextMode;
    errorMessage = '';
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    errorMessage = '';
    isSubmitting = true;

    try {
      const response = await loginUser({
        identifier: identifier.trim(),
        password: loginPassword,
      });

      const token = response?.access_token || response?.token;
      if (token) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem(
          'visiontype_username',
          response.username || identifier.trim()
        );
      }

      onAuthSuccess?.();
    } catch (err) {
      errorMessage = err?.message || 'Invalid credentials';
    } finally {
      isSubmitting = false;
    }
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    errorMessage = '';

    if (regPassword !== regConfirmPassword) {
      errorMessage = 'Passwords do not match';
      return;
    }

    isSubmitting = true;

    try {
      const response = await registerUser({
        username: regUsername.trim(),
        email: regEmail.trim(),
        password: regPassword,
      });

      const token = response?.access_token || response?.token;
      if (token) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem(
          'visiontype_username',
          response.username || regUsername.trim()
        );
      }

      onAuthSuccess?.();
    } catch (err) {
      errorMessage = err?.message || 'Registration failed';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="auth-card">
  {#if mode === 'login'}
    <div class="auth-header">
      <h2>LOG IN 🔐</h2>
      <p>Sign in to sync your WPM scores and unlock Online PvP</p>
    </div>

    <form id="login-form" onsubmit={handleLoginSubmit}>
      {#if errorMessage}
        <div id="auth-error" class="auth-error">{errorMessage}</div>
      {/if}

      <div class="input-group">
        <input
          type="text"
          id="login-username"
          placeholder="username or email"
          required
          autocomplete="username"
          bind:value={identifier}
        />
      </div>

      <div class="input-group">
        <input
          type="password"
          id="login-password"
          placeholder="password"
          required
          autocomplete="current-password"
          bind:value={loginPassword}
        />
      </div>

      <button type="submit" id="auth-submit-btn" disabled={isSubmitting}>
        {isSubmitting ? 'LOGGING IN...' : 'LOG IN'}
      </button>
    </form>

    <div class="auth-footer">
      <span id="auth-toggle-text">Don't have an account?</span>
      <button type="button" id="auth-toggle-btn" onclick={() => switchMode('register')}>
        Sign Up
      </button>
    </div>
  {:else}
    <div class="auth-header">
      <h2>REGISTER 📝</h2>
      <p>Create an account to save your progress and compete on the leaderboard</p>
    </div>

    <form id="register-form" onsubmit={handleRegisterSubmit}>
      {#if errorMessage}
        <div id="auth-error" class="auth-error">{errorMessage}</div>
      {/if}

      <div class="input-group">
        <input
          type="text"
          id="register-username"
          placeholder="username"
          required
          minlength="3"
          autocomplete="username"
          bind:value={regUsername}
        />
      </div>

      <div class="input-group">
        <input
          type="email"
          id="register-email"
          placeholder="email"
          required
          autocomplete="email"
          bind:value={regEmail}
        />
      </div>

      <div class="input-group">
        <input
          type="password"
          id="register-password"
          placeholder="password"
          required
          minlength="6"
          autocomplete="new-password"
          bind:value={regPassword}
        />
      </div>

      <div class="input-group">
        <input
          type="password"
          id="register-confirm-password"
          placeholder="confirm password"
          required
          autocomplete="new-password"
          bind:value={regConfirmPassword}
        />
      </div>

      <button type="submit" id="auth-submit-btn" disabled={isSubmitting}>
        {isSubmitting ? 'CREATING...' : 'CREATE ACCOUNT'}
      </button>
    </form>

    <div class="auth-footer">
      <span id="auth-toggle-text">Already have an account?</span>
      <button type="button" id="auth-toggle-btn" onclick={() => switchMode('login')}>
        Log In
      </button>
    </div>
  {/if}
</div>