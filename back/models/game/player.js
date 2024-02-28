async function createPlayerInDatabase(database, gameStateId, gameStateForPlayer, userId) {
    const playerCollection = database.collection('players');
    const newPlayer = {
        gameStateId : gameStateId,
        position : gameStateForPlayer.position,
        walls : gameStateForPlayer.walls,
        isCurrentPlayer : gameStateForPlayer.isCurrentPlayer,
        userId : userId
    };
    const result = await playerCollection.insertOne(newPlayer);
    return result;
}

module.exports = { createPlayerInDatabase };