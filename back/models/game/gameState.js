const {ObjectId} = require("mongodb");

async function createGameStateInDatabase(database) {
    const gameCollection = database.collection('gameStates');
    const result = await gameCollection.insertOne({gameFinished: false});
    const newGameStateId = result.insertedId;
    return newGameStateId;
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