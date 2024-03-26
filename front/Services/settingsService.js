import {API_ENDPOINT} from "../js/config.js";

export const SettingsService = {
    configuration(token) {
        return fetch(`${API_ENDPOINT}/api/configuration/textInteraction`, {
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