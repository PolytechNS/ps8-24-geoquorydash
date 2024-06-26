import { API_ENDPOINT } from '../js/config.js';

export const AuthService = {
    login(username, password) {
        return fetch(`${API_ENDPOINT}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        })
            .then(response => response.json());
    },
    signUp(username, password) {
        return fetch(`${API_ENDPOINT}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('An error occurred');
                } else if (response.status === 409) {
                    throw new Error('Username already exists');
                } else {
                    return response.json();
                }
            });
    },
    username(token) {
        return fetch(`${API_ENDPOINT}/api/auth/username`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(response => response.json());
    },
    udpateSkin(token, skinURL) {
        return fetch(`${API_ENDPOINT}/api/auth/updateskin`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ skinURL }),
        })
            .then(response => response.json());
    },
    getSkin(token, skinURL) {
        return fetch(`${API_ENDPOINT}/api/auth/getskin`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then(response => response.json());
    }
};
