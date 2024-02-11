const socketIo = require('socket.io');

const setupSocket = (server) => {
    const io = socketIo(server);

    io.on('connection', (socket) => {
        console.log('New client connected');

        // Example of handling a custom event
        socket.on('customEvent', (data) => {
            console.log(data);
        });

        socket.on('disconnect', () => console.log('Client disconnected'));
    });
}

module.exports = setupSocket;
