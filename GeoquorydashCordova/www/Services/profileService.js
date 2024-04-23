import { API_ENDPOINT } from '../js/config.js';

export const ProfileService = {
    picture(username) {
        return fetch(`${API_ENDPOINT}/api/profile/picture`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        })
            .then(response => response.json());
    },
    button(username, currentUser){
        return fetch(`${API_ENDPOINT}/api/profile/button`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, currentUser }),
        })
            .then(response => response.json());
    },
    updatePicture(username, profilePicture){
        return fetch(`${API_ENDPOINT}/api/profile/updatePicture`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, profilePicture }),
        })
            .then(response => response.json());
    }
};
