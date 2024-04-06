const profileController = require('./profileController');

async function handleProfileRoutes(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === '/api/profile/picture' && req.method === 'POST') {
        await profileController.getPicture(req, res);
    } else if (url.pathname === '/api/profile/button' && req.method === 'POST') {
        await profileController.getButton(req, res);
    } else {
        // Not Found
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Not Found');
    }
}

module.exports = handleProfileRoutes;