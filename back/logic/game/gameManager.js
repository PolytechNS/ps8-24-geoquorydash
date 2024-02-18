let computeMove = null;

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

        // Initialisation des murs pour chaque joueur
        this.gameState.players.forEach(player => {
            player.walls = [];
        });
    }

    // Methods to manage the game
    tryMove() {
        if (!computeMove)
            computeMove = require("../ai/ai.js").computeMove;

        return computeMove(this.gameState);
    }


    validateMove(move) {
        let pos;
        for (let player of this.gameState.players) {
            if (player.id === 'ia') {
                pos = player.position;
                break;
            }
        }

        pos.x = move.x;
        pos.y = move.y;
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
        this.gameState.players.forEach(player => {
            this.gameState.walls.forEach(wall => {
                boardWalls.push(wall);
            })
        })
        return boardWalls;
    }

    getCurrentPlayer() {
        return this.gameState.players.find(player => player.isCurrentPlayer === true);
    }
}

console.log("oue")

module.exports = GameManager;
