const {verifyAndValidateUserID} = require("./logic/authentification/authController");
const usersConnected = require('./usersConnected');
const {findUsernameById} = require("./models/users/users");

const userSetupSocket = (io) => {

    io.of('/api/user').use(async (socket, next) => {
        const token = socket.handshake.query.token;
        const userId = verifyAndValidateUserID(token);
        if (userId) {
            usersConnected.addUser(userId, socket);
            return next();
        }
        return next(new Error('Authentication error'));
    });

    io.of('/api/user').on('connection', async (socket) => {
        const username = await findUsernameById(usersConnected.getUserId(socket));
        io.of('/api/user').emit('updateStatus', {username, status: 'online'});

        socket.on('gameRequestDeclined', async (fromUserId) => {
            const userSocket = usersConnected.getUserSocket(fromUserId);
            if (userSocket) {
                userSocket.emit('gameRequestDeclined', {
                    toUsername: socket.username
                });
            } else {
                console.log(`User ${fromUserId} is not connected.`);
            }

        });

        socket.on('manualDisconnect', async (token) => {
            const userId = verifyAndValidateUserID(token);
            if (userId) {
                usersConnected.removeUser(userId);
                io.of('/api/user').emit('updateStatus', {username, status: 'offline'});
            } else {
                console.log('Invalid token');
            }
        });
    });
}




module.exports = userSetupSocket;