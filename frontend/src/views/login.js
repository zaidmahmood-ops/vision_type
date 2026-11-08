import { loginUser, registerUser } from '../services/authService.js';

// ==========================================
// 1. LOGIN EVENT HANDLER & VIEW
// ==========================================
export function setupLoginEvents(onSuccess) {
    const form = document.getElementById('login-form');
    const errorBox = document.getElementById('auth-error');
    const submitBtn = document.getElementById('auth-submit-btn');

    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        if (errorBox) {
            errorBox.classList.add('hidden');
            errorBox.innerText = '';
        }

        const identifier = document.getElementById('login-username')?.value.trim();
        const password = document.getElementById('login-password')?.value;

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = 'LOGGING IN...';
        }

        try {
            const response = await loginUser({ identifier, password });
            
            // Standardized key matching api.js and authService.js
            const token = response?.access_token || response?.token;
            if (token) {
                localStorage.setItem('auth_token', token);
                localStorage.setItem('visiontype_username', response.username || identifier);
            }

            if (typeof onSuccess === 'function') {
                onSuccess();
            }
        } catch (err) {
            if (errorBox) {
                errorBox.innerText = err.message || 'Invalid credentials';
                errorBox.classList.remove('hidden');
            }
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = 'LOG IN';
            }
        }
    });
}

export function renderLogin() {
    return `
        <div class="auth-card">
            <div class="auth-header">
                <h2>LOG IN 🔐</h2>
                <p>Sign in to sync your WPM scores and unlock Online PvP</p>
            </div>

            <form id="login-form">
                <div id="auth-error" class="auth-error hidden"></div>

                <div class="input-group">
                    <input 
                        type="text" 
                        id="login-username" 
                        placeholder="username or email" 
                        required 
                        autocomplete="username"
                    >
                </div>

                <div class="input-group">
                    <input 
                        type="password" 
                        id="login-password" 
                        placeholder="password" 
                        required 
                        autocomplete="current-password"
                    >
                </div>

                <button type="submit" id="auth-submit-btn">LOG IN</button>
            </form>

            <div class="auth-footer">
                <span id="auth-toggle-text">Don't have an account?</span>
                <button type="button" id="auth-toggle-btn">Sign Up</button>
            </div>
        </div>
    `;
}

// ==========================================
// 2. REGISTER EVENT HANDLER & VIEW
// ==========================================
export function setupRegisterEvents(onSuccess) {
    const form = document.getElementById('register-form');
    const errorBox = document.getElementById('auth-error');
    const submitBtn = document.getElementById('auth-submit-btn');

    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        if (errorBox) {
            errorBox.classList.add('hidden');
            errorBox.innerText = '';
        }

        const username = document.getElementById('register-username')?.value.trim();
        const email = document.getElementById('register-email')?.value.trim();
        const password = document.getElementById('register-password')?.value;
        const confirmPassword = document.getElementById('register-confirm-password')?.value;

        if (password !== confirmPassword) {
            if (errorBox) {
                errorBox.innerText = 'Passwords do not match';
                errorBox.classList.remove('hidden');
            }
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = 'CREATING...';
        }

        try {
            const response = await registerUser({ username, email, password });
            
            const token = response?.access_token || response?.token;
            if (token) {
                localStorage.setItem('auth_token', token);
                localStorage.setItem('visiontype_username', response.username || username);
            }
            
            if (typeof onSuccess === 'function') {
                onSuccess();
            }
        } catch (err) {
            if (errorBox) {
                errorBox.innerText = err.message;
                errorBox.classList.remove('hidden');
            }
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = 'CREATE ACCOUNT';
            }
        }
    });
}

// Inside renderRegister()
export function renderRegister() {
    return `
        <div class="auth-card">
            <div class="auth-header">
                <h2>REGISTER 📝</h2>
                <p>Create an account to save your progress and compete on the leaderboard</p>
            </div>

            <form id="register-form">
                <div id="auth-error" class="auth-error hidden"></div>

                <div class="input-group">
                    <input 
                        type="text" 
                        id="register-username" 
                        placeholder="username" 
                        required 
                        minlength="3"
                        autocomplete="username"
                    >
                </div>

                <div class="input-group">
                    <input 
                        type="email" 
                        id="register-email" 
                        placeholder="email" 
                        required 
                        autocomplete="email"
                    >
                </div>

                <div class="input-group">
                    <input 
                        type="password" 
                        id="register-password" 
                        placeholder="password" 
                        required 
                        minlength="6"
                        autocomplete="new-password"
                    >
                </div>

                <div class="input-group">
                    <input 
                        type="password" 
                        id="register-confirm-password" 
                        placeholder="confirm password" 
                        required 
                        autocomplete="new-password"
                    >
                </div>

                <button type="submit" id="auth-submit-btn">CREATE ACCOUNT</button>
            </form>

            <div class="auth-footer">
                <span id="auth-toggle-text">Already have an account?</span>
                <button type="button" id="auth-toggle-btn">Log In</button>
            </div>
        </div>
    `;
}