import { API_ENDPOINT } from '../js/config.js';

export const FriendsService = {
    searchUsers(username) {
        return fetch(`${API_ENDPOINT}/api/friends/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        })
            .then(response => response.json());
    },
    addFriend(currentUser, targetUser) {
        return fetch(`${API_ENDPOINT}/api/friends/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentUser, targetUser }),
        })
            .then(response => response.json());
    }
};
