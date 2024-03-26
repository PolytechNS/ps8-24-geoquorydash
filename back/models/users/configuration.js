const { MongoClient, ObjectId} = require('mongodb');
const { uri } = require('../../bdd.js');
const { DatabaseConnectionError } = require('../../utils/errorTypes.js');

async function createDefaultConfiguration(userId){
    console.log('create with userId:', userId);
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('myapp_db');
        const configurationCollection = database.collection('configuration');
        const newConfiguration = {
            userId : new ObjectId(userId),
            textInGameInteraction: [
                "Bien joué !",
                "Tu es trop fort !",
                "Tu as vraiment du talent !",
                "Tu es un génie !",
                "Tu es incroyable !",
                "Tu es un champion !"
            ]
        };
        await configurationCollection.insertOne(newConfiguration);
        return newConfiguration;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new DatabaseConnectionError();
    }
}

async function retrieveTextInGameInteractionFromDatabase(userId){
    console.log('retrieve with userId:', userId);
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('myapp_db');
        const configurationCollection = database.collection('configuration');
        const configuration = await configurationCollection.findOne({ userId: new ObjectId(userId) });
        console.log('configuration:', configuration);
        return configuration.textInGameInteraction;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new DatabaseConnectionError();
    }
}

module.exports = { createDefaultConfiguration, retrieveTextInGameInteractionFromDatabase };