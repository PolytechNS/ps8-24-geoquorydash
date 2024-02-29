import { API_ENDPOINT } from '../js/config.js';

export const GameService = {
    history(token) {
        console.log('GameService.history');
        return fetch(`${API_ENDPOINT}/api/game/history`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                authorization: `Bearer ${token}`
            }
        }).then(response => {
                if (!response.ok) {
                    throw new Error('Réponse réseau non ok');
                }
                return response.json();
            });
    }
};
