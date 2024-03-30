const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
const { uri } = require('../../bdd.js');
const { InvalidTokenError, DatabaseConnectionError } = require('../../utils/errorTypes');
const { verifyAndValidateUserID } = require('../../logic/authentification/authController');

async function createStatInDatabase(userId) {
    console.log("On rentre dans la méthode de création de stats");
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('myapp_db');
        const statCollection = database.collection('stat');
        const newStat = {
            userId : userId,
            numberOfPlayedGames : 1,
            playingTimeDuration : 150,
            numberOfVictory : 1,
            numberOfMoves : 20,
            numberOfWallsInstalled : 8,
            numberOfTurnsOfClosestGame : 56
        };
        const result = await statCollection.insertOne(newStat);
        return result;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new DatabaseConnectionError("Error connecting to MongoDB");
    }
}

async function retrieveStatFromDatabaseForAUser(token) {
    console.log("On rentre dans la méthode de création de stats");
    var userId = verifyAndValidateUserID(token);
    if (!userId) {
        console.error("Invalid token");
        throw new InvalidTokenError("Invalid token");
    }
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('myapp_db');
        const statCollection = database.collection('stat');
        userId = new ObjectId(userId);
        const statistics = await statCollection.findOne({ userId: userId });
        if(statistics) {
            return statistics;
        } else {
            throw new Error('No statistics found for this user');
        }
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new DatabaseConnectionError("Error connecting to MongoDB");
    }
}

module.exports = { createStatInDatabase, retrieveStatFromDatabaseForAUser };
