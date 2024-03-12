// controllers/authController.js
const { generateToken, verifyToken } = require('./tokenManager');
const { parseJSON } = require('../../utils/utils.js');
const createUserCollection = require('../../models/users/users');
const { ObjectId } = require('mongodb');

async function signup(req, res) {
    parseJSON(req, async (err, { username, password }) => {
        if (err) {
            console.log('Invalid JSON:', err);
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }

        try {
            const usersCollection = await createUserCollection();
            const existingUser = await usersCollection.findOne({ username: username });
            if (existingUser) {
                console.log('User already exists:', username);
                res.writeHead(409, { 'Content-Type': 'text/plain' }); // 409 Conflict
                res.end('User already exists');
                return;
            }

            const newUser = {
                username,
                password,
            };
            await usersCollection.insertOne(newUser);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User created successfully' })); // Envoyez une réponse JSON
        } catch (err) {
            console.log('Error creating user:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal server error');
        }
    });
}

async function login(req, res) {
    parseJSON(req, async (err, { username, password }) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }

        try {
            const usersCollection = await createUserCollection();
            const user = await usersCollection.findOne({ username, password });
            if (user) {
                const token = generateToken(user._id);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ token }));
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

function verifyAndValidateUserID(token) {
    try {
        const tokenData = verifyToken(token);
        var userID = tokenData.userID;
    } catch (err) {
        console.log('Invalid token:', err);
        return null;
    }

    if (!ObjectId.isValid(userID)) {
        console.log('Invalid userID:', userID);
        return null;
    }

    return userID;
}

module.exports = { signup, login, searchUsers, verifyAndValidateUserID};
