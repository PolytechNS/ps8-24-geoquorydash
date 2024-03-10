class GameOnlineManager {
    waitingPlayers = {};
    constructor() {}

    getUserIdBySocket(disconnectedSocket) {
        for (const userId in this.waitingPlayers) {
            const socket = this.waitingPlayers[userId];
            if (socket === disconnectedSocket) {
                return userId;
            }
        }
        return null;
    }

    addPlayerToWaitList(userId, socket) {
        this.waitingPlayers[userId] = socket;
    }

    updatePlayerSocket(userId, newSocket) {
        this.waitingPlayers[userId] = newSocket;
    }

    isPlayerInWaitList(userId) {
        return userId in this.waitingPlayers;
    }

    removePlayerFromWaitList(userId) {
        if (userId in this.waitingPlayers) {
            delete this.waitingPlayers[userId];
        }
    }

    tryMatchmaking = (io) => {
        const userIds = Object.keys(this.waitingPlayers);
        while (userIds.length >= 2) {
            const player1 = userIds.shift();
            const player2 = userIds.shift();

            const socket1 = this.waitingPlayers[player1];
            const socket2 = this.waitingPlayers[player2];

            const roomId = player1 + "_" + player2;
            socket1.join(roomId);
            socket2.join(roomId);

            io.of('/api/game').to(roomId).emit('matchFound', roomId);
        }
    };
}

const GameOnlineManagerInstance = new GameOnlineManager();
module.exports = GameOnlineManagerInstance;
