import {
    askPossibleMove,
    lockBarrier,
    activateBarrierCellListeners,
    deactivateBarrierCellListeners,
    updatePlayerBarrierCounts,
    getPlayerElementById
} from "./game.js";

let continueMap = new Map(); // Clé : ID du joueur, Valeur : booléen indiquant si l'animation doit continuer

function hideOldPossibleMoves() {
    let playerCells = document.getElementsByClassName('player-cell');
    for (let i = 0; i < playerCells.length; i++) {
        playerCells[i].classList.remove('blinking');
    }

    var allElements = document.querySelectorAll('*');
    allElements.forEach(function(cell) {
        if (cell.moveEventListener) {
            cell.removeEventListener('click', cell.moveEventListener);
            cell.moveEventListener = null;
            cell.classList.remove('blinking');
        }
    });
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
    playerCell.appendChild(getPlayerElementById(player.id));
    playerCell.firstElementChild.style.opacity = 1;
    playerCell.style.opacity = 1;

    let otherPlayer = gameState.players.find(otherPlayer => otherPlayer.id !== player.id);
    let otherPlayerCell = document.getElementById(`cell-${otherPlayer.position.x}-${otherPlayer.position.y}`);
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
        if (localStorage.getItem('roomId')) {
            progress(300,300, player.id)
            stopProgress(otherPlayer.id)
        }
    } else {
        Array.from(barrierCells).forEach(barrierCell => {
            deactivateBarrierCellListeners(barrierCell);
        });
        if (localStorage.getItem('roomId')) {
            progress(300, 300, otherPlayer.id)
            stopProgress(player.id)
        }
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

function popUp(text) {
    var modal = document.getElementById("myModal");
    var modalContent = document.querySelector('.modal-content');

    var textContent = document.querySelector('.modal-content p')
    textContent.textContent = text;
    modalContent.appendChild(textContent);

    modal.style.display = "flex";
}

function confirmationPopup(askTextButtonInteraction) {
    var modal = document.getElementById("myModal");
    var modalContent = document.querySelector('.modal-content');
    document.querySelector('.modal-content p').textContent = 'Match trouvé!'

    setTimeout(() => {
        modal.style.display = "none";
        askTextButtonInteraction();
    }, 1000);
}

function progress(timeleft, timetotal, currentPlayerID) {
    console.log(currentPlayerID);
    // selectionner la div #bar enfant de #progress-bar-${currentPlayerID}
    var progressBar = document.querySelector(`#progress-bar-${currentPlayerID} .bar`);

    var width = 100;
    var totalTime = timetotal;
    continueMap.set(currentPlayerID, true); // Démarre l'animation pour ce joueur

    function updateProgress() {
        if (!continueMap.get(currentPlayerID)) { // Vérifie si l'animation doit continuer
            return;
        }
        var timePassed = totalTime - timeleft;
        width = 100 - (timePassed / totalTime) * 100;
        progressBar.style.width = width + '%';
        progressBar.textContent = `${width.toFixed(0)}`;

        if (timeleft > 0) {
            timeleft--;
            requestAnimationFrame(updateProgress);
        }
    }

    requestAnimationFrame(updateProgress);
}


function stopProgress(currentPlayerID) {
    continueMap.set(currentPlayerID, false); // Arrête l'animation pour ce joueur
    var progressBar = document.querySelector(`#progress-bar-${currentPlayerID} .bar`);
    progressBar.style.width = '100%';
    progressBar.textContent = '';
}


export { updateBoardDisplay, popUp, confirmationPopup};