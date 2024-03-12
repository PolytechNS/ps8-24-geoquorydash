const { parseJSON } = require('../../utils/utils.js');
const createUserCollection = require('../../models/users/users');

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
            res.end('Internal server error');
        }
    });
}

module.exports = {getPicture};
