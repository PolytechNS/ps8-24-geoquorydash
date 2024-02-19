const socketIo = require('socket.io');
const gameManager = require('./logic/game/gameManager');
const fogOfWar = require('./logic/game/fogOfWarController');
const { movePlayer, getPossibleMove, toggleWall, moveIA , turn} = require("./logic/game/gameEngine");

const setupSocket = (server) => {
    const io = socketIo(server);

    io.of('/api/game').on('connection', (socket) => {
        console.log('ON Connection');

        socket.emit("updateBoard", gameManager.gameState, fogOfWar.visibilityMap);
        fogOfWar.updateBoardVisibility();

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });

        socket.on('movePlayer', (targetPosition) => {
            var response = movePlayer(targetPosition);
            if (response) socket.emit("endGame", response);
            fogOfWar.updateBoardVisibility();

            turn();
            fogOfWar.updateBoardVisibility();

            socket.emit('updateBoard', gameManager.gameState, fogOfWar.visibilityMap);
        });

        socket.on('possibleMoveRequest', () => {
            let possibleMove = getPossibleMove();
            socket.emit('possibleMoveList', possibleMove);
        });

        socket.on('toggleWall', (wall, isVertical) => {
            var response = toggleWall(wall, isVertical);
            if(response) {
                socket.emit('lockWall', wall);
                fogOfWar.updateBoardVisibility();
                socket.emit('updateBoard', gameManager.gameState, fogOfWar.visibilityMap);
            } else {
                socket.emit('ImpossibleWallPosition');
            }
        })

    });
}

module.exports = setupSocket;