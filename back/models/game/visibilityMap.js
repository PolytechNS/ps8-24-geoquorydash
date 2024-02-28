async function createVisibilityMapInDatabase(database, gameStateId, visibilityMap) {
    const visibilityMapCollection = database.collection('visibilityMaps');
    const result = await visibilityMapCollection.insertOne({ gameStateId, visibilityMap });
    return result;
}

module.exports = { createVisibilityMapInDatabase };