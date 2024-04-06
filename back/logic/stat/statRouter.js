const { associateStatToNewUser, retrieveStat } = require('./statController');

async function handleStatRoutes(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === '/api/stat/associatestat' && req.method === 'POST') {
        await associateStatToNewUser(req, res);
    } else if (url.pathname === '/api/stat/getstat' && req.method === 'GET') {
        await retrieveStat(req, res);
    } else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Not Found');
    }
}

module.exports = handleStatRoutes;