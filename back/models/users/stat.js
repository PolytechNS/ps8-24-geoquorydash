const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
const { uri } = require('../../bdd.js');
const { InvalidTokenError, DatabaseConnectionError } = require('../../utils/errorTypes');
const { verifyAndValidateUserID } = require('../../logic/authentification/authController');

async function createStatInDatabase(userId) {
    console.log("On rentre dans la méthode de création de stats");
    /*const userId = verifyAndValidateUserID(token);
    if (!userId) {
        console.error("Invalid token");
        throw new InvalidTokenError("Invalid token");
    }*/
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('myapp_db');
        const statCollection = database.collection('stat');
        console.log("On vient de se connecter à la collection stat");
        const newStat = {
            userId : userId,
            numberOfPlayedGames : 0,
            playingTimeDuration : 0,
            numberOfVictory : 0,
            numberOfMoves : 0,
            numberOfWallInstalled : 0,
            numberOfTurnsOfClosestGame : 0
        };
        console.log("L'objet newStat est créé");
        console.log("On peut par exemple accéder à la propriété numberOfPlayedGames : " + newStat.numberOfPlayedGames);
        const result = await statCollection.insertOne(newStat);
        return result;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new DatabaseConnectionError("Error connecting to MongoDB");
    }
}

async function retrieveNumberOfPlayedGamesFromDatabaseForAUser(token) {
    var userId = verifyAndValidateUserID(token);
    if (!userId) {
        console.error("Invalid token");
        throw new InvalidTokenError("Invalid token");
    }
    console.log("Id du user : " + userId);
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('myapp_db');
        const statCollection = database.collection('stat');
        console.log("On vient de se connecter à la collection stat");
        userId = new ObjectId(userId);
        console.log("Le nouveau userId est : " + userId);
        const statistics = await statCollection.findOne({ userId: userId });
        if(statistics) {
            console.log("Valeur à retourner : " + statistics.numberOfPlayedGames);
            return statistics.numberOfPlayedGames;
        } else {
            throw new Error('No statistics found for this user');
        }
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new DatabaseConnectionError("Error connecting to MongoDB");
    }
}

module.exports = { createStatInDatabase, retrieveNumberOfPlayedGamesFromDatabaseForAUser };
