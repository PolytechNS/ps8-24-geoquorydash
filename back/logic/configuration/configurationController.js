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

    let body = '';
    req.on('data', chunk => {
        if (!configurationManager.isConfigurationValid(chunk.toString())) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid configuration');
            return;
        }
        body += chunk.toString();
    });

    req.on('end', async () => {
        const configuration = JSON.parse(body);
        await saveConfigurationToDatabase(userId, configuration);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Configuration saved');
    });
}

module.exports = { retrieveConfiguration, saveConfiguration };