import { API_ENDPOINT } from '../js/config.js';

export const StatService = {
    associateStatToNewUser(username) {
        return fetch(`${API_ENDPOINT}/api/stat/associatestat`, {
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
    numberOfPlayedGames(token) {
        return fetch(`${API_ENDPOINT}/api/stat/numberofplayedgames`, {
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
        });
    },
    getStat(token) {
        return fetch(`${API_ENDPOINT}/api/stat/getstat`, {
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
            return data.stat; // Retourne la valeur pour une utilisation ultérieure
        })
        .catch(error => {
            console.error('Erreur lors de la récupération du nombre de jeux joués:', error);
        });
    },
    getRanking(token) {
        return fetch(`${API_ENDPOINT}/api/stat/ranking`, {
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
        });
    },
    getAllRanking() {
        return fetch(`${API_ENDPOINT}/api/stat/allranking`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Réponse réseau non ok');
            }
            return response.json(); // Parse la réponse en JSON
        });
    }
};
