const gameManager = require('../game/gameManager');

let iaPlayer = null; // A initialiser plus tard, mais en gros ce joueur sera l'ia
let firstToPlay = false;


move = {
    action: null,
    value: null
};

async function setup(AIplay) { // AIplay vaut 1 si notre ia joue en premier, et 2 sinon
    let stringPosition = null;
    if(AIplay === 1) { // Notre ia joue en premier
        firstToPlay = true;
        stringPosition = "51";
    } else {
        stringPosition = "59";
    }
    initializeGameState();
    initializeGameStateTeacher();
    return stringPosition;
}

async function nextMove(gameStateTeacher) {
    let myGameState = this.convertGameStateTeacherToGameState(gameStateTeacher);

    if(canSeeTheOtherPlayer()) {
        // On fait un dijkstra pour l'autre joueur pour savoir s'il atteint la victoire plus rapidement que nous ou pas
        let otherPlayer = getOtherPlayer();
        let otherPosition = otherPlayer.position;
        let shortestPathForOtherPlayer = dijkstraAlgorithm(otherPosition, getAdjacentCellsPositionsWithWalls);
        let shortestPathLengthForOtherPlayer = shortestPathForOtherPlayer.length;

        let iaPlayer = getIAPlayer();
        let iaPosition = iaPlayer.position;
        let shortestPathForIA = dijkstraAlgorithm(iaPosition, getAdjacentCellsPositionsWithWalls);
        let shortestPathLengthForIA = shortestPathForIA.length;

        if(shortestPathLengthForIA < shortestPathLengthForOtherPlayer) {
            // On va tenter de maximiser la longueur du chemin de l'adversaire, en tentant de poser un mur entre chacune des cases du chemin renvoyé
            // par son dijkstra, et on pose le mur qui allonge le plus son chemin
            let wallToInstall = chooseWallToInstallToIncreaseShortestPathLengthForOtherPlayer(shortestPathForOtherPlayer, shortestPathForIA);

            if(wallToInstall) { // On vérifie qu'un mur peut bien être posé sur le plus court chemin de l'adversaire pour le ralentir
                let wallToInstallForTeacher = convertOurWallToTopLeftCornerWall(wallToInstall);
                return {action: "wall", value: wallToInstallForTeacher};
            } else {
                let nextPositionToGo = dijkstraAlgorithm(iaPosition, getAdjacentCellsPositionsWithWalls)[0];
                let stringNextPositionToGo = convertMyPositionToTeacherPosition(nextPositionToGo);
                return {action: "move", value: stringNextPositionToGo};
            }
        } else {
            let nextPositionToGo = dijkstraAlgorithm(iaPosition, getAdjacentCellsPositionsWithWalls)[0];
            let stringNextPositionToGo = convertMyPositionToTeacherPosition(nextPositionToGo);
            return {action: "move", value: stringNextPositionToGo};
        }
    } else {
        let wallToInstallToSeeOtherPlayer = chooseWallToInstallToSeeOtherPlayer();
        let wallToInstallToSeeOtherPlayerForTeacher = convertOurWallToTopLeftCornerWall(wallToInstallToSeeOtherPlayer);


        return {action: "wall", value: wallToInstallToSeeOtherPlayerForTeacher};
    }
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
    return shortestPath;
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

function getIAPlayer() {
    return gameState.players.find(player => player.id === "ia");
}

function getOtherPlayer() {
    return gameState.players.find(player => player.id === "p2");
}

function canSeeTheOtherPlayer() {
    let otherPlayer = getOtherPlayer();
    if(otherPlayer.position) {      // Cela signifie que la position de notre joueur est non-nulle, donc qu'on la connais
        return true;
    }
    return false;
}

function chooseWallToInstallToIncreaseShortestPathLengthForOtherPlayer(shortestPathForOtherPlayer) {
    // Il faudra vérifier que les murs sont possibles à poser

    let maxDistanceToReachArrival = 0;
    let possibleWallToInstall = []; 
    let wallToInstall = null;
    // Si plusieurs murs sont possibles pour allonger de même longueur le chemin de l'adversaire, on choisi celui qui nous ralenti le moins nous

    for(let i = 0; i < shortestPathForOtherPlayer.length - 1; i++) {

        let wall = [];
        let currentCellPosition = shortestPathForOtherPlayer[i];
        let nextCellPosition = shortestPathForOtherPlayer[i + 1];

        let isVertical = true;
        if(currentCellPosition.y === nextCellPosition.y) {  // Dans ce cas là, le mur doit être horizontal. Sinon, il reste vertical
            isVertical = false;
        }

        let interX = currentCellPosition.x + (nextCellPosition.x - currentCellPosition.x) / 2;
        let interY = currentCellPosition.y + (nextCellPosition.y - currentCellPosition.y) / 2;
        // La position {interX, interY} représente la position entre les deux cases. Deux murs sont alors possible pour bloquer cette position

        wall = getWallThatCanBeInstalled(interX, interY, isVertical);
        if(wall) { // Si wall n'est pas null, c'est à dire qu'un mur peut être posé via la position {interX, interY}
            let IAplayer = getIAPlayer();
            IAplayer.walls.push(wall);  // On l'ajoute temporairement à la liste des murs de notre IA pour être pris en compte par le dijkstra à venir

            let otherPlayer = getOtherPlayer();
            let newShortestPathForOtherPlayer = dijkstraAlgorithm(otherPlayer.position, getAdjacentCellsPositionsWithWalls);
            let newShortestPathLengthForOtherPlayer = newShortestPathForOtherPlayer.length;

            if(newShortestPathLengthForOtherPlayer > maxDistanceToReachArrival) {
                possibleWallToInstall = [wall];
                maxDistanceToReachArrival = newShortestPathLengthForOtherPlayer;
            } else if(newShortestPathLengthForOtherPlayer === maxDistanceToReachArrival) {
                possibleWallToInstall.push(wall);
            }

            IAplayer.walls.pop();       // On retire le mur temporaire que l'on a ajouté plus tôt
        }
    }

    if(possibleWallToInstall.length === 0) {
        console.log("Aucun mur ne peut être posé tout au long du plus court chemin de l'adversaire, on ne peut pas le ralentir dans cette configuration");
        return null;
    } else if(possibleWallToInstall.length === 1) {
        return possibleWallToInstall[0];
    } else {
        // Dans ce cas là, plusieurs murs sont capables de ralentir autant les uns que les autres mon adversaire
        // On va alors choisir, parmi ces-derniers, celui qui nous ralenti le moins nous
        let minDistanceTorReachArrival = 9999;
        
        possibleWallToInstall.forEach(possibleWall => {
            let IAplayer = getIAPlayer();
            IAplayer.walls.push(possibleWall);

            let newShortestPathForIA = dijkstraAlgorithm(IAplayer.position, getAdjacentCellsPositionsWithWalls);
            let newShortestPathLengthForIA = newShortestPathForIA.length;

            if(newShortestPathLengthForIA < minDistanceTorReachArrival) {
                wallToInstall = possibleWall;
                minDistanceTorReachArrival = newShortestPathLengthForIA;
            }

            IAplayer.walls.pop();
        });
    }
    return wallToInstall;
}

function getWallThatCanBeInstalled(interX, interY, isVertical) {
    let wall = [];
    wall.push({x : interX, y : interY});

    // Dans ce cas là, on est dans un cas limite où un seul mur peut être posé
    if(interX === 0 || interX === 16 || interY === 0 || interY === 16) {
        if(interX === 0) {                              // Dans ce cas là, le mur est forcément vertical
            wall.push({x : interX + 1, y : interY});
            wall.push({x : interX + 2, y : interY});
        } else if(interX === 16) {                      // Dans ce cas là, le mur est forcément vertical
            wall.push({x : interX - 1, y : interY});
            wall.push({x : interX - 2, y : interY});
        } else if(interY === 0) {                       // Dans ce cas là, le mur est forcément horizontal
            wall.push({x : interX, y : interY + 1});
            wall.push({x : interX, y : interY + 2});
        } else if(interY === 16) {                      // Dans ce cas là, le mur est forcément horizontal
            wall.push({x : interX, y : interY - 1});
            wall.push({x : interX, y : interY - 2});
        }
        if(canWallBeInstalledOnBoard(wall)) {
            return wall;
        } else {
            return null;
        }
    }
    
    // Dans ce cas là, le mur peut être vertcal ou horizontal, et deux murs sont possibles
    if(isVertical) {
        wall.push({x : interX + 1, y : interY});
        wall.push({x : interX + 2, y : interY});
        if(canWallBeInstalledOnBoard(wall)) {
            return wall;
        } else {
            wall.pop();
            wall.pop();
            wall.push({x : interX - 1, y : interY});
            wall.push({x : interX - 2, y : interY});
            if(canWallBeInstalledOnBoard(wall)) {
                return wall;
            } else {
                return null;
            }
        }
    } else {
        wall.push({x : interX, y : interY + 1});
        wall.push({x : interX, y : interY + 2});
        if(canWallBeInstalledOnBoard(wall)) {
            return wall;
        } else {
            wall.pop();
            wall.pop();
            wall.push({x : interX, y : interY - 1});
            wall.push({x : interX, y : interY - 2});
            if(canWallBeInstalledOnBoard(wall)) {
                return wall;
            } else {
                return null;
            }
        }
    }
}

function chooseWallToInstallToSeeOtherPlayer() {
    let interestingWalls = getInterestingWallsToSeeOtherPlayer();
    interestingWalls.forEach(interestingWall => {
        if(canWallBeInstalledOnBoard(interestingWall)) {
            return interestingWall;
        }
    });
    console.log("Auncun mur intéréssant ne peut être posé");
    return null;
}

function getInterestingWallsToSeeOtherPlayer() {
    let wall1 = [{x : 2, y : 9}, {x : 3, y : 9}, {x : 4, y : 9}]; // Le mur vertical en bas à droite de la position de départ du joueur
    let wall2 = [{x : 2, y : 3}, {x : 3, y : 3}, {x : 4, y : 3}];
    let wall3 = [{x : 2, y : 15}, {x : 3, y : 15}, {x : 4, y : 15}];
    let interestingWalls = [wall1, wall2, wall3];
    return interestingWalls;
}

function canWallBeInstalledOnBoard(wallToInstall) {
    let boardWalls = getBoardWalls();
    boardWalls.forEach(boardWall => {
        if(!(equalsPositions(boardWall[1], wallToInstall[1])        // Les deux murs se chevaucheraient au milieu
        || equalsPositions(boardWall[2], wallToInstall[0])          // Le début de notre mur chevaucherait la fin du mur déjà posé
        || equalsPositions(boardWall[0], wallToInstall[2]))) {      // La fin de notre mur chevaucherait le début du mur déjà posé
            return true;
        }
    });
    return false;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////// CETTE SECTION EST DÉDIÉE AUX FONCTIONS COPIÉES D'AUTRE FICHIERS POUR RENDRE CELUI-CI PARFAITEMENT INDÉPENDANT DES AUTRES //////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Notre structure de gameState à nous
let gameState = {
    players: [
        {
        position: null,
        id: null,
        walls: [],
        isCurrentPlayer: false
        }
    ]
};

function initializeGameState() {
    // Object.assign permet de mettre à jour l'état existant de gameState et non de remplacer l'objet original gameState par un nouvel objet,
    // ce qui signifie que toutes les références précédentes à l'objet gameState pointeront bien vers le nouvel état de gameState et pas l'ancien
    Object.assign(gameState, {
        players: [
            {
                id: "ia",                           // Dans ce fichier, l'ia c'est nous
                position: { x: 16, y: 8 },          // donc on se place en bas du plateau
                walls: [],
                isCurrentPlayer: firstToPlay        // Cette variable est définie via isFirstToPlay, indiquant si notre IA joue en 1er ou non
            },
            {
                id: "p2",                           // Dans ce fichier, le p2 c'est l'ia adverse
                position: null,                     // donc on ne sait pas au départ où il se trouve
                walls: [],
                isCurrentPlayer: !firstToPlay       // Comme isFirstToPlay indique si notre IA joue en premier ou non, c'est l'inverse de cette valeur
            }
        ]
    });
}

// La structure de gameState du prof
let gameStateTeacher = {
    opponentWalls: [[]], // contient une position et un isVertical
    ownWalls: [[]], // pareil
    board: [[]]
};

// Cette fonction permet d'initialiser la structure gameStateTeacher en initialisant le plateau de jeu
function initializeGameStateTeacher() {
    gameStateTeacher.opponentWalls = [];        // Au départ, c'est un tableau vide car il n'y a aucun mur

    gameStateTeacher.ownWalls = [];             // Idem
    
    let finalBoard = [];
    let intermediateBoard;
    for(let i = 0; i < 9; i++) {
        intermediateBoard = [];
        for(let j = 0; j < 9; j++) {
            if(i < 5) {
                intermediateBoard.push(0);
            } else {
                intermediateBoard.push(-1);
            }
        }
        finalBoard.push(intermediateBoard);
    }
    finalBoard[0][4] = 1;               // On initialise notre position au bas du plateau
    // finalBoard[8][4] = 2;            // On ne peut pas savoir dès le début où se trouve le joueur adverse, représenté par un 2
    gameStateTeacher.board = finalBoard;
}

// Cette méthode récupère le gameStateTeacher du prof et le convertit en un gameState de notre forme à nous
function convertGameStateTeacherToGameState() {
    let IAplayer = getIAPlayer();
    IAplayer.walls = [];
    IAplayer.walls = reconstructWallsListWithTopLeftCorners(gameStateTeacher.ownWalls);

    let otherPlayer = getOtherPlayer();
    otherPlayer.walls = [];
    otherPlayer.walls = reconstructWallsListWithTopLeftCorners(gameStateTeacher.opponentWalls);

    IAplayer.position = null;       // On réinitialise cette position dans le doute mais elle ne devrait jamais être null
    otherPlayer.position = null;    // On réinitialise cette position à null car le joueur adverse a pu disparaître entre temps
    for(let i = 0; i < 9; i++) {
        for(let j = 0; j < 9; j++) {
            if(gameStateTeacher.board[i][j] === 1) {           // Dans ce cas, il s'agit de la case sur laquelle mon bot se trouve
                teacherPositionForIA = `${i}${j}`;
                myPositionForIA = convertTeacherPositionToMyPosition(teacherPositionForIA);
                IAplayer.position = myPositionForIA;
            } else if(gameStateTeacher.board[i][j] === 2) {    // Dans ce cas, il s'agit de la case sur laquelle mon opposant se trouve
                teacherPositionForOtherPlayer = `${i}${j}`;
                myPositionForOtherPlayer = convertTeacherPositionToMyPosition(teacherPositionForOtherPlayer);
                otherPlayer.position = myPositionForOtherPlayer;
            }
        }
    }
}

// Cette méthode permet de récupérer les murs du gameStateTeacher pour les placer aux bons endroits dans notre structure gameState
function reconstructWallsListWithTopLeftCorners(walls) {
    wallsList = [];
    walls.forEach(wall => {
        let oneWall = null;
        topLeftCornerPosition = convertTeacherPositionToMyPosition(wall[0]);
        if(wall[1] === 1) {     // Dans ce cas là, le mur est vertical
            oneWall = convertTopLeftCornerWallToOurWall(topLeftCornerPosition, true);
        } else {                // Dans ce cas là, le mur est horizontal
            oneWall = convertTopLeftCornerWallToOurWall(topLeftCornerPosition, false);
        }
        wallsList.push(oneWall);
    });
    return wallsList;
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
}

function convertOurWallToTopLeftCornerWall(wall) {
    let isVertical = 1;
    let topLeftSquarePosition = null;

    if(wall[0].x === wall[1].x) {
        // Dans ce cas là, le mur est horizontal
        isVertical = 0;
        topLeftSquarePosition = {x: wall[0].x - 1, y: wall[0].y};
    } else {
        // isVertical reste à 1
        topLeftSquarePosition = {x: wall[0].x, y: wall[0].y - 1};
    }
    let topLeftSquareTeacherPosition = this.convertMyPositionToTeacherPosition(topLeftSquarePosition);
    return [topLeftSquareTeacherPosition, isVertical];
}

// Cette méthode convertit les coordonnées du prof dans notre système de coordonnées à nous
function convertTeacherPositionToMyPosition(teacherPosition) {
    let xTeacherPosition = parseInt(teacherPosition[0]);
    let yTeacherPosition = parseInt(teacherPosition[1]);
    let myPosition = {x: 2*(9 - yTeacherPosition), y: 2*(xTeacherPosition - 1)};
    return myPosition;
}

// Cette méthode convertir nos coordonnées à nous dans le système de coordonnées du prof
function convertMyPositionToTeacherPosition(myPosition) {
    let teacherPosition = {x: (myPosition.y / 2) + 1, y: 10 - ((myPosition.x / 2) + 1)};
    return `${teacherPosition.x}${teacherPosition.y}`;
}

// Cette méthode retourne la liste des positions voisines géographiques, peu importe les murs aux alentours, d'une position donnée
function getAdjacentCellsPositions(cellPosition) {
    let [xPosition, yPosition] = [cellPosition.x, cellPosition.y]

    const adjacentCells = [];

    if (xPosition > 0) adjacentCells.push({x: xPosition-2, y: yPosition});
    if (xPosition < 16) adjacentCells.push({x: xPosition+2, y: yPosition});
    if (yPosition > 0) adjacentCells.push({x: xPosition, y: yPosition-2});
    if (yPosition < 16) adjacentCells.push({x: xPosition, y: yPosition+2});

    return adjacentCells;
}

// Cette méthode retourne la liste des positions voisines, en prenant en compte les murs aux alentours, d'une position donnée
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

// Cette méthode vérifie si deux positions sont séparées par un mur ou non
function checkBarriersBetween(startPosition, targetPosition, walls) {
    const [x1, y1] = [startPosition.x, startPosition.y];
    const [x2, y2] = [targetPosition.x, targetPosition.y];

    const interX = x1 + (x2 - x1) / 2;
    const interY = y1 + (y2 - y1) / 2;
    let possibleWallPosition = {x: interX, y: interY};

    const boardWalls = walls ? walls : getBoardWalls();
    return arrayOfPositionContainsPosition(boardWalls, possibleWallPosition);
}

// Cette méthode vérifie si pour un tableau donné de positions, ce tableau contient une position donnée
function arrayOfPositionContainsPosition (array, position) {
    for (let i = 0; i < array.length; i++) {
        if (arePositionsEquals(array[i], position)) {
            return true;
        }
    }
    return false;
}

// Cette méthode vérifie si deux positions sont égales ou non
function arePositionsEquals (position1, position2) {
    return position1.x === position2.x && position1.y === position2.y;
}

// Cette méthode renvoi un tableau contenant 
function getBoardWalls() {
    let boardWalls = [];
    gameState.players.forEach(player => {
        player.walls.forEach(wall => {
            wall.forEach(cell => {
                boardWalls.push(cell);
            });
        });
    });
    return boardWalls;
}

exports.setup = setup;
exports.nextMove = nextMove;
exports.correction = correction;
exports.updateBoard = updateBoard;

module.exports = { dijkstraAlgorithm };