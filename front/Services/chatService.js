import { API_ENDPOINT } from '../js/config.js';

export const ChatService = {
    getMessages(username1, username2) {
        return fetch(`${API_ENDPOINT}/api/chat/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username1, username2 })
        })
            .then(response => response.json());
    }
};
