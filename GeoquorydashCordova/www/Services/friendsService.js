import { API_ENDPOINT } from '../js/config.js';
import {sendMobileNotification} from "./mobileNotificationsService.js";

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
            .then(response => {
                sendMobileNotification('Hello, user!', [currentUser.toString()])
                    .then(response => console.log('Notification response:', response))
                    .catch(error => console.error('Failed to send notification:', error));
                response.json();
            });
    },
    getRequests(currentUser) {
        return fetch(`${API_ENDPOINT}/api/friends/requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentUser }),
        })
            .then(response => response.json());
    },
    acceptFriend(currentUser, targetUser) {
        return fetch(`${API_ENDPOINT}/api/friends/accept`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentUser, targetUser }),
        })
            .then(response => response.json());
    },
    cancelFriend(currentUser, targetUser) {
        return fetch(`${API_ENDPOINT}/api/friends/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentUser, targetUser }),
        })
            .then(response => response.json());
    },
    deniedFriend(currentUser, targetUser) {
        return fetch(`${API_ENDPOINT}/api/friends/denied`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentUser, targetUser }),
        })
            .then(response => response.json());
    },
    getFriends(currentUser) {
        return fetch(`${API_ENDPOINT}/api/friends/friends`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentUser }),
        })
            .then(response => response.json());
    },
    removeFriend(currentUser, targetUser) {
        return fetch(`${API_ENDPOINT}/api/friends/remove`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentUser, targetUser }),
        })
            .then(response => response.json());
    },
};
