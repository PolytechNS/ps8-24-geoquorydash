const { MongoClient } = require('mongodb');
const uri = "mongodb://mongo:27017/myapp_db";
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log("Connecté à MongoDB");
    } catch (err) {
        console.error("Erreur lors de la connexion à MongoDB:", err);
    } finally {
        await client.close();
    }
}

module.exports = { run, uri };