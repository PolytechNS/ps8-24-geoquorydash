const { computeMoveForAI } = require("../ai/ai.js")

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
                    isCurrentPlayer: true // Au départ, le user courant est le joueur 2
                }
            ]
        };
        return this;
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
