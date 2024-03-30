const { createStatInDatabase, retrieveStatFromDatabaseForAUser } = require("../../models/users/stat");
const createUserCollection = require('../../models/users/users');
const { parseJSON } = require('../../utils/utils.js');

async function associateStatToNewUser(req, res) {
    /*const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];

        const userID = verifyAndValidateUserID(token);
        if (userID) {
            try {
                const result = await createStatInDatabase();
                const user = await usersCollection.findOne({ _id: new ObjectId(userID) });
                if (result) {
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end('Statistics has succesfully been associated to new user');
                } else {
                    console.log("Creation of statistics have failed");
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Creation of statistics have failed');
                }
            } catch (error) {
                console.log("error")
                console.error('Error while creating statistics:', error);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal server error with statistics');
            }
        } else {
            console.log("unauthorized");
            res.writeHead(401, { 'Content-Type': 'text/plain' });
            res.end('Unauthorized');
        }
    } else {
        console.log("invalid or missing");
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid or missing Authorization header');
    }*/
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

module.exports = { associateStatToNewUser, retrieveStat };