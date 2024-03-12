import { API_ENDPOINT } from '../js/config.js';

export const SearchService = {
    searchUsers(username) {
        return fetch(`${API_ENDPOINT}/api/friends/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        })
            .then(response => response.json());
    }
};
