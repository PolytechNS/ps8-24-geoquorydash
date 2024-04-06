const gameManager = require('./logic/game/gameManager');
const fogOfWar = require('./logic/game/fogOfWarController');
const gameOnlineManager = require('./logic/game/gameOnlineManager');
const chatManager = require('./logic/chat/chatManager');
const usersConnected = require("./usersConnected");
const statManager = require('./logic/stat/statManager');
const { movePlayer, getPossibleMove, toggleWall, initializeGame, changeCurrentPlayer, moveAI} = require("./logic/game/gameEngine");
const { createGameInDatabase, moveUserPlayerInDatabase, moveAIPlayerInDatabase, modifyVisibilityMapInDatabase, toggleWallInDatabase,
    endGameInDatabase
} = require('./models/game/gameDataBaseManager');
const { verifyAndValidateUserID } = require('./logic/authentification/authController');
const {InvalidTokenError, DatabaseConnectionError} = require("./utils/errorTypes");
const {createGameStateInDatabase, setGameStateInProgressBoolean, getGameStateInProgress} = require("./models/game/gameState");
const {retrieveConfigurationFromDatabase} = require("./models/users/configuration");
const {findUserIdByUsername, findUsernameById} = require("./models/users/users");

const setupSocket = (io) => {

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

                // Dans ce càs là, on joue contre le bot, donc on est le player2 et on commence à jouer
                statManager.createTemporaryStat(userObjectID, null, "local", "player2");
                console.log("Des stats temporaire viennent d'être ajoutées pour une game locale");
            }

        });

        socket.on('resumeGame', async (gameStateID, token) => {
            console.log('ON resumeGame');

            const userId = verifyAndValidateUserID(token);
            if (!userId) {
                socket.emit('tokenInvalid');
                return;
            }
            const gameStateInProgress = await getGameStateInProgress();
            if (gameStateInProgress) {
                socket.emit('gameAlreadyInProgress', gameStateInProgress._id.toString());
                return;
            }

            await setGameStateInProgressBoolean(gameStateID, true);
            const gameState = gameManager.gameStateList[gameStateID];
            const visibilityMap = fogOfWar.visibilityMapObjectList[gameStateID].visibilityMap;
            socket.emit("updateBoard", gameState, visibilityMap, gameStateID);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
            const userId = gameOnlineManager.getUserIdBySocket(socket);
            if (userId) {
                gameOnlineManager.removePlayerFromWaitList(userId);
            }
        });

        socket.on('movePlayer', async (targetPosition, id, token, roomId) => {
            if (token) await setGameStateInProgressBoolean(id, true);

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

            const userId = verifyAndValidateUserID(token);
            if (!userId) {
                socket.emit('tokenInvalid');
                return;
            }
            statManager.updateTemporaryStat(userId, "move");

            if (response) {
                await endGameInDatabase(id, token);

                await statManager.updateStat(userId, Date.now(), response.id); // response.id est l'id du joueur qui a gagné

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
            if (token) await setGameStateInProgressBoolean(gameStateID, true);

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

            const userId = verifyAndValidateUserID(token);
            if (!userId) {
                socket.emit('tokenInvalid');
                return;
            }
            statManager.updateTemporaryStat(userId, "wall");
        });

        socket.on('findMatch', async (token) => {
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
            // var numberOfPlayersInWaitingRoom = Object.keys(gameOnlineManager.waitingPlayers).length;
            // // Le player qui arrive en premier dans la waiting room sera toujours player1, et le deuxième player2
            // if (numberOfPlayersInWaitingRoom === 2) {
            //     var firstPlayerId = Object.keys(gameOnlineManager.waitingPlayers)[0];
            //     var secondPlayerId = Object.keys(gameOnlineManager.waitingPlayers)[1];
            //     statManager.createTemporaryStat(firstPlayerId, secondPlayerId, "online", "player1");
            //     statManager.createTemporaryStat(secondPlayerId, firstPlayerId, "online", "player2");
            // }
            await gameOnlineManager.tryMatchmaking(io);
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
            } else if (responseAI === 'endGame') {
                await endGameInDatabase(id);

                const userId = verifyAndValidateUserID(token);
                if (!userId) {
                    socket.emit('tokenInvalid');
                    return;
                }
                await statManager.updateStat(userId, Date.now(), "player1"); // Dans ce cas, c'est le bot, qui est toujours player1, qui gagne

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

        socket.on('askTextButtonInteraction', async (token, roomId, socketId) => {
            const userId = verifyAndValidateUserID(token);
            if (!userId) {
                socket.emit('tokenInvalid');
                return;
            }
            const text = await chatManager.retrieveTextInGameInteraction(userId)
            const playerId = gameOnlineManager.gameInSession[roomId][0].id === socketId ? 'player1' : 'player2'
            socket.emit('answerTextButtonInteraction', text, playerId);
        });

        socket.on('askInteractionConfiguration', async (token) => {
            console.log('ON askInteractionConfiguration ');

            const userId = verifyAndValidateUserID(token);
            if (!userId) {
                socket.emit('tokenInvalid');
                return;
            }
            const configurationPossible = chatManager.textToDisplay["default"];
            const configuration = await retrieveConfigurationFromDatabase(userId);
            console.log('EMIT answerTextButtonInteraction ', configurationPossible, configuration);

            socket.emit('answerTextButtonInteraction', configurationPossible, configuration);
        });

        socket.on('displayText', (roomId, text, position) => {
            io.of('/api/game').to(roomId).emit('displayText', text, position);
        });

        socket.on('quitGame', async (token, gameStateID) => {
            console.log('ON quitGame');
            if (token){
                const verificationResult = verifyAndValidateUserID(token);
                if (!verificationResult) {
                    socket.emit('tokenInvalid');
                    return;
                }
                await setGameStateInProgressBoolean(gameStateID, false);
            }
        });

        socket.on('gameRequest', async (token, username) => {
            const userId = verifyAndValidateUserID(token);
            if (userId) {
                const userIdToRequest = await findUserIdByUsername(username);
                const userSocket = usersConnected.getUserSocket(userIdToRequest);
                if (userSocket) {
                    const data = {
                        userIdSender: userId,
                        userIdReceiver: userIdToRequest,
                    };
                    const roomId = await gameOnlineManager.joinGameRequestWaitingRoom(data, socket);
                    userSocket.emit('gameRequest', {
                        fromUsername: await findUsernameById(userId),
                        roomId: roomId
                    });

                } else {
                    console.log(`User ${username} is not connected.`);
                }
            } else {
                console.log('Invalid token');
            }
        });

        socket.on('gameRequestAccepted', async (token, usernameSenderRequest) => {
            const userIdReceiverRequest = verifyAndValidateUserID(token);
            if (userIdReceiverRequest) {
                const userIdSenderRequest = await findUserIdByUsername(usernameSenderRequest);
                const roomId = userIdSenderRequest + userIdReceiverRequest;
                const data = {
                    userIdReceiver: userIdReceiverRequest,
                    waitingRoomId: roomId,
                };
                await gameOnlineManager.joinGameRequestWaitingRoom(data, socket);
                await gameOnlineManager.tryMatchmakingFriend(io, roomId);
            } else {
                console.log(`User ${usernameSenderRequest} is not connected.`);
                socket.emit('gameRequestDeclined');
            }
        });
    });


}



module.exports = setupSocket;