const { generateToken, verifyToken } = require('./tokenManager');
const { parseJSON } = require('../../utils/utils.js');
const {createUserCollection} = require('../../models/users/users');
const { createDefaultConfiguration } = require('../../models/users/configuration.js');
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
                profilePicture: null,
                friends: [],
                friendRequests: [],
                skinURL: "Cube002.png"
            };

            let usersCollectionResponse = await usersCollection.insertOne(newUser);
            await createDefaultConfiguration(usersCollectionResponse.insertedId.toString());

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User created successfully' }));
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

async function username(req, res) {
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];

        const userID = verifyAndValidateUserID(token);
        if (userID) {
            try {
                const usersCollection = await createUserCollection();
                const user = await usersCollection.findOne({ _id: new ObjectId(userID) });
                if (user) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(user.username));
                } else {
                    console.log("user not found");
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('User not found');
                }
            } catch (error) {
                console.log("error")
                console.error('Error fetching user data:', error);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal server error');
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
    }
}

async function updateSkin(req, res) {
    console.log("On passe dans la méthode skin");
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];

        parseJSON(req, async (err, { skinURL }) => {
            if (err) {
                console.log('Invalid JSON:', err);
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Invalid JSON');
                return;
            }

            const userID = verifyAndValidateUserID(token);
            if (userID) {
                try {
                    const usersCollection = await createUserCollection();
                    const user = await usersCollection.findOne({ _id: new ObjectId(userID) });
                    if (user) {
                        const updateResult = await usersCollection.updateOne(
                            { _id: new ObjectId(userID) },
                            { $set: { skinURL: skinURL } }
                        );
                        if (updateResult.modifiedCount === 1) {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'Skin updated successfully' }));
                        } else {
                            console.log("Failed to update skin");
                            res.writeHead(500, { 'Content-Type': 'text/plain' });
                            res.end('Failed to update skin');
                        }
                    } else {
                        console.log("user not found");
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end('User not found');
                    }
                } catch (error) {
                    console.log("error")
                    console.error('Error fetching user data:', error);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal server error');
                }
            } else {
                console.log("unauthorized");
                res.writeHead(401, { 'Content-Type': 'text/plain' });
                res.end('Unauthorized');
            }
        });

    } else {
        console.log("invalid or missing");
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid or missing Authorization header');
    }
}

async function getSkin(req, res) {
    console.log("On est dans la méthode getSkin");
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];

        const userID = verifyAndValidateUserID(token);
        if (userID) {
            try {
                const usersCollection = await createUserCollection();
                const user = await usersCollection.findOne({ _id: new ObjectId(userID) });
                if (user) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ skinURL: user.skinURL }));
                } else {
                    console.log("user not found");
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('User not found');
                }
            } catch (error) {
                console.log("error")
                console.error('Error fetching user data:', error);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal server error');
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
    }
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


module.exports = { signup, login, username, updateSkin, getSkin, verifyAndValidateUserID };
