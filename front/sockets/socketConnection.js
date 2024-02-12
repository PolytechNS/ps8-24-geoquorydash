var socket = io('/api/game');
import { handleIAMove } from '../gamePage/gameIA.js';


socket.on('connect', function() {
    console.log('Connected to /api/game!');
});

socket.on('gameState', function(gameState) {
    console.log('ia moved');
    handleIAMove(gameState);
});

export default socket;