import { API_ENDPOINT } from '../js/config.js';

export const ChatService = {
    getMessages(username1, username2) {
        return fetch(`${API_ENDPOINT}/api/chat/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username1, username2 })
        })
            .then(response => response.json());
    },
    sendMessage(sender, receiver, message) {
        return fetch(`${API_ENDPOINT}/api/chat/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sender, receiver, message })
        })
            .then(response => response.json());
    },
    getNotifications(token) {
        return fetch(`${API_ENDPOINT}/api/chat/notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        })
            .then(response => response.json());
    }
};
