let usersConnected = {};

function addUser(userId, socket) {
    usersConnected[userId] = socket;
}

function removeUser(userId) {
    delete usersConnected[userId];
}

function getUserSocket(userId) {
    return usersConnected[userId];
}

function getUserId(socket) {
    return Object.keys(usersConnected).find(key => usersConnected[key] === socket);
}

module.exports = {
    addUser,
    removeUser,
    getUserSocket,
    getUserId,
    get usersConnected() {
        return usersConnected;
    }
};
