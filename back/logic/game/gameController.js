const {retrieveGamesFromDatabaseForAUser} = require("../../models/game/gameDataBaseManager");
async function retrieveGameHistory(req, res) {
    console.log('Retrieve game history');
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    console.log('Token dans retrieveGameHistory:', token);
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