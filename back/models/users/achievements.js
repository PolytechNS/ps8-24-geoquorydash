const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
const { uri } = require('../../bdd.js');
const { InvalidTokenError, DatabaseConnectionError } = require('../../utils/errorTypes');
const { verifyAndValidateUserID } = require('../../logic/authentification/authController');
const {createUserCollection} = require('../../models/users/users');

async function createAchievementsInDatabase(userId) {
    console.log("On rentre dans la méthode de création des achievements");
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('myapp_db');
        const achievementsCollection = database.collection('achievements');
        const newAchievementsStructure = {
            userId : userId,
            achievements : []
        };
        const result = await achievementsCollection.insertOne(newAchievementsStructure);
        return result;
    } catch (error) {
        console.error("Error connecting to MongoDB while associating achievements:", error);
        throw new DatabaseConnectionError("Error connecting to MongoDB");
    }
}

async function updateAchievementsInDatabase(userId, achievement) {
    console.log("On rentre dans la méthode de mise à jour des achievements classiques");
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('myapp_db');
        const achievementsCollection = database.collection('achievements');
        userId = new ObjectId(userId);
        const achievementsStructure = await achievementsCollection.findOne({ userId: userId });
        if(achievementsStructure) {
            const achievementExists = achievementsStructure.achievements.some(existingAchievement => existingAchievement.id === achievement.id);
            if (!achievementExists) {
                console.log("L'achievement \"" + achievement.nom + "\" n'existe pas encore pour cet utilisateur");
                achievementsStructure.achievements.push(achievement);
                const result = await achievementsCollection.updateOne({ userId: userId }, { $set: { achievements: achievementsStructure.achievements } });
                return result;
            } else {
                console.log("L'achievement \"" + achievement.nom + "\" existe déjà pour cet utilisateur");
            }
        } else {
            throw new Error('No achievements found for this user');
        }
    } catch (error) {
        console.error("Error connecting to MongoDB while updating achievements:", error);
        throw new DatabaseConnectionError("Error connecting to MongoDB");
    }
}

async function retrieveAchievementsFromDatabaseForAUser(username) {
    console.log("On rentre dans la méthode de récupération des achievements");
    var userId = await getUserIdByUsername(username);
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('myapp_db');
        const achievementsCollection = database.collection('achievements');
        userId = new ObjectId(userId);
        const achievementsStructure = await achievementsCollection.findOne({ userId: userId });
        if(achievementsStructure) {
            console.log("On a bien trouvé des achievements pour le joueur de username " + username);
            return achievementsStructure;
        } else {
            console.log("Aucun achievement trouvé pour l'utilisateur de username " + username);
            throw new Error('No achievements found for this user');
        }
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new DatabaseConnectionError("Error connecting to MongoDB");
    }
}

async function getUserIdByUsername(username) {
    try {
        const usersCollection = await createUserCollection();
        const user = await usersCollection.findOne({ username });
        return user._id;
    } catch (error) {
        console.error("Error fetching user by username:", error);
        throw error;
    }

}

module.exports = { createAchievementsInDatabase, updateAchievementsInDatabase, retrieveAchievementsFromDatabaseForAUser };