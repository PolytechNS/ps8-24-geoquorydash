const friendsController = require('./friendsController');

async function handleFriendsRoutes(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === '/api/friends/search' && req.method === 'POST') {
        await friendsController.searchUsers(req, res);
    } else if (url.pathname === '/api/friends/add' && req.method === 'POST') {
        await friendsController.addFriend(req, res);
    } else if (url.pathname === '/api/friends/cancel' && req.method === 'POST') {
        await friendsController.cancelFriend(req, res);
    } else if (url.pathname === '/api/friends/requests' && req.method === 'POST') {
        await friendsController.getRequests(req, res);
    } else if (url.pathname === '/api/friends/accept' && req.method === 'POST') {
        await friendsController.acceptFriend(req, res);
    } else if (url.pathname === '/api/friends/denied' && req.method === 'POST') {
        await friendsController.deniedFriend(req, res);
    } else if (url.pathname === '/api/friends/friends' && req.method === 'POST') {
        await friendsController.getFriends(req, res);
    } else if (url.pathname === '/api/friends/remove' && req.method === 'POST') {
        await friendsController.removeFriend(req, res);
    } else {
        // Not Found
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Not Found');
    }
}

module.exports = handleFriendsRoutes;