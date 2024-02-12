const authController = require('./authController');

function handleAuthRoutes(req, res) {
    // You might want to parse the URL and method more carefully in a production app
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === '/api/auth/signup' && req.method === 'POST') {
        authController.signup(req, res);
    } else if (url.pathname === '/api/auth/login' && req.method === 'POST') {
        authController.login(req, res);
    } else {
        // Not Found
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
}

module.exports = handleAuthRoutes;