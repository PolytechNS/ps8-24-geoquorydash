const gameManager = require('./gameManager');
const fogOfWar = require('./fogOfWarController');
const socketIo = require('socket.io');
const { arrayOfPositionContainsPosition, arePositionsEquals } = require('../../utils/utils.js');
const { parseJSON } = require('../../utils/utils.js');
const createUserCollection = require("../../models/users");

let player1, player2, currentPlayer, otherPlayer, gameActive = true;

async function initializeGame() {
    await gameManager.initialize();
    await fogOfWar.initializeFogOfWar();
    player1 = gameManager.getPlayerById('ia');
    player2 = gameManager.getPlayerById('p2');
    currentPlayer = gameManager.getCurrentPlayer();
    otherPlayer = player1;
}

/*initializeGame().then(() => {
    console.log('Initialisation terminée.');
    console.log(player1, player2, currentPlayer, otherPlayer, gameActive);

}).catch((error) => {
    console.error('Erreur lors de l\'initialisation du jeu :', error);
});*/

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

function moveAI() {
    currentPlayer = gameManager.getCurrentPlayer();
    const iaMove = gameManager.computeMoveForAI(getAdjacentCellsPositionsWithWalls);
    movePlayer(iaMove);
}

function toggleWall(wall, isVertical) {
    if (!gameActive) return;

    var walls = gameManager.getBoardWalls();
    for (const wallCell of wall) {
        walls.push(wallCell);
    }

    if(canPlayerReachArrival(walls)) {
        var response = updateWalls(wall, isVertical);
        if (response) {
            return response;
        }
        return 1;
    }
    return 0;
}

function updateWalls(wall, isVertical) {
    currentPlayer.walls.push(wall);
    fogOfWar.adjustVisibilityForWalls(wall, isVertical);
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

function turn() {
    if (!gameActive) return;

    // On change le joueur courant car on change de tour
    for (let player of gameManager.getGameState().players) {
        player.isCurrentPlayer = !player.isCurrentPlayer;
    }
    otherPlayer = currentPlayer;
    currentPlayer = gameManager.getCurrentPlayer();

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
    gameManager.endGame();
    fogOfWar.endGame();
}

async function newGame(req, res) {
    parseJSON(req, async (err, { gameState, visibilityMap  }) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }
        try {
            gameActive = true;
            const usersCollection = await createUserCollection();
            gameManager.gameState = {
                players: [
                    {
                        id: "ia",
                        position: { x: 0, y: 8 },
                        walls: [],
                        isCurrentPlayer: false
                    },
                    {
                        id: "p2",
                        position: { x: 16, y: 8 },
                        walls: [],
                        isCurrentPlayer: true
                    }
                ]
            };
            fogOfWar.visibilityMap = [];
            for (let i = 0; i < (9*9); i++) {
                fogOfWar.visibilityMap[i] = [];
                if (i < 36) {
                    fogOfWar.visibilityMap[i] = 1; // Visibility +1
                } else if (i <= 44) {
                    fogOfWar.visibilityMap[i] = 0; // Visibility 0
                } else {
                    fogOfWar.visibilityMap[i] = -1; // Visibility -1
                }
            }
            await usersCollection.updateOne({ username: "lucie" }, { $set: { gameState: gameManager.gameState, visibilityMap: fogOfWar.visibilityMap } });
            // console.log('User gameState:', gameManager.gameState);
            // console.log('User visibilityMap:', fogOfWar.visibilityMap);
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Game state updated successfully');
        } catch (error) {
            console.error('Error updating game state:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal server error');
        }
    });
}

module.exports = {getPossibleMove, movePlayer, toggleWall, moveIA: moveAI, turn, initializeGame, newGame};