import { GameService } from "../Services/gameService.js";


document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (token){
        GameService.history(token)
            .then(data => {
                const gameStates = data.gameStates;
                const listElement = document.createElement('ul');
                let partNumber = 1; // Variable pour numéro de partie
                gameStates.forEach(id => {
                    const itemLi = document.createElement('li');
                    const itemButton = document.createElement('button');
                    itemLi.appendChild(itemButton);
                    itemButton.textContent = `Partie ${partNumber}`;
                    itemButton.dataset.gameId = id;
                    itemButton.addEventListener('click', () => {
                        loadGame(id);
                    });
                    listElement.appendChild(itemLi);
                    partNumber++;
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

function loadGame(gameStateId) {
    console.log('AZY1');
    localStorage.setItem('gameStateID', gameStateId);
    window.location.href = '../gamePage/gamePage.html?resumeGame=true';
}