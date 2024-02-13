const { computeMove } = require("./logic/ai/ai.js")

class GameManager {
    gridMap = [];

    gameState = {
        players: [
            {
            position: null,
            id: null,
            walls: [],
            isCurrentPlayer
            }
        ]
    };

    constructor() {
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
    }

    // Methods to manage the game
    tryMove(){
        return computeMove(this.gameState);
    }

    getGameState() {
        return this.gameState;
    }

    getPlayerById(playerId) {
        const player = this.gameState.players.find(player => player.id === playerId);
        return player;
    }

    getBoardWalls() {
        let boardWalls = [];
        players.forEach(player => {
            walls.forEach(wall => {
                boardWalls.push(wall);
            })
        })
        return boardWalls;
    }

    getCurrentPlayer() {
        return this.gameState.players.find(player => player.isCurrentPlayer === true);
    }
}

module.exports = GameManager;
