const {initializeGame} = require("./gameEngine");
const fogOfWar = require("./fogOfWarController");
const gameManager = require("./gameManager");
const {createGameInDatabase} = require("../../models/game/gameDataBaseManager");
const {createGameStateInDatabase} = require("../../models/game/gameState");
const usersConnected = require("../../usersConnected");
const statManager = require("../stat/statManager");

class GameOnlineManager {
    waitingPlayers = {};
    gameRequestsWaitingRooms = {};
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

    async setupGameMatch(io, player1, player2, socket1, socket2) {
        statManager.createTemporaryStat(player1, player2, "online", "player1");
        statManager.createTemporaryStat(player2, player1, "online", "player2");
        const gameStateId = await createGameStateInDatabase();
        const defaultOption = true;
        const onlineGameOption = true;
        initializeGame({defaultOption, onlineGameOption, id: gameStateId});
        fogOfWar.updateBoardVisibility(gameStateId);

        const gameState = gameManager.gameStateList[gameStateId];
        const visibilityMap = fogOfWar.visibilityMapObjectList[gameStateId].visibilityMap;

        await createGameInDatabase(gameState, visibilityMap, {userId1: player1, userId2: player2}, gameStateId);

        const roomId = gameStateId.toString();

        this.gameInSession[roomId] = [socket1, socket2];
        socket1.join(roomId);
        socket2.join(roomId);

        io.of('/api/game').to(roomId).emit('matchFound', roomId);

        socket1.emit("updateBoard", gameState, fogOfWar.invertedVisibilityMap(visibilityMap), gameStateId, gameManager.getPlayers(gameStateId)[0]);
        socket2.emit("updateBoard", gameState, visibilityMap, gameStateId, gameManager.getPlayers(gameStateId)[1]);
    }


    async tryMatchmaking(io) {
        const userIds = Object.keys(this.waitingPlayers);
        while (userIds.length >= 2) {
            const player1 = userIds.shift();
            const player2 = userIds.shift();

            const socket1 = this.waitingPlayers[player1];
            const socket2 = this.waitingPlayers[player2];

            await this.setupGameMatch(io, player1, player2, socket1, socket2);

            delete this.waitingPlayers[player1];
            delete this.waitingPlayers[player2];
        }
    };
    async tryMatchmakingFriend(io, gameRequestWaitingRoomId) {
        const usersData = this.gameRequestsWaitingRooms[gameRequestWaitingRoomId];
        while (usersData.length >= 2) {
            const player1Data = usersData.shift();
            const player2Data = usersData.shift();

            const socket1 = player1Data.socket;
            const socket2 = player2Data.socket;

            await this.setupGameMatch(io, player1Data.userId, player2Data.userId, socket1, socket2);

            delete this.gameRequestsWaitingRooms[gameRequestWaitingRoomId];
        }
    };

    async joinGameRequestWaitingRoom(data, socket){
        if (!data.waitingRoomId){
            const waitingRoomId = data.userIdSender + data.userIdReceiver;
            this.gameRequestsWaitingRooms[waitingRoomId] = [{
                userId : data.userIdSender,
                socket : socket
            }];
            return waitingRoomId;
        } else {
            this.gameRequestsWaitingRooms[data.waitingRoomId].push({
                userId : data.userIdReceiver,
                socket : socket
            });
        }
    }



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
