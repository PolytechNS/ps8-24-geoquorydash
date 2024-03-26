const socketIo = require('socket.io');
const gameManager = require('./logic/game/gameManager');
const fogOfWar = require('./logic/game/fogOfWarController');
const gameOnlineManager = require('./logic/game/gameOnlineManager');
const chatManager = require('./logic/chat/chatManager');
const { movePlayer, getPossibleMove, toggleWall, initializeGame, changeCurrentPlayer, moveAI} = require("./logic/game/gameEngine");
const { createGameInDatabase, moveUserPlayerInDatabase, moveAIPlayerInDatabase, modifyVisibilityMapInDatabase, toggleWallInDatabase,
    endGameInDatabase
} = require('./models/game/gameDataBaseManager');
const { verifyAndValidateUserID } = require('./logic/authentification/authController');
const {InvalidTokenError, DatabaseConnectionError} = require("./utils/errorTypes");
const {createGameStateInDatabase} = require("./models/game/gameState");
const { getTextToIndex, retrieveTextInGameInteraction} = require('./logic/chat/chatManager');
const setupSocket = (server) => {
    const io = socketIo(server);

    io.of('/api/game').on('connection', async (socket) => {
        console.log('ON Connection');

        socket.on('startNewGame', async (token) => {
            console.log('ON startNewGame');

            const defaultOption = true;
            if (!token) {
                // Initialiser une nouvelle partie qui ne sera pas stocker en BD car l'utilisateur n'est pas connecté
                initializeGame({defaultOption, id: socket.id});
                fogOfWar.updateBoardVisibility(socket.id);
                socket.emit("updateBoard", gameManager.gameStateList[socket.id], fogOfWar.visibilityMapObjectList[socket.id].visibilityMap);
            } else {
                // Initialiser une nouvelle partie apres verification du token et stocker en BD car l'utilisateur est connecté
                const verificationResult = verifyAndValidateUserID(token);
                if (!verificationResult) {
                    socket.emit('tokenInvalid');
                    return;
                }

                const userObjectID = verificationResult;
                const gameStateIdObject = await createGameStateInDatabase();
                const gameStateId = gameStateIdObject.toString();
                initializeGame({defaultOption, id: gameStateId});
                fogOfWar.updateBoardVisibility(gameStateId);
                const gameState = gameManager.gameStateList[gameStateId];
                await createGameInDatabase(gameState, fogOfWar.visibilityMapObjectList[gameStateId].visibilityMap, {userId1: userObjectID}, gameStateIdObject);
                socket.emit("updateBoard", gameState, fogOfWar.visibilityMapObjectList[gameStateId].visibilityMap, gameStateId);
            }

        });

        socket.on('resumeGame', async (gameStateID, token) => {
            console.log('ON resumeGame');

            const userId = verifyAndValidateUserID(token);
            if (!userId) {
                socket.emit('tokenInvalid');
                return;
            }

            // try {
            //     var gameState = await gameManager.resumeGame(gameStateID);
            // } catch (error) {
            //     throw error;
            // }
            // try {
            //     var visibilityMap = await fogOfWar.resumeVisibilityMap(gameStateID);
            // } catch (error) {
            //     throw error;
            // }
            // const defaultOption = false;
            // initializeGame({defaultOption, id: gameStateID});
            const gameState = gameManager.gameStateList[gameStateID];
            const visibilityMap = fogOfWar.visibilityMapObjectList[gameStateID].visibilityMap;
            socket.emit("updateBoard", gameState, visibilityMap, gameStateID);
        });

        // socket.on('startOnlineGame', async (token) => {
        //     console.log('ON startOnlineGame');
        //     const userId = verifyAndValidateUserID(token);
        //     if (!userId) {
        //         socket.emit('tokenInvalid');
        //         return;
        //     }
        //
        //     try {
        //         const verificationResult = verifyAndValidateUserID(token);
        //         if (!verificationResult) {
        //             socket.emit('tokenInvalid');
        //             return;
        //         }
        //         const userObjectID = verificationResult;
        //         const defaultOption = true;
        //         initializeGame(defaultOption);
        //         fogOfWar.updateBoardVisibility();
        //         const gamestatePlayers = gameManager.gameState.players;
        //         const gameStateID = await createGameInDatabase(gamestatePlayers, fogOfWar.visibilityMap, userObjectID);
        //         socket.emit("updateBoard", gameManager.gameState, fogOfWar.visibilityMap, gameStateID);
        //     } catch (error) {
        //         if (error instanceof DatabaseConnectionError) {
        //             socket.emit('databaseConnectionError');
        //         } else {
        //             console.log("Une erreur inattendue est survenue : ", error.message);
        //         }
        //     }
        // });


        socket.on('disconnect', () => {
            console.log('Client disconnected');
            const userId = gameOnlineManager.getUserIdBySocket(socket);
            if (userId) {
                gameOnlineManager.removePlayerFromWaitList(userId);
            }
        });

        socket.on('movePlayer', async (targetPosition, id, token, roomId) => {
            var response = movePlayer(targetPosition, id);

            try {
                await moveUserPlayerInDatabase(id, token, targetPosition);
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
                await endGameInDatabase(id, token);
                console.log('EMIT endGame');
                roomId ?
                    io.of('/api/game').to(roomId).emit("endGame", response) :
                    socket.emit("endGame", response);
                return;
            }
            fogOfWar.updateBoardVisibility(id);

            try {
                await modifyVisibilityMapInDatabase(token, id, fogOfWar.visibilityMapObjectList[id].visibilityMap);
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

            changeCurrentPlayer(id);

            if (!roomId) {
                await handleAIMove(id, token);
            } else {
                fogOfWar.updateBoardVisibility(id);
                try {
                    await modifyVisibilityMapInDatabase(token, id, fogOfWar.visibilityMapObjectList[id].visibilityMap);
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
                gameOnlineManager.emitUpdateBoard(id, roomId);
            }
        });


        socket.on('possibleMoveRequest', (id) => {
            let possibleMove = getPossibleMove(id);
            socket.emit('possibleMoveList', possibleMove);
        });


        socket.on('toggleWall', async (wall, isVertical, gameStateID, token, roomId) => {
            console.log('ON toggleWall');
            const onlineGameOption = !!roomId;
            var response = toggleWall(wall, isVertical, onlineGameOption, gameStateID);
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
                fogOfWar.updateBoardVisibility(gameStateID);
                try{
                    await modifyVisibilityMapInDatabase(token, gameStateID, fogOfWar.visibilityMapObjectList[gameStateID].visibilityMap);
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

                changeCurrentPlayer(gameStateID);

                if (roomId) {
                    gameOnlineManager.emitUpdateBoard(gameStateID, roomId);
                } else {
                    await handleAIMove(gameStateID, token);
                }
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
            if (gameOnlineManager.isPlayerInWaitList(userId)) {
                gameOnlineManager.updatePlayerSocket(userId, socket);
            } else {
                gameOnlineManager.addPlayerToWaitList(userId, socket);
            }
            gameOnlineManager.tryMatchmaking(io);
        });

        async function handleAIMove(id, token) {
            let responseAI = moveAI(id);
            if (responseAI.action === 'wall') {
                try {
                    await toggleWallInDatabase(id, responseAI.value, responseAI.isVertical, token);
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
                socket.emit('toggleAndLockWall', responseAI.value);
            } else if (responseAI.action === 'move') {
                try {
                    const targetAIPosition = gameManager.gameStateList[id].players.find(player => player.id === 'player1').position;
                    await moveAIPlayerInDatabase(id, targetAIPosition, token);
                } catch (error) {
                    if (error instanceof DatabaseConnectionError) {
                        socket.emit('databaseConnectionError');
                    } else {
                        // Gérer toutes les autres erreurs non spécifiques
                        console.log("Une erreur inattendue est survenue : ", error.message);
                    }
                }
            } else if (responseAI.action === 'endGame') {
                await endGameInDatabase(id);
                console.log('EMIT endGame');
                socket.emit("endGame", responseAI);
                return;
            }

            fogOfWar.updateBoardVisibility(id);
            try {
                await modifyVisibilityMapInDatabase(token, id, fogOfWar.visibilityMapObjectList[id].visibilityMap);
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
            changeCurrentPlayer(id);
            socket.emit('updateBoard', gameManager.gameStateList[id], fogOfWar.visibilityMapObjectList[id].visibilityMap, id);
        }

        socket.on('askTextButtonInteraction', async (token) => {
            console.log('ON askTextButtonInteraction ');

            const userId = verifyAndValidateUserID(token);
            if (!userId) {
                socket.emit('tokenInvalid');
                return;
            }
            const text = await chatManager.retrieveTextInGameInteraction(userId)
            console.log('EMIT askTextButtonInteraction ', text);

            socket.emit('answerTextButtonInteraction', text);
        });

        socket.on('displayText', (roomId, text) => {
            io.of('/api/game').to(roomId).emit('displayText', text);
        });

    });
}



module.exports = setupSocket;