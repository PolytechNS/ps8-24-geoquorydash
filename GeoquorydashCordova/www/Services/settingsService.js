import {API_ENDPOINT} from "../js/config.js";

export const SettingsService = {
    getConfiguration(token) {
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
    },

    saveConfiguration(token, configuration) {
        return fetch(`${API_ENDPOINT}/api/configuration/textInteraction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                authorization: `Bearer ${token}`
            },
            body: JSON.stringify(configuration)
        }).then(response => {
            if (!response.ok) {
                window.location.reload();
                throw new Error('Réponse réseau non ok');
            }
        });
    }
};