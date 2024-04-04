var gameSocket = io('/api/game');
import { updateBoardDisplay } from '../gamePage/fogOfWar.js';
import {
    displayPossibleMove,
    endGame,
    lockBarrier,
    ImpossibleWallPlacementPopUp,
} from '../gamePage/game.js';

gameSocket.on('connect', function() {
    console.log('Connected to /api/game!');
});

gameSocket.on('updateBoard', function(gameState, visibilityMap, gameStateID, player) {
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
            alert('Une erreur est survenue. Veuillez vous reconnecter.');
            window.location.href = '/home.html';
        }
    }
};

gameSocket.on('tokenInvalid', function() {
    localStorage.removeItem('token');
    alert('Votre session a expiré. Veuillez vous reconnecter.');
    window.location.href = '/home.html';
});

gameSocket.on('databaseConnectionError', function() {
    alert('Probleme de connexion avec la base de données. Veuillez réessayer plus tard.');
});

gameSocket.on('matchFound', function(roomId) {
    alert('Match trouvé! Vous allez être redirigé vers la partie.');
    localStorage.setItem('roomId', roomId);
});

gameSocket.on('gameAlreadyInProgress', function(gameStateId) {
    alert('Une partie est déjà en cours.');
    window.location.href = '/gameLocal/gameLocal.html';
    localStorage.setItem('gameStateID', gameStateId);
});

export default gameSocket;