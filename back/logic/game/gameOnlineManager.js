const {initializeGame} = require("./gameEngine");
const fogOfWar = require("./fogOfWarController");
const gameManager = require("./gameManager");
const {createGameInDatabase} = require("../../models/game/gameDataBaseManager");

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

    tryMatchmaking = async (io) => {
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

            const defaultOption = true;
            const onlineGameOption = true;
            initializeGame(defaultOption, onlineGameOption);
            fogOfWar.updateBoardVisibility();

            const gameStatePlayers = gameManager.gameState.players;
            const gameStateID = await createGameInDatabase(gameStatePlayers, fogOfWar.visibilityMap, player1, player2);

            const invertedVisibilityMap = fogOfWar.visibilityMap.map(value => -value);
            socket1.emit("updateBoard", gameManager.gameState, invertedVisibilityMap, gameStateID, gameManager.getPlayers()[0]);
            socket2.emit("updateBoard", gameManager.gameState, fogOfWar.visibilityMap, gameStateID, gameManager.getPlayers()[1]);
        }
    };
}

const GameOnlineManagerInstance = new GameOnlineManager();
module.exports = GameOnlineManagerInstance;
