const chatController = require('./chatController');

async function handleChatRoutes(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === '/api/chat/messages' && req.method === 'POST') {
        await chatController.getMessages(req, res);
    } else if (url.pathname === '/api/chat/send' && req.method === 'POST') {
        await chatController.sendMessage(req, res);
    } else if (url.pathname === '/api/chat/notifications' && req.method === 'POST') {
        await chatController.getNotifications(req, res);
    } else {
        // Not Found
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Not Found');
    }
}

module.exports = handleChatRoutes;