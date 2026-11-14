// src/navigation.js
import * as typingTestView from './views/typingTest.js';
import { renderLogin, renderRegister, setupLoginEvents, setupRegisterEvents } from './views/login.js';
import { renderLeaderboard, setupLeaderboardEvents } from './views/leaderboard.js';
import { renderPvp, setupPvpEvents, cleanupPvp } from './views/pvp.js';
import { renderSettings } from './views/settings.js';
import { renderInfo } from './views/info.js';
import { renderProfile, setupProfileEvents} from './views/user-profile.js';

let currentRoute = 'typing';

export function navigateTo(route) {
  const container = document.getElementById('view-container');
  if (!container) return;

  if (currentRoute === 'typing' && route !== 'typing') {
    typingTestView.cleanupTypingGame();
  }

  // Leaving PvP: stop the race engine and close the socket (no stray UI callbacks)
  if (currentRoute === 'pvp' && route !== 'pvp') {
    cleanupPvp();
  }

  currentRoute = route;
  container.classList.toggle('typing-mode', route === 'typing');

  switch (route) {
    case 'typing':
      typingTestView.initTypingGame();
      break;
    case 'login':
      container.innerHTML = renderLogin();
      // On successful login, update auth state in navbar and go back to typing
      setupLoginEvents(() => {
        checkAuthState();
        navigateTo('typing');
      });
      break;
    case 'register':
      container.innerHTML = renderRegister();
      setupRegisterEvents(() => {
        checkAuthState();
        navigateTo('typing');
      });
      break;
    case 'leaderboard':
      container.innerHTML = renderLeaderboard();
      setupLeaderboardEvents(container);
      break;
    case 'pvp':
      container.innerHTML = renderPvp();
      setupPvpEvents(container);
      break;
    case 'settings':
      container.innerHTML = renderSettings();
      break;
    case 'info':
      container.innerHTML = renderInfo();
      break;
    case 'user-profile':
      container.innerHTML = renderProfile();
      setupProfileEvents(container);
      break;
    default:
      typingTestView.initTypingGame();
  }
}

export function initNavigation() {
  // Navigation button listeners
  document.getElementById('shuffle-button')?.addEventListener('click', () => navigateTo('typing'));
  document.getElementById('leaderboard-button')?.addEventListener('click', () => navigateTo('leaderboard'));
  document.getElementById('pvp-button')?.addEventListener('click', () => navigateTo('pvp'));
  document.getElementById('settings-button')?.addEventListener('click', () => navigateTo('settings'));
  document.getElementById('i-button')?.addEventListener('click', () => navigateTo('info'));

  document.getElementById('login-button')?.addEventListener('click', () => navigateTo('login'));
  document.getElementById('logout-button')?.addEventListener('click', handleLogout);
  document.getElementById('profile-button')?.addEventListener('click', () => navigateTo('user-profile'))
  document.getElementById('notification-button')?.addEventListener('click', () => navigateTo('notifications'));

  // Run auth check on initial page load
  checkAuthState();
}

// Event Delegation for dynamic sub-views (like auth toggle links)
const container = document.getElementById('view-container');
container?.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'auth-toggle-btn') {
    if (currentRoute === 'login') {
      navigateTo('register');
    } else if (currentRoute === 'register') {
      navigateTo('login');
    }
  }
});

// Check if user is logged in and toggle visibility accordingly
export function checkAuthState() {
  const loginBtn = document.getElementById('login-button');
  const userProfileSlot = document.getElementById('user-profile-slot');
  const navUsername = document.getElementById('nav-username');

  const token = localStorage.getItem('auth_token');
  const username = localStorage.getItem('visiontype_username') || 'User';

  if (token) {
    // Hide login button, show profile slot with username
    loginBtn?.classList.add('hidden');
    userProfileSlot?.classList.remove('hidden');
    if (navUsername) {
      navUsername.innerText = username;
    }
  } else  {
    // Show login button, hide profile slot
    loginBtn?.classList.remove('hidden');
    userProfileSlot?.classList.add('hidden');
  }
}

// Handle logout action
function handleLogout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('visiontype_username');
  checkAuthState(); // Instantly flips navbar back to login state
  navigateTo('typing');
}