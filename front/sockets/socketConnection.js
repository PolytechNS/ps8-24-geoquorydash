var socket = io('/api/game');
import { updateBoardDisplay } from '../gamePage/fogOfWar.js';
import {displayPossibleMove, endGame, lockBarrier, ImpossibleWallPlacementPopUp} from '../gamePage/gameIA.js';

socket.on('connect', function() {
    console.log('Connected to /api/game!');
});

socket.on('updateBoard', function(gameState, visibilityMap, gameStateID) {
    console.log("ON updateBoard, J'affiche le nouveau plateau de jeu");
    if (gameStateID) {
        localStorage.setItem('gameStateID', gameStateID);
    }
    updateBoardDisplay(gameState, visibilityMap);
});

socket.on('possibleMoveList', function(possibleMove) {
    displayPossibleMove(possibleMove);
});

socket.on('endGame', function(player) {
    endGame(player);
});

socket.on('lockWall', function(wall) {
    lockBarrier(wall);
});

socket.on('ImpossibleWallPosition', function() {
    ImpossibleWallPlacementPopUp();
});

window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const newGame = urlParams.get('newGame');
    const resumeGame = urlParams.get('resumeGame');

    if (newGame === 'true') {
        socket.emit('startNewGame', localStorage.getItem('token'));
    } else if (resumeGame === 'true') {
        const gameStateID = localStorage.getItem('gameStateID');
        const token = localStorage.getItem('token');
        if (gameStateID && token) {
            socket.emit('resumeGame', gameStateID, token);
        } else {
            alert('An error occured while trying to resume the game. Please try again later.');
            window.location.href = '/home.html';
        }
    }
};

socket.on('tokenInvalid', function() {
    localStorage.removeItem('token');
    alert('Your token is invalid. Please log in again.')
    window.location.href = '/home.html';
});

socket.on('databaseConnectionError', function() {
    alert('Connection problem detected. Your game may not be saved. Please try again later.');
});

export default socket;