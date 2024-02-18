const gameManager = require('./gameInstance'); // Instance unique de GameManager
let player1 = gameManager.getPlayerById('ai')
let player2 = gameManager.getPlayerById('p2');
let currentPlayer = gameManager.getCurrentPlayer();
let otherPlayer = player1;
let gameActive = true;

async function movePlayer(targetPosition) {
    if (!gameActive) return; // a faire

    const possibleMove = getPossibleMove();
    if(possibleMove.includes(targetPosition)) {
        currentPlayer.position = targetPosition;

        if (currentPlayer === player2 && targetX === 16) {
            endGame('Le joueur 2 a gagné!');
        } else if (currentPlayer === player1 && targetX === 0) {
            endGame('Le joueur 1 a gagné!');
        }

        updatePathLength();
        turn();
        displayPossibleMove();
        return 1;
    }

    return 0;

}

function updateWalls(wall) {
    if(canPlayerReachArrival()) {
        currentPlayer.walls.push(wall);
        turn();
    }
}

// Cette fonction marche très bien car elle est appelée uniquement dans les cas adéquat, lorsque deux cellules sont voisines
function checkBarriersBetween(startPosition, targetPosition) {
    const [x1, y1] = [startPosition.x, startPosition.y];
    const [x2, y2] = [targetPosition.x, targetPosition.y];

    const interX = x1 + (x2 - x1) / 2;
    const interY = y1 + (y2 - y1) / 2;
    wallPosition = {x: interX, y: interY};

    const boardWalls = gameManager.getBoardWalls();
    boardWalls.forEach(wall => {
        if(wall.includes(wallPosition)) {
            return true;
        }
    })
    return false;
}

function getPossibleMove() {
    if (!gameActive) return;
    let possibleMove = [];

    const adjacentCellsPositionsWithWalls = getAdjacentCellsPositionsWithWalls();
    let neighborPlayer = null;
    if(neighborPlayer = playerPositionIfIsNeighbor()) {
        const [xPosition, yPosition] = [currentPlayer.position.x, currentPlayer.position.y];
        const [nx, ny] = [neighborPlayer.x, neighborPlayer.y];
        let forwardPosition = null;
        if(x === nx) {
            if(y < ny) {
                forwardPosition = {x: xPosition, y: yPosition + 4};
            } else {
                forwardPosition = {x: xPosition, y: yPosition - 4};
            }
        } else {
            if(x < nx) {
                forwardPosition = {x: xPosition + 4, y: yPosition};
            } else {
                forwardPosition = {x: xPosition - 4, y: yPosition};
            }
        }
        if(!checkBarriersBetween(neighborPlayer, forwardPosition)) {
            possibleMove.push(forwardPosition);
        }

        for(const adjacentCellPosition of adjacentCellsPositionsWithWalls) {
            if(adjacentCellPosition !== neighborPlayer) {
               possibleMove.push(adjacentCellPosition);
            }
        }
    } else {
        return adjacentCellsPositionsWithWalls;
    }
}

function playerPositionIfIsNeighbor() {
    if (!gameActive) return;

    const adjacentCellsPositionsWithWalls = getAdjacentCellsPositionsWithWalls();
    for(const adjacentCellPosition of adjacentCellsPositionsWithWalls) {
        if(adjacentCellPosition === otherPlayer.position) {
            return adjacentCellPosition;
        }
    }
    return null;
}

function isAPlayableCell(position) {
    if((position.x % 2) !== 0 || (position.y % 2) !== 0) {
        return false;
    }
    return true;
}

function getAdjacentCellsPositions(cellPosition) { // Cette méthode retourne une liste de positions
    let [xPosition, yPosition] = [0, 0];
    if(cellPosition) {
        [xPosition, yPosition] = [cellPosition.x, cellPosition.y]
    } else {
        [xPosition, yPosition] = [currentPlayer.position.x, currentPlayer.position.y];
    }

    const adjacentCells = [];

    if (xPosition > 0) adjacentCells.push({x: xPosition-2, y: yPosition});
    if (xPosition < 16) adjacentCells.push({x: xPosition+2, y: yPosition});
    if (yPosition > 0) adjacentCells.push({x: xPosition, y: yPosition-2});
    if (yPosition < 16) adjacentCells.push({x: xPosition, y: yPosition+2});

    return adjacentCells;
}

function getAdjacentCellsPositionsWithWalls(cellPosition) {
    const adjacentCellsPositionsWithWalls = [];
    const adjacentCellsPositions = getAdjacentCellsPositions(cellPosition);

    for(const adjacentCellPosition of adjacentCellsPositions) {
        if(!checkBarriersBetween(currentPlayer.position, adjacentCellPosition)) {
            neighbors.push(adjacentCellPosition);
        }
    }
    return adjacentCellsPositionsWithWalls;
}

function canPlayerReachArrival() {
    currentPosition = currentPlayer.position;
    let alreadyVisitedCell = []; // La liste des cases que l'on va visiter
    let canReach = false;

    if(currentPlayer === player1) {
        canReach = checkPathToReachTheEnd(currentPosition, alreadyVisitedCell, "player1");
    } else if(currentPlayer === player2) {
        canReach = checkPathToReachTheEnd(currentPosition, alreadyVisitedCell, "player2");
    }

    if (canReach) {
        //console.log("Le joueur " + (player === player1 ? "player1" : "player2") + " peut encore atteindre la fin");
    } else {
        //console.log("Le joueur " + (player === player1 ? "player1" : "player2") + " est bloqué à cause de ce mouvement");
    }

    return canReach;
}

function checkPathToReachTheEnd(currentPosition, alreadyVisitedCell, player) {
    if(alreadyVisitedCell.includes(currentPosition)) { // Dans ce cas là, la cellule a déjà été visitée
        return false;
    }

    const [x, y] = [currentPosition.x, currentPosition.y];
    if ((player === "player1" && x === 16) || (player === "player2" && x === 0)) {
        return true;
    }

    alreadyVisitedCell.push(currentPosition);
    const adjacentCellsPositions = getAdjacentCellsPositionsWithWalls(currentPosition);
    for (const adjacentCellPosition of adjacentCellsPositions) {
        if (checkPathToReachTheEnd(adjacentCellPosition, alreadyVisitedCell, player)) {
            return true;
        }
    }
    return false;
}

function updateWalls(wall) {
    currentPlayer.walls.push(wall);
}

function turn() {
    currentPlayer = currentPlayer === player1 ? player2 : player1;

    if(currentPlayer === player1) {
        const iaMove = gameManager.tryMove();
        movePlayer(iaMove);
    }

    updateBoardVisibility();

}


function endGame(message) {
    gameActive = false;
    // Envoi un message au front avec une socket pour gérer les affichages
}

module.exports = {getPossibleMove, movePlayer, updateWalls};