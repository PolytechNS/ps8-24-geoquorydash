const friendsController = require('./friendsController');

async function handleFriendsRoutes(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === '/api/friends/search' && req.method === 'POST') {
        await friendsController.searchUsers(req, res);
    } else if (url.pathname === '/api/friends/add' && req.method === 'POST') {
        await friendsController.addFriend(req, res);
    } else {
        // Not Found
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Not Found');
    }
}

module.exports = handleFriendsRoutes;