const socketIo = require('socket.io');
const GameManager = require('./gameManager');

const setupSocket = (server) => {
    const io = socketIo(server);

    io.of('/api/game').on('connection', (socket) => {
        console.log('New connection!');

        const gameManager = new GameManager(socket);

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });

        socket.on('newMove', () => {
            const iaMove = gameManager.handleMove();
            socket.emit('gameState', iaMove);
        });
    });
}

module.exports = setupSocket;
