const {verifyAndValidateUserID} = require("./logic/authentification/authController");
const {findUserIdByUsername, findUsernameById} = require("./models/users/users");
const gameOnlineManager = require('./logic/game/gameOnlineManager');
const usersConnected = require('./usersConnected');

const userSetupSocket = (io) => {

    io.of('/api/user').use(async (socket, next) => {
        const token = socket.handshake.query.token;
        const location = socket.handshake.query.location;
        const userId = verifyAndValidateUserID(token);
        if (userId) {
            usersConnected.addUser(userId, socket);
            console.log(`User ${userId} connected at page ${location} with socket id ${socket.id}`);
            return next();
        }
        return next(new Error('Authentication error'));
    });

    io.of('/api/user').on('connection', (socket) => {

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

        socket.on('manualDisconnect', (token) => {
            const userId = verifyAndValidateUserID(token);
            if (userId) {
                usersConnected.removeUser(userId);
            } else {
                console.log('Invalid token');
            }
        });
    });
}




module.exports = userSetupSocket;