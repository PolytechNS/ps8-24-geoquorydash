import { API_ENDPOINT } from '../js/config.js';

export const ProfileService = {
    picture(username) {
        return fetch(`${API_ENDPOINT}/api/profile/picture`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        })
            .then(response => response.json());
    }
};
