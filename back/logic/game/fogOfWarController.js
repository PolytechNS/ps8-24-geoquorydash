const {gameState} = require("./gameManager");

class FogOfWar{
    visibilityMap = [];
    oldPlayer1AdjacentsCells = [];
    oldPlayer2AdjacentsCells = [];

    constructor() {
        for (let i = 0; i < (9*9); i++) {
            this.visibilityMap[i] = [];
            if (i < 36) {
                this.visibilityMap[i] = 1; // Visibility +1
            } else if (i <= 44) {
                this.visibilityMap[i] = 0; // Visibility 0
            } else {
                this.visibilityMap[i] = -1; // Visibility -1
            }
        }
    }

    updateBoardVisibility() {
        // Get the indices of the players cell
        let { i:iP1, j:jP1 } = gameState.players[0].position;
        let { i: iP2, j: jP2 } = gameState.players[1].position;

        // Get the indices of the adjacent cells
        let adjacentPlayer1Cells = this.getAdjacentPlayerCellsIndices(iP1, jP1);
        let adjacentPlayer2Cells = this.getAdjacentPlayerCellsIndices(iP2, jP2);

        // Update the visibility map based on the current adjacent cells
        for (let i = 0; i < adjacentPlayer1Cells.length; i++) {
            let index = adjacentPlayer1Cells[i];
            this.visibilityMap[index] += 1;
        }
        for (let i = 0; i < adjacentPlayer2Cells.length; i++) {
            let index = adjacentPlayer2Cells[i];
            this.visibilityMap[index] -= 1;
        }

        // Update the visibility map based on the old adjacent cells
        for (let i = 0; i < this.oldPlayer1AdjacentsCells.length; i++) {
            let index = this.oldPlayer1AdjacentsCells[i];
            this.visibilityMap[index] -= 1;
        }

        for (let i = 0; i < this.oldPlayer2AdjacentsCells.length; i++) {
            let index = this.oldPlayer2AdjacentsCells[i];
            this.visibilityMap[index] += 1;
        }

        // Update the old adjacent cells
        this.oldPlayer1AdjacentsCells = adjacentPlayer1Cells;
        this.oldPlayer2AdjacentsCells = adjacentPlayer2Cells;

    }

    getAdjacentPlayerCellsIndices(i, j) {
        let adjacentIndices = [];

        let playerCellRow = i / 2;
        let playerCellCol = j / 2;
        let baseIndex = playerCellRow * 9 + playerCellCol; // Convert 2D position to 1D

        // Check player cell itself
        adjacentIndices.push(baseIndex);

        // Check left player cell
        if (j > 1) {
            adjacentIndices.push(baseIndex - 1);
        }

        // Check right player cell
        if (j < 15) {
            adjacentIndices.push(baseIndex + 1);
        }

        // Check top player cell
        if (i > 1) {
            adjacentIndices.push(baseIndex - 9);
        }

        // Check bottom player cell
        if (i < 15) {
            adjacentIndices.push(baseIndex + 9);
        }

        return adjacentIndices;
    }

    getAdjacentBarrierCellsIndicesHorizontal(i,j) {
        let nearAdjacentIndices = [];
        let farAdjacentIndices = [];
        let barrierCellRow = (i-1)/2;
        let barrierCellCol = j/2;
        let baseIndex = barrierCellRow * 9 + barrierCellCol;

        nearAdjacentIndices.push(baseIndex);
        nearAdjacentIndices.push(baseIndex + 1);
        nearAdjacentIndices.push(baseIndex + 9);
        nearAdjacentIndices.push(baseIndex + 10);

        if (j>1){
            farAdjacentIndices.push(baseIndex - 1);
            farAdjacentIndices.push(baseIndex + 8);
        }
        if (j<14){
            farAdjacentIndices.push(baseIndex + 2);
            farAdjacentIndices.push(baseIndex + 11);
        }
        if (i>1){
            farAdjacentIndices.push(baseIndex - 9);
            farAdjacentIndices.push(baseIndex - 8);
        }
        if (i<15){
            farAdjacentIndices.push(baseIndex + 18);
            farAdjacentIndices.push(baseIndex + 19);
        }

        let adjacentIndices = [];
        adjacentIndices.push(nearAdjacentIndices);
        adjacentIndices.push(farAdjacentIndices)
        return adjacentIndices;
    }

    getAdjacentBarrierCellsIndicesVertical(i,j) {
        let nearAdjacentIndices = [];
        let farAdjacentIndices = [];
        let barrierCellRow = i/2;
        let barrierCellCol = (j-1)/2;
        let baseIndex = barrierCellRow * 9 + barrierCellCol;

        nearAdjacentIndices.push(baseIndex);
        nearAdjacentIndices.push(baseIndex + 1);
        nearAdjacentIndices.push(baseIndex + 9);
        nearAdjacentIndices.push(baseIndex + 10);

        if (j>1){
            farAdjacentIndices.push(baseIndex - 1);
            farAdjacentIndices.push(baseIndex + 8);
        }
        if (j<15){
            farAdjacentIndices.push(baseIndex + 2);
            farAdjacentIndices.push(baseIndex + 11);
        }
        if (i>1){
            farAdjacentIndices.push(baseIndex - 9);
            farAdjacentIndices.push(baseIndex - 8);
        }
        if (i<14){
            farAdjacentIndices.push(baseIndex + 18);
            farAdjacentIndices.push(baseIndex + 19);
        }

        let adjacentIndices = [];
        adjacentIndices.push(nearAdjacentIndices);
        adjacentIndices.push(farAdjacentIndices)
        return adjacentIndices;
    }

    adjustVisibilityForWalls(player, getAdjacentBarrierCellsIndices) {
        let { i, j } = player.walls[player.walls.length - 1];
        let adjacentBarrierCells = getAdjacentBarrierCellsIndices(i, j);

        let visibilityToAdd = player.id === 'ia' ? 2 : -2;

        adjacentBarrierCells.forEach((cellGroup) => {
            cellGroup.forEach(cellIndex => {
                this.visibilityMap[cellIndex] += visibilityToAdd;
            });
            // Ajustez visibilityToAdd en fonction du type de joueur
            visibilityToAdd += player.id === 'ia' ? -1 : 1;
        });
    }

    adjustVisibilityForWallsHorizontal(player) {
        this.adjustVisibilityForWalls(player, this.getAdjacentBarrierCellsIndicesHorizontal);
    }

    adjustVisibilityForWallsVertical(player) {
        this.adjustVisibilityForWalls(player, this.getAdjacentBarrierCellsIndicesVertical);
    }


}

module.exports = FogOfWar;