var socket = io('/api/game');
import { updateBoardDisplay } from '../gamePage/fogOfWar.js';
import {
    displayPossibleMove,
    endGame,
    lockBarrier,
    ImpossibleWallPlacementPopUp,
} from '../gamePage/game.js';

socket.on('connect', function() {
    console.log('Connected to /api/game!');
});

socket.on('updateBoard', function(gameState, visibilityMap, gameStateID, player) {
    if (gameStateID) {
        localStorage.setItem('gameStateID', gameStateID);
    }
    updateBoardDisplay(gameState, visibilityMap, player);
});

socket.on('possibleMoveList', function(possibleMove) {
    displayPossibleMove(possibleMove);
});

socket.on('endGame', function(player) {
    console.log('endGame');
    endGame(player);
});

socket.on('lockWall', function(wall) {
    lockBarrier(wall);
});

socket.on('toggleAndLockWall', function(wall) {
    lockBarrier(wall, true);
});

socket.on('ImpossibleWallPosition', function() {
    ImpossibleWallPlacementPopUp();
});

window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const newGame = urlParams.get('newGame');
    const resumeGame = urlParams.get('resumeGame');

    if (newGame === 'true') {
        if (localStorage.getItem('gameStateID')){
            socket.emit('quitGame', localStorage.getItem('token'), localStorage.getItem('gameStateID'));
        }
        socket.emit('startNewGame', localStorage.getItem('token'));
    } else if (resumeGame === 'true') {
        const gameStateID = localStorage.getItem('gameStateID');
        const token = localStorage.getItem('token');
        if (gameStateID && token) {
            socket.emit('resumeGame', gameStateID, token);
        } else {
            alert('Une erreur est survenue. Veuillez vous reconnecter.');
            window.location.href = '/home.html';
        }
    }
};

socket.on('tokenInvalid', function() {
    localStorage.removeItem('token');
    alert('Votre session a expiré. Veuillez vous reconnecter.');
    window.location.href = '/home.html';
});

socket.on('databaseConnectionError', function() {
    alert('Probleme de connexion avec la base de données. Veuillez réessayer plus tard.');
});

socket.on('matchFound', function(roomId) {
    alert('Match trouvé! Vous allez être redirigé vers la partie.');
    localStorage.setItem('roomId', roomId);
});

socket.on('gameAlreadyInProgress', function(gameStateId) {
    alert('Une partie est déjà en cours.');
    window.location.href = '/gameLocal/gameLocal.html';
    localStorage.setItem('gameStateID', gameStateId);
});

export default socket;