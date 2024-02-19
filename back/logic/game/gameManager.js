const { computeMoveForAI } = require("../ai/ai.js")
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
                console.log('GameState initialized from DB:');
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
        if (userGameState) {
            this.gameState = userGameState;
            console.log('GameState DB');
        } else {
            this.gameState = {
                players: [
                    {
                        id: "ia",
                        position: { x: 0, y: 8 },
                        walls: [],
                        isCurrentPlayer: false
                    },
                    {
                        id: "p2",
                        position: { x: 16, y: 8 },
                        walls: [],
                        isCurrentPlayer: true
                    }
                ]
            };
            console.log('GameState default');
        }
    }

    async endGame(){
        this.gameState = {
            players: [
                {
                    id: "ia",
                    position: { x: 0, y: 8 },
                    walls: [],
                    isCurrentPlayer: false
                },
                {
                    id: "p2",
                    position: { x: 16, y: 8 },
                    walls: [],
                    isCurrentPlayer: true
                }
            ]
        };
        fetch('/api/auth/updateGameState', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ gameState: this.gameState })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update gameState');
                }
                return response.json();
            })
            .then(data => {
                console.log('Game state updated successfully:', data);
            })
            .catch(error => {
                console.error('Error updating gameState:', error);
            });
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
