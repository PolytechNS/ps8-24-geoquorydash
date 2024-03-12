const { generateToken, verifyToken } = require('../authentification/tokenManager');
const { parseJSON } = require('../../utils/utils.js');
const createUserCollection = require('../../models/users/users');
const { ObjectId } = require('mongodb');

async function searchUsers(req, res) {
    parseJSON(req, async (err, { username }) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }

        try {
            const usersCollection = await createUserCollection();
            const users = await usersCollection.find({ username: { $regex: username, $options: 'i' } }).toArray();
            if (users) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(users));
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('User not found');
            }
        } catch (error) {
            console.error('Error during login:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal server error');
        }
    });
}

module.exports = {searchUsers};
