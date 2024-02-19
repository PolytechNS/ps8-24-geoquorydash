const gameManager = require('./gameManager'); // Assurez-vous que le chemin soit correct
const fogOfWar = require('./fogOfWarController');
const { arrayOfPositionContainsPosition, arePositionsEquals } = require('../../utils/utils.js');

let player1, player2, currentPlayer, otherPlayer, gameActive = true;

async function initializeGame() {
    await gameManager.initialize();
    player1 = gameManager.getPlayerById('ia');
    player2 = gameManager.getPlayerById('p2');
    currentPlayer = gameManager.getCurrentPlayer();
    otherPlayer = player1;
}

initializeGame().then(() => {
    console.log('Initialisation terminée.');
}).catch((error) => {
    console.error('Erreur lors de l\'initialisation du jeu :', error);
});
console.log(player1, player2, currentPlayer, otherPlayer, gameActive);

function movePlayer(targetPosition) {
    if (!gameActive) return;

    // const possibleMove = getPossibleMove();
    currentPlayer.position = targetPosition;
    console.log(currentPlayer.position);

    if (currentPlayer === player1 && targetPosition.x === 16) {
        console.log('Le joueur 2 a gagné!');
        endGame('Le joueur 2 a gagné!');
        return currentPlayer;
    } else if (currentPlayer === player2 && targetPosition.x === 0) {
        console.log('Le joueur 1 a gagné!');
        endGame('Le joueur 1 a gagné!');
        return currentPlayer;
    }
}

function moveAI() {
    currentPlayer = gameManager.getCurrentPlayer();
    const iaMove = gameManager.computeMoveForAI(getPossibleMove());
    movePlayer(iaMove);
}

function toggleWall(wall, isVertical) {
    if (!gameActive) return;

    var walls = gameManager.getBoardWalls();
    for (const wallCell of wall) {
        walls.push(wallCell);
    }

    if(canPlayerReachArrival(walls)) {
        updateWalls(wall, isVertical);
        return 1;
    }
    return 0;
}

function updateWalls(wall, isVertical) {
    currentPlayer.walls.push(wall);
    fogOfWar.adjustVisibilityForWalls(wall, isVertical);
    turn();
}

// Cette fonction marche très bien car elle est appelée uniquement dans les cas adéquat, lorsque deux cellules sont voisines
function checkBarriersBetween(startPosition, targetPosition, walls) {
    const [x1, y1] = [startPosition.x, startPosition.y];
    const [x2, y2] = [targetPosition.x, targetPosition.y];

    const interX = x1 + (x2 - x1) / 2;
    const interY = y1 + (y2 - y1) / 2;
    let possibleWallPosition = {x: interX, y: interY};

    const boardWalls = walls ? walls : gameManager.getBoardWalls();
    return arrayOfPositionContainsPosition(boardWalls, possibleWallPosition);
}

function getPossibleMove() {
    if (!gameActive) return;
    let possibleMove = [];

    const adjacentCellsPositionsWithWalls = getAdjacentCellsPositionsWithWalls(currentPlayer.position);
    if(isOtherPlayerOnAdjacentCells(adjacentCellsPositionsWithWalls)) {
        let forwardPosition = null;
        if(currentPlayer.position.x === otherPlayer.position.x) {
            if(currentPlayer.position.y < otherPlayer.position.y) {
                forwardPosition = {x: currentPlayer.position.x, y: currentPlayer.position.y + 4};
            } else {
                forwardPosition = {x: currentPlayer.position.x, y: currentPlayer.position.y - 4};
            }
        } else {
            if(currentPlayer.position.x < otherPlayer.position.x) {
                forwardPosition = {x: currentPlayer.position.x + 4, y: currentPlayer.position.y};
            } else {
                forwardPosition = {x: currentPlayer.position.x - 4, y: currentPlayer.position.y};
            }
        }
        if(!checkBarriersBetween(otherPlayer, forwardPosition)) {
            possibleMove.push(forwardPosition);
        }

        for(const adjacentCellPosition of adjacentCellsPositionsWithWalls) {
            if(!arePositionsEquals(adjacentCellPosition, otherPlayer.position)) {
               possibleMove.push(adjacentCellPosition);
            }
        }
        return possibleMove;
    } else {
        return adjacentCellsPositionsWithWalls;
    }
}

function isOtherPlayerOnAdjacentCells(currentPlayerAdjacentCells) {
    if (!gameActive) return;

    return arrayOfPositionContainsPosition(currentPlayerAdjacentCells, otherPlayer.position);
}

function isAPlayableCell(position) {
    if((position.x % 2) !== 0 || (position.y % 2) !== 0) {
        return false;
    }
    return true;
}

function getAdjacentCellsPositions(cellPosition) { // Cette méthode retourne une liste de positions
    let [xPosition, yPosition] = [cellPosition.x, cellPosition.y]

    const adjacentCells = [];

    if (xPosition > 0) adjacentCells.push({x: xPosition-2, y: yPosition});
    if (xPosition < 16) adjacentCells.push({x: xPosition+2, y: yPosition});
    if (yPosition > 0) adjacentCells.push({x: xPosition, y: yPosition-2});
    if (yPosition < 16) adjacentCells.push({x: xPosition, y: yPosition+2});

    return adjacentCells;
}

function getAdjacentCellsPositionsWithWalls(cellPosition,walls) {
    const adjacentCellsPositionsWithWalls = [];
    const adjacentCellsPositions = getAdjacentCellsPositions(cellPosition);
    for(const adjacentCellPosition of adjacentCellsPositions) {
        if(!checkBarriersBetween(currentPlayer.position, adjacentCellPosition, walls)) {
            adjacentCellsPositionsWithWalls.push(adjacentCellPosition);
        }
    }
    return adjacentCellsPositionsWithWalls;
}

function canPlayerReachArrival(walls) {
    var currentPosition = currentPlayer.position;
    let alreadyVisitedCell = []; // La liste des cases que l'on va visiter
    let canReach = false;

    if(currentPlayer === player1) {
        canReach = checkPathToReachTheEnd(currentPosition, alreadyVisitedCell, "player1", walls);
    } else if(currentPlayer === player2) {
        canReach = checkPathToReachTheEnd(currentPosition, alreadyVisitedCell, "player2", walls);
    }

    if (canReach) {
        //console.log("Le joueur " + (player === player1 ? "player1" : "player2") + " peut encore atteindre la fin");
    } else {
        //console.log("Le joueur " + (player === player1 ? "player1" : "player2") + " est bloqué à cause de ce mouvement");
    }

    return canReach;
}

function checkPathToReachTheEnd(currentPosition, alreadyVisitedCell, player, walls) {
    if(arrayOfPositionContainsPosition(alreadyVisitedCell, currentPosition)) { // Dans ce cas là, la cellule a déjà été visitée
        return false;
    }

    const [x, y] = [currentPosition.x, currentPosition.y];
    if ((player === "player1" && x === 16) || (player === "player2" && x === 0)) {
        return true;
    }

    alreadyVisitedCell.push(currentPosition);
    const adjacentCellsPositions = getAdjacentCellsPositionsWithWalls(currentPosition, walls);
    for (const adjacentCellPosition of adjacentCellsPositions) {
        if (checkPathToReachTheEnd(adjacentCellPosition, alreadyVisitedCell, player, walls)) {
            return true;
        }
    }
    return false;
}

function checkIfAIturn() {
    if (!gameActive) return;

    for (let player of gameManager.getGameState().players) {
        if (player.isCurrentPlayer) {
            if (player.id === 'ia') {
                turn();
            }
        }
    }
}

function turn() {
    if (!gameActive) return;

    // On change le joueur courant car on change de tour
    for (let player of gameManager.getGameState().players) {
        player.isCurrentPlayer = !player.isCurrentPlayer;
    }
    otherPlayer = currentPlayer;
    currentPlayer = gameManager.getCurrentPlayer();

    moveAI(); // On fait bouger l'IA

    // On change le joueur courant car on change de tour
    for (let player of gameManager.getGameState().players) {
        player.isCurrentPlayer = !player.isCurrentPlayer;
    }
    otherPlayer = currentPlayer;
    currentPlayer = gameManager.getCurrentPlayer();
}

function endGame(message) {
    gameActive = false;
    gameManager.endGame();
    // Envoi un message au front avec une socket pour gérer les affichages
}

module.exports = {getPossibleMove, movePlayer, toggleWall, moveIA: moveAI, turn};