import { updateBoardDisplay } from "./fogOfWar.js";
import socket from "../sockets/socketConnection.js";

const board = document.getElementById('board');
const BotPlayer = createPlayer('BotPlayer', 'blue');
const player2 = createPlayer('player2', 'red');
let player1Path = [];
let player2Path = [];
let currentPlayer = player2;
let gameActive = true;


for (let i = 0; i < 17; i++) {
    for (let j = 0; j < 17; j++) {
        const cell = document.createElement('div');
        cell.className = 'cell';

        if (i % 2 === 0 && j % 2 === 0) {
            cell.classList.add('player-cell');
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
player1Cell.appendChild(BotPlayer);

const player2Cell = document.getElementById('cell-16-8');
player2Cell.appendChild(player2);

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

function askPossibleMove() {
    // console.log("EMIT possibleMoveRequest")
    socket.emit('possibleMoveRequest');
}

function displayPossibleMove(possibleMove) {
    var allElements = document.querySelectorAll('*');
    allElements.forEach(function(cell) {
        // Supprimer l'écouteur en utilisant la référence stockée
        if (cell.moveEventListener) {
            cell.removeEventListener('click', cell.moveEventListener);
            cell.moveEventListener = null; // Nettoyer la référence
        }
    });

    possibleMove.forEach(move => {
        let cell = document.getElementById(`cell-${move.x}-${move.y}`);
        cell.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';

        // Créer une nouvelle fonction de rappel qui inclut les paramètres spécifiques
        let callback = () => socketMovePlayer(move.x, move.y);
        cell.addEventListener('click', callback);
        // Stocker la référence de cette fonction pour pouvoir la supprimer plus tard
        cell.moveEventListener = callback;
    });
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
/*    if(!canPlayerReachArrival(BotPlayer)) {
        retrieveImpossibleMovePopUp("Vous n'avez pas le droit de poser cette barrière, car cela bloquerait le joueur 1");
        return;
    } else if(!canPlayerReachArrival(player2)) {
        retrieveImpossibleMovePopUp("Vous n'avez pas le droit de poser cette barrière, car cela bloquerait le joueur 2");
        return;
    }*/
    //hidePossibleMove();

    let wall;
    wall = [];

    const [targetCellx, targetCelly] = targetCell.id.split('-').slice(1).map(Number);
    const [targetCell2x, targetCell2y] = targetCell2.id.split('-').slice(1).map(Number);
    const [targetCell3x, targetCell3y] = targetCell3.id.split('-').slice(1).map(Number);

    wall.push({x: targetCellx, y: targetCelly});
    wall.push({x: targetCell2x, y: targetCell2y});
    wall.push({x: targetCell3x, y: targetCell3y});

    targetCell.classList.add('locked');
    targetCell2.classList.add('locked');
    targetCell3.classList.add('locked');

    console.log("EMIT toggleWall")
    socket.emit('toggleWall', wall, isVertical);


/*    updatePathLength();
    turn();
    askPossibleMove();*/
}

function socketMovePlayer(i, j) {
    let targetPosition = {x: i, y: j};

    // console.log("EMIT movePlayer, Je veux bouger en " + i + " " + j);
    socket.emit('movePlayer', targetPosition);
}

function toggleBarrier(cell, cell2, cell3, isVertical) {
    if (!cell.querySelector('.barrier') && (!cell2.querySelector('.barrier') || !cell2) && (!cell3.querySelector('.barrier') || !cell3)) {
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
        barrier.style.filter = currentPlayer.id === 'BotPlayer' ? 'url(#svgTintRed)' : 'url(#svgTintGreen)';
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
            barrier2.style.filter = currentPlayer.id === 'BotPlayer' ? 'url(#svgTintRed)' : 'url(#svgTintGreen)';
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
            barrier3.style.filter = currentPlayer.id === 'BotPlayer' ? 'url(#svgTintRed)' : 'url(#svgTintGreen)';
            cell3.appendChild(barrier3);
        }
    }
}


/*
function updatePathLength() {
    const player1PathLengthElement = document.getElementById('player1PathLength');
    const player2PathLengthElement = document.getElementById('player2PathLength');

    player1PathLengthElement.innerText = `Le chemin du joueur 1 : ${player1Path.length}`;
    player2PathLengthElement.innerText = `Le chemin du joueur 2 : ${player2Path.length}`;
}
*/
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
/*
function updateBoard(gameState) {
    const player1 = gameState.players.find(player => player.id === 'ia');
    const player1Cell = document.getElementById(`cell-${player1.position.x}-${player1.position.y}`);
    player1Cell.appendChild(BotPlayer);


    const player2 = gameState.players.find(player => player.id === 'p2');
    const player2Cell = document.getElementById(`cell-${player1.position.x}-${player1.position.y}`);
    player2Cell.appendChild(player2);
}
*/
/*function endGame(message) {
    gameActive = false;
    const messageElement = document.getElementById('message');
    messageElement.innerText = message;
    messageElement.classList.add('visible');
    board.classList.add('hidden');
}*/
/*function displayPossibleMove() {
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
}*/
/*
function retrieveImpossibleMovePopUp(message) {
    const messageElement = document.getElementById('message');
    messageElement.innerText = message;
    messageElement.classList.add('visible');
    setTimeout(function() {
        messageElement.classList.remove('visible');
    }, 2000);
}
*/
/*
function hidePossibleMove() {
    if (!gameActive) return;

    const playerCell = currentPlayer.parentElement;

    const neighborsList = getGeographicNeighbors(playerCell);
    for(const neighbor of neighborsList) {
        neighbor.style.backgroundColor = 'transparent';
    }

    let neighborPlayer = null;
    if(neighborPlayer = playerIsNeighbor()) {
        const neighborsOfPlayer2 = getGeographicNeighbors(neighborPlayer);
        for(const neighbor2 of neighborsOfPlayer2) {
            neighbor2.style.backgroundColor = 'transparent';
        }
    }
}
*/


export { askPossibleMove, displayPossibleMove };