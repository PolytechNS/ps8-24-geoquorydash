import { API_ENDPOINT } from '../js/config.js';

export const GameService = {
    newGame() {
        return fetch(`${API_ENDPOINT}/api/game/newGame`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        })
            .then(response => response.json());
    },
    resumeGame(){
        return fetch(`${API_ENDPOINT}/api/game/resumeGame`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        })
            .then(response => response.json());
    }
};