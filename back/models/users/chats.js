const { MongoClient } = require('mongodb');
const { uri } = require('../../bdd.js');

async function createChatCollection() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('myapp_db');
        const chatsCollection = database.collection('chats');
        return chatsCollection;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

module.exports = createChatCollection;
