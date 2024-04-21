import { API_ENDPOINT } from '../js/config.js';

export const AchievementsService = {
    associateAchievementsToNewUser(username) {
        return fetch(`${API_ENDPOINT}/api/achievements/associateachievements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
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
    updateFriendsAchievements(username, numberOfFriends) {
        return fetch(`${API_ENDPOINT}/api/achievements/updatefriendsachievements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, numberOfFriends }),
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
    getAchievements(username) {
        return fetch(`${API_ENDPOINT}/api/achievements/getachievements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Réponse réseau non ok');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des achievements:', error);
            throw error;
        });
    }
}