const { ObjectId } = require('mongodb');

async function createPlayerInDatabase(database, gameStateId, gameStateForPlayer, userId) {
    const playerCollection = database.collection('players');
    const newPlayer = {
        gameStateId : gameStateId,
        position : gameStateForPlayer.position,
        walls : gameStateForPlayer.walls,
        isCurrentPlayer : gameStateForPlayer.isCurrentPlayer,
    };
    newPlayer.userId = userId ? new ObjectId(userId) : 'ai';
    const result = await playerCollection.insertOne(newPlayer);
    return result;
}

async function changeUserPlayerPositionInDatabase(database, gameStateId, targetPosition, userID) {
    const playerCollection = database.collection('players');
    const userAndGameId = {
        gameStateId : new ObjectId(gameStateId),
        userId : new ObjectId(userID)
    };
    console.log(userAndGameId);
    console.log(targetPosition);
    const result = await playerCollection.updateOne(userAndGameId, { $set: { position: targetPosition } });
    return result;
}

async function changeAIPlayerPositionInDatabase(database, gameStateId, targetPosition) {
    const playerCollection = database.collection('players');
    const aiAndGameId = {
        gameStateId : new ObjectId(gameStateId),
        userId : 'ai'
    };
    const result = await playerCollection.updateOne(aiAndGameId, { $set: { position: targetPosition } })
    return result;
}

module.exports = { createPlayerInDatabase, changeUserPlayerPositionInDatabase, changeAIPlayerPositionInDatabase};