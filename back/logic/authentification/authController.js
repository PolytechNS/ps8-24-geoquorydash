// controllers/authController.js
const { generateToken } = require('./authentication');
const { parseJSON } = require('../../utils/utils.js');
const createUserCollection = require('../../models/users');

async function signup(req, res) {
    console.log('Signup');
    parseJSON(req, async (err, {username, password}) => {
        console.log('Signup started');
        if (err) {
            console.log('Invalid JSON:', err);
            res.writeHead(400, {'Content-Type': 'text/plain'});
            res.end('Invalid JSON');
            return;
        }
        console.log('Signup called');
        console.log(username, password);

        try {
            const usersCollection = await createUserCollection();
            const newUser = {
                username,
                password,
                gameState: {
                    players: [
                        {
                            id: "ia",
                            position: { x: 0, y: 8 },
                            walls: [],
                            isCurrentPlayer: false
                        },
                        {
                            id: "p2",
                            position: { x: 16, y: 8 },
                            walls: [],
                            isCurrentPlayer: true
                        }
                    ]
                },
                visibilityMap: []
            };
            for (let i = 0; i < (9*9); i++) {
                newUser.visibilityMap[i] = [];
                if (i < 36) {
                    newUser.visibilityMap[i] = 1; // Visibility +1
                } else if (i <= 44) {
                    newUser.visibilityMap[i] = 0; // Visibility 0
                } else {
                    newUser.visibilityMap[i] = -1; // Visibility -1
                }
            }
            await usersCollection.insertOne(newUser);
            console.log('User created:', newUser);
            const token = generateToken(username);
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({token}));
        } catch (err) {
            console.log('Error creating user:', err);
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('Internal server error');
        }
    });
}

async function login(req, res) {
    console.log('Login');
    parseJSON(req, async (err, { username, password }) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }
        console.log('Login called');
        console.log(username, password);

        try {
            const usersCollection = await createUserCollection();
            const user = await usersCollection.findOne({ username, password });
            if (user) {
                const token = generateToken(username);
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

async function updateGameState(req, res) {
    parseJSON(req, async (err, { gameState, visibilityMap  }) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }
        try {
            const usersCollection = await createUserCollection();
            if (gameState) {
                await usersCollection.updateOne({ username: "lucie" }, { $set: { gameState } });
                console.log('User gameState:', gameState);
            }
            if (visibilityMap) {
                await usersCollection.updateOne({ username: "lucie" }, { $set: { visibilityMap } });
                console.log('User visibilityMap:', visibilityMap);
            }
            console.log('User gameState updated successfully');
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Game state updated successfully');
        } catch (error) {
            console.error('Error updating game state:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal server error');
        }
    });
}


module.exports = { signup, login, updateGameState };
