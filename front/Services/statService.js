import { API_ENDPOINT } from '../js/config.js';

export const StatService = {
    associateStatToNewUser(username) {
        console.log("On va envoyer la requête " + username);
        return fetch(`${API_ENDPOINT}/api/stat/associatestat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        })
            .then(response => {
                console.log("La requête est bien partie");
                if (!response.ok) {
                    throw new Error('An error occurred');
                } else if (response.status === 409) {
                    throw new Error('Username already exists');
                } else {
                    console.log("La réponse est bonne");
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
        })
        .then(data => {
            console.log("Nombre de jeux joués :", data.numberOfGames); // Affiche la valeur de numberOfGames
            return data.numberOfGames; // Retourne la valeur pour une utilisation ultérieure
        })
        .catch(error => {
            console.error('Erreur lors de la récupération du nombre de jeux joués:', error);
        });
    }
};
