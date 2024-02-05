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
            cell.addEventListener('click', function (event) {
                event.preventDefault();
                if (i % 2 === 0 && j % 2 !== 0) {
                    if (i === 16)
                        toggleBarrier(cell, document.getElementById(`cell-${i - 1}-${j}`), document.getElementById(`cell-${i - 2}-${j}`), true);
                    else
                        toggleBarrier(cell, document.getElementById(`cell-${i + 1}-${j}`), document.getElementById(`cell-${i + 2}-${j}`), true);
                } else if (j % 2 === 0 && i % 2 !== 0) {
                    if (j === 16)
                        toggleBarrier(document.getElementById(`cell-${i}-${j - 2}`), document.getElementById(`cell-${i}-${j - 1}`), cell, false);
                    else
                        toggleBarrier(cell, document.getElementById(`cell-${i}-${j + 1}`), document.getElementById(`cell-${i}-${j + 2}`), false);
                }
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

function createPlayer(className, bgColor) {
    const player = document.createElement('div');
    player.className = `player ${className}`;
    player.id = `${className}`;
    return player;
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
                targetCell.appendChild(currentPlayer);
                if (currentPlayer === player1 && targetX === 16) {
                    endGame('Le joueur 1 a gagné!');
                } else if (currentPlayer === player2 && targetX === 0) {
                    endGame('Le joueur 2 a gagné!');
                }

                if (currentPlayer === player1) {
                    player1Path = calculateShortestPath(targetCell, 16);
                } else {
                    player2Path = calculateShortestPath(targetCell, 0);
                }

                updatePathLength();
                turn();
            }
        }
    } else if ((Math.abs(targetX - x) === 4 && targetY === y) || (Math.abs(targetY - y) === 4 && targetX === x)) {
        const jumpedCell = getJumpedPlayer(playerCellId, targetCellId);
        const barrierInBetween = checkBarriersBetween(playerCellId, jumpedCell.id);
        const secondBarrierInBetween = checkBarriersBetween(jumpedCell.id, targetCellId);
        const jumpedPlayer = getJumpedPlayer(playerCellId, targetCellId);

        if (jumpedPlayer && !barrierInBetween && !secondBarrierInBetween) {
            targetCell.appendChild(currentPlayer);

            if (currentPlayer === player1 && targetX === 16) {
                endGame('Le joueur 1 a gagné!');
            } else if (currentPlayer === player2 && targetX === 0) {
                endGame('Le joueur 2 a gagné!');
            }

            if (currentPlayer === player1) {
                player1Path = calculateShortestPath(targetCell, 16);
            } else {
                player2Path = calculateShortestPath(targetCell, 0);
            }

            updatePathLength();
            turn();
        }
    }
}

function checkBarriersBetween(startCellId, targetCellId) {
    const [x1, y1] = startCellId.split('-').slice(1).map(Number);
    const [x2, y2] = targetCellId.split('-').slice(1).map(Number);

    const interX = x1 + (x2 - x1) / 2;
    const interY = y1 + (y2 - y1) / 2;

    const barrierCell = document.getElementById(`cell-${interX}-${interY}`);
    return barrierCell && barrierCell.querySelector('.barrier');
}

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

function calculateShortestPath(startCell, targetRow) {
    const queue = [{ cell: startCell, path: [] }];
    const visited = new Set();

    while (queue.length > 0) {
        const { cell, path } = queue.shift();
        const [x, y] = cell.id.split('-').slice(1).map(Number);

        if (x === targetRow) {
            return path;
        }

        const neighbors = getNeighbors(cell);
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
}

function getNeighbors(cell) {
    const [x, y] = cell.id.split('-').slice(1).map(Number);
    const neighbors = [];

    if (x > 0) neighbors.push(document.getElementById(`cell-${x - 1}-${y}`));
    if (x < 16) neighbors.push(document.getElementById(`cell-${x + 1}-${y}`));
    if (y > 0) neighbors.push(document.getElementById(`cell-${x}-${y - 1}`));
    if (y < 16) neighbors.push(document.getElementById(`cell-${x}-${y + 1}`));

    return neighbors;
}

function toggleBarrier(cell, cell2, cell3, isVertical) {
    if (!cell.querySelector('.barrier') && (!cell2.querySelector('.barrier') || !cell2) && (!cell3.querySelector('.barrier') || !cell3)) {
        const barrier = document.createElement('div');
        barrier.className = 'barrier';
        if (isVertical) {
            barrier.style.height = '100%';
            barrier.style.width = '80%';
            barrier.style.backgroundImage = 'url("img/BarriereVerticale.png")';
            barrier.style.backgroundPosition = 'top';
            adjustVisibilityForWallsVertical(cell.id, currentPlayer.id);
        }
        else {
            barrier.style.height = '80%';
            barrier.style.width = '100%';
            barrier.style.backgroundImage = 'url("img/Barriere.png")';
            barrier.style.backgroundPosition = 'left';
            adjustVisibilityForWallsHorizontal(cell.id, currentPlayer.id);
        }
        cell.appendChild(barrier);
        if (cell2) {
            const barrier2 = document.createElement('div');
            barrier2.className = 'barrier';
            if (isVertical) {
                barrier2.style.height = '100%';
                barrier2.style.width = '80%';
                barrier2.style.backgroundImage = 'url("img/BarriereVerticale.png")';
                barrier2.style.backgroundPosition = 'center';
            }
            else {
                barrier2.style.height = '80%';
                barrier2.style.width = '100%';
                barrier2.style.backgroundImage = 'url("img/Barriere.png")';
                barrier2.style.backgroundPosition = 'center';
            }
            cell2.appendChild(barrier2);
        }
        if (cell3) {
            const barrier3 = document.createElement('div');
            barrier3.className = 'barrier';
            if (isVertical) {
                barrier3.style.height = '100%';
                barrier3.style.width = '80%';
                barrier3.style.backgroundImage = 'url("img/BarriereVerticale.png")';
                barrier3.style.backgroundPosition = 'bottom';
            }
            else {
                barrier3.style.height = '80%';
                barrier3.style.width = '100%';
                barrier3.style.backgroundImage = 'url("img/Barriere.png")';
                barrier3.style.backgroundPosition = 'right';
            }
            cell3.appendChild(barrier3);
        }

        if (currentPlayer === player1) {
            player1Path = calculateShortestPath(player1Cell, 16);
        } else {
            player2Path = calculateShortestPath(player2Cell, 0);
        }

        updatePathLength();
        turn();
    }
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