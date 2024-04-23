const { MongoClient } = require('mongodb');
const { uri } = require('../../bdd.js');
const {ObjectId} = require("mongodb");

async function createUserCollection() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('myapp_db');
        const usersCollection = database.collection('users');
        return usersCollection;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

async function findUserIdByUsername(username) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('myapp_db');
        const usersCollection = database.collection('users');
        const user = await usersCollection.findOne({username: username});
        return user._id;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

async function findUsernameById(id) {
    if (!id) return null;
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('myapp_db');
        const usersCollection = database.collection('users');
        const user = await usersCollection.findOne({_id: new ObjectId(id)});
        return user.username? user.username : null;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

module.exports = {createUserCollection, findUserIdByUsername, findUsernameById};
