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
    const { playerCollection, query } = preparePlayerQueryAndCollection(database, gameStateId, userID);
    const result = await playerCollection.updateOne(query, { $set: { position: targetPosition } });
    return result;
}

async function changeAIPlayerPositionInDatabase(database, gameStateId, targetPosition) {
    const { playerCollection, query } = preparePlayerQueryAndCollection(database, gameStateId);
    const result = await playerCollection.updateOne(query, { $set: { position: targetPosition } })
    return result;
}

async function addWallToUserPlayerInDatabase(database, gameStateId, wall, userID) {
    const { playerCollection, query } = preparePlayerQueryAndCollection(database, gameStateId, userID);
    const result = await playerCollection.updateOne(query, { $push: { walls: wall } });
    return result;
}

async function addWallToAIPlayerInDatabase(database, gameStateId, wall) {
    const { playerCollection, query } = preparePlayerQueryAndCollection(database, gameStateId);
    const result = await playerCollection.updateOne(query, { $push: { walls: wall } });
    return result;

}

function preparePlayerQueryAndCollection(database, gameStateId, userId) {
    const playerCollection = database.collection('players');
    const query = {
        gameStateId: new ObjectId(gameStateId),
        userId: userId ? new ObjectId(userId) : 'ai'
    };
    return { playerCollection, query };
}


module.exports = { createPlayerInDatabase, changeUserPlayerPositionInDatabase, changeAIPlayerPositionInDatabase, addWallToUserPlayerInDatabase, addWallToAIPlayerInDatabase};