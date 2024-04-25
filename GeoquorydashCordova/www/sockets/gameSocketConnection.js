var gameSocket = io('/api/game', {
    query: {
        token: localStorage.getItem('token'),
    }
});
import { updateBoardDisplay } from '../gamePage/fogOfWar.js';
import { updateSkin } from '../gamePage/game.js';
import {
    displayPossibleMove,
    endGame,
    lockBarrier,
    ImpossibleWallPlacementPopUp
} from '../gamePage/game.js';

gameSocket.on('connect', function() {
    console.log('Connected to /api/game!');
});

gameSocket.on('updateBoard', function(gameState, visibilityMap, gameStateID, player, storeInQueue) {
    if (gameStateID) {
        localStorage.setItem('gameStateID', gameStateID);
    }
    updateBoardDisplay(gameState, visibilityMap, player);

});

gameSocket.on('possibleMoveList', function(possibleMove) {
    displayPossibleMove(possibleMove);
});

gameSocket.on('endGame', function(player) {
    console.log('endGame');
    endGame(player);
});

gameSocket.on('lockWall', function(wall) {
    lockBarrier(wall);
});

gameSocket.on('toggleAndLockWall', function(wall) {
    lockBarrier(wall, true);
});

gameSocket.on('ImpossibleWallPosition', function() {
    ImpossibleWallPlacementPopUp();
});

window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const newGame = urlParams.get('newGame');
    const resumeGame = urlParams.get('resumeGame');

    if (newGame === 'true') {
        if (localStorage.getItem('gameStateID')){
            gameSocket.emit('quitGame', localStorage.getItem('token'), localStorage.getItem('gameStateID'));
        }
        gameSocket.emit('startNewGame', localStorage.getItem('token'));
    } else if (resumeGame === 'true') {
        const gameStateID = localStorage.getItem('gameStateID');
        const token = localStorage.getItem('token');
        if (gameStateID && token) {
            gameSocket.emit('resumeGame', gameStateID, token);
        } else {
            var modal = document.getElementById("modalErreur");
            var modalContent = document.querySelector('.modal-content-erreur');
            document.querySelector('.modal-content-erreur p').textContent = 'Une erreur est survenue. Veuillez vous reconnecter.';

            var btn = document.getElementById("erreurBtn");

            modal.style.display = "flex";

            btn.onclick = function() {
                modal.style.display = "none";
                window.location.href = '/home.html';
            }
        }
    }
};

gameSocket.on('tokenInvalid', function() {
    localStorage.removeItem('token');
    var modal = document.getElementById("modalErreur");
    var modalContent = document.querySelector('.modal-content-erreur');
    document.querySelector('.modal-content-erreur p').textContent = 'Votre session a expiré. Veuillez vous reconnecter.';

    var btn = document.getElementById("erreurBtn");

    modal.style.display = "flex";

    btn.onclick = function() {
        modal.style.display = "none";
        window.location.href = '/home.html';
    }
});

gameSocket.on('databaseConnectionError', function() {
    var modal = document.getElementById("modalErreur");
    var modalContent = document.querySelector('.modal-content-erreur');
    document.querySelector('.modal-content-erreur p').textContent = 'Probleme de connexion avec la base de données. Veuillez réessayer plus tard.';

    var btn = document.getElementById("erreurBtn");

    modal.style.display = "flex";

    btn.onclick = function() {
        modal.style.display = "none";
        window.location.href = '/home.html';
    }
});




gameSocket.on('gameAlreadyInProgress', function(gameStateId) {
    var modal = document.getElementById("modalErreur");
    var modalContent = document.querySelector('.modal-content-erreur');
    document.querySelector('.modal-content-erreur p').textContent = 'Une partie est déjà en cours.';

    var btn = document.getElementById("erreurBtn");

    modal.style.display = "flex";

    btn.onclick = function() {
        modal.style.display = "none";
        window.location.href = '/gameLocal/gameLocal.html';
        localStorage.setItem('gameStateID', gameStateId);

    }
});

gameSocket.on('updateSkin', function(skinURL1, skinURL2) {
    updateSkin(skinURL1, skinURL2);
});

export default gameSocket;