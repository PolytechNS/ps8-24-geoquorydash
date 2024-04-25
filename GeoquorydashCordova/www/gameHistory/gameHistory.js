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
                var modal = document.getElementById("myModal");
                var modalContent = document.querySelector('.modal-content');

                var textContent = document.querySelector('.modal-content p')
                textContent.textContent = "Erreur lors de la récupération des données";

                modal.style.display = "flex";

                var okButton = document.getElementById('confirmBtn');
                okButton.onclick = function() {
                    localStorage.clear();
                    modal.style.display = "none";
                    window.location.href = '/home.html';
                };
            });
    } else {
        var modal = document.getElementById("myModal");
        var modalContent = document.querySelector('.modal-content');

        var textContent = document.querySelector('.modal-content p')
        textContent.textContent = "Vous devez être connecté pour accéder à cette page";

        modal.style.display = "flex";

        var okButton = document.getElementById('confirmBtn');
        okButton.onclick = function() {
            localStorage.clear();
            modal.style.display = "none";
            window.location.href = '/home.html';
        };
    }
});

function loadGame(gameStateId) {
    localStorage.setItem('gameStateID', gameStateId);
    window.location.href = '../gamePage/gamePage.html?resumeGame=true';
}