const gameManager = require('../game/gameManager');

let iaPlayer = null; // A initialiser plus tard, mais en gros ce joueur sera l'ia
let firstToPlay = false;


move = {
    action: null,
    value: null
};

async function setup(AIplay) { // AIplay vaut 1 si l'ia joue en premier, et 2 sinon
    let stringPosition = null;
    if(AIplay === 1) { // L'ia joue en premier
        firstToPlay = true;
        stringPosition = "51";
    } else {
        stringPosition = "59";
    }
    return stringPosition;
}

async function nextMove(gameStateTeacher) {
    let stringNextPositionToGo = await gameManager.computeMyAINextMove(gameStateTeacher, getAdjacentCellsPositionsWithWalls);
    return {action: "move", value: stringNextPositionToGo};
}

async function correction(rightMove) {

}

async function updateBoard(gameState) {

}

function dijkstraAlgorithm(position, getAdjacentCellsPositionsWithWalls) {
    // Initialisation des variables
    let alreadyVisitedCells = [];
    let cellsWithWeights = [];
    /* cellsWithWeights est un tableau de structure de la forme { position: position, pathLength: pathLength, predecessor: predecessor } avec
    position la case concernée, pathLength la distance pour atteindre cette case depuis notre position de base, et predecessor la case qui précède
    la case dont on est en train de calculer le chemin */
    let pathLength = 0;
    cellsWithWeights.push({position: position, pathLength: pathLength, predecessor: null});

    // On commence à travailler
    let shortestPathFinalPosition = getShortestPathFinalPosition(position, alreadyVisitedCells, cellsWithWeights, pathLength, getAdjacentCellsPositionsWithWalls);

    //console.log("Le chemin le plus court pour gagner mène à la case de coordonnées x = " + shortestPathFinalPosition.x + " et y = " + shortestPathFinalPosition.y);

    let shortestPath = reconstructPath(position, shortestPathFinalPosition, cellsWithWeights);
    //console.log("Le prochain mouvement à faire est donc de se déplacer en x : " + shortestPath[0].x + ", y : " + shortestPath[0].y);
    return shortestPath[0];
}

function getShortestPathFinalPosition(position, alreadyVisitedCells, cellsWithWeights, pathLength, getAdjacentCellsPositionsWithWalls) {
    let currentPosition = {x: position.x, y: position.y};

    let AIwinningPosition = null;
    if(firstToPlay) {
        AIwinningPosition = 0;
    } else {
        AIwinningPosition = 16;
    }

    while(currentPosition.x !== AIwinningPosition) {
        updateWeightsFromACell(currentPosition, alreadyVisitedCells, cellsWithWeights, pathLength + 1, getAdjacentCellsPositionsWithWalls);
        currentPosition = getNextCellToWorkOn(alreadyVisitedCells, cellsWithWeights);
    }
    
    // Si on sort de la boucle while, ça veut dire qu'on a trouvé une cellule qui a un x qui vaut 16, donc une case qui nous fait gagner
    let finalPositionCell = cellsWithWeights.find(cell => equalsPositions(cell.position, currentPosition));
    return finalPositionCell.position;
}

// Cette fonction sert, pour une cellule donnée, à mettre à jour le poids de ses voisins, voisins pour lesquels on a encore jamais calculé le poids de ses voisins à lui
function updateWeightsFromACell(currentPosition, alreadyVisitedCells, cellsWithWeights, pathLength, getAdjacentCellsPositionsWithWalls) {
    alreadyVisitedCells.push(currentPosition);
    
    let currentCell = cellsWithWeights.find(cell => equalsPositions(cell.position, currentPosition));
    let currentPathLength = currentCell ? currentCell.pathLength : 0;

    let adjacentCellsPosition = getAdjacentCellsPositionsWithWalls(currentPosition);
    adjacentCellsPosition.forEach(adjacentPosition => {
        
        if (!alreadyVisitedCells.some(cell => equalsPositions(cell, adjacentPosition))) {
            let existingCell = cellsWithWeights.find(cell => equalsPositions(cell.position, adjacentPosition));

            // Le nouveau pathLength est le pathLength de la cellule actuelle + 1 (coût de déplacement)
            let newPathLength = currentPathLength + 1;

            if (existingCell) {
                if (existingCell.pathLength > newPathLength) {
                    existingCell.pathLength = newPathLength;
                    existingCell.predecessor = currentPosition;
                }
            } else {
                cellsWithWeights.push({ position: adjacentPosition, pathLength: newPathLength, predecessor: currentPosition });
            }
        }
    });
}

function getNextCellToWorkOn(alreadyVisitedCells, cellsWithWeights) {
    let minimumWeightCell = null;
    let minimumWeight = 9999;
    cellsWithWeights.forEach(element => {
        if(!alreadyVisitedCells.some(cell => equalsPositions(cell, element.position))) { // On vérifie qu'on ne va pas travailler sur une cellule sur laquelle on a déjà travaillé
            if(element.pathLength < minimumWeight) {
                minimumWeight = element.pathLength;
                minimumWeightCell = element.position;
            }
        }
    });

    return minimumWeightCell;
}

function equalsPositions(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
}

function reconstructPath(position, shortestPathFinalPosition, cellsWithWeights) {
    let path = [];
    let current = shortestPathFinalPosition;

    while (!equalsPositions(current, position)) {
        path.unshift(current); // Ajoute la position actuelle au début du chemin
        let cell = cellsWithWeights.find(cell => equalsPositions(cell.position, current));
        current = cell ? cell.predecessor : null; // Définit la position actuelle sur le prédécesseur
    }

    return path;
}

exports.setup = setup;
exports.nextMove = nextMove;
exports.correction = correction;
exports.updateBoard = updateBoard;

module.exports = { dijkstraAlgorithm };