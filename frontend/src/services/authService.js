import { apiRequest } from './api.js';



export async function registerUser({ username, email, password }) {

    // Correct endpoint: /register (api.js adds /api -> /api/register)

    const data = await apiRequest('/api/register', {

        method: 'POST',

        body: JSON.stringify({ username, email, password }),

    });



    if (data.access_token) {

        localStorage.setItem('auth_token', data.access_token);

        if (data.username || username) {

            localStorage.setItem('visiontype_username', data.username || username);

        }

    }



    return data;

}



export async function loginUser({ identifier, password }) {

    const data = await apiRequest('/api/login', {

        method: 'POST',

        body: JSON.stringify({ email: identifier, password }), // <-- Changed 'username' to 'email'

    });



    if (data.access_token) {

        localStorage.setItem('auth_token', data.access_token);

        if (data.username) {

            localStorage.setItem('visiontype_username', data.username);

        }

    }



    return data;

} 