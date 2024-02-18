var socket = io('/api/game');
import { updateBoardDisplay } from '../gamePage/fogOfWar.js';
import { displayPossibleMove, endGame } from '../gamePage/gameIA.js';


socket.on('connect', function() {
    console.log('Connected to /api/game!');
});

socket.on('initializeBoard', function(gameState, visibilityMap) {
    console.log("ON initializeBoard");
    updateBoardDisplay(gameState, visibilityMap);
});

socket.on('updateBoard', function(gameState, visibilityMap) {
    // console.log("ON updateBoard, J'affiche le nouveau plateau de jeu");
    updateBoardDisplay(gameState, visibilityMap);
});

socket.on('possibleMoveList', function(possibleMove) {
    // console.log("ON possibleMoveList, J'affiche les déplacements possibles");
    displayPossibleMove(possibleMove);
});

socket.on('endGame', function(player) {
    // console.log("ON possibleMoveList, J'affiche les déplacements possibles");
    endGame(player);
});

export default socket;