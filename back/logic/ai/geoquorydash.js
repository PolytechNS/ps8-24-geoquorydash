let iaPlayer = null; // A initialiser plus tard, mais en gros ce joueur sera l'ia
let firstToPlay = false;


move = {
    action: null,
    value: null
};

async function setup(AIplay) { // AIplay vaut 1 si notre ia joue en premier, et 2 sinon
    let stringPosition = null;
    if(AIplay === 1) { // Notre ia joue en premier
        console.log("On commence à jouer en premier");
        firstToPlay = true;
        stringPosition = "51";
    } else {
        console.log("On commence à jouer en deuxième");
        stringPosition = "59";
    }
    initializeGameState();
    // initializeGameStateTeacher();

    let IAplayer = getIAPlayer();
    let otherPlayer = getOtherPlayer();
    console.log("La position de mon joueur est " + printPosition(IAplayer.position));
    let otherPlayerPosition = otherPlayer.position;
    if(otherPlayerPosition) {
        console.log("La position du joueur adverse est " + printPosition(otherPlayer.position));
    } else {
        console.log("La position du joueur adverse est pour l'instant inconue");
    }

    console.log("Fin du setup\n");
    return stringPosition;
}

async function nextMove(gameStateTeacher) {
    console.log("On va calculer notre prochain mouvement, mais avant ça, on sait que :");
    convertGameStateTeacherToGameState(gameStateTeacher);

    let IAplayer = getIAPlayer();
    let otherPlayer = getOtherPlayer();
    console.log("Mon joueur possède actuellement " + IAplayer.walls.length + " murs");
    console.log("Le joueur adverse possède actuellement " + otherPlayer.walls.length + " murs");
    console.log("La position de mon joueur est " + printPosition(IAplayer.position));
    let otherPlayerPosition = otherPlayer.position;
    if(otherPlayerPosition) {
        console.log("La position du joueur adverse est " + printPosition(otherPlayer.position) + "\n");
    } else {
        console.log("La position du joueur adverse est pour l'instant inconue\n");
    }

    // let IAplayer = getIAPlayer();
    let shortestPathForIA = dijkstraAlgorithm(IAplayer);
    let shortestPathLengthForIA = shortestPathForIA.length;

    // Dans le cas où le joueur choisi d'avancer et non de poser un mur, ce sera forcément cette position
    let nextPositionToGo = shortestPathForIA[0];
    let stringNextPositionToGo = convertMyPositionToTeacherPosition(nextPositionToGo);

    // On vérifie que l'on peut encore poser des murs, et si on ne peut pas, on avance
    if(!canPlayerStillInstallWall(IAplayer.id)) {
        console.log("Je ne peux plus poser de murs, donc je dois forcément avancer en " + printPosition(nextPositionToGo));
        IAplayer.position = nextPositionToGo;
        return {action: "move", value: stringNextPositionToGo};
    }

    // Si on se retrouve là, c'est que le joueur peut encore poser des murs

    if(canSeeTheOtherPlayer()) {
        console.log("Je vois l'autre joueur, donc je vais comparer nos plus courts chemins");

        // On fait un shortestPath pour l'autre joueur pour savoir s'il atteint la victoire plus rapidement que nous ou pas
        // let otherPlayer = getOtherPlayer();
        // let otherPlayerPosition = otherPlayer.position;
        let shortestPathForOtherPlayer = dijkstraAlgorithm(otherPlayer);
        let shortestPathLengthForOtherPlayer = shortestPathForOtherPlayer.length;

        console.log("Mon plus court chemin est de taille " + shortestPathLengthForIA);
        console.log("Le plus court chemin de l'adversaire est " + shortestPathLengthForOtherPlayer);

        if(shortestPathLengthForIA > shortestPathLengthForOtherPlayer) {
            console.log("Le joueur adverse a un chemin plus court que le miens pour gagner");
            // On va tenter de maximiser la longueur du chemin de l'adversaire, en tentant de poser un mur entre chacune des cases du chemin renvoyé
            // par son shortestPath, et on pose le mur qui allonge le plus son chemin
            let wallToInstall = chooseWallToInstallToIncreaseShortestPathLengthForOtherPlayer(shortestPathForOtherPlayer, shortestPathForIA);

            // On vérifie qu'un mur peut bien être posé sur le plus court chemin de l'adversaire pour le ralentir
            if(wallToInstall) {
                let stringForWallToInstall = "[";
                wallToInstall.forEach(wall => {
                    stringForWallToInstall += printPosition(wall);
                    stringForWallToInstall += ","
                })
                stringForWallToInstall += "]";
                console.log("Le meilleur mur pour ralentir mon adversaire est en position " + stringForWallToInstall);
                // Si oui, on le pose
                IAplayer.walls.push(wallToInstall);

                let wallToInstallForTeacher = convertOurWallToTopLeftCornerWall(wallToInstall);
                return {action: "wall", value: wallToInstallForTeacher};
            }
        }

        console.log("J'ai un chemin plus court que celui de mon adversaire pour gagner");
        console.log("J'avance donc sur la case " + printPosition(nextPositionToGo));
        IAplayer.position = nextPositionToGo;
        return {action: "move", value: stringNextPositionToGo};

    } else {
        console.log("Je ne vois pas mon adversaire");
        let wallToInstallToSeeOtherPlayer = chooseWallToInstallToSeeOtherPlayer();
        let stringForWallToInstallToSeeOtherPlayer = "[";
                wallToInstallToSeeOtherPlayer.forEach(wall => {
                    stringForWallToInstallToSeeOtherPlayer += printPosition(wall);
                    stringForWallToInstallToSeeOtherPlayer += ","
                })
                stringForWallToInstallToSeeOtherPlayer += "]";
        console.log("Le meilleur mur à poser pour voir mon adversaire est " + stringForWallToInstallToSeeOtherPlayer);
        IAplayer.walls.push(wallToInstallToSeeOtherPlayer);
        let wallToInstallToSeeOtherPlayerForTeacher = convertOurWallToTopLeftCornerWall(wallToInstallToSeeOtherPlayer);


        return {action: "wall", value: wallToInstallToSeeOtherPlayerForTeacher};
    }
}

async function correction(rightMove) {

}

async function updateBoard(gameState) {

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function dijkstraAlgorithm(player) {
    // Initialisation des variables
    let alreadyVisitedCells = [];
    let cellsWithWeights = [];
    /* cellsWithWeights est un tableau de structure de la forme { position: position, pathLength: pathLength, predecessor: predecessor } avec
    position la case concernée, pathLength la distance pour atteindre cette case depuis notre position de base, et predecessor la case qui précède
    la case dont on est en train de calculer le chemin */
    let pathLength = 0;
    cellsWithWeights.push({position: player.position, pathLength: pathLength, predecessor: null});

    // On commence à travailler
    let shortestPathFinalPosition = getShortestPathFinalPosition(player, alreadyVisitedCells, cellsWithWeights, pathLength);

    //console.log("Le chemin le plus court pour gagner mène à la case de coordonnées x = " + shortestPathFinalPosition.x + " et y = " + shortestPathFinalPosition.y);

    let shortestPath = reconstructPath(player.position, shortestPathFinalPosition, cellsWithWeights);
    //console.log("Le prochain mouvement à faire est donc de se déplacer en x : " + shortestPath[0].x + ", y : " + shortestPath[0].y);
    return shortestPath;
}

function getShortestPathFinalPosition(player, alreadyVisitedCells, cellsWithWeights, pathLength) {
    let currentPosition = {x: player.position.x, y: player.position.y};

    let winningPosition = null;
    if(player.id === "ia") {
        if(firstToPlay) {
            winningPosition = 0;
        } else {
            winningPosition = 16;
        }
    } else if(player.id === "p2") {
        if(firstToPlay) {
            winningPosition = 16;
        } else {
            winningPosition = 0;
        }
    }

    while(currentPosition.x !== winningPosition) {
        updateWeightsFromACell(currentPosition, alreadyVisitedCells, cellsWithWeights, pathLength + 1);
        currentPosition = getNextCellToWorkOn(alreadyVisitedCells, cellsWithWeights);
    }
    
    // Si on sort de la boucle while, ça veut dire qu'on a trouvé une cellule qui a un x qui vaut 16, donc une case qui nous fait gagner
    let finalPositionCell = cellsWithWeights.find(cell => equalsPositions(cell.position, currentPosition));
    return finalPositionCell.position;
}

// Cette fonction sert, pour une cellule donnée, à mettre à jour le poids de ses voisins, voisins pour lesquels on a encore jamais calculé le poids de ses voisins à lui
function updateWeightsFromACell(currentPosition, alreadyVisitedCells, cellsWithWeights, pathLength) {
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

    let maxDistanceToReachArrival = 0;
    let possibleWallToInstall = []; 
    let wallToInstall = null;
    let otherPlayer = getOtherPlayer();
    let IAplayer = getIAPlayer();
    // Si plusieurs murs sont possibles pour allonger de même longueur le chemin de l'adversaire, on choisi celui qui nous ralenti le moins nous

    for(let i = -1; i < shortestPathForOtherPlayer.length - 1; i++) {

        let currentCellPosition = null;
        let nextCellPosition = null;

        if(i === -1) {
            // On fait ce cas là pour comparer aussi le mur que l'on pourrait poser entre le joueur et la première case de son shortestPath
            currentCellPosition = otherPlayer.position;
            nextCellPosition = shortestPathForOtherPlayer[0];
        } else {
            currentCellPosition = shortestPathForOtherPlayer[i];
            nextCellPosition = shortestPathForOtherPlayer[i + 1];
        }

        let isVertical = true;
        if(currentCellPosition.y === nextCellPosition.y) {  // Dans ce cas là, le mur doit être horizontal. Sinon, il reste vertical
            isVertical = false;
        }

        let interX = currentCellPosition.x + (nextCellPosition.x - currentCellPosition.x) / 2;
        let interY = currentCellPosition.y + (nextCellPosition.y - currentCellPosition.y) / 2;
        // La position {interX, interY} représente la position entre les deux cases. Deux murs sont alors possible pour bloquer cette position

        let wallsThatCanBeInstalled = getWallsThatCanBeInstalled(interX, interY, isVertical);

        // REPRENDRE ICI, ET FAIRE LE CHEMIN POUR CHACUN DES MURS POSSIBLES POUR SAVOIR LEQUEL EST LE PLUS AVANTAGEUX

        if(wallsThatCanBeInstalled) { // Si wallsThatCanBeInstalled n'est pas null, CàD qu'un mur peut être posé via la position {interX, interY}
            wallsThatCanBeInstalled.forEach(wall => {
                IAplayer.walls.push(wall);  // On l'ajoute temporairement à la liste des murs pour être pris en compte par le shortestPath à venir

                let newShortestPathForOtherPlayer = dijkstraAlgorithm(otherPlayer);
                let newShortestPathLengthForOtherPlayer = newShortestPathForOtherPlayer.length;

                if(newShortestPathLengthForOtherPlayer > maxDistanceToReachArrival) {
                    possibleWallToInstall = [wall];
                    maxDistanceToReachArrival = newShortestPathLengthForOtherPlayer;
                } else if(newShortestPathLengthForOtherPlayer === maxDistanceToReachArrival) {
                    possibleWallToInstall.push(wall);
                }

                IAplayer.walls.pop();       // On retire le mur temporaire que l'on a ajouté plus tôt
            });
        }
    }

    if(possibleWallToInstall.length === 0) {
        console.log("Aucun mur ne peut être posé tout au long du plus court chemin de l'adversaire, on ne peut pas le ralentir dans cette configuration");
        return null;
    } else if(possibleWallToInstall.length === 1) {
        wallToInstall = possibleWallToInstall[0];
    } else {
        // Dans ce cas là, plusieurs murs sont capables de ralentir autant les uns que les autres mon adversaire
        // On va alors choisir, parmi ces-derniers, celui qui nous ralenti le moins nous
        let minDistanceTorReachArrival = 9999;
        
        possibleWallToInstall.forEach(possibleWall => {
            IAplayer.walls.push(possibleWall);

            let newShortestPathForIA = dijkstraAlgorithm(IAplayer);
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

function getWallsThatCanBeInstalled(interX, interY, isVertical) {
    let wallsThatCanBeInstalled = [];
    let wall = [];
    wall.push({x : interX, y : interY});

    // Dans ce cas là, on est dans un cas limite où un seul mur peut être posé car on touche un bord
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
            wallsThatCanBeInstalled.push(wall);
            return wallsThatCanBeInstalled;
        } else {
            // console.log("Dans ce cas limite, aucun mur ne peut être posé");
            return null;
        }
    }

    // Dans ce cas là, le mur peut être vertcal ou horizontal, et deux murs sont possibles
    let wall2 = [];
    wall2.push({x : interX, y : interY});

    if(isVertical) {
        // Mur possible n°1
        wall.push({x : interX + 1, y : interY});
        wall.push({x : interX + 2, y : interY});
        if(canWallBeInstalledOnBoard(wall)) {
            wallsThatCanBeInstalled.push(wall);
        }

        // Mur possible n°2
        wall2.push({x : interX - 1, y : interY});
        wall2.push({x : interX - 2, y : interY});
        if(canWallBeInstalledOnBoard(wall2)) {
            wallsThatCanBeInstalled.push(wall2);
        }

    } else {
        // Mur possible n°1
        wall.push({x : interX, y : interY + 1});
        wall.push({x : interX, y : interY + 2});
        if(canWallBeInstalledOnBoard(wall)) {
            wallsThatCanBeInstalled.push(wall);
        }
        wall2.push({x : interX, y : interY - 1});
        wall2.push({x : interX, y : interY - 2});
        if(canWallBeInstalledOnBoard(wall2)) {
            wallsThatCanBeInstalled.push(wall2);
        }
    }

    if(wallsThatCanBeInstalled.length === 0) {
        return null;
    }

    return wallsThatCanBeInstalled;
}

function chooseWallToInstallToSeeOtherPlayer() {
    let interestingWalls = getInterestingWallsToSeeOtherPlayer();
    for(let i = 0; i < interestingWalls.length; i++) {
        if(canWallBeInstalledOnBoard(interestingWalls[i])) {
            return interestingWalls[i];
        }
    }
    console.log("Auncun mur intéréssant ne peut être posé");
    return null;
}

function getInterestingWallsToSeeOtherPlayer() {
    let wall1 = null;
    let wall2 = null;
    let wall3 = null;
    if(firstToPlay) {
        wall1 = [{x : 2, y : 9}, {x : 3, y : 9}, {x : 4, y : 9}]; // Le mur vertical en bas à droite de la position de départ du joueur
        wall2 = [{x : 2, y : 3}, {x : 3, y : 3}, {x : 4, y : 3}];
        wall3 = [{x : 2, y : 15}, {x : 3, y : 15}, {x : 4, y : 15}];
    } else {
        wall1 = [{x : 12, y : 7}, {x : 13, y : 7}, {x : 14, y : 7}]; // Le mur vertical en bas à droite de la position de départ du joueur
        wall2 = [{x : 12, y : 1}, {x : 13, y : 1}, {x : 14, y : 1}];
        wall3 = [{x : 12, y : 13}, {x : 13, y : 13}, {x : 14, y : 13}];
    }
    let interestingWalls = [wall1, wall2, wall3];
    return interestingWalls;
}

function canWallBeInstalledOnBoard(wallToInstall) {
    // Étape 1 : si le mur contient une position hors du plateau de jeu, false
    wallToInstall.forEach(element => {
        if(element.x < 0 || element.x > 16 || element.y < 0 || element.y > 16) {    // Le mur dépasse les limites du terrain
            return false;
        }
    });

    // Étape 2 : si aucun mur n'est posé sur le plateau, true
    let boardWallsInWallsList = getBoardWallsInWallsList();
    //console.log("Actuellement, il y a " + boardWallsInWallsList.length + " murs sur le terrain");
    if(boardWallsInWallsList.length === 0) { // Il n'y a pour l'instant aucun mur sur le terrain, tous les murs peuvent être posés
        //console.log("On rentre dans le cas où le nombre de murs est de 0");
        return true;
    }

    // Étape 3 : si le mur chevauche un des autres murs déjà posé sur le plateau, false
    for(let i = 0; i < boardWallsInWallsList.length; i++) {
        if(equalsPositions(boardWallsInWallsList[i][1], wallToInstall[1])           // Les deux murs se chevaucheraient au milieu
        || equalsPositions(boardWallsInWallsList[i][2], wallToInstall[0])           // Le début de notre mur chevaucherait la fin du mur déjà posé
        || equalsPositions(boardWallsInWallsList[i][0], wallToInstall[2])) {        // La fin de notre mur chevaucherait le début du mur déjà posé
            return false;
        }
    }

    // Étape 4 : si le mur bloque un joueur pour atteindre l'arrivée, false
    let boardWallsInPositionsList = getBoardWallsInPositionsList()          // On récupère la liste des positions occupées par un mur
    wallToInstall.forEach(element => {                                      // On y ajoute les positions du mur que l'on veut poser
        boardWallsInPositionsList.push(element);
    });
    if(!canPlayerReachArrival(boardWallsInPositionsList)) {                 // On regarde si ce mur bloque l'un des joueurs
        return false;                                                       // S'il ne bloque persone, le mur peut être installé
    }

    return true;
}

function canPlayerReachArrival(boardWallsInPositionsList) {
    let alreadyVisitedCell = []; // La liste des cases que l'on va visiter
    let canReach = false;

    let IAplayer = getIAPlayer();
    let canReachIAplayer = checkPathToReachTheEnd(IAplayer.position, alreadyVisitedCell, IAplayer.id, boardWallsInPositionsList);

    alreadyVisitedCell = [];    // On réinitialise la liste des cellules déjà visitées pour le joueur adverse

    let otherPlayer = getOtherPlayer();
    let canReachOtherPlayer = checkPathToReachTheEnd(otherPlayer.position, alreadyVisitedCell, otherPlayer.id, boardWallsInPositionsList);

    canReach = canReachIAplayer && canReachOtherPlayer;

    return canReach;
}

function checkPathToReachTheEnd(currentPosition, alreadyVisitedCell, playerID, boardWallsInPositionsList) {
    if(arrayOfPositionContainsPosition(alreadyVisitedCell, currentPosition)) { // Dans ce cas là, la cellule a déjà été visitée
        return false;
    }

    if(playerID === "ia") {
        if((firstToPlay && currentPosition.x === 0) || (!firstToPlay && currentPosition.x === 16)) {
            return true;
        }
    } else if(playerID === "p2") {
        if((!firstToPlay && currentPosition.x === 0) || (firstToPlay && currentPosition.x === 16)) {
            return true;
        }
    }

    alreadyVisitedCell.push(currentPosition);
    const adjacentCellsPositions = getAdjacentCellsPositionsWithWalls(currentPosition, boardWallsInPositionsList);
    for (const adjacentCellPosition of adjacentCellsPositions) {
        if (checkPathToReachTheEnd(adjacentCellPosition, alreadyVisitedCell, playerID, boardWallsInPositionsList)) {
            return true;
        }
    }
    return false;
}

function canPlayerStillInstallWall(playerID) {
    let IAplayer = getIAPlayer();
    let otherPlayer = getOtherPlayer();
    
    if(playerID === IAplayer.id) {
        if(IAplayer.walls.length < 10) {
            return true;
        } else {
            return false;
        }
    } else if(playerID === otherPlayer.id) {
        if(otherPlayer.walls.length < 10) {
            return true;
        } else {
            return false;
        }
    }
    return null;
}

function printPosition(position) {
    let stringToReturn = "{x: " + position.x + ", y: " + position.y + "}";
    return stringToReturn;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////// CETTE SECTION EST DÉDIÉE AUX FONCTIONS COPIÉES D'AUTRE FICHIERS POUR RENDRE CELUI-CI PARFAITEMENT INDÉPENDANT DES AUTRES //////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Notre structure de gameState à nous
let gameState = {
    players: [
        {
        id: null,
        position: null,
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
/*
// La structure de gameState du prof
let gameStateTeacher = {
    opponentWalls: [],        // Contient des tableaux, eux mêmes contenant une position et un isVertical
    ownWalls: [],             // Pareil
    board: []
};

// Cette fonction permet d'initialiser la structure gameStateTeacher en initialisant le plateau de jeu
function initializeGameStateTeacher() {
    gameStateTeacher.opponentWalls = [];        // Au départ, c'est un tableau vide car il n'y a aucun mur

    gameStateTeacher.ownWalls = [];             // Idem
    
    let finalBoard = [];
    let intermediateBoard;
    for(let i = 0; i < 9; i++) {
        intermediateBoard = [];
        if(firstToPlay) {
            for(let j = 0; j < 9; j++) {
                if(i < 5) {
                    intermediateBoard.push(0);
                } else {
                    intermediateBoard.push(-1);
                }
            }
        } else {
            for(let j = 0; j < 9; j++) {
                if(i > 3) {
                    intermediateBoard.push(0);
                } else {
                    intermediateBoard.push(-1);
                }
            }
        }
        finalBoard.push(intermediateBoard);
    }
    finalBoard[0][4] = 1;               // On initialise notre position au bas du plateau
    // finalBoard[8][4] = 2;            // On ne peut pas savoir dès le début où se trouve le joueur adverse, représenté par un 2
    gameStateTeacher.board = finalBoard;
}*/

// Cette méthode récupère le gameStateTeacher du prof et le convertit en un gameState de notre forme à nous
function convertGameStateTeacherToGameState(gameStateTeacher) {
    let IAplayer = getIAPlayer();
    IAplayer.walls = [];
    if(gameStateTeacher.ownWalls.length > 0) {
        IAplayer.walls = reconstructWallsListWithTopLeftCorners(gameStateTeacher.ownWalls);
    }

    let otherPlayer = getOtherPlayer();
    otherPlayer.walls = [];
    if(gameStateTeacher.opponentWalls.length > 0) {
        otherPlayer.walls = reconstructWallsListWithTopLeftCorners(gameStateTeacher.opponentWalls);
    }

    IAplayer.position = null;       // On réinitialise cette position dans le doute mais elle ne devrait jamais être null
    otherPlayer.position = null;    // On réinitialise cette position à null car le joueur adverse a pu disparaître entre temps
    for(let i = 0; i < 9; i++) {
        for(let j = 0; j < 9; j++) {
            if(gameStateTeacher.board[i][j] === 1) {           // Dans ce cas, il s'agit de la case sur laquelle mon bot se trouve
                teacherPositionForIA = `${i + 1}${j + 1}`;
                myPositionForIA = convertTeacherPositionToMyPosition(teacherPositionForIA);
                IAplayer.position = myPositionForIA;
            } else if(gameStateTeacher.board[i][j] === 2) {    // Dans ce cas, il s'agit de la case sur laquelle mon opposant se trouve
                teacherPositionForOtherPlayer = `${i + 1}${j + 1}`;
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

    return wall;
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
    let topLeftSquareTeacherPosition = convertMyPositionToTeacherPosition(topLeftSquarePosition);
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
function getAdjacentCellsPositionsWithWalls(cellPosition, boardWallsInPositionsList) {
    const adjacentCellsPositionsWithWalls = [];
    const adjacentCellsPositions = getAdjacentCellsPositions(cellPosition);
    for(const adjacentCellPosition of adjacentCellsPositions) {
        if(!checkBarriersBetween(cellPosition, adjacentCellPosition, boardWallsInPositionsList)) {
            adjacentCellsPositionsWithWalls.push(adjacentCellPosition);
        }
    }
    return adjacentCellsPositionsWithWalls;
}

// Cette méthode vérifie si deux positions sont séparées par un mur ou non
function checkBarriersBetween(startPosition, targetPosition, boardWallsInPositionsList) {
    const [x1, y1] = [startPosition.x, startPosition.y];
    const [x2, y2] = [targetPosition.x, targetPosition.y];

    const interX = x1 + (x2 - x1) / 2;
    const interY = y1 + (y2 - y1) / 2;
    let possibleWallPosition = {x: interX, y: interY};

    const walls = boardWallsInPositionsList ? boardWallsInPositionsList : getBoardWallsInPositionsList();

    return arrayOfPositionContainsPosition(walls, possibleWallPosition);
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

// Cette méthode renvoi un tableau contenant toutes les positions sur lesquelles se trouve un mur, et non pas un tableau de murs (tableau de tableaux)
function getBoardWallsInPositionsList() {
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

function getBoardWallsInWallsList() {
    let boardWalls = [];
    gameState.players.forEach(player => {
        player.walls.forEach(wall => {
            boardWalls.push(wall);
        });
    });
    return boardWalls;
}

//exports.setup = setup;
//exports.nextMove = nextMove;
exports.correction = correction;
exports.updateBoard = updateBoard;

module.exports = { dijkstraAlgorithm, nextMove, setup };

function printBoard(board) {
    for(let i = 8; i >= 0; i--) {
        let stringToPrint = "| ";
        for(let j = 0; j < 9; j++) {
            stringToPrint += board[j][i];
            if(board[j][i] !== -1) {
                stringToPrint += " ";
            }
            stringToPrint += " ";
        }
        stringToPrint += "|";
        console.log(stringToPrint);
    }
    console.log("\n");
}

async function main(){
    let opponentWalls1 = [
        ["19",0],
        ["25",0],
        ["34",0]
    ];
    let ownWalls1 = [
        ["38",1],
        ["16",0],
        ["52",0],
        ["59",0],
        ["33",0],
        ["23",1]
    ];
    let board1 = [
        [0,0,0,0,2,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,1,0,0,0,0]
    ];

    let opponentWalls2 = [];
    let ownWalls2 = [];
    let board2 = [
        [0,0,0,0,0,-1,-1,-1,-1],
        [0,0,0,0,0,-1,-1,-1,-1],
        [0,0,0,0,0,-1,-1,-1,-1],
        [0,0,0,0,0,-1,-1,-1,-1],
        [1,0,0,0,0,-1,-1,-1,-1],
        [0,0,0,0,0,-1,-1,-1,-1],
        [0,0,0,0,0,-1,-1,-1,-1],
        [0,0,0,0,0,-1,-1,-1,-1],
        [0,0,0,0,0,-1,-1,-1,-1]
    ];

    let opponentWalls3 = [
        
    ];
    let ownWalls3 = [
        ["15",1],
        ["35",1],
        ["17",1],
        ["27",0],
        ["78",0],
        ["68",1],
        ["12",0],
        ["22",1],
        ["45",1],
        ["76",0]
    ];
    let board3 = [
        [0,0,0,0,0,0,0,0,0],
        [0,0,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,2,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0]
    ];

    console.log("-----------------------------------------------------------------------");
    await setup(1);
    console.log("Le jeu a avancé et l'état du plateau de jeu est désormais :\n")
    let gameStateTeacherStruct = {
        opponentWalls: [],        // Contient des tableaux, eux mêmes contenant une position et un isVertical
        ownWalls: [],             // Pareil
        board: []
    };
    gameStateTeacherStruct.opponentWalls = opponentWalls3;
    gameStateTeacherStruct.ownWalls = ownWalls3;
    gameStateTeacherStruct.board = board3;
    printBoard(gameStateTeacherStruct.board);
    let start = Date.now();
    await nextMove(gameStateTeacherStruct).then((move) => {
        console.log("NEXT MOVE: ",move);
        let timeTaken = Date.now() - start;
        console.log("Total time taken : " + timeTaken + " milliseconds");
    });
    console.log("-----------------------------------------------------------------------");





    // ------------------- FONCTIONS ----------------------------------

    /*
    function init_gameboard(){
        let gameboard = [];
                for (let i = 0; i < 9; i++) {
                    let row = [];
                    for (let j = 0; j < 9; j++) {row.push(parseInt("0"));}
                    gameboard.push(row);
                }
        return gameboard.reverse();
    }
    function showGameboard(gameboard){
        gameboard.forEach(row => {
            let rowString = "";
            row.forEach(cell => {
                rowString += "|"+cell;
            });
            rowString += "|";
            console.log(rowString);
        });
    }
    */
}

main();