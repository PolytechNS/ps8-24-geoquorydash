const { MongoClient } = require('mongodb');
const { uri } = require('../../bdd.js');
const { createGameStateInDatabase } = require('./gameState');
const { createVisibilityMapInDatabase, changeVisibilityMapInDatabase, retrieveVisibilityMapWithGameStateIDFromDatabase} = require('./visibilityMap');
const { createPlayerInDatabase, retrieveAllGamesIDWithUserID, changeUserPlayerPositionInDatabase,
    changeAIPlayerPositionInDatabase, addWallToAIPlayerInDatabase, addWallToUserPlayerInDatabase,
    retrievePlayersWithGamestateIDFromDatabase
} = require('./player');
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

async function retrieveGamesFromDatabaseForAUser(token) {
    const userID = verifyAndValidateUserID(token);
    if (!userID) {
        console.error("Invalid token");
        throw new InvalidTokenError("Invalid token");
    }
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('myapp_db');
        return await retrieveAllGamesIDWithUserID(database, userID);

    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new DatabaseConnectionError("Error connecting to MongoDB");
    }
}

async function retrieveGameStateFromDB(gameStateID) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('myapp_db');
        const gameState = {
            players: []
        };
        await retrievePlayersWithGamestateIDFromDatabase(database, gameStateID, gameState);
        return gameState;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new DatabaseConnectionError("Error connecting to MongoDB");
    }

}

async function retrieveVisibilityMapFromDatabase(gameStateID) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('myapp_db');
        const visibilityMap = await retrieveVisibilityMapWithGameStateIDFromDatabase(database, gameStateID);
        return visibilityMap;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new DatabaseConnectionError("Error connecting to MongoDB");
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

async function toggleWallInDatabase(gameStateID, wall, isVertical, token) {
    if (token){
        var userID = verifyAndValidateUserID(token);
        if (!userID) {
            console.error("Invalid token");
            throw new InvalidTokenError("Invalid token");
        }
    }
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('myapp_db');
        wall.push({
            isVertical: isVertical
        });
        if (userID) {
            await addWallToUserPlayerInDatabase(database, gameStateID, wall, userID);
        } else {
            await addWallToAIPlayerInDatabase(database, gameStateID, wall);
        }
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

module.exports = { createGameInDatabase, retrieveGamesFromDatabaseForAUser, retrieveGameStateFromDB,
    moveUserPlayerInDatabase, moveAIPlayerInDatabase, modifyVisibilityMapInDatabase, toggleWallInDatabase,
    retrieveVisibilityMapFromDatabase};