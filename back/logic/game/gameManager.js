const { computeMoveForAI } = require("../ai/ai.js")
const { getGameState } = require("../authentification/authController.js")
const createUserCollection = require('../../models/users');

class GameManager {
    gridMap = [];

    gameState = {
        players: [
            {
            position: null,
            id: null,
            walls: [],
            isCurrentPlayer: false
            }
        ]
    };

    constructor() {
        console.log('GameManager constructor');
        this.gridMap = new Array(17).fill(0).map(() => new Array(17).fill(0));
        return this;
    }

    async initializeGameStateFromDB() {
        try {
            const usersCollection = await createUserCollection();
            const userGameState = await usersCollection.findOne({ username: "lucie" });
            if (userGameState && userGameState.gameState) {
                console.log('GameState:', userGameState.gameState);
                return userGameState.gameState;
            } else {
                console.error('Les données de l\'état du jeu sont manquantes ou incorrectes.');
            }
        } catch (error) {
            console.error('Erreur lors de l\'utilisation de getGameState:', error);
            throw error;
        }
    }

    async initialize() {
        const userGameState = await this.initializeGameStateFromDB();
        this.gameState = userGameState;
    }

    // Methods to manage the game
    computeMoveForAI(getPossibleMove){
        return computeMoveForAI(this.gameState, getPossibleMove);
    }


    validateMove(move) {
        let pos;
        for (let player of this.gameState.players) {
            if (player.id === 'ia') {
                pos = player.position;
                break;
            }
        }

        pos.x=move.x;
        pos.y=move.y;
    }

    getGameState() {
        return this.gameState;
    }

    getPlayerById(playerId) {
        return this.gameState.players.find(player => player.id === playerId);
    }

    getBoardWalls() {
        let boardWalls = [];
        this.gameState.players.forEach(player => {
            player.walls.forEach(wall => {
                wall.forEach(cell => {
                    boardWalls.push(cell);
                });
            });
        });
        return boardWalls;
    }

    getCurrentPlayer() {
        return this.gameState.players.find(player => player.isCurrentPlayer === true);
    }
}

const gameManagerInstance = new GameManager();
module.exports = gameManagerInstance;
