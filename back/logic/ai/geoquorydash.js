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

function dijkstraAlgorithm(position) {
    // Initialisation des variables
    let alreadyVisitedCells = [];
    let cellsWithWeights = [];
    /* cellsWithWeights est un tableau de structure de la forme { position: position, pathLength: pathLength, predecessor: predecessor } avec
    position la case concernée, pathLength la distance pour atteindre cette case depuis notre position de base, et predecessor la case qui précède
    la case dont on est en train de calculer le chemin */
    let pathLength = 0;
    cellsWithWeights.push([position, pathLength])

    // On commence à travailler
    let shortestPathFinalPosition = getShortestPathFinalPosition(position, alreadyVisitedCells, cellsWithWeights, pathLength);

    console.log("Le chemin le plus court pour atteindre l'arrivée est de longueur " + shortestPathLength);

    let shortestPath = reconstructPath(shortestPathFinalPosition, cellsWithWeights);
    console.log("Le prochain mouvement à faire est donc de se déplacer en " + shortestPath[0]);
}

function getShortestPathFinalPosition(position, alreadyVisitedCells, cellsWithWeights, pathLength) {
    while(position.x !== 16) {
        updateWeightsFromACell(position, alreadyVisitedCells, cellsWithWeights, pathLength + 1);
        position = getNextCellToWorkOn(alreadyVisitedCells, cellsWithWeights);
    }
    
    // Si on sort de la boucle while, ça veut dire qu'on a trouvé une cellule qui a un x qui vaut 16, donc une case qui nous fait gagner
    let finalPositionCell = cellsWithWeights.find(cell => equalsPositions(cell.position, position));
    return finalPositionCell.position;
}

// Cette fonction sert, pour une cellule donnée, à mettre à jour le poids de ses voisins, voisins pour lesquels on a encore jamais calculé le poids de ses voisins à lui
function updateWeightsFromACell(position, alreadyVisitedCells, cellsWithWeights, pathLength) {
    let adjacentCellsPosition = getAdjacentCellsPositionsWithWalls(position);
    adjacentCellsPosition.forEach(adjacentPosition => {
        if(!alreadyVisitedCells.some(cell => equalsPositions(cell, adjacentPosition))) { // On vérifie que la cellule pour laquelle on update le pathLength n'est pas une cellule sur laquelle on a déjà travaillé

            let existingCell = cellsWithWeights.find(cell => equalsPositions(cell.position, adjacentPosition));
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

function reconstructPath(shortestPathFinalPosition, cellsWithWeights) {
    let path = [];
    let current = shortestPathFinalPosition;

    while (current) {
        path.unshift(current); // Ajoute la position actuelle au début du chemin
        let cell = cellsWithWeights.find(cell => equalsPositions(cell.position, current));
        current = cell ? cell.predecessor : null; // Définit la position actuelle sur le prédécesseur
    }

    return path;
}













































function canPlayerReachArrival() {
    const currentPosition = iaPlayer.position; // A modifier car ce n'est pas comme ça qu'on récupère la position du joueur
    let alreadyVisitedCell = []; // La liste des cases que l'on va visiter avec le nombre de coups nécessaire pour les visiter
    let canReach = false;
    let pathLength = 0;

    canReach = checkPathToReachTheEnd(currentPosition, alreadyVisitedCell, firstToPlay);
}

function checkPathToReachTheEnd(currentPosition, alreadyVisitedCell, firstToPlay) {
    if(alreadyVisitedCell.includes(currentPosition)) { // Dans ce cas là, la cellule a déjà été visitée
        return false;
    }

    const [x, y] = [currentPosition.x, currentPosition.y];
    if ((firstToPlay && x === 16) || (!firstToPlay && x === 0)) {
        return true; // A modifier mais dire que c'est vers ces cases là qu'il faut aller
    }

    alreadyVisitedCell.push({position: currentPosition, length: pathLength + 1});
    const neighborsList = getNeighborsWithBarriers(currentPosition);
    for (const neighbor of neighborsList) {
        if (checkPathToReachTheEnd(neighbor, alreadyVisitedCell, player)) {
            return true;
        }
    }
    return false;
}

exports.setup = setup;
exports.nextMove = nextMove;
exports.correction = correction;
exports.updateBoard = updateBoard;


gameState = {
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
};

move = {
    action: null,
    value: null
};
