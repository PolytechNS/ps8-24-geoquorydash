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
            numberOfPlayedGames : 0,
            playingTimeDuration : 0,
            numberOfVictory : 0,
            numberOfMoves : 0,
            numberOfWallsInstalled : 0,
            fastestWinNumberOfMoves : 0 // Cette statistique concerne le nombre de coups joués uniquement par le joueur gagnant
        };
        const result = await statCollection.insertOne(newStat);
        return result;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new DatabaseConnectionError("Error connecting to MongoDB");
    }
}

async function updateStatInDatabase(userId, temporaryStat, winnerId) {
    console.log("On rentre dans la méthode de mise à jour de stats");
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
            const playerId = temporaryStat.playerId;

            statistics.numberOfPlayedGames += 1;
            if(playerId === winnerId) {
                statistics.numberOfVictory += 1;

                // fastestWinNumberOfMoves représente le nombre de décisions prises par les deux joueurs cumulées (mur posé ou déplacement)
                // Étant donné que c'est une victoire, le nombre de tours
                var tmpFastestWinNumberOfMoves = temporaryStat.numberOfMoves + temporaryStat.numberOfWallsInstalled;
                if(statistics.fastestWinNumberOfMoves > tmpFastestWinNumberOfMoves || statistics.fastestWinNumberOfMoves === 0) {
                    statistics.fastestWinNumberOfMoves = tmpFastestWinNumberOfMoves;
                }
            }
            statistics.playingTimeDuration += Math.ceil(temporaryStat.playingTimeDuration / 60000); // Conversion de millisecondes en minutes
            statistics.numberOfMoves += temporaryStat.numberOfMoves;
            statistics.numberOfWallsInstalled += temporaryStat.numberOfWallsInstalled;

            await statCollection.updateOne({ userId: userId }, { $set: statistics });
        } else {
            throw new Error('No statistics found for this user');
        }
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new DatabaseConnectionError("Error connecting to MongoDB");
    } finally {
        await client.close();
    }
}

async function retrieveStatFromDatabaseForAUser(token) {
    console.log("On rentre dans la méthode de récupération de stats");
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

async function retrieveAllStatsFromDatabase() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('myapp_db');
        const statCollection = database.collection('stat');
        return await statCollection.find().toArray();
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new DatabaseConnectionError("Error connecting to MongoDB");
    } finally {
        await client.close();
    }
}

module.exports = { createStatInDatabase, retrieveStatFromDatabaseForAUser, updateStatInDatabase, retrieveAllStatsFromDatabase };
