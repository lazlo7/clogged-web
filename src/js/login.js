import { getApiPath } from './config.js';


window.login = async function _() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(getApiPath('/auth/login'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: username, password: password }),
        });

        if (response.status === 401 || response.status === 422) { 
            throw new Error('Incorrect username or password');
        }
        
        const data = await response.json();
        if (data.detail) {
            throw new Error(data.detail);
        }

        if (!data.id || !data.username || data.username !== username) {
            throw new Error('Incorrect response from server, please try again later');
        }

    } catch (error) {
        console.log(error.message);
        return;
    }

    window.location.href = '/dashboard';
}


window.logout = async function _() {
    const response = await fetch(getApiPath('/auth/logout'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (response.status === 401) {
        alert('You are not logged in');
        return;
    }

    if (response.status !== 200) {
        alert('Failed to logout, please try again later');
        return;
    }

    json_response = await response.json();
    console.log(`Logged out for id: ${json_response.id} username: ${json_response.username} from ${json_response.sessions_revoked_n} sessions`);

    window.location.href = '/';
}


async function is_authenticated() {
    // Since the cookie is http-only, we can't access it from JavaScript.
    // Instead, we check whether /auth/check endpoint returns 200 or not.
    try {
        const response = await fetch(getApiPath('/auth/check'), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.status === 200;
    } catch (error) {
        return false;
    }
}


async function add_auth_button() {
    // Add either a login or logout button depending on session_id cookie.
    const is_auth = await is_authenticated();
    const button = document.getElementById('auth-button');
    if (is_auth) {
        button.outerHTML = '<span id="auth-button" onclick="logout()" class="link green">logout</span>';
    } else {
        button.outerHTML = '<a id="auth-button" href="/login" class="link green">login</a>';
    }
}

window.onload = add_auth_button;