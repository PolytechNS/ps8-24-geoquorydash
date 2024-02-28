const { MongoClient } = require('mongodb');
const { uri } = require('../../bdd.js');
const { createGameStateInDatabase } = require('./gameState');
const { createVisibilityMapInDatabase } = require('./visibilityMap');
const { createPlayerInDatabase } = require('./player');

async function createGameInDatabase(gameStateForPlayer, visibilityMap, userID) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('myapp_db');

        const gameStateID = await createGameStateInDatabase(database);
        await createVisibilityMapInDatabase(database, gameStateID, visibilityMap);
        await createPlayerInDatabase(database, gameStateID, gameStateForPlayer, userID);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

module.exports = { createGameInDatabase };