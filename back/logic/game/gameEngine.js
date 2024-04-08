const gameManager = require('./gameManager');
const fogOfWar = require('./fogOfWarController');
const { arrayOfPositionContainsPosition, arePositionsEquals } = require('../../utils/utils.js');

// let player1, player2, currentPlayer, otherPlayer, gameActive = true;

function initializeGame(options) {
    if (options.defaultOption) {
        fogOfWar.initializeDefaultFogOfWar(options.id);
        if (options.onlineGameOption) {
            gameManager.initializeDefaultOnlineGameState(options.id);
        } else {
            gameManager.initializeDefaultGameState(options.id);
        }
    }
}

function movePlayer(targetPosition, gameStateId) {
    if (!gameManager.isGameActive(gameStateId)) return;

    const gameState = gameManager.gameStateList[gameStateId];
    const currentPlayer = gameManager.getCurrentPlayer(gameStateId);
    currentPlayer.position = targetPosition;
    if (currentPlayer === gameState.players.find(player => player.id === 'player1') && targetPosition.x === 16) {
        // console.log("Player 1 wins");
        // console.log(currentPlayer);

        endGame(gameStateId);
        return currentPlayer;
    } else if (currentPlayer === gameState.players.find(player => player.id === 'player2') && targetPosition.x === 0) {
        // console.log("Player 2 wins");
        endGame(gameStateId);
        return currentPlayer;
    }
}

function moveAI(id) {
    console.log("id de la game d'apres l'ia ", id);
    // Quand on fait ce move, nous sommes l'ia, donc le joueur local correspond au joueur adverse
    let currentPlayer = gameManager.getCurrentPlayer(id);
    // console.log("Id du joueur : " + currentPlayer.id);
    const iaMove = gameManager.computeMoveForAI(fogOfWar.visibilityMapObjectList[id].visibilityMap, id);
    // console.log(iaMove);
    // console.log("Nature du move de " + currentPlayer.id + " : " + iaMove.action);
    if(iaMove.action === "move") {
        let targetPosition = convertTeacherPositionToMyPosition(iaMove.value);
        return movePlayer(targetPosition, id) ?
            "endGame" :
            {
                action : iaMove.action,
                value: targetPosition
            };
    } else if(iaMove.action === "wall") {
        let topLeftCornerPosition = convertTeacherPositionToMyPosition(iaMove.value[0]);
        let wallToInstall = convertTopLeftCornerWallToOurWall(topLeftCornerPosition, iaMove.value[1]);
        let isVertical = true;
        if(iaMove.value[1] === 0) {
            isVertical = false;
        }
        return toggleWall(wallToInstall, isVertical, false, id) ?
            {   action : iaMove.action,
                value: wallToInstall,
                isVertical: isVertical
            }
            : "wallNotToggled";
    }
}

function toggleWall(wall, isVertical, onlineGameOption, id) {
    if (!gameManager.isGameActive(id)) return;
    console.log("JE PRINT LE MUR ",wall);
    var walls = gameManager.getBoardWalls(id);
    for (const wallCell of wall) {
        // console.log("Je push une case en mur");
        walls.push(wallCell);
    }

    if(canPlayerReachArrival(walls, id)) {
        console.log("Mon mur a bien été posé");
        updateWalls(wall, isVertical, onlineGameOption, id);
        // if (response) {
        //     return response;
        // }
        return 1;
    }
    return 0;
}

function updateWalls(wall, isVertical, onlineGameOption, gameStateID) {
    gameManager.getCurrentPlayer(gameStateID).walls.push(wall);
    fogOfWar.adjustVisibilityForWalls(wall, isVertical, gameStateID);
    // if (!onlineGameOption) {
    //     return turn(gameStateID);
    // }
}

function checkBarriersBetween(startPosition, targetPosition, object) {
    const [x1, y1] = [startPosition.x, startPosition.y];
    const [x2, y2] = [targetPosition.x, targetPosition.y];

    const interX = x1 + (x2 - x1) / 2;
    const interY = y1 + (y2 - y1) / 2;
    let possibleWallPosition = {x: interX, y: interY};

    const boardWalls = object.walls ? object.walls : gameManager.getBoardWalls(object.id);
    return arrayOfPositionContainsPosition(boardWalls, possibleWallPosition);
}

function getPossibleMove(id) {
    if (!gameManager.isGameActive(id)) return;
    console.log("Je suis dans getPossibleMove");
    let possibleMove = [];
    let currentPlayer = gameManager.getCurrentPlayer(id);
    let otherPlayer = gameManager.getOtherPlayer(id);
    const adjacentCellsPositionsWithWalls = getAdjacentCellsPositionsWithWalls(currentPlayer.position, {id: id});
    if(isOtherPlayerOnAdjacentCells(adjacentCellsPositionsWithWalls, id)) {
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
        if(!checkBarriersBetween(otherPlayer, forwardPosition, {walls: null, id: id})) {
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

function isOtherPlayerOnAdjacentCells(currentPlayerAdjacentCells, id) {
    if (!gameManager.isGameActive(id)) return;

    return arrayOfPositionContainsPosition(currentPlayerAdjacentCells, gameManager.getOtherPlayer(id).position);
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

function getAdjacentCellsPositionsWithWalls(cellPosition, object) {
    const adjacentCellsPositionsWithWalls = [];
    const adjacentCellsPositions = getAdjacentCellsPositions(cellPosition);
    for(const adjacentCellPosition of adjacentCellsPositions) {
        if(!checkBarriersBetween(cellPosition, adjacentCellPosition, object)) {
            adjacentCellsPositionsWithWalls.push(adjacentCellPosition);
        }
    }
    return adjacentCellsPositionsWithWalls;
}

function canPlayerReachArrival(walls, id) {
    // console.log(gameManager.gameStateList[id].players[1]);

    let alreadyVisitedCell = []; // La liste des cases que l'on va visiter
    let canReach = false;
    let canReachPlayer1 = checkPathToReachTheEnd(gameManager.gameStateList[id].players[0].position, alreadyVisitedCell, "player1", walls);
    alreadyVisitedCell = [];
    // console.log(gameManager.gameStateList[id].players[1]);
    let canReachPlayer2 = checkPathToReachTheEnd(gameManager.gameStateList[id].players[1].position, alreadyVisitedCell, "player2", walls);
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
    const adjacentCellsPositions = getAdjacentCellsPositionsWithWalls(currentPosition, {walls: walls});
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

async function turn(id) {
    if (!gameManager.isGameActive(id)) return;

    // On change le joueur courant car on change de tour
    for (let player of gameManager.gameStateList[id].players) {
        player.isCurrentPlayer = !player.isCurrentPlayer;
    }

    // let otherPlayer = gameManager.getOtherPlayer(id);
    // let currentPlayer = gameManager.getCurrentPlayer(id);

    var response = await moveAI(id); // On fait bouger l'IA
    if (response) return response;

    // On change le joueur courant car on change de tour
    for (let player of gameManager.gameStateList[id].players) {
        player.isCurrentPlayer = !player.isCurrentPlayer;
    }
    // otherPlayer = gameManager.getOtherPlayer(id);
    // currentPlayer = gameManager.getCurrentPlayer(id);
}

function changeCurrentPlayer(gameStateID) {
    gameManager.gameStateList[gameStateID].players.forEach(player => {
        player.isCurrentPlayer = !player.isCurrentPlayer;
    });
    // currentPlayer = gameManager.getCurrentPlayer(gameStateID);
    // otherPlayer = gameManager.getOtherPlayer(gameStateID);
}

function endGame(id) {
    // gameActive = false;
    gameManager.endGame(id);
}

module.exports = {getPossibleMove, movePlayer, toggleWall, moveAI, turn, initializeGame, changeCurrentPlayer};