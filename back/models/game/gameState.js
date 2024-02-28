async function createGameStateInDatabase(database) {
    const gameCollection = database.collection('gameStates');
    const result = await gameCollection.insertOne({ });
    const newGameStateId = result.insertedId;
    return newGameStateId;
}

module.exports = { createGameStateInDatabase };