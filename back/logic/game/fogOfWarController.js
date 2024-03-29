const gameManager = require('./gameManager');
const { retrieveVisibilityMapFromDatabase } = require('../../models/game/gameDataBaseManager');

class FogOfWar{
    visibilityMapObjectList = {};
    // oldPlayer1AdjacentsCells = [];
    // oldPlayer2AdjacentsCells = [];

    constructor() {}

    initializeDefaultFogOfWar(gameStateID) {
        let visibilityMap = [];
        for (let i = 0; i < (9*9); i++) {
            if (i < 36) {
                visibilityMap[i] = 1; // Visibility +1
            } else if (i <= 44) {
                visibilityMap[i] = 0; // Visibility 0
            } else {
                visibilityMap[i] = -1; // Visibility -1
            }
        }
        let oldPlayer1AdjacentsCells = [];
        let oldPlayer2AdjacentsCells = [];

        this.visibilityMapObjectList[gameStateID] = {
            visibilityMap: visibilityMap,
            oldPlayer1AdjacentsCells: oldPlayer1AdjacentsCells,
            oldPlayer2AdjacentsCells: oldPlayer2AdjacentsCells
        };
    }

    async resumeVisibilityMap(gameStateID) {
        try {
            const visibilityMap = await retrieveVisibilityMapFromDatabase(gameStateID);
            if (visibilityMap) {
                this.visibilityMapObjectList[gameStateID].visibilityMap = visibilityMap;
                return visibilityMap;
            }
            return null;
        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
            return null;
        }
    }

    updateBoardVisibility(id) {
        // Get the indices of the players cell
        let gameState = gameManager.gameStateList[id];
        let {i: iP1, j: jP1} = {i: gameState.players[0].position.x, j: gameState.players[0].position.y}
        let {i: iP2, j: jP2} = {i: gameState.players[1].position.x, j: gameState.players[1].position.y}

        // Get the indices of the adjacent cells
        let adjacentPlayer1Cells = this.getAdjacentPlayerCellsIndices(iP1, jP1);
        let adjacentPlayer2Cells = this.getAdjacentPlayerCellsIndices(iP2, jP2);

        let visibilityMapObject = this.visibilityMapObjectList[id];
        // Update the visibility map based on the current adjacent cells
        for (let i = 0; i < adjacentPlayer1Cells.length; i++) {
            let index = adjacentPlayer1Cells[i];
            visibilityMapObject.visibilityMap[index] += 1;
        }
        for (let i = 0; i < adjacentPlayer2Cells.length; i++) {
            let index = adjacentPlayer2Cells[i];
            visibilityMapObject.visibilityMap[index] -= 1;
        }

        // Update the visibility map based on the old adjacent cells
        for (let i = 0; i < visibilityMapObject.oldPlayer1AdjacentsCells.length; i++) {
            let index = visibilityMapObject.oldPlayer1AdjacentsCells[i];
            visibilityMapObject.visibilityMap[index] -= 1;
        }

        for (let i = 0; i < visibilityMapObject.oldPlayer2AdjacentsCells.length; i++) {
            let index = visibilityMapObject.oldPlayer2AdjacentsCells[i];
            visibilityMapObject.visibilityMap[index] += 1;
        }

        // Update the old adjacent cells
        visibilityMapObject.oldPlayer1AdjacentsCells = adjacentPlayer1Cells;
        visibilityMapObject.oldPlayer2AdjacentsCells = adjacentPlayer2Cells;

        // this.displayVisibilityMap(id);
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

    adjustVisibilityForWalls(wall, isVertical, gameStateID) {
        let { x, y } = wall[0];
        let adjacentBarrierCells = (isVertical) ? this.getAdjacentBarrierCellsIndicesVertical(x, y) : this.getAdjacentBarrierCellsIndicesHorizontal(x, y);
        let playersStartingTop = ['ia', 'player1'];
        let visibilityToAdd = playersStartingTop.includes(gameManager.getCurrentPlayer(gameStateID).id) ? 2 : -2;
        let visibilityMap = this.visibilityMapObjectList[gameStateID].visibilityMap;
        adjacentBarrierCells.forEach((cellGroup) => {
            cellGroup.forEach(cellIndex => {
                visibilityMap[cellIndex] += visibilityToAdd;
            });
            visibilityToAdd += playersStartingTop.includes(gameManager.getCurrentPlayer(gameStateID).id) ? -1 : 1;
        });
        // this.displayVisibilityMap();
    }

    displayVisibilityMap(id) {
        console.log('');
        for (let i = 0; i < 9; i++) {
            let row = '';
            for (let j = 0; j < 9; j++) {
                if(this.visibilityMapObjectList[id].visibilityMap[i * 9 + j] >= 0) {
                    row += ' ' + this.visibilityMapObjectList[id].visibilityMap[i * 9 + j] + ' ';
                } else {
                    row += this.visibilityMapObjectList[id].visibilityMap[i * 9 + j] + ' ';
                }
            }
             console.log(row);
        }
    }

    invertedVisibilityMap(visibilityMap) {
        return visibilityMap.map((visibility) => visibility * -1);
    }

}

const fogOfWarInstance = new FogOfWar();
module.exports = fogOfWarInstance;