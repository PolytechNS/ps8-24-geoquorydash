var socket = io('/api/game');
import { updateBoardDisplay } from '../gamePage/fogOfWar.js';
import {displayPossibleMove, endGame, lockBarrier, ImpossibleWallPlacementPopUp} from '../gamePage/gameIA.js';


socket.on('connect', function() {
    console.log('Connected to /api/game!');
});

socket.on('updateBoard', function(gameState, visibilityMap) {
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

export default socket;