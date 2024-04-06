const { createStatInDatabase, retrieveStatFromDatabaseForAUser, retrieveAllStatsFromDatabase } = require("../../models/users/stat");
const createUserCollection = require('../../models/users/users');
const { parseJSON } = require('../../utils/utils.js');
const {verifyAndValidateUserID} = require("../authentification/authController");
const {ObjectId} = require("mongodb");

async function associateStatToNewUser(req, res) {
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
                await createStatInDatabase(userByUsername._id);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Statistics associated successfully' }));
            } else {
                console.log("Aucun utilisateur trouvé avec le username :", username);
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('User not found');
            }
        } catch (err) {
            console.log('Error associating statistics:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal server error while creating statistics');
        }
    });
}

async function retrieveStat(req, res) {
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    try {
        const stat = await retrieveStatFromDatabaseForAUser(token);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ stat }));
    } catch (error) {
        console.error("Error retrieving game history:", error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

async function getRanking(req, res) {
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    try {
        const stats = await retrieveAllStatsFromDatabase();
        const rankedPlayers = calculateHybridRanking(stats);
        var userId = new ObjectId(verifyAndValidateUserID(token));
        const userIndex = rankedPlayers.findIndex(playerId => playerId.equals(userId));
        const userRanking = userIndex !== -1 ? userIndex + 1 : 0;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ranking: userRanking }));
    } catch (error) {
        console.error("Error retrieving ranking:", error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}


async function getAllRanking(req, res) {
    try {
        const stats = await retrieveAllStatsFromDatabase();
        const rankedPlayers = calculateHybridRanking(stats);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ranking: rankedPlayers }));
    } catch (error) {
        console.error("Error retrieving ranking:", error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

function calculateHybridRanking(stats) {
    const sortedPlayers = stats.sort((a, b) => {
        const ratioA = a.numberOfPlayedGames !== 0 ? a.numberOfVictory / a.numberOfPlayedGames : 0;
        const ratioB = b.numberOfPlayedGames !== 0 ? b.numberOfVictory / b.numberOfPlayedGames : 0;

        if (a.numberOfVictory !== b.numberOfVictory) {
            return b.numberOfVictory - a.numberOfVictory;
        } else {
            return ratioB - ratioA;
        }
    });

    return sortedPlayers.map(player => player.userId);
}

module.exports = { associateStatToNewUser, retrieveStat, getRanking, getAllRanking };