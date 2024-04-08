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
    getAchievements(token) {
        return fetch(`${API_ENDPOINT}/api/achievements/getachievements`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                authorization: `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Réponse réseau non ok');
            }
            return response.json(); // Parse la réponse en JSON
        })
        .then(data => {
            return data; // Retourne la valeur pour une utilisation ultérieure
        })
        .catch(error => {
            console.error('Erreur lors de la récupération du nombre de jeux joués:', error);
        });
    }
}