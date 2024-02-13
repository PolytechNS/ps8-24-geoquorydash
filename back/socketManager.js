const socketIo = require('socket.io');
const GameManager = require('./logic/game/gameManager');
const FogOfWar = require('./logic/game/fogOfWarController');
const gameManager = require('./gameInstance');
const { movePlayer, getPossibleMove, updateWalls } = require("./logic/gameEngine/gameEngine");

const setupSocket = (server) => {
    const io = socketIo(server);

    io.of('/api/game').on('connection', (socket) => {
        console.log('New connection!');

        const fogController = new FogOfWar(socket);

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });

        socket.on('newMove', () => {
            const iaMove = gameManager.tryMove();
            socket.emit('tryMove', iaMove);
        });

        socket.on('newMoveValid', (move) => {
            gameManager.validateMove(move);
            fogController.updateBoardVisibility();
            socket.emit("updatedVisibility", fogController.visibilityMap);
        });

        socket.on("retry", () => {
            console.log("retry");
        });

        socket.on('movePlayer', (position) => {
            response = movePlayer(position);
            if(response === 0) {
                socket.emit('retryMove');
            } else {
                socket.emit('updateBoard', gameManager.gameState);
            }
        });

        socket.on('possibleMoveRequest', () => {
            possibleMove = getPossibleMove();
            socket.emit('possibleMoveList', possibleMove);
        });

        socket.on('toggleWall', (wall) => {
            updateWalls(wall);
            socket.emit('updateBoard', gameManager.gameState);
        })
    });
}

module.exports = setupSocket;