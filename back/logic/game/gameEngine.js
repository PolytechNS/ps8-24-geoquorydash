const gameManager = require('./gameManager');
const fogOfWar = require('./fogOfWarController');
const { arrayOfPositionContainsPosition, arePositionsEquals } = require('../../utils/utils.js');

// let player1, player2, currentPlayer, otherPlayer, gameActive = true;

function initializeGame(options) {
    // gameActive = true;
    if (options.defaultOption) {
        fogOfWar.initializeDefaultFogOfWar(options.id);
        if (options.onlineGameOption) {
            gameManager.initializeDefaultOnlineGameState(options.id);
        } else {
            gameManager.initializeDefaultGameState(options.id);
        }
    }
    // try {
    //     player1 = gameManager.gameStateList[options.id].players[0];
    //     player2 = gameManager.gameStateList[options.id].players[1];
    // } catch (error) {
    //     console.error("Error initializing game:", error);
    // }
    // // print all the keys
    // currentPlayer = player1.isCurrentPlayer ? player1 : player2;
    // otherPlayer = currentPlayer === player1 ? player2 : player1;
    console.log("Game initialized avec id ", options.id, gameManager.gameStateList[options.id]);
}

function movePlayer(targetPosition, gameStateId) {
    if (!gameManager.isGameActive(gameStateId)) return;

    const gameState = gameManager.gameStateList[gameStateId];
    const currentPlayer = gameManager.getCurrentPlayer(gameStateId);

    currentPlayer.position = targetPosition;

    if (currentPlayer === gameState.players[0] && targetPosition.x === 16) {
        console.log("Player 1 wins");
        endGame(gameStateId);
        return currentPlayer;
    } else if (currentPlayer === gameState.players[1] && targetPosition.x === 0) {
        console.log("Player 2 wins");
        endGame(gameStateId);
        return currentPlayer;
    }
}

function moveAI(id) {
    let currentPlayer = gameManager.getCurrentPlayer(id);
    const iaMove = gameManager.computeMoveForAI(getAdjacentCellsPositionsWithWalls, id);
    return movePlayer(iaMove, id);
}

function toggleWall(wall, isVertical, onlineGameOption, gameStateID) {
    if (!gameManager.isGameActive(gameStateID)) return;

    var walls = gameManager.getBoardWalls(gameStateID);
    for (const wallCell of wall) {
        walls.push(wallCell);
    }

    if(canPlayerReachArrival(walls, gameStateID)) {
        var response = updateWalls(wall, isVertical, onlineGameOption, gameStateID);
        if (response) {
            return response;
        }
        return 1;
    }
    return 0;
}

function updateWalls(wall, isVertical, onlineGameOption, gameStateID) {
    gameManager.getCurrentPlayer(gameStateID).walls.push(wall);
    fogOfWar.adjustVisibilityForWalls(wall, isVertical, gameStateID);
    if (!onlineGameOption) {
        return turn(gameStateID);
    }
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

function canPlayerReachArrival(walls, gameStateID) {
    let alreadyVisitedCell = []; // La liste des cases que l'on va visiter
    let canReach = false;
    let canReachPlayer1 = checkPathToReachTheEnd(gameManager.gameStateList[gameStateID].players[0].position, alreadyVisitedCell, "player1", walls);
    alreadyVisitedCell = [];
    let canReachPlayer2 = checkPathToReachTheEnd(gameManager.gameStateList[gameStateID].players[1].position, alreadyVisitedCell, "player2", walls);
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

function turn(id) {
    if (!gameManager.isGameActive(id)) return;

    // On change le joueur courant car on change de tour
    for (let player of gameManager.gameStateList[id].players) {
        player.isCurrentPlayer = !player.isCurrentPlayer;
    }
    let otherPlayer = gameManager.getOtherPlayer(id);
    let currentPlayer = gameManager.getCurrentPlayer(id);

    var response = moveAI(id); // On fait bouger l'IA
    if (response) return response;

    // On change le joueur courant car on change de tour
    for (let player of gameManager.gameStateList[id].players) {
        player.isCurrentPlayer = !player.isCurrentPlayer;
    }
    otherPlayer = gameManager.getOtherPlayer(id);
    currentPlayer = gameManager.getCurrentPlayer(id);
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

module.exports = {getPossibleMove, movePlayer, toggleWall, moveIA: moveAI, turn, initializeGame, changeCurrentPlayer};