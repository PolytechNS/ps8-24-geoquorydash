const { retrieveGameHistory } = require('./gameController');

async function handleGameRoutes(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === '/api/game/history' && req.method === 'GET') {
        console.log('gameRouter: retrieveGameHistory');
        await retrieveGameHistory(req, res);
    } else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Not Found');
    }
}

module.exports = handleGameRoutes;