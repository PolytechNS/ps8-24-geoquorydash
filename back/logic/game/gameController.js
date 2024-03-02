const {retrieveGamesFromDatabaseForAUser} = require("../../models/game/gameDataBaseManager");
async function retrieveGameHistory(req, res) {
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    try {
        const gameStates = await retrieveGamesFromDatabaseForAUser(token);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ gameStates }));
    } catch (error) {
        console.error("Error retrieving game history:", error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

module.exports = { retrieveGameHistory };