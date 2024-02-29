import { GameService } from "../Services/gameService.js";


document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (token){
        console.log('Demande de l\'historique avec le token:', token);
        GameService.history(token)
            .then(data => {
                console.log('Reponse recu : ', data);
                const gameStates = data.gameStates;
                const listElement = document.createElement('ul');
                gameStates.forEach(id => {
                    const item = document.createElement('li');
                    item.textContent = id;
                    listElement.appendChild(item);
                });

                document.body.appendChild(listElement);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des données:', error);
                alert('Erreur lors de la récupération des données');
                window.location.href = '/home.html';
            });
    } else {
        alert('Vous devez être connecté pour accéder à cette page');
        window.location.href = '/home.html';
    }

});