const socketIo = require('socket.io');
const {verifyAndValidateUserID} = require("./logic/authentification/authController");
const {findUserIdByUsername, findUsernameById} = require("./models/users/users");

var usersConnected = {};

const userSetupSocket = (server) => {
    const io = socketIo(server);

    io.use(async (socket, next) => {
        const token = socket.handshake.query.token;
        const userId = verifyAndValidateUserID(token);
        if (userId) {
            const username = await findUsernameById(userId);
            socket.userId = userId;
            socket.username = username;
            usersConnected[userId] = socket;
            return next();
        }
        return next(new Error('Authentication error'));
    });

    io.on('connection', (socket) => {
        console.log(Object.keys(usersConnected).length);
        console.log('A user connected');

        socket.on('gameRequest', async (username) => {
            const userToRequestId = await findUserIdByUsername(username);
            const userSocket = usersConnected[userToRequestId];
            if (userSocket) {
                console.log(`User ${username} is connected, sending game request.`);
                userSocket.emit('gameRequest', {
                    fromUserId: socket.userId,
                    fromUsername: socket.username
                });
            } else {
                console.log(`User ${username} is not connected.`);
            }
        });

        socket.on('gameRequestAccepted', async (fromUserId) => {
            const userSocket = usersConnected[fromUserId];
            if (userSocket) {
                console.log(`User ${socket.username} accepted the game request.`);
                userSocket.emit('gameRequestAccepted', {
                    toUsername: socket.username
                });
            } else {
                console.log(`User ${fromUserId} is not connected.`);
            }
        });

        socket.on('gameRequestDeclined', async (fromUserId) => {
            const userSocket = usersConnected[fromUserId];
            if (userSocket) {
                console.log(`User ${socket.username} declined the game request.`);
                userSocket.emit('gameRequestDeclined', {
                    toUsername: socket.username
                });
            } else {
                console.log(`User ${fromUserId} is not connected.`);
            }

        });

        socket.on('disconnect', () => {
            console.log('A user disconnected');
            delete usersConnected[socket.userId];
        });
    });
}




module.exports = userSetupSocket;