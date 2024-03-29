const {ObjectId, MongoClient} = require("mongodb");
const {uri} = require("../../bdd");
const {DatabaseConnectionError} = require("../../utils/errorTypes");

async function createGameStateInDatabase() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('myapp_db');
        const gameCollection = database.collection('gameStates');
        const result = await gameCollection.insertOne({gameFinished: false});
        const newGameStateId = result.insertedId;
        return newGameStateId;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new DatabaseConnectionError("Error connecting to MongoDB");

    }
}

async function setGameStateToFinishedInDatabase(database, gameStateID) {
    const gameCollection = database.collection('gameStates');
    await gameCollection.updateOne({_id: new ObjectId(gameStateID)}, {$set: {gameFinished: true}});
}

async function gameStatesNotFinished(database, gameStatesId) {
    const gameCollection = database.collection('gameStates');
    const gameStatesNotFinished = await gameCollection.find({_id: {$in: gameStatesId}, gameFinished: false}).toArray();
    return gameStatesNotFinished.map(gameState => gameState._id);
}

module.exports = { createGameStateInDatabase, setGameStateToFinishedInDatabase, gameStatesNotFinished };