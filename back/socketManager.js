const socketIo = require('../front/sockets/socket.io');
const GameManager = require('./logic/game/gameManager');
const FogOfWar = require('./logic/game/fogOfWarController');

const setupSocket = (server) => {
    const io = socketIo(server);

    io.of('/api/game').on('connection', (socket) => {
        console.log('New connection!');

        const gameManager = new GameManager(socket);
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
            socket.emit("updatedVisibility", currentPlayer, fogController.visibilityMap);
        });

        socket.on("retry", () => {
            console.log("retry");
        })
    });
}

module.exports = setupSocket;
