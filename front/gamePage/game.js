import {initializeVisibility, updateBoardDisplay, adjustVisibilityForWallsHorizontal, adjustVisibilityForWallsVertical} from "./fogOfWar.js";

const board = document.getElementById('board');
const player1 = createPlayer('player1', 'blue');
const player2 = createPlayer('player2', 'red');
let player1Path = [];
let player2Path = [];
let currentPlayer = player1;
let gameActive = true;

for (let i = 0; i < 17; i++) {
    for (let j = 0; j < 17; j++) {
        const cell = document.createElement('div');
        cell.className = 'cell';

        if (i % 2 === 0 && j % 2 === 0) {
            cell.classList.add('player-cell');
            cell.addEventListener('click', () => movePlayer(cell));
        } else {
            cell.classList.add('barrier-cell');
            cell.addEventListener('mouseenter', (event) => {
                event.preventDefault();
                handleCellAction(cell, i, j, 'displayBarrier');
            });
            cell.addEventListener('mouseleave', (event) => {
                event.preventDefault();
                handleCellAction(cell, i, j, 'hideBarrier');
            });
            cell.addEventListener('click', function (event) {
                event.preventDefault();
                handleCellAction(cell, i, j, 'lockBarrier');
            });
        }

        cell.id = `cell-${i}-${j}`;
        board.appendChild(cell);
    }
}


const player1Cell = document.getElementById('cell-0-8');
player1Cell.appendChild(player1);

const player2Cell = document.getElementById('cell-16-8');
player2Cell.appendChild(player2);

initializeVisibility(board);
updateBoardDisplay(board, currentPlayer);

displayPossibleMove();

function createPlayer(className, bgColor) {
    const player = document.createElement('div');
    player.className = `player ${className}`;
    player.id = `${className}`;
    return player;
}

function handleCellAction(cell, i, j, actionType) {
    let cell2, cell3;
    let isVertical = i % 2 === 0 && j % 2 !== 0;
    let isHorizontal = j % 2 === 0 && i % 2 !== 0;
    let isEdge = (isVertical && i === 16) || (isHorizontal && j === 16);

    if (isVertical) {
        if(isEdge){
            cell2 = document.getElementById(`cell-${i - 1}-${j}`);
            cell3 = cell;
            cell = document.getElementById(`cell-${i - 2}-${j}`);
        } else {
            cell2 = document.getElementById(`cell-${i + 1}-${j}`);
            cell3 = document.getElementById(`cell-${i + 2}-${j}`);
        }


    } else if (isHorizontal) {
        if(isEdge) {
            cell2 = document.getElementById(`cell-${i}-${j - 1}`);
            cell3 = cell;
            cell = document.getElementById(`cell-${i}-${j - 2}`);
        } else {
            cell2 = document.getElementById(`cell-${i}-${j + 1}`);
            cell3 = document.getElementById(`cell-${i}-${j + 2}`);
        }
    }

    if (cell2 && cell3) {
        if (actionType === 'displayBarrier') {
            displayPossibleToggleBarrier(cell, cell2, cell3, isVertical);
        } else if (actionType === 'hideBarrier') {
            hidePossibleToggleBarrier(cell, cell2, cell3);
        } else if (actionType === 'lockBarrier') {
            lockBarrier(cell, cell2, cell3, isVertical);
        }
    }
}

function playerIsNeighbor() {
    if (!gameActive) return;

    const playerCell = currentPlayer.parentElement;

    const neighborsList = getNeighborsWithBarriers(playerCell);
    for(const neighbor of neighborsList) {
        if(neighbor.querySelector('.player')) {
            return neighbor;
        }
    }
    return null;
}

function displayPossibleMove() {
    if (!gameActive) return;

    const playerCell = currentPlayer.parentElement;
    const neighborsList = getNeighborsWithBarriers(playerCell);

    let neighborPlayer = null;
    if(neighborPlayer = playerIsNeighbor()) {
        const [x, y] = playerCell.id.split('-').slice(1).map(Number);
        const [nx, ny] = neighborPlayer.id.split('-').slice(1).map(Number);
        let forwardCell = null;
        if(x === nx) {
            if(y < ny) {
                forwardCell = document.getElementById(`cell-${x}-${y + 4}`);
            } else {
                forwardCell = document.getElementById(`cell-${x}-${y - 4}`);
            }
        } else {
            if(x < nx) {
                forwardCell = document.getElementById(`cell-${x + 4}-${y}`);
            } else {
                forwardCell = document.getElementById(`cell-${x - 4}-${y}`);
            }
        }
        if(!checkBarriersBetween(neighborPlayer.id, forwardCell.id)) {
            forwardCell.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        }

        for(const neighbor of neighborsList) {
            if(playerIsNeighbor()) {
               if(neighbor.id !== playerIsNeighbor().id) {
                    neighbor.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
                }
            }
        }
    } else {
        for(const neighbor of neighborsList) {
            neighbor.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        }
    }
}

function hidePossibleMove() {
    if (!gameActive) return;

    const playerCell = currentPlayer.parentElement;

    const neighborsList = getGeographicNeighbors(playerCell);
    for(const neighbor of neighborsList) {
        neighbor.style.backgroundColor = 'transparent';
        //console.log("Dans la fonction : " + neighbor.id);
    }

    let neighborPlayer = null;
    if(neighborPlayer = playerIsNeighbor()) {
        const neighborsOfPlayer2 = getGeographicNeighbors(neighborPlayer);
        for(const neighbor2 of neighborsOfPlayer2) {
            neighbor2.style.backgroundColor = 'transparent';
        }
    }
}

function displayPossibleToggleBarrier(targetCell, targetCell2, targetCell3, isVertical) {
    toggleBarrier(targetCell, targetCell2, targetCell3, isVertical);
}

function hidePossibleToggleBarrier(targetCell, targetCell2, targetCell3) {
    if(!targetCell.classList.contains('locked') && !targetCell2.classList.contains('locked') && !targetCell3.classList.contains('locked')) {
        var taretCellChild = targetCell.querySelector('div');
        var taretCell2Child = targetCell2.querySelector('div');
        var taretCell3Child = targetCell3.querySelector('div');
        targetCell.removeChild(taretCellChild);
        targetCell2.removeChild(taretCell2Child);
        targetCell3.removeChild(taretCell3Child);
    }

}

function lockBarrier(targetCell, targetCell2, targetCell3, isVertical) {
    if(isBarrierPlacementValid(targetCell, targetCell2, targetCell3)) {
        if(!canPlayerReachArrival(player1)) {
            retrieveImpossibleMovePopUp("Vous n'avez pas le droit de poser cette barrière, car cela bloquerait le joueur 1");
            return;
        } else if(!canPlayerReachArrival(player2)) {
            retrieveImpossibleMovePopUp("Vous n'avez pas le droit de poser cette barrière, car cela bloquerait le joueur 2");
            return;
        }
        hidePossibleMove();

        targetCell.classList.add('locked');
        targetCell2.classList.add('locked');
        targetCell3.classList.add('locked');

        if(isVertical) {
            adjustVisibilityForWallsVertical(targetCell.id, currentPlayer.id);
        } else {
            adjustVisibilityForWallsHorizontal(targetCell.id, currentPlayer.id);
        }

        updatePathLength();
        turn();
        displayPossibleMove();
    } else {
        retrieveImpossibleMovePopUp("Vous n'avez pas le droit de poser cette barrière, il y a deja une barriere");
        return;

    }
}

function canPlayerReachArrival(player) {
    const currentCell = player.parentElement;
    let alreadyVisitedCell = []; // La liste des cases que l'on va visiter
    let canReach = false;

    if(player === player1) {
        canReach = checkPathToReachTheEnd(currentCell, alreadyVisitedCell, "player1");
    } else if(player === player2) {
        canReach = checkPathToReachTheEnd(currentCell, alreadyVisitedCell, "player2");
    }

    if (canReach) {
        console.log("Le joueur " + (player === player1 ? "player1" : "player2") + " peut encore atteindre la fin");
    } else {
        console.log("Le joueur " + (player === player1 ? "player1" : "player2") + " est bloqué à cause de ce mouvement");
    }

    return canReach;
}

function retrieveImpossibleMovePopUp(message) {
    const messageElement = document.getElementById('message');
    messageElement.innerText = message;
    messageElement.classList.add('visible');
    setTimeout(function() {
        messageElement.classList.remove('visible');
    }, 2000);
}

function checkPathToReachTheEnd(currentCell, alreadyVisitedCell, player) {
    if(alreadyVisitedCell.includes(currentCell)) { // Dans ce cas là, la cellule a déjà été visitée
        return false;
    }

    const [x, y] = currentCell.id.split('-').slice(1).map(Number);
    if ((player === "player1" && x === 16) || (player === "player2" && x === 0)) {
        return true;
    }

    alreadyVisitedCell.push(currentCell);
    const neighborsList = getNeighborsWithBarriers(currentCell);
    for (const neighbor of neighborsList) {
        if (checkPathToReachTheEnd(neighbor, alreadyVisitedCell, player)) {
            return true;
        }
    }
    return false;
}

function movePlayer(targetCell) {
    if (!gameActive) return;

    const playerCellId = currentPlayer.parentElement.id;
    const targetCellId = targetCell.id;
    const [x, y] = playerCellId.split('-').slice(1).map(Number);
    const [targetX, targetY] = targetCellId.split('-').slice(1).map(Number);

    if (((Math.abs(targetX - x) === 2 && targetY === y) || (Math.abs(targetY - y) === 2 && targetX === x))) {
        const barrierInBetween = checkBarriersBetween(playerCellId, targetCellId);
        if (!barrierInBetween) {
            const closePlayer = targetCell.querySelector('.player');
            if (!(closePlayer && closePlayer !== currentPlayer)) {
                hidePossibleMove();
                targetCell.appendChild(currentPlayer);
                if (currentPlayer === player1 && targetX === 16) {
                    endGame('Le joueur 1 a gagné!');
                } else if (currentPlayer === player2 && targetX === 0) {
                    endGame('Le joueur 2 a gagné!');
                }
                /*
                if (currentPlayer === player1) {
                    player1Path = calculateShortestPath(targetCell, 16);
                } else {
                    player2Path = calculateShortestPath(targetCell, 0);
                }*/

                updatePathLength();
                turn();
                displayPossibleMove();
            }
        }
    } else if ((Math.abs(targetX - x) === 4 && targetY === y) || (Math.abs(targetY - y) === 4 && targetX === x)) {
        const jumpedCell = getJumpedPlayer(playerCellId, targetCellId);
        const barrierInBetween = checkBarriersBetween(playerCellId, jumpedCell.id);
        const secondBarrierInBetween = checkBarriersBetween(jumpedCell.id, targetCellId);
        const jumpedPlayer = getJumpedPlayer(playerCellId, targetCellId);

        if (jumpedPlayer && !barrierInBetween && !secondBarrierInBetween) {
            hidePossibleMove();
            targetCell.appendChild(currentPlayer);

            if (currentPlayer === player1 && targetX === 16) {
                endGame('Le joueur 1 a gagné!');
            } else if (currentPlayer === player2 && targetX === 0) {
                endGame('Le joueur 2 a gagné!');
            }
            /*
            if (currentPlayer === player1) {
                player1Path = calculateShortestPath(targetCell, 16);
            } else {
                player2Path = calculateShortestPath(targetCell, 0);
            }*/

            updatePathLength();
            turn();
            displayPossibleMove();
        }
    }
}


// Cette fonction marche très bien car elle est appelée uniquement dans les cas adéquat, lorsque deux cellules sont voisines
function checkBarriersBetween(startCellId, targetCellId) {
    const [x1, y1] = startCellId.split('-').slice(1).map(Number);
    const [x2, y2] = targetCellId.split('-').slice(1).map(Number);

    const interX = x1 + (x2 - x1) / 2;
    const interY = y1 + (y2 - y1) / 2;

    const barrierCell = document.getElementById(`cell-${interX}-${interY}`);
    return barrierCell && barrierCell.querySelector('.barrier');
}

// Cette fonction, appelée lorsque l'on tente de faire un saut de 2 cases d'un coup, vérifie si un joueur est présent sur la case
// située entre celle du joueur courant et celle où l'on veut atterir, et elle retourne la case contenant le joueur que l'on cherche à
// sauter dans le cas où il y a bien un joueur entre les deux cases
function getJumpedPlayer(startCellId, targetCellId) {
    const [startX, startY] = startCellId.split('-').slice(1).map(Number);
    const [targetX, targetY] = targetCellId.split('-').slice(1).map(Number);

    const jumpedX = startX + (targetX - startX) / 2;
    const jumpedY = startY + (targetY - startY) / 2;

    const jumpedCell = document.getElementById(`cell-${jumpedX}-${jumpedY}`);
    if (jumpedCell) {
        const jumpedPlayer = jumpedCell.querySelector('.player');
        if (jumpedPlayer && jumpedPlayer !== currentPlayer) {
            return jumpedCell;
        }
    }

    return null;
}

function updatePathLength() {
    const player1PathLengthElement = document.getElementById('player1PathLength');
    const player2PathLengthElement = document.getElementById('player2PathLength');

    player1PathLengthElement.innerText = `Le chemin du joueur 1 : ${player1Path.length}`;
    player2PathLengthElement.innerText = `Le chemin du joueur 2 : ${player2Path.length}`;
}
/*
function calculateShortestPath(startCell, targetRow) {
    const queue = [{ cell: startCell, path: [] }];
    const visited = new Set();

    while (queue.length > 0) {
        const { cell, path } = queue.shift();
        const [x, y] = cell.id.split('-').slice(1).map(Number);

        if (x === targetRow) {
            return path;
        }

        const neighbors = getNeighborsWithBarriers(cell);
        for (const neighbor of neighbors) {
            const neighborId = neighbor.id;
            const isBarrier = neighbor.querySelector('.barrier');

            if (!visited.has(neighborId) && !(isBarrier && !path.includes(neighborId))) {
                visited.add(neighborId);
                if (neighbor.classList.contains('player-cell')) {
                    queue.push({ cell: neighbor, path: [...path, neighborId] });
                } else {
                    queue.push({ cell: neighbor, path });
                }
            }
        }
    }

    return [];
}*/

function isAPlayableCell(cell) {
    if(cell.classList.contains('player-cell')) {
        return true;
    }
    print("Cette cellule n'est pas une case mais un bord");
    return false;
}

function getGeographicNeighbors(cell) {
    const [x, y] = cell.id.split('-').slice(1).map(Number);
    if(!isAPlayableCell(cell)) {
        print("Cette cellule n'a pas de voisins géographiques car c'est un bord");
        return null;
    }
    const neighbors = [];

    if (x > 0) neighbors.push(document.getElementById(`cell-${x - 2}-${y}`));
    if (x < 16) neighbors.push(document.getElementById(`cell-${x + 2}-${y}`));
    if (y > 0) neighbors.push(document.getElementById(`cell-${x}-${y - 2}`));
    if (y < 16) neighbors.push(document.getElementById(`cell-${x}-${y + 2}`));

    return neighbors;
}

function getNeighborsWithBarriers(cell) {
    const [x, y] = cell.id.split('-').slice(1).map(Number);
    if(!isAPlayableCell(cell)) {
        print("Cette cellule n'a pas de voisins en prenant en compte les barrières car c'est un bord");
        return null;
    }
    const neighbors = [];
    const geographicNeighbors = getGeographicNeighbors(cell);

    for(const neighborCell of geographicNeighbors) {
        if(!checkBarriersBetween(cell.id, neighborCell.id)) {
            //console.log("Voisin après barrière : " + neighborCell.id);
            neighbors.push(neighborCell);
        }
    }
    return neighbors
}

function toggleBarrier(cell, cell2, cell3, isVertical) {
    if (isBarrierPlacementValid(cell, cell2, cell3)) {
        const barrier = document.createElement('div');
        barrier.className = 'barrier';
        if (isVertical) {
            barrier.style.height = '100%';
            barrier.style.width = '80%';
            barrier.style.backgroundImage = 'url("../img/BarriereVerticale.png")';
            barrier.style.backgroundPosition = 'top';
        }
        else {
            barrier.style.height = '80%';
            barrier.style.width = '100%';
            barrier.style.backgroundImage = 'url("../img/Barriere.png")';
            barrier.style.backgroundPosition = 'left';
        }
        barrier.style.filter = currentPlayer.id === 'player1' ? 'url(#svgTintRed)' : 'url(#svgTintGreen)';
        cell.appendChild(barrier);
        if (cell2) {
            const barrier2 = document.createElement('div');
            barrier2.className = 'barrier';
            if (isVertical) {
                barrier2.style.height = '100%';
                barrier2.style.width = '80%';
                barrier2.style.backgroundImage = 'url("../img/BarriereVerticale.png")';
                barrier2.style.backgroundPosition = 'center';
            }
            else {
                barrier2.style.height = '80%';
                barrier2.style.width = '100%';
                barrier2.style.backgroundImage = 'url("../img/Barriere.png")';
                barrier2.style.backgroundPosition = 'center';
            }
            barrier2.style.filter = currentPlayer.id === 'player1' ? 'url(#svgTintRed)' : 'url(#svgTintGreen)';
            cell2.appendChild(barrier2);
        }
        if (cell3) {
            const barrier3 = document.createElement('div');
            barrier3.className = 'barrier';
            if (isVertical) {
                barrier3.style.height = '100%';
                barrier3.style.width = '80%';
                barrier3.style.backgroundImage = 'url("../img/BarriereVerticale.png")';
                barrier3.style.backgroundPosition = 'bottom';
            }
            else {
                barrier3.style.height = '80%';
                barrier3.style.width = '100%';
                barrier3.style.backgroundImage = 'url("../img/Barriere.png")';
                barrier3.style.backgroundPosition = 'right';
            }
            barrier3.style.filter = currentPlayer.id === 'player1' ? 'url(#svgTintRed)' : 'url(#svgTintGreen)';
            cell3.appendChild(barrier3);
        }
    }
}

function isBarrierPlacementValid(cell, cell2, cell3) {
    const isCellEmpty = !cell.classList.contains('locked');
    const isCell2Empty = !cell2.classList.contains('locked');
    const isCell3Empty = !cell3.classList.contains('locked');
    return isCellEmpty && isCell2Empty && isCell3Empty;
}


function turn() {
    currentPlayer = currentPlayer === player1 ? player2 : player1;
    updateBoardDisplay(board, currentPlayer);
    document.getElementById('playerTurn').innerText = `C'est au tour du joueur ${currentPlayer.id === 'player1' ? '1' : '2'}`;
}

function endGame(message) {
    gameActive = false;
    const messageElement = document.getElementById('message');
    messageElement.innerText = message;
    messageElement.classList.add('visible');
    board.classList.add('hidden');
}