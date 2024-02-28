const socketIo = require('socket.io');
const gameManager = require('./logic/game/gameManager');
const fogOfWar = require('./logic/game/fogOfWarController');
const { movePlayer, getPossibleMove, toggleWall, turn, initializeGame, resumeGameFromDB} = require("./logic/game/gameEngine");
const { verifyToken } = require('./logic/authentification/tokenManager');
const { ObjectId } = require('mongodb');
const { createGameInDatabase } = require('./models/game/gameDataBaseManager');

const setupSocket = (server) => {
    const io = socketIo(server);

    io.of('/api/game').on('connection', async (socket) => {
        console.log('ON Connection');

        socket.on('startNewGame', async (token) => {
            // Vérifier le token
            var userID;
            try {
                const tokenData = verifyToken(token);
                userID = tokenData.userID;
            } catch (err) {
                console.log('Invalid token:', err);
                socket.emit('endGame', 'Invalid token');
                return;
            }
            // Validation de l'ID utilisateur
            if (!ObjectId.isValid(userID)) {
                console.log('Invalid userID:', userID);
                socket.emit('endGame', 'Invalid userID');
                return;
            }

            const userObjectID = new ObjectId(userID);

            await initializeGame();
            console.log('Après Initialisation pour nouvelle partie.');
            await fogOfWar.updateBoardVisibility();

            const player = gameManager.gameState.players.find(player => player.id === 'p2');
            await createGameInDatabase(player, fogOfWar.visibilityMap, userObjectID);
            socket.emit("updateBoard", gameManager.gameState, fogOfWar.visibilityMap);

        });

        socket.on('resumeSavedGame', async () => {
            await resumeGameFromDB();
            console.log('Après Initialisation pour reprise de partie.');
            await fogOfWar.updateBoardVisibility();
            socket.emit("updateBoard", gameManager.gameState, fogOfWar.visibilityMap);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });

        socket.on('movePlayer', (targetPosition) => {
            var response = movePlayer(targetPosition);
            if (response) {
                socket.emit("endGame", response);
                return;
            }
            fogOfWar.updateBoardVisibility();

            response = turn();
            if (response) {
                socket.emit("endGame", response);
                return;
            }
            fogOfWar.updateBoardVisibility();

            socket.emit('updateBoard', gameManager.gameState, fogOfWar.visibilityMap);
        });

        socket.on('possibleMoveRequest', () => {
            let possibleMove = getPossibleMove();
            socket.emit('possibleMoveList', possibleMove);
        });

        socket.on('toggleWall', (wall, isVertical) => {
            var response = toggleWall(wall, isVertical);

            if (response === 1) {
                socket.emit('lockWall', wall);
                fogOfWar.updateBoardVisibility();
                socket.emit('updateBoard', gameManager.gameState, fogOfWar.visibilityMap);
            } else if (response) {
                socket.emit("endGame", response);
            } else {
                socket.emit('ImpossibleWallPosition');
            }
        })

    });
}

module.exports = setupSocket;