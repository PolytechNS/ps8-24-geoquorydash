const { ObjectId, MongoClient} = require('mongodb');
const {uri} = require("../../bdd");
const {DatabaseConnectionError} = require("../../utils/errorTypes");

async function createPlayerInDatabase(database, gameStateId, gameStateForPlayer, userId) {
    const playerCollection = database.collection('players');
    const newPlayer = {
        gameStateId : gameStateId,
        position : gameStateForPlayer.position,
        walls : gameStateForPlayer.walls,
        isCurrentPlayer : gameStateForPlayer.isCurrentPlayer,
    };
    newPlayer.userId = userId ? new ObjectId(userId) : 'ai';
    const result = await playerCollection.insertOne(newPlayer);
    return result;
}

async function changeUserPlayerPositionInDatabase(database, gameStateId, targetPosition, userID) {
    const { playerCollection, query } = preparePlayerQueryAndCollection(database, gameStateId, userID);
    const result = await playerCollection.updateOne(query, { $set: { position: targetPosition } });
    return result;
}

async function changeAIPlayerPositionInDatabase(database, gameStateId, targetPosition) {
    const { playerCollection, query } = preparePlayerQueryAndCollection(database, gameStateId);
    const result = await playerCollection.updateOne(query, { $set: { position: targetPosition } })
    return result;
}

async function addWallToUserPlayerInDatabase(database, gameStateId, wall, userID) {
    const { playerCollection, query } = preparePlayerQueryAndCollection(database, gameStateId, userID);
    const result = await playerCollection.updateOne(query, { $push: { walls: wall } });
    return result;
}

async function addWallToAIPlayerInDatabase(database, gameStateId, wall) {
    const { playerCollection, query } = preparePlayerQueryAndCollection(database, gameStateId);
    const result = await playerCollection.updateOne(query, { $push: { walls: wall } });
    return result;

}

function preparePlayerQueryAndCollection(database, gameStateId, userId) {
    const playerCollection = database.collection('players');
    const query = {
        gameStateId: new ObjectId(gameStateId),
        userId: userId ? new ObjectId(userId) : 'ai'
    };
    return { playerCollection, query };
}

async function retrieveAllGamesIDWithUserID(database, userId){
    const playerCollection = database.collection('players');
    try {
        // Assurez-vous de convertir userId en ObjectId si nécessaire
        const userIdObj = new ObjectId(userId);

        const pipeline = [
            {
                $match: { userId: userIdObj }
            },
            {
                $group: {
                    _id: null, // Groupe tous les documents correspondants ensemble
                    gameStates: { $addToSet: "$gameStateId" } // Collecte les gameStateId uniques
                }
            }
        ];

        const result = await playerCollection.aggregate(pipeline).toArray();

        if (result.length > 0) {
            return result[0].gameStates;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error retrieving game IDs:", error);
        throw error; // Relance l'erreur pour la gestion d'erreur externe
    }
}

async function retrievePlayersWithGamestateIDFromDatabase(gameStateObjectId, gameState) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db('myapp_db');
        const playerCollection = database.collection('players');
        const result = await playerCollection.find({gameStateId: gameStateObjectId}).toArray();
        const players = [];
        if (result.length > 0) {
            result.forEach(player => {
                const playerData = {
                    position: player.position,
                    id: player.userId.toString() === 'ai' ? 'player1' : 'player2', // Si l'ID est 'ai', le joueur est l'IA, sinon c'est 'p2
                    walls: player.walls,
                    isCurrentPlayer: player.isCurrentPlayer
                };
                players.push(playerData);
            });
        }
        if (gameState) gameState.players = players;
        return result;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new DatabaseConnectionError("Error connecting to MongoDB");
    }
}

module.exports = { createPlayerInDatabase, retrieveAllGamesIDWithUserID, retrievePlayersWithGamestateIDFromDatabase, changeUserPlayerPositionInDatabase, changeAIPlayerPositionInDatabase, addWallToUserPlayerInDatabase, addWallToAIPlayerInDatabase};