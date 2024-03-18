const gameManager = require('./gameManager');
const fogOfWar = require('./fogOfWarController');
const socketIo = require('socket.io');
const { arrayOfPositionContainsPosition, arePositionsEquals } = require('../../utils/utils.js');
let player1 = gameManager.getPlayerById('ia');
let player2 = gameManager.getPlayerById('p2');
let currentPlayer = gameManager.getCurrentPlayer();
let otherPlayer = player1;
let gameActive = true;

function movePlayer(targetPosition) {
    if (!gameActive) return;

    currentPlayer.position = targetPosition;

    if (currentPlayer === player1 && targetPosition.x === 16) {
        endGame('Le joueur 2 a gagné!');
        return currentPlayer;
    } else if (currentPlayer === player2 && targetPosition.x === 0) {
        endGame('Le joueur 1 a gagné!');
        return currentPlayer;
    }
}

/*async function moveAI() {
    currentPlayer = gameManager.getCurrentPlayer();
    //const iaMove = gameManager.computeMoveForAI(getAdjacentCellsPositionsWithWalls);
    const iaMove = await gameManager.computeNextMoveForAI(getAdjacentCellsPositionsWithWalls);
    console.log("Move de l'ia : " + iaMove);
    if(iaMove.action === "move") {
        let teacherPositionToMove = iaMove.value;
        let positionToMove = convertTeacherPositionToMyPosition(teacherPositionToMove);
        movePlayer(positionToMove);
    } else {
        let teacherWall = iaMove.value;
        console.log("Move : " + iaMove.action + ", value : " + iaMove.value);
        console.log("Position du mur vue du prof : " + teacherWall[0] + " et la verticalité du mur est " + teacherWall[1]);
        let topLeftCornerPosition = convertTeacherPositionToMyPosition(teacherWall[0]);
        let wallToInstall = convertTopLeftCornerWallToOurWall(topLeftCornerPosition, teacherWall[1]);
        console.log("Mur converti : {x: " + wallToInstall[0].x + ", y: " + wallToInstall[0].y + "} etc…");
        toggleWall(wallToInstall, teacherWall[1]);
    }
}*/

async function moveAI() {
    // Quand on fait ce move, nous sommes l'ia, donc le joueur local correspond au joueur adverse
    currentPlayer = gameManager.getCurrentPlayer();
    console.log("Id du joueur : " + currentPlayer.id);
    const iaMove = await gameManager.computeMoveForAI(fogOfWar);
    console.log(iaMove);
    console.log("Nature du move de " + currentPlayer.id + " : " + iaMove.action);
    if(iaMove.action === "move") {
        console.log("Le joueur " + currentPlayer.id + " a decidé d'avancer");
        let targetPosition = convertTeacherPositionToMyPosition(iaMove.value);
        return movePlayer(targetPosition);
    } else if(iaMove.action === "wall") {
        console.log("Le joueur " + currentPlayer.id + " a decidé de poser un mur");
        let wallToInstall = convertTopLeftCornerWallToOurWall(iaMove.value[0], iaMove.value[1]);
        let isVertical = true;
        if(iaMove.value[1] === 0) {
            isVertical = false;
        }
        return toggleWall(wallToInstall, isVertical);
    }
}

function toggleWall(wall, isVertical) {
    if (!gameActive) return;

    var walls = gameManager.getBoardWalls();
    for (const wallCell of wall) {
        console.log("Je push une case en mur");
        walls.push(wallCell);
    }

    if(canPlayerReachArrival(walls)) {
        var response = updateWalls(wall, isVertical);
        if (response) {
            console.log("Mon mur a bien été posé");
            return response;
        }
        return 1;
    }
}

function updateWalls(wall, isVertical) {
    currentPlayer.walls.push(wall);
    fogOfWar.adjustVisibilityForWalls(wall, isVertical);
    console.log("Les murs ont bien été mis à jour");
    return turn();
}

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
        if(!checkBarriersBetween(cellPosition, adjacentCellPosition, walls)) {
            adjacentCellsPositionsWithWalls.push(adjacentCellPosition);
        }
    }
    return adjacentCellsPositionsWithWalls;
}

function canPlayerReachArrival(walls) {
    let alreadyVisitedCell = []; // La liste des cases que l'on va visiter
    let canReach = false;
    let canReachPlayer1 = checkPathToReachTheEnd(player1.position, alreadyVisitedCell, "player1", walls);
    alreadyVisitedCell = [];
    let canReachPlayer2 = checkPathToReachTheEnd(player2.position, alreadyVisitedCell, "player2", walls);
    canReach = canReachPlayer1 && canReachPlayer2;

    return canReach;
}

function checkPathToReachTheEnd(currentPosition, alreadyVisitedCell, player, walls) {
    if(arrayOfPositionContainsPosition(alreadyVisitedCell, currentPosition)) { // Dans ce cas là, la cellule a déjà été visitée
        return false;
    }

    if ((player === "player1" && currentPosition.x === 16) || (player === "player2" && currentPosition.x === 0)) {
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

function convertTeacherPositionToMyPosition(teacherPosition) {
    let xTeacherPosition = parseInt(teacherPosition[0]);
    let yTeacherPosition = parseInt(teacherPosition[1]);
    let myPosition = {x: 2*(9 - yTeacherPosition), y: 2*(xTeacherPosition - 1)};
    return myPosition;
}

function convertTopLeftCornerWallToOurWall(topLeftCornerPosition, isVertical) {
    let wall = [];
    if(isVertical) {
        wall.push({x: topLeftCornerPosition.x, y: topLeftCornerPosition.y + 1});
        wall.push({x: topLeftCornerPosition.x + 1, y: topLeftCornerPosition.y + 1});
        wall.push({x: topLeftCornerPosition.x + 2, y: topLeftCornerPosition.y + 1});
    } else {
        wall.push({x: topLeftCornerPosition.x + 1, y: topLeftCornerPosition.y});
        wall.push({x: topLeftCornerPosition.x + 1, y: topLeftCornerPosition.y + 1});
        wall.push({x: topLeftCornerPosition.x + 1, y: topLeftCornerPosition.y + 2});
    }

    return wall;
}

function turn() {
    if (!gameActive) return;
    console.log("LE JEU EST TOUJOURS EN COURS");
    // On change le joueur courant car on change de tour
    for (let player of gameManager.getGameState().players) {
        console.log("On est dans le changement de tour et on a : " + player.id + "/" + player.isCurrentPlayer);
        player.isCurrentPlayer = !player.isCurrentPlayer;
    }
    otherPlayer = currentPlayer;
    currentPlayer = gameManager.getCurrentPlayer();
    console.log("On a désormais changé de tour, et le joueur courant est maintenant : " + currentPlayer.id);

    var response = moveAI(); // On fait bouger l'IA
    if (response) return response;

    // On change le joueur courant car on change de tour
    for (let player of gameManager.getGameState().players) {
        player.isCurrentPlayer = !player.isCurrentPlayer;
    }
    otherPlayer = currentPlayer;
    currentPlayer = gameManager.getCurrentPlayer();
}

function endGame(message) {
    gameActive = false;
}

module.exports = {getPossibleMove, movePlayer, toggleWall, moveIA: moveAI, turn, getAdjacentCellsPositionsWithWalls};