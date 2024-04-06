const { MongoClient } = require('mongodb');
const { uri } = require('../../bdd.js');
const { createGameStateInDatabase, setGameStateToFinishedInDatabase, gameStatesNotFinished} = require('./gameState');
const { createVisibilityMapInDatabase, changeVisibilityMapInDatabase, retrieveVisibilityMapWithGameStateIDFromDatabase} = require('./visibilityMap');
const { createPlayerInDatabase, retrieveAllGamesIDWithUserID, changeUserPlayerPositionInDatabase,
    changeAIPlayerPositionInDatabase, addWallToAIPlayerInDatabase, addWallToUserPlayerInDatabase,
    retrievePlayersWithGamestateIDFromDatabase
} = require('./player');
const { verifyAndValidateUserID } = require('../../logic/authentification/authController');
const { InvalidTokenError, DatabaseConnectionError } = require('../../utils/errorTypes');

async function createGameInDatabase(gameState, visibilityMap, users, gameStateID) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('myapp_db');

        // const gameStateID = await createGameStateInDatabase(database);
        await createVisibilityMapInDatabase(database, gameStateID, visibilityMap);

        let userPlayer = gameState.players.find(player => player.id === 'player2');
        await createPlayerInDatabase(database, gameStateID, userPlayer, users.userId1);

        if (users.userId2) {
            let userPlayer2 = gameState.players.find(player => player.id === 'player1');
            await createPlayerInDatabase(database, gameStateID, userPlayer2, users.userId2);
        } else {
            let aiPlayer = gameState.players.find(player => player.id === 'player1');
            await createPlayerInDatabase(database, gameStateID, aiPlayer);
        }
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
        const gameStatesId = await retrieveAllGamesIDWithUserID(database, userID);
        return await gameStatesNotFinished(database, gameStatesId);

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

async function moveAIPlayerInDatabase(gameStateID, targetPosition, token) {
    if (token) {
        const userID = verifyAndValidateUserID(token);
        if (!userID) {
            console.error("Invalid token");
            throw new InvalidTokenError("Invalid token");
        }
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
}

async function toggleWallInDatabase(gameStateID, wall, isVertical, token) {
    if (token){
        var userID = verifyAndValidateUserID(token);
        if (!userID) {
            console.error("Invalid token");
            throw new InvalidTokenError("Invalid token");
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

async function endGameInDatabase(gameStateID, token) {
    if (token){
        if (!verifyAndValidateUserID(token)) {
            console.error("Invalid token");
            throw new InvalidTokenError("Invalid token");
        }

        const client = new MongoClient(uri);
        try {
            await client.connect();
            const database = client.db('myapp_db');
            await setGameStateToFinishedInDatabase(database, gameStateID);
        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
            throw new DatabaseConnectionError("Error connecting to MongoDB");
        }
    }

}

module.exports = { createGameInDatabase, retrieveGamesFromDatabaseForAUser, retrieveGameStateFromDB,
    moveUserPlayerInDatabase, moveAIPlayerInDatabase, modifyVisibilityMapInDatabase, toggleWallInDatabase,
    retrieveVisibilityMapFromDatabase, endGameInDatabase};