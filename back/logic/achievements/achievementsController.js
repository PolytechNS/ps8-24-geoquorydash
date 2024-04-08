const { createAchievementsInDatabase, retrieveAchievementsFromDatabaseForAUser } = require("../../models/users/achievements.js");
const {createUserCollection} = require('../../models/users/users');
const achievementsManager = require('../../logic/achievements/achievementsManager.js');
const { parseJSON } = require('../../utils/utils.js');

async function associateAchievementsToNewUser(req, res) {
    parseJSON(req, async (err, { username }) => {
        if (err) {
            console.log('Invalid JSON:', err);
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }

        try {
            const usersCollection = await createUserCollection();
            const userByUsername = await usersCollection.findOne({ username });
            
            if (userByUsername) {
                console.log("User found with the username :", username);
                await createAchievementsInDatabase(userByUsername._id);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Statistics associated successfully' }));
            } else {
                console.log("Aucun utilisateur trouvé avec le username :", username);
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('User not found');
            }
        } catch (err) {
            console.log('Error associating achievements:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal server error while creating statistics');
        }
    });
}

async function updateFriendsAchievements(req, res) {
    parseJSON(req, async (err, { username, numberOfFriends }) => {
        if (err) {
            console.log('Invalid JSON:', err);
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }

        try {
            const usersCollection = await createUserCollection();
            const userByUsername = await usersCollection.findOne({ username });
            
            if (userByUsername) {
                console.log("User found with the username :", username);
                await achievementsManager.checkNewFriendsAchievements(userByUsername._id, numberOfFriends);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Statistics associated successfully' }));
            } else {
                console.log("Aucun utilisateur trouvé avec le username :", username);
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('User not found');
            }
        } catch (err) {
            console.log('Error associating achievements:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal server error while creating statistics');
        }
    });
}

async function retrieveAchievements(req, res) {
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    try {
        const achievementsStructure = await retrieveAchievementsFromDatabaseForAUser(token);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ achievementsStructure }));
    } catch (error) {
        console.error("Error retrieving game history:", error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

module.exports = { associateAchievementsToNewUser, updateFriendsAchievements, retrieveAchievements };