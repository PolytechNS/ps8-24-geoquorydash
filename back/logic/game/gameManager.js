const { computeMove } = require("../ai/ai.js")

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

    tryMove(){
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

        pos.x=move.x;
        pos.y=move.y;
    }
}

module.exports = GameManager;
