const { MongoClient } = require('mongodb');
const uri = "mongodb://mongo:27017/myapp_db";    // Lors de la connexion du back à mongo, cette db n'existe pas encore mais elle sera créée lors de l'insertion du premier élément
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log("Connecté à MongoDB");
        // Opérations sur la base de données
    } catch (err) {
        // Gère les erreurs de connexion
        console.error("Erreur lors de la connexion à MongoDB:", err);
    } finally {
        await client.close();
    }
}

module.exports = { run, uri };