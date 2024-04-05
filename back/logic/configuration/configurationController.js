const {retrieveConfigurationFromDatabase, saveConfigurationToDatabase} = require("../../models/users/configuration");
const {verifyAndValidateUserID} = require("../authentification/authController");
const {InvalidTokenError} = require("../../utils/errorTypes");
const configurationManager = require("../../logic/configuration/configurationManager");

async function retrieveConfiguration(req, res) {
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    const userId = verifyAndValidateUserID(token);
    if (!userId) {
        console.error("Invalid token");
        throw new InvalidTokenError("Invalid token");
    }

    try {
        const personalConfiguration = await retrieveConfigurationFromDatabase(userId);
        const genericConfiguration = configurationManager.allTextInteraction;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ genericConfiguration, personalConfiguration}));
    } catch (error) {
        console.error("Error retrieving game history:", error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

async function saveConfiguration(req, res) {
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    const userId = verifyAndValidateUserID(token);
    if (!userId) {
        console.error("Invalid token");
        throw new InvalidTokenError("Invalid token");
    }

    let dataChunks = [];

    req.on('data', chunk => {
        dataChunks.push(chunk);
    }).on('end', async () => {
        const bodyString = Buffer.concat(dataChunks).toString();
        const configuration = JSON.parse(bodyString);

        if (!configurationManager.isConfigurationValid(configuration.textInGameInteraction)) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid configuration');
            return;
        }

        await saveConfigurationToDatabase(userId, configuration.textInGameInteraction);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Configuration saved');
    });
}

module.exports = { retrieveConfiguration, saveConfiguration };