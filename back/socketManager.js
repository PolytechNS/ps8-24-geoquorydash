const socketIo = require('socket.io');
const gameManager = require('./logic/game/gameManager');
const fogOfWar = require('./logic/game/fogOfWarController');
const { movePlayer, getPossibleMove, toggleWall, turn, initializeGame} = require("./logic/game/gameEngine");

const setupSocket = (server) => {
    const io = socketIo(server);

    io.of('/api/game').on('connection', async (socket) => {
        console.log('ON Connection');
        await initializeGame();
        socket.emit("updateBoard", gameManager.gameState, fogOfWar.visibilityMap);
        fogOfWar.updateBoardVisibility();

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });

        socket.on('movePlayer', (targetPosition) => {
            var response = movePlayer(targetPosition);
            if (response) {
                socket.emit("endGame", response);
                return;
            }
            fogOfWar.updateBoardVisibility();

            response = turn();
            if (response) {
                socket.emit("endGame", response);
                return;
            }
            fogOfWar.updateBoardVisibility();

            socket.emit('updateBoard', gameManager.gameState, fogOfWar.visibilityMap);
        });

        socket.on('possibleMoveRequest', () => {
            let possibleMove = getPossibleMove();
            socket.emit('possibleMoveList', possibleMove);
        });

        socket.on('toggleWall', (wall, isVertical) => {
            var response = toggleWall(wall, isVertical);

            if (response === 1) {
                socket.emit('lockWall', wall);
                fogOfWar.updateBoardVisibility();
                socket.emit('updateBoard', gameManager.gameState, fogOfWar.visibilityMap);
            } else if (response) {
                socket.emit("endGame", response);
            } else {
                socket.emit('ImpossibleWallPosition');
            }
        })

    });
}

module.exports = setupSocket;