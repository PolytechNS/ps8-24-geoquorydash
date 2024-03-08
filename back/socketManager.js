const socketIo = require('socket.io');
const gameManager = require('./logic/game/gameManager');
const fogOfWar = require('./logic/game/fogOfWarController');
const gameOnlineManager = require('./logic/game/gameOnlineManager');
const { movePlayer, getPossibleMove, toggleWall, turn, initializeGame} = require("./logic/game/gameEngine");
const { createGameInDatabase, moveUserPlayerInDatabase, moveAIPlayerInDatabase, modifyVisibilityMapInDatabase, toggleWallInDatabase,
    endGameInDatabase
} = require('./models/game/gameDataBaseManager');
const { verifyAndValidateUserID } = require('./logic/authentification/authController');
const {InvalidTokenError, DatabaseConnectionError} = require("./utils/errorTypes");

const setupSocket = (server) => {
    const io = socketIo(server);

    io.of('/api/game').on('connection', async (socket) => {
        console.log('ON Connection');

        socket.on('startNewGame', async (token) => {
            console.log('ON startNewGame');

            const defaultOption = true;
            if (!token) {
                // Initialiser une nouvelle partie qui ne sera pas stocker en BD car l'utilisateur n'est pas connecté
                initializeGame(defaultOption);
                fogOfWar.updateBoardVisibility();
                socket.emit("updateBoard", gameManager.gameState, fogOfWar.visibilityMap);
            } else {
                // Initialiser une nouvelle partie apres verification du token et stocker en BD car l'utilisateur est connecté
                const verificationResult = verifyAndValidateUserID(token);
                if (!verificationResult) {
                    socket.emit('tokenInvalid');
                    return;
                }

                const userObjectID = verificationResult;
                initializeGame(defaultOption);
                fogOfWar.updateBoardVisibility();
                const gamestatePlayers = gameManager.gameState.players;
                const gameStateID = await createGameInDatabase(gamestatePlayers, fogOfWar.visibilityMap, userObjectID);
                socket.emit("updateBoard", gameManager.gameState, fogOfWar.visibilityMap, gameStateID);
            }

        });

        socket.on('resumeGame', async (gameStateID, token) => {
            console.log('ON resumeGame');

            const userId = verifyAndValidateUserID(token);
            if (!userId) {
                socket.emit('tokenInvalid');
                return;
            }

            const gameState = await gameManager.resumeGame(gameStateID);
            if (!gameState) {
                socket.emit('databaseConnectionError');
                return;
            }

            const visibilityMap = await fogOfWar.resumeVisibilityMap(gameStateID);
            if (!visibilityMap) {
                socket.emit('databaseConnectionError');
                return;
            }
            const defaultOption = false;
            initializeGame(defaultOption);
            socket.emit("updateBoard", gameManager.gameState, fogOfWar.visibilityMap, gameStateID);
        });


        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });


        socket.on('movePlayer', async (targetPosition, gameStateID, token) => {
            var response = movePlayer(targetPosition);

            try {
                await moveUserPlayerInDatabase(gameStateID, token, targetPosition);
            } catch (error) {
                if (error instanceof InvalidTokenError) {
                    socket.emit('tokenInvalid');
                    return;
                } else if (error instanceof DatabaseConnectionError) {
                    socket.emit('databaseConnectionError');
                } else {
                    // Gérer toutes les autres erreurs non spécifiques
                    console.log("Une erreur inattendue est survenue : ", error.message);
                }
            }

            if (response) {
                await endGameInDatabase(gameStateID);
                console.log('EMIT endGame');
                socket.emit("endGame", response);
                return;
            }
            fogOfWar.updateBoardVisibility();

            try{
                await modifyVisibilityMapInDatabase(token, gameStateID, fogOfWar.visibilityMap);
            }catch (error) {
                if (error instanceof InvalidTokenError) {
                    socket.emit('tokenInvalid');
                    return;
                } else if (error instanceof DatabaseConnectionError) {
                    socket.emit('databaseConnectionError');
                } else {
                    // Gérer toutes les autres erreurs non spécifiques
                    console.log("Une erreur inattendue est survenue : ", error.message);
                }
            }

            let response2 = turn();

            try {
                const targetAIPosition = gameManager.gameState.players.find(player => player.id === 'ia').position;
                await moveAIPlayerInDatabase(gameStateID, targetAIPosition);
            } catch (error) {
                if (error instanceof DatabaseConnectionError) {
                    socket.emit('databaseConnectionError');
                } else {
                    // Gérer toutes les autres erreurs non spécifiques
                    console.log("Une erreur inattendue est survenue : ", error.message);
                }
            }

            if (response2) {
                await endGameInDatabase(gameStateID);
                console.log('EMIT endGame');
                socket.emit("endGame", response2);
                return;
            }
            fogOfWar.updateBoardVisibility();
            try {
                await modifyVisibilityMapInDatabase(token, gameStateID, fogOfWar.visibilityMap);
            } catch (error) {
                if (error instanceof InvalidTokenError) {
                    socket.emit('tokenInvalid');
                    return;
                } else if (error instanceof DatabaseConnectionError) {
                    socket.emit('databaseConnectionError');
                } else {
                    // Gérer toutes les autres erreurs non spécifiques
                    console.log("Une erreur inattendue est survenue : ", error.message);
                }
            }

            socket.emit('updateBoard', gameManager.gameState, fogOfWar.visibilityMap);
        });


        socket.on('possibleMoveRequest', () => {
            let possibleMove = getPossibleMove();
            socket.emit('possibleMoveList', possibleMove);
        });


        socket.on('toggleWall', async (wall, isVertical, gameStateID, token) => {
            var response = toggleWall(wall, isVertical);
            if (response === 1) {
                try {
                    await toggleWallInDatabase(gameStateID, wall, isVertical, token);
                } catch (error) {
                    if (error instanceof InvalidTokenError) {
                        socket.emit('tokenInvalid');
                        return;
                    } else if (error instanceof DatabaseConnectionError) {
                        socket.emit('databaseConnectionError');
                    } else {
                        // Gérer toutes les autres erreurs non spécifiques
                        console.log("Une erreur inattendue est survenue : ", error.message);
                    }
                }
                socket.emit('lockWall', wall);
                fogOfWar.updateBoardVisibility();
                try{
                    await modifyVisibilityMapInDatabase(token, gameStateID, fogOfWar.visibilityMap);
                }catch (error) {
                    if (error instanceof InvalidTokenError) {
                        socket.emit('tokenInvalid');
                        return;
                    } else if (error instanceof DatabaseConnectionError) {
                        socket.emit('databaseConnectionError');
                    } else {
                        // Gérer toutes les autres erreurs non spécifiques
                        console.log("Une erreur inattendue est survenue : ", error.message);
                    }
                }
                socket.emit('updateBoard', gameManager.gameState, fogOfWar.visibilityMap);
            } else if (response) {
                await endGameInDatabase(gameStateID);
                console.log('EMIT endGame');
                socket.emit("endGame", response);
            } else {
                socket.emit('ImpossibleWallPosition');
            }
        });


        socket.on('findMatch', (token) => {
            console.log('ON joinGameRoom');
            const userId = verifyAndValidateUserID(token);
            if (!userId) {
                socket.emit('tokenInvalid');
                return;
            }
            gameOnlineManager.addPlayerSocketToWaitList(socket);
            gameOnlineManager.tryMatchmaking(io);
        });

        socket.on('test', (data) => {
            console.log('ON test');
            socket.emit('test', data);
        });
    });
}

module.exports = setupSocket;