const { retrieveConfiguration, saveConfiguration } = require('./configurationController');

async function handleConfigurationRoutes(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === '/api/configuration/textInteraction' && req.method === 'GET') {
        await retrieveConfiguration(req, res);
    } else if (url.pathname === '/api/configuration/textInteraction' && req.method === 'POST') {
        await saveConfiguration(req, res);
    } else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Not Found');
    }
}

module.exports = handleConfigurationRoutes;