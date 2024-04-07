import {
    askPossibleMove,
    lockBarrier,
    activateBarrierCellListeners,
    deactivateBarrierCellListeners,
    updatePlayerBarrierCounts,
    getPlayerElementById
} from "./game.js";
function hideOldPossibleMoves() {
    let playerCells = document.getElementsByClassName('player-cell');
    for (let i = 0; i < playerCells.length; i++) {
        playerCells[i].classList.remove('blinking');
    }
}

function updateBoardDisplay(gameState, visibilityMap, player) {
    if (player) {
        updateBoardDisplayOnlineGame(gameState, visibilityMap, player);
    } else {
        updateBoardDisplayLocalGame(gameState, visibilityMap);
    }
    updatePlayerBarrierCounts();
}

function getIndicesFromId(barrierCellId) {
    let i = parseInt(barrierCellId.split('-')[1]);
    let j = parseInt(barrierCellId.split('-')[2]);
    return { i, j };
}

function updateBoardDisplayOnlineGame(gameState, visibilityMap, player) {
    let playerCells = document.getElementsByClassName('player-cell');

    for (let i = 0; i < playerCells.length; i++) {
        playerCells[i].style.opacity = visibilityMap[i] <= 0 ? 1 : 0.1;
    }

    hideOldPossibleMoves(player);

    let playerCell = document.getElementById(`cell-${player.position.x}-${player.position.y}`);
    console.log(getPlayerElementById(player.id));
    playerCell.appendChild(getPlayerElementById(player.id));
    playerCell.firstElementChild.style.opacity = 1;
    playerCell.style.opacity = 1;

    let otherPlayer = gameState.players.find(otherPlayer => otherPlayer.id !== player.id);
    let otherPlayerCell = document.getElementById(`cell-${otherPlayer.position.x}-${otherPlayer.position.y}`);
    console.log(getPlayerElementById(otherPlayer.id));
    var otherPlayerInBoard = getPlayerElementById(otherPlayer.id);
    if (otherPlayerCell.style.opacity === '1'){
        otherPlayerCell.appendChild(otherPlayerInBoard);
        otherPlayerInBoard.style.opacity = '1';
    } else {
        otherPlayerInBoard.remove();
    }
    displayWalls(gameState);

    const barrierCells = document.getElementsByClassName('barrier-cell');
    if (player.isCurrentPlayer) {
        Array.from(barrierCells).forEach(barrierCell => {
            let barrierCellId = barrierCell.id;
            let { i, j } = getIndicesFromId(barrierCellId);
            activateBarrierCellListeners(barrierCell, i, j, player.id);
        });
        askPossibleMove();
    } else {
        Array.from(barrierCells).forEach(barrierCell => {
            deactivateBarrierCellListeners(barrierCell);
        });
    }

}

function updateBoardDisplayLocalGame(gameState, visibilityMap) {
    let playerCells = document.getElementsByClassName('player-cell');
    let currentPlayer = gameState.players.find(player => player.isCurrentPlayer === true);
    let currentPlayerPosition = currentPlayer.position;

    for (let i = 0; i < playerCells.length; i++) {
        playerCells[i].style.opacity = visibilityMap[i] <= 0 ? 1 : 0.1;
    }

    hideOldPossibleMoves(currentPlayer);

    let currentPlayerCell = document.getElementById(`cell-${currentPlayerPosition.x}-${currentPlayerPosition.y}`);
    currentPlayerCell.appendChild(getPlayerElementById('player2'));
    currentPlayerCell.firstElementChild.style.opacity = 1;
    currentPlayerCell.style.opacity = 1;

    let otherPlayerPosition = gameState.players.find(player => player.id !== currentPlayer.id).position;
    let otherPlayerCell = document.getElementById(`cell-${otherPlayerPosition.x}-${otherPlayerPosition.y}`);
    var otherPlayer =getPlayerElementById('player1');
    if (otherPlayerCell.style.opacity === '1'){
        otherPlayerCell.appendChild(otherPlayer);
        otherPlayer.style.opacity = '1';
    } else {
        otherPlayer.remove();
    }

    displayWalls(gameState);

    askPossibleMove();
}

function displayWalls(gameState) {
    gameState.players.forEach(player => {
        player.walls.forEach(wall => {
            let cell = document.getElementById(`cell-${wall[0].x}-${wall[0].y}`);
            // handleCellAction(cell, wall[0].x, wall[0].y, 'displayBarrier', player.id);
            lockBarrier(wall, true, player.id);
        });
    })
}

function confirmationPopup(roomId, askTextButtonInteraction) {
    var modal = document.getElementById("myModal");
    var btn = document.getElementById("confirmButton");
    var span = document.getElementsByClassName("close")[0];

    modal.style.display = "block";
    localStorage.setItem('roomId', roomId);

    // Quand l'utilisateur clique sur <span> (x), fermez la modale
    span.onclick = function() {
        modal.style.display = "none";
        askTextButtonInteraction();
    }

    // Quand l'utilisateur clique sur le bouton de confirmation
    btn.onclick = function() {
        modal.style.display = "none";
        askTextButtonInteraction();
    }
}

export { updateBoardDisplay, confirmationPopup};
