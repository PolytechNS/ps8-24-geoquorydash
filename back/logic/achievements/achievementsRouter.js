const { associateAchievementsToNewUser, updateFriendsAchievements, retrieveAchievements } = require('./achievementsController.js');

async function handleAchievementsRoutes(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === '/api/achievements/associateachievements' && req.method === 'POST') {
        // console.log('Do nothing');
        await associateAchievementsToNewUser(req, res);
    } else if (url.pathname === '/api/achievements/updatefriendsachievements' && req.method === 'POST') {
        console.log("On a bien reçu la requête de mise à jour des achievements des amis");
        await updateFriendsAchievements(req, res);
    } else if (url.pathname === '/api/achievements/getachievements' && req.method === 'GET') {
        await retrieveAchievements(req, res);
    } else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Not Found');
    }
}

module.exports = handleAchievementsRoutes;