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
        console.log("userId: ", userId);
        const newStat = {
            userId : userId,
            numberOfPlayedGames : 0,
            playingTimeDuration : 0,
            numberOfVictory : 0,
            numberOfMoves : 0,
            numberOfWallsInstalled : 0,
            numberOfTurnsOfClosestGame : 0
        };
        const result = await statCollection.insertOne(newStat);
        return result;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new DatabaseConnectionError("Error connecting to MongoDB");
    }
}

async function createTemporaryStat(gameId) {
    console.log("On rentre dans la méthode de création temporaire de stats");
    try {
        const temporaryStat = {
            gameId : gameId,
            playingTimeDuration : Date.now(),
            numberOfMoves : 0,
            numberOfWallsInstalled : 0
        };
        return temporaryStat;
    } catch (error) {
        console.error("Error while creating temporary stat:", error);
    }
}

async function updateStatInDatabase(token, temporaryStat, playerId, firstPlayerId, winnerId) {
    console.log("On rentre dans la méthode de mise à jour de stats");
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
        console.log("userId: ", userId);
        const statistics = await statCollection.findOne({ userId: userId });
        if(statistics) {
            statistics.numberOfPlayedGames += 1;
            if(playerId === winnerId) {
                statistics.numberOfVictory += 1;
            }
            statistics.playingTimeDuration += Math.round(temporaryStat.playingTimeDuration / 60000); // Conversion de millisecondes en minutes
            statistics.numberOfMoves += temporaryStat.numberOfMoves;
            statistics.numberOfWallsInstalled += temporaryStat.numberOfWallsInstalled;
            var tmpNumberOfTurnsOfClosestGame = temporaryStat.numberOfMoves + temporaryStat.numberOfWallsInstalled;
            if(playerId === firstPlayerId) {
                if(playerId !== winnerId) {
                    tmpNumberOfTurnsOfClosestGame += 1;
                }
            } else if(playerId !== firstPlayerId) {
                if(playerId === winnerId) {
                    tmpNumberOfTurnsOfClosestGame += 1;
                } else {
                    tmpNumberOfTurnsOfClosestGame += 2;
                }
            }
            if(statistics.numberOfTurnsOfClosestGame < tmpNumberOfTurnsOfClosestGame) {
                statistics.numberOfTurnsOfClosestGame = tmpNumberOfTurnsOfClosestGame;
            }
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

module.exports = { createStatInDatabase, retrieveStatFromDatabaseForAUser, createTemporaryStat, updateStatInDatabase };
