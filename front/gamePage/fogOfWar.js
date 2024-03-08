import {askPossibleMove, handleCellAction, lockBarrier} from "./game.js";

function hideOldPossibleMoves() {
    let playerCells = document.getElementsByClassName('player-cell');
    for (let i = 0; i < playerCells.length; i++) {
        playerCells[i].style.backgroundColor = '';
    }
}

function updateBoardDisplay(gameState, visibilityMap) {
    let playerCells = document.getElementsByClassName('player-cell');
    let currentPlayer = gameState.players.find(player => player.isCurrentPlayer === true);
    let currentPlayerPosition = currentPlayer.position;

    for (let i = 0; i < playerCells.length; i++) {
        playerCells[i].style.opacity = visibilityMap[i] <= 0 ? 1 : 0.1;
    }

    hideOldPossibleMoves(currentPlayer);

    let currentPlayerCell = document.getElementById(`cell-${currentPlayerPosition.x}-${currentPlayerPosition.y}`);
    currentPlayerCell.appendChild(document.getElementById('player2'));
    currentPlayerCell.firstElementChild.style.opacity = 1;
    currentPlayerCell.style.opacity = 1;

    let otherPlayerPosition = gameState.players.find(player => player.id !== currentPlayer.id).position;
    let otherPlayerCell = document.getElementById(`cell-${otherPlayerPosition.x}-${otherPlayerPosition.y}`);
    var otherPlayer = document.getElementById('BotPlayer');
    otherPlayerCell.appendChild(otherPlayer);
    otherPlayerCell.style.opacity === '1' ? otherPlayer.style.opacity = '1' : otherPlayer.style.opacity = '0';

    displayWalls(gameState);

    askPossibleMove();
}

function displayWalls(gameState) {
    gameState.players.forEach(player => {
        player.walls.forEach(wall => {
            let cell = document.getElementById(`cell-${wall[0].x}-${wall[0].y}`);
            handleCellAction(cell, wall[0].x, wall[0].y, 'displayBarrier');
            lockBarrier(wall);
        });
    })
}

function getAdjacentPlayerCellsIndices(i, j) {
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

function getAdjacentBarrierCellsIndicesHorizontal(i,j) {
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

function getAdjacentBarrierCellsIndicesVertical(i,j) {
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

function adjustVisibilityForWallsHorizontal(barrierCellId, currentPlayer) {
    let { i, j } = getIndicesFromId(barrierCellId);
    let adjacentBarrierCells = getAdjacentBarrierCellsIndicesHorizontal(i, j);

    if (currentPlayer === 'BotPlayer'){
        let visibilityToAdd = 2;
        for (let i = 0; i < adjacentBarrierCells.length; i++){
            for (let j = 0; j < adjacentBarrierCells[i].length; j++){
                visibilityMap[adjacentBarrierCells[i][j]] += visibilityToAdd;
            }
            visibilityToAdd -= 1;
        }
    } else {
        let visibilityToAdd = -2;
        for (let i = 0; i < adjacentBarrierCells.length; i++){
            for (let j = 0; j < adjacentBarrierCells[i].length; j++){
                visibilityMap[adjacentBarrierCells[i][j]] += visibilityToAdd;
            }
            visibilityToAdd += 1;
        }
    }
}

function adjustVisibilityForWallsVertical(barrierCellId, currentPlayer) {
    let { i, j } = getIndicesFromId(barrierCellId);
    let adjacentBarrierCells = getAdjacentBarrierCellsIndicesVertical(i, j);

    if (currentPlayer === 'BotPlayer'){
        let visibilityToAdd = 2;
        for (let i = 0; i < adjacentBarrierCells.length; i++){
            for (let j = 0; j < adjacentBarrierCells[i].length; j++){
                visibilityMap[adjacentBarrierCells[i][j]] += visibilityToAdd;
            }
            visibilityToAdd -= 1;
        }
    } else {
        let visibilityToAdd = -2;
        for (let i = 0; i < adjacentBarrierCells.length; i++){
            for (let j = 0; j < adjacentBarrierCells[i].length; j++){
                visibilityMap[adjacentBarrierCells[i][j]] += visibilityToAdd;
            }
            visibilityToAdd += 1;
        }
    }
}

export {  updateBoardDisplay, adjustVisibilityForWallsHorizontal, adjustVisibilityForWallsVertical };
