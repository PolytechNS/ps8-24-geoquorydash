let visibilityMap = [];
let oldPlayer1AdjacentsCells = [];
let oldPlayer2AdjacentsCells = [];
let playerCells = board.getElementsByClassName('player-cell');

// Function to initialize the visibility of the board
function initializeVisibility(board) {
    let playerCells = board.getElementsByClassName('player-cell');

    for (let i = 0; i < playerCells.length; i++) {
        visibilityMap[i] = [];
            if (i < 36) {
                visibilityMap[i] = 1; // Visibility +1
            } else if (i <= 44) {
                visibilityMap[i] = 0; // Visibility 0
            } else {
                visibilityMap[i] = -1; // Visibility -1
            }
    }

    let Player1Cell = board.getElementsByClassName('player1')[0].parentElement.id;
    let Player2Cell = board.getElementsByClassName('player2')[0].parentElement.id;
    oldPlayer1AdjacentsCells = getAdjacentPlayerCellsIndices(Player1Cell);
    oldPlayer2AdjacentsCells = getAdjacentPlayerCellsIndices(Player2Cell);
}

function getCurrentPlayerClass(player) {
    if (player.classList.contains('player1')) {
        return 'player1';
    } else if (player.classList.contains('player2')) {
        return 'player2';
    }

    // Default return if no player is identified
    return null;
}

function updateBoardVisibility(board) {
    // Get the player cells
    let Player1Cell = board.getElementsByClassName('player1')[0].parentElement.id;
    let Player2Cell = board.getElementsByClassName('player2')[0].parentElement.id;

    // Get the indices of the players cell
    let { i:iP1, j:jP1 } = getIndicesFromId(Player1Cell);
    let { i: iP2, j: jP2 } = getIndicesFromId(Player2Cell);

    // Get the indices of the adjacent cells
    let adjacentPlayer1Cells = getAdjacentPlayerCellsIndices(iP1, jP1);
    let adjacentPlayer2Cells = getAdjacentPlayerCellsIndices(iP2, jP2);

    // Update the visibility map based on the current adjacent cells
    for (let i = 0; i < adjacentPlayer1Cells.length; i++) {
        let index = adjacentPlayer1Cells[i];
        visibilityMap[index] += 1;
    }
    for (let i = 0; i < adjacentPlayer2Cells.length; i++) {
        let index = adjacentPlayer2Cells[i];
        visibilityMap[index] -= 1;
    }

    // Update the visibility map based on the old adjacent cells
    for (let i = 0; i < oldPlayer1AdjacentsCells.length; i++) {
        let index = oldPlayer1AdjacentsCells[i];
        visibilityMap[index] -= 1;
    }
    for (let i = 0; i < oldPlayer2AdjacentsCells.length; i++) {
        let index = oldPlayer2AdjacentsCells[i];
        visibilityMap[index] += 1;
    }

    // Update the old adjacent cells
    oldPlayer1AdjacentsCells = adjacentPlayer1Cells;
    oldPlayer2AdjacentsCells = adjacentPlayer2Cells;


    console.log(visibilityMap);
}

// Function to update the board display based on visibility
function updateBoardDisplay(board, player) {
    let currentPlayerClass = getCurrentPlayerClass(player);

    updateBoardVisibility(board);

    for (let i = 0; i < playerCells.length; i++) {
        if (currentPlayerClass === 'player1') {
            playerCells[i].style.opacity = visibilityMap[i] >= 0 ? 1 : 0.1;
            document.getElementById('player1').style.opacity = 1;
            document.getElementById('player1').parentElement.style.opacity = 1;
            let player2 = document.getElementById('player2');
            player2.style.opacity = player2.parentElement.style.opacity === '0.1' ? 0 : 1;
        } else {
            playerCells[i].style.opacity = visibilityMap[i] <= 0 ? 1 : 0.1;
            document.getElementById('player2').style.opacity = 1;
            document.getElementById('player2').parentElement.style.opacity = 1;
            let player1 = document.getElementById('player1');
            player1.style.opacity = player1.parentElement.style.opacity === '0.1' ? 0 : 1;
        }
    }
}

function getIndicesFromId(cellId) {
    // Split the id by '-' and extract the numeric parts
    let parts = cellId.split('-');
    let i = parseInt(parts[1], 10);
    let j = parseInt(parts[2], 10);

    return { i, j };
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
    if (j<15){
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

    console.log('i: ' + i + ' j: ' + j);
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

    if (currentPlayer === 'player1'){
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

    if (currentPlayer === 'player1'){
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


export { initializeVisibility, updateBoardDisplay, adjustVisibilityForWallsHorizontal, adjustVisibilityForWallsVertical };
