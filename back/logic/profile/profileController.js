const { parseJSON } = require('../../utils/utils.js');
const {createUserCollection} = require('../../models/users/users');

async function getPicture(req, res) {
    parseJSON(req, async (err, { username }) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }

        try {
            const usersCollection = await createUserCollection();
            const user = await usersCollection.findOne({ username });
            if (user) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ profilePicture: user.profilePicture }));
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            }
        } catch (error) {
            console.error('Error during login:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    });
}

async function setPicture(req, res) {
    parseJSON(req, async (err, { username, profilePicture }) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }

        try {
            const usersCollection = await createUserCollection();
            const user = await usersCollection.findOne({ username });
            if (user) {
                await usersCollection.updateOne({ username }, { $set: { profilePicture } });
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(JSON.stringify({ profilePicture: user.profilePicture }));
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end(JSON.stringify({ error: 'Not Found' }));
            }
        } catch (error) {
            console.error('Error during login:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    });
}

async function getButton(req, res) {
    parseJSON(req, async (err, { username, currentUser }) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }

        try {
            const usersCollection = await createUserCollection();
            const user = await usersCollection.findOne({ username });
            if (user) {
                let buttonType = "add";

                if (user.friends.includes(currentUser)) {
                    buttonType = "friends";
                } else if (user.friendRequests.includes(currentUser)) {
                    buttonType = "pending";
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ button: buttonType }));
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end(JSON.stringify({ error: 'Not Found' }));
            }
        } catch (error) {
            console.error('Error during login:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    });
}


module.exports = { getPicture, setPicture, getButton };
