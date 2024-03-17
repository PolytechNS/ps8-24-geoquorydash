const {initializeGame} = require("./gameEngine");
const fogOfWar = require("./fogOfWarController");
const gameManager = require("./gameManager");
const {createGameInDatabase} = require("../../models/game/gameDataBaseManager");
const {createGameStateInDatabase} = require("../../models/game/gameState");

class GameOnlineManager {
    waitingPlayers = {};
    gameInSession = {};
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

    async tryMatchmaking(io) {
        const userIds = Object.keys(this.waitingPlayers);
        while (userIds.length >= 2) {
            const player1 = userIds.shift();
            const player2 = userIds.shift();

            const socket1 = this.waitingPlayers[player1];
            const socket2 = this.waitingPlayers[player2];

            const gameStateId = await createGameStateInDatabase();
            const defaultOption = true;
            const onlineGameOption = true;
            initializeGame({defaultOption, onlineGameOption, id: gameStateId});
            fogOfWar.updateBoardVisibility(gameStateId);

            const gameState = gameManager.gameStateList[gameStateId];
            const gameStateID = await createGameInDatabase(gameState, fogOfWar.visibilityMapObjectList[gameStateId].visibilityMap, {userId1: player1, userId2: player2});

            const roomId = gameStateID.toString();

            this.gameInSession[roomId] = [socket1, socket2];
            this.gameInSession[roomId][0].join(roomId);
            this.gameInSession[roomId][1].join(roomId);

            io.of('/api/game').to(roomId).emit('matchFound', roomId);

            delete this.waitingPlayers[player1];
            delete this.waitingPlayers[player2];

            this.gameInSession[roomId][0].emit("updateBoard", gameManager.gameState, fogOfWar.invertedVisibilityMap(), gameStateID, gameManager.getPlayers()[0]);
            this.gameInSession[roomId][1].emit("updateBoard", gameManager.gameState, fogOfWar.visibilityMap, gameStateID, gameManager.getPlayers()[1]);
        }
    };

    emitUpdateBoard(gameStateID, roomId){
        const socket1 = this.gameInSession[roomId][0];
        const socket2 = this.gameInSession[roomId][1];
        let visibilityMap = fogOfWar.visibilityMapObjectList[gameStateID].visibilityMap;
        socket1.emit("updateBoard", gameManager.gameStateList[gameStateID], fogOfWar.invertedVisibilityMap(visibilityMap), gameStateID, gameManager.getPlayers(gameStateID)[0]);
        socket2.emit("updateBoard", gameManager.gameStateList[gameStateID], visibilityMap, gameStateID, gameManager.getPlayers(gameStateID)[1]);
    }
}

const GameOnlineManagerInstance = new GameOnlineManager();
module.exports = GameOnlineManagerInstance;
