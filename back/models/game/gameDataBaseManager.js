const { MongoClient } = require('mongodb');
const { uri } = require('../../bdd.js');
const { createGameStateInDatabase } = require('./gameState');
const { createVisibilityMapInDatabase, changeVisibilityMapInDatabase } = require('./visibilityMap');
const { createPlayerInDatabase, changeUserPlayerPositionInDatabase, changeAIPlayerPositionInDatabase } = require('./player');
const { verifyAndValidateUserID } = require('../../logic/authentification/authController');
const { InvalidTokenError, DatabaseConnectionError } = require('../../utils/errorTypes');
async function createGameInDatabase(gameStateForPlayer, visibilityMap, userID) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('myapp_db');

        const gameStateID = await createGameStateInDatabase(database);
        await createVisibilityMapInDatabase(database, gameStateID, visibilityMap);

        let aiPlayer = gameStateForPlayer.find(player => player.id === 'ia');
        await createPlayerInDatabase(database, gameStateID, aiPlayer);

        let userPlayer = gameStateForPlayer.find(player => player.id === 'p2');
        await createPlayerInDatabase(database, gameStateID, userPlayer, userID);

        return gameStateID;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

async function moveUserPlayerInDatabase(gameStateID, token, targetPosition) {
    if (token){
        const userID = verifyAndValidateUserID(token);
        if (!userID) {
            console.error("Invalid token");
            throw new InvalidTokenError("Invalid token");
        }
        const client = new MongoClient(uri);
        try {
            await client.connect();
            const database = client.db('myapp_db');
            await changeUserPlayerPositionInDatabase(database, gameStateID, targetPosition, userID);
        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
            throw new DatabaseConnectionError("Error connecting to MongoDB");
        }
    }
}

async function moveAIPlayerInDatabase(gameStateID, targetPosition) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('myapp_db');
        await changeAIPlayerPositionInDatabase(database, gameStateID, targetPosition);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new DatabaseConnectionError("Error connecting to MongoDB");
    }
}

async function modifyVisibilityMapInDatabase(token, gameStateID, visibilityMap) {
    if (token){
        if (!verifyAndValidateUserID(token)) {
            console.error("Invalid token");
            throw new InvalidTokenError("Invalid token");
        }
        const client = new MongoClient(uri);
        try {
            await client.connect();
            const database = client.db('myapp_db');
            await changeVisibilityMapInDatabase(database, gameStateID, visibilityMap);
        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
            throw new DatabaseConnectionError("Error connecting to MongoDB");
        }
    }

}

module.exports = { createGameInDatabase, moveUserPlayerInDatabase, moveAIPlayerInDatabase, modifyVisibilityMapInDatabase};