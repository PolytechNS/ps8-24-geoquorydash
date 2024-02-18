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
    let pathLength = 0;
    cellsWithWeights.push([position, pathLength])

    // On commence à travailler
    let shortestPathLength = getShortestPathLength(position, alreadyVisitedCells, cellsWithWeights, pathLength);

    console.log("Le chemin le plus court pour atteindre l'arrivée est de longueur " + shortestPathLength);
}

function getShortestPathLength(position, alreadyVisitedCells, cellsWithWeights, pathLength) {
    while(position.x !== 16) {
        updateWeightsFromACell(position, alreadyVisitedCells, cellsWithWeights, pathLength + 1);
        position = getNextCellToWorkOn(alreadyVisitedCells, cellsWithWeights);
    }
    
    // Si on sort de la boucle while, ça veut dire qu'on a trouvé une cellule qui a un x qui vaut 16, donc une case qui nous fait gagner
    let shortestPathLength = 0;
    cellsWithWeights.forEach(element => {
        if(equalsPositions(element[0], position)) {
            shortestPathLength = element[1];
        }
    });

    return shortestPathLength;
}

// Cette fonction sert, pour une cellule donnée, à mettre à jour le poids de ses voisins, voisins pour lesquels on a encore jamais calculé le poids de ses voisins à lui
function updateWeightsFromACell(position, alreadyVisitedCells, cellsWithWeights, pathLength) {
    let adjacentCellsPosition = getAdjacentCellsPositionsWithWalls(position);
    adjacentCellsPosition.forEach(adjacentPosition => {
        if(!alreadyVisitedCells.includes(adjacentPosition)) { // On vérifie que la cellule pour laquelle on update le pathLength n'est pas une cellule sur laquelle on a déjà travaillé
            
            alreadyVisitedCells.push(position);
            cellsWithWeights.forEach(element => {
                if(equalsPositions(element[0], adjacentPosition)) {
                    if(element[1] > pathLength) {
                        element[1] = pathLength;
                    }
                    return;
                }
            });
            cellsWithWeights.push([adjacentPosition, pathLength]);
        }
        
    });
}

function getNextCellToWorkOn(alreadyVisitedCells, cellsWithWeights) {
    let minimumWeightCell = null;
    let minimumWeight = 9999;
    cellsWithWeights.forEach(element => {
        if(!alreadyVisitedCells.includes(element[0])) { // On vérifie qu'on ne va pas travailler sur une cellule sur laquelle on a déjà travaillé
            if(element[1] < minimumWeight) {
                minimumWeight = element[1];
                minimumWeightCell = element[0];
            }
        }
    });

    return minimumWeightCell;
}

function equalsPositions(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
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
