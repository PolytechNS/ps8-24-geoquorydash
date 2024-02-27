import socket from "../sockets/socketConnection.js";

const board = document.getElementById('board');
const BotPlayer = createPlayer('BotPlayer', 'blue');
const player2 = createPlayer('player2', 'red');
let currentPlayer = player2;

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
    if (cell.classList.contains('locked')) return;

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
        } else if (actionType === 'lockBarrier' && cell.classList.contains('previewMode')) {
            socketToggleWall(cell, cell2, cell3, isVertical);
        }
    }
}

function askPossibleMove() {
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
        targetCell.classList.remove('previewMode');
        targetCell2.classList.remove('previewMode');
        targetCell3.classList.remove('previewMode');
    }

}

function socketToggleWall(targetCell, targetCell2, targetCell3, isVertical){
    let wall;
    wall = [];

    const [targetCellx, targetCelly] = targetCell.id.split('-').slice(1).map(Number);
    const [targetCell2x, targetCell2y] = targetCell2.id.split('-').slice(1).map(Number);
    const [targetCell3x, targetCell3y] = targetCell3.id.split('-').slice(1).map(Number);

    wall.push({x: targetCellx, y: targetCelly});
    wall.push({x: targetCell2x, y: targetCell2y});
    wall.push({x: targetCell3x, y: targetCell3y});

    socket.emit('toggleWall', wall, isVertical);
}
function lockBarrier(wall) {
    var targetCell = document.getElementById(`cell-${wall[0].x}-${wall[0].y}`)
    var targetCell2 = document.getElementById(`cell-${wall[1].x}-${wall[1].y}`)
    var targetCell3 = document.getElementById(`cell-${wall[2].x}-${wall[2].y}`)

    targetCell.classList.add('locked');
    targetCell2.classList.add('locked');
    targetCell3.classList.add('locked');
    targetCell.classList.remove('previewMode');
    targetCell2.classList.remove('previewMode');
    targetCell3.classList.remove('previewMode');
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
        cell.classList.add('previewMode');
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
            cell2.classList.add('previewMode');
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
            cell3.classList.add('previewMode');
        }
    }
}

function ImpossibleWallPlacementPopUp() {
    var message = "Impossible de poser le mur a l'emplacement souhaité !";
    const messageElement = document.getElementById('message');
    messageElement.innerText = message;
    messageElement.classList.add('visible');
    setTimeout(function() {
        messageElement.classList.remove('visible');
    }, 2000);
}

function endGame(player) {
    alert("Le joueur " + player.id + " a gagne !");
}


export { askPossibleMove, displayPossibleMove, endGame, lockBarrier, ImpossibleWallPlacementPopUp };