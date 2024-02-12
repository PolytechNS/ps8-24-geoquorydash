
var socket = io('/api/game');
import { handleIAMove } from '../gamePage/gameIA.js';
import { updateBoardDisplay } from '../gamePage/fogOfWar.js';


socket.on('connect', function() {
    console.log('Connected to /api/game!');
});

socket.on('tryMove', function(gameState) {
    handleIAMove(gameState);
});

socket.on('updatedVisibility', function(player, visibilityMap) {
    updateBoardDisplay(player, visibilityMap);
});

export default socket;