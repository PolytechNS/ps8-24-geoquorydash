const { MongoClient } = require('mongodb');
const uri = 'mongodb://mongo:27017/myapp_db';
const client = new MongoClient(uri);

async function addUser(userData) {
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const database = client.db('myapp_db');
        const usersCollection = database.collection('users');
        const insertResult = await usersCollection.insertOne(userData);

        console.log('User added successfully', insertResult);
    } catch (error) {
        console.error('Error adding user:', error);
    } finally {
        await client.close();
    }
}

async function getUserByUsername(username) {
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const database = client.db('myapp_db');
        const usersCollection = database.collection('users');
        const user = await usersCollection.findOne({ username });

        return user;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    } finally {
        await client.close();
    }
}

module.exports = { addUser, getUserByUsername };
