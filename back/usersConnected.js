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

module.exports = {
    addUser,
    removeUser,
    getUserSocket,
    get usersConnected() {
        return usersConnected;
    }
};
