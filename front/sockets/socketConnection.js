var socket = io('/api/game');
import { handleIAMove } from '../gamePage/gameIA.js';
import { updateBoardDisplay } from '../gamePage/fogOfWar.js';
import { askPossibleMove } from '../gamePage/gameIA.js';


socket.on('connect', function() {
    console.log('Connected to /api/game!');
});

socket.on('tryMove', function(gameState) {
    handleIAMove(gameState);
});

socket.on('updatedVisibility', function(player, visibilityMap) {
    updateBoardDisplay(player, visibilityMap);
});

socket.on('possibleMoveList', function(possibleMove) {
    displayPossibleMove(possibleMove);
});

export default socket;