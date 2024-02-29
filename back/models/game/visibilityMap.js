const {ObjectId} = require("mongodb");

async function createVisibilityMapInDatabase(database, gameStateId, visibilityMap) {
    const visibilityMapCollection = database.collection('visibilityMaps');
    const result = await visibilityMapCollection.insertOne({ gameStateId, visibilityMap });
    return result;
}

async function changeVisibilityMapInDatabase(database, gameStateId, visibilityMap) {
    const visibilityMapCollection = database.collection('visibilityMaps');
    const result = await visibilityMapCollection.updateOne({ gameStateId : new ObjectId(gameStateId)}, { $set: { visibilityMap } });
    return result;
}

module.exports = { createVisibilityMapInDatabase, changeVisibilityMapInDatabase};