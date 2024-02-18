const { MongoClient } = require('mongodb');
const { uri } = require('../bdd.js');

async function createUserCollection() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log("Connected to MongoDB");

        const database = client.db('myapp_db');
        const usersCollection = database.collection('users');

        return usersCollection;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

module.exports = createUserCollection;
