const { computeMove } = require("./logic/ai/ai.js")

class GameManager {
    gridMap = [];

    gameState = {
        player: {
            position: null,
            id: null,
            walls: []
        }
    };

    constructor() {
        this.gridMap = new Array(17).fill(0).map(() => new Array(17).fill(0));
        this.gameState = {
            players: [
                {
                    id: "ia",
                    position: { x: 0, y: 8 },
                    walls: []
                },
                {
                    id: "p2",
                    position: { x: 16, y: 8 },
                    walls: []
                }
            ]
        };
    }

    // Methods to manage the game
    handleMove(){
        return computeMove(this.gameState);
    }
}

module.exports = GameManager;
