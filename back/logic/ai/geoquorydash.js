let iaPlayer = null; // A initialiser plus tard, mais en gros ce joueur sera l'ia
let firstToPlay = false;

async function setup(AIplay) { // AIplay vaut 1 si l'ia joue en premier, et 2 sinon
    let position = null;
    if(AIplay === 1) { // L'ia joue en premier
        firstToPlay = true;
        position = {x: 0, y: 8}
    } else {
        position = {x: 0, y: 8}
    }
    stringPosition = `${position.x}${position.y}`
    return stringPosition;
}

async function nextMove(gameState) {

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

    console.log("Le chemin le plus court pour gagner mène à la case de coordonnées x = " + shortestPathFinalPosition.x + " et y = " + shortestPathFinalPosition.y);

    let shortestPath = reconstructPath(position, shortestPathFinalPosition, cellsWithWeights);
    console.log("Le prochain mouvement à faire est donc de se déplacer en x : " + shortestPath[0].x + ", y : " + shortestPath[0].y);
    return shortestPath[0];
}

function getShortestPathFinalPosition(position, alreadyVisitedCells, cellsWithWeights, pathLength, getAdjacentCellsPositionsWithWalls) {
    while(position.x !== 16) {
        updateWeightsFromACell(position, alreadyVisitedCells, cellsWithWeights, pathLength + 1, getAdjacentCellsPositionsWithWalls);
        position = getNextCellToWorkOn(alreadyVisitedCells, cellsWithWeights);
    }
    
    // Si on sort de la boucle while, ça veut dire qu'on a trouvé une cellule qui a un x qui vaut 16, donc une case qui nous fait gagner
    let finalPositionCell = cellsWithWeights.find(cell => equalsPositions(cell.position, position));
    return finalPositionCell.position;
}

// Cette fonction sert, pour une cellule donnée, à mettre à jour le poids de ses voisins, voisins pour lesquels on a encore jamais calculé le poids de ses voisins à lui
function updateWeightsFromACell(position, alreadyVisitedCells, cellsWithWeights, pathLength, getAdjacentCellsPositionsWithWalls) {
    let adjacentCellsPosition = getAdjacentCellsPositionsWithWalls(position);
    adjacentCellsPosition.forEach(adjacentPosition => {
        if(!alreadyVisitedCells.some(cell => equalsPositions(cell, adjacentPosition))) { // On vérifie que la cellule pour laquelle on update le pathLength n'est pas une cellule sur laquelle on a déjà travaillé
            let existingCell = null;
            if(cellsWithWeights.length !== 0) {
                console.log
                existingCell = cellsWithWeights.find(cell => equalsPositions(cell.position, adjacentPosition));
            }
            if (existingCell) {
                if (existingCell.pathLength > pathLength) {
                    existingCell.pathLength = pathLength;
                    existingCell.predecessor = position;
                }
            } else {
                cellsWithWeights.push({ position: adjacentPosition, pathLength: pathLength, predecessor: position });
            }
        }
    });
    alreadyVisitedCells.push(position);
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


/*gameState = {
    opponentWalls: [
        {
            position: null,
            isVerticalOrHorizontal: null    // 0 si horizontal, 1 sinon
        }
    ],
    ownWalls: [
        {
            position: null,
            isVerticalOrHorizontal: null    // 0 si horizontal, 1 sinon
        }
    ],
    board: [[]]
};*/

move = {
    action: null,
    value: null
};

module.exports = { dijkstraAlgorithm };