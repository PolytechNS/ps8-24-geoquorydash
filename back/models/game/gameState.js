const {ObjectId, MongoClient} = require("mongodb");
const {uri} = require("../../bdd");
const {DatabaseConnectionError} = require("../../utils/errorTypes");

async function createGameStateInDatabase() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('myapp_db');
        const gameCollection = database.collection('gameStates');
        const result = await gameCollection.insertOne({gameFinished: false, inProgess: true});
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

async function gameStatesNotFinishedAndNotInProgress(database, gameStatesId) {
    const gameCollection = database.collection('gameStates');
    const gameStatesNotFinished = await gameCollection.find({_id: {$in: gameStatesId}, gameFinished: false, inProgess: false}).toArray();
    return gameStatesNotFinished.map(gameState => gameState._id);
}

async function setGameStateInProgressBoolean(gameStatesId, isInProgress) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('myapp_db');
        const gameCollection = database.collection('gameStates');

        let objectId;
        try {
            objectId = new ObjectId(gameStatesId);
        } catch (error) {
            throw new Error("Invalid gameStatesId: Must be a 24 character hex string");
        }

        await gameCollection.updateOne({_id: objectId}, {$set: {inProgess: isInProgress}});
    } catch (error) {
        console.error("Error:", error);
        if (error.message.includes("Invalid gameStatesId")) {
            console.error("Invalid gameStatesId: Must be a 24 character hex string");
        } else {
            throw new DatabaseConnectionError("Error connecting to MongoDB", error);
        }
    } finally {
        await client.close();
    }
}


async function getGameStateInProgress() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('myapp_db');
        const gameCollection = database.collection('gameStates');
        const gameState = await gameCollection.findOne({inProgess: true});
        return gameState;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new DatabaseConnectionError("Error connecting to MongoDB");

    }
}

async function retrieveGameStateWithIDFromDatabase(database, gameStateID){
    const gameCollection = database.collection('gameStates');
    const gameState = await gameCollection.findOne({_id: new ObjectId(gameStateID)});
    return gameState;
}

module.exports = { createGameStateInDatabase,
    setGameStateToFinishedInDatabase,
    gameStatesNotFinished: gameStatesNotFinishedAndNotInProgress,
    setGameStateInProgressBoolean,
    getGameStateInProgress,
    retrieveGameStateWithIDFromDatabase };