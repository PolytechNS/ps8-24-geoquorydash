const {verifyAndValidateUserID} = require("./logic/authentification/authController");
const usersConnected = require('./usersConnected');
const {findUsernameById, findUserIdByUsername} = require("./models/users/users");
const notificationManager = require("./logic/notifications/notificationManager");

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

        socket.on('message', async (data) => {
            const receiverId = await findUserIdByUsername(data.receiver);
            const receiverSocket = usersConnected.getUserSocket(receiverId);
            if (receiverSocket) {
                receiverSocket.emit('message', {
                    sender: data.sender,
                    message: data.message
                });
            } else {
                console.log(`User ${data.receiver} is not connected.`);
            }
            notificationManager.addChatNotification(receiverId, data.sender);
        });

        socket.on('retrieveChatNotifications', (token) => {
            const userId = verifyAndValidateUserID(token);
            if (userId) {
                const notifications = notificationManager.getChatNotifications(userId);
                socket.emit('updateGlobalChatNotifications', notifications);
            } else {
                console.log('Invalid token');
            }
        });

        socket.on('addFriendRequest', async (fromUsername, toUsername) => {
            const toUserId = await findUserIdByUsername(toUsername);
            const toSocket = usersConnected.getUserSocket(toUserId);
            if (toSocket) {
                toSocket.emit('friendRequest', fromUsername);
            } else {
                console.log(`User ${toUsername} is not connected.`);
            }
        });
    });
}




module.exports = userSetupSocket;