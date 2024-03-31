let firstToPlay = false;
let formerPositionOfOtherPlayer = null;
let formerNumberOfWallsOnBoard = 0;
let formerBoard = null;

async function setup(AIplay) { // AIplay vaut 1 si notre ia joue en premier, et 2 sinon
    let stringPosition = null;
    if(AIplay === 1) { // Notre ia joue en premier
        // console.log("On commence à jouer en premier");
        firstToPlay = true;
        stringPosition = "31";
    } else {
        // console.log("On commence à jouer en deuxième");
        stringPosition = "79";
    }
    initializeGameState();
    initializeFormerBoard();

    let IAplayer = getIAPlayer(gameState);
    let otherPlayer = getOtherPlayer(gameState);
    // console.log("La position de mon joueur est " + printPosition(IAplayer.position));
    let otherPlayerPosition = otherPlayer.position;
    if(otherPlayerPosition) {
        // console.log("La position du joueur adverse est " + printPosition(otherPlayer.position));
    } else {
        // console.log("La position du joueur adverse est pour l'instant inconue");
    }

    // console.log("Fin du setup\n");
    return stringPosition;
}

function nextMove(gameStateTeacher, gameState) {
    console.log("On va calculer notre prochain mouvement, mais avant ça, on sait que :");
    console.log("Mon gameState est :", gameState);

    convertGameStateTeacherToGameState(gameStateTeacher, gameState);

    let supposedPositionForOtherPlayer = null;
    let IAplayer = getIAPlayer(gameState);
    let otherPlayer = getOtherPlayer(gameState);
    console.log("Mon joueur1 possède actuellement " + IAplayer.walls.length + " murs");
    console.log("Le joueur2 possède actuellement " + otherPlayer.walls.length + " murs");
    console.log("La position de mon joueur1 est " + printPosition(IAplayer.position));
    let otherPlayerPosition = otherPlayer.position;
    if(otherPlayerPosition) {
        console.log("La position du joueur2 est " + printPosition(otherPlayer.position) + "\n");
    } else {
        console.log("La position du joueur2 est pour l'instant inconue\n");
    }

    let shortestPathForIA = dijkstraAlgorithm(IAplayer.position, IAplayer, gameState);
    let shortestPathLengthForIA = shortestPathForIA.length;

    // Dans le cas où le joueur choisi d'avancer et non de poser un mur, ce sera forcément cette position
    let nextPositionToGo = shortestPathForIA[0];
    let stringNextPositionToGo = convertMyPositionToTeacherPosition(nextPositionToGo);

    // On vérifie que l'on peut encore poser des murs, et si on ne peut pas, on avance
    if(!canPlayerStillInstallWall(IAplayer.id, gameState)) {
        console.log("Je ne peux plus poser de murs, donc je dois forcément avancer en " + printPosition(nextPositionToGo));
        if(isOtherPlayerOnTargetCell(nextPositionToGo, gameState)) {
            nextPositionToGo = manageOtherPlayerOnTargetCell(gameState);
            stringNextPositionToGo = convertMyPositionToTeacherPosition(nextPositionToGo);
        }
        IAplayer.position = nextPositionToGo;
        return {action: "move", value: stringNextPositionToGo};
    }

    // Si on se retrouve là, c'est que le joueur peut encore poser des murs
    if(canSeeTheOtherPlayer(gameStateTeacher)){
        formerPositionOfOtherPlayer = otherPlayer.position;
        console.log("Je vois l'autre joueur, donc je vais comparer nos plus courts chemins");

        // On fait un shortestPath pour l'autre joueur pour savoir s'il atteint la victoire plus rapidement que nous ou pas
        let shortestPathForOtherPlayer = dijkstraAlgorithm(otherPlayer.position, otherPlayer, gameState);
        let shortestPathLengthForOtherPlayer = shortestPathForOtherPlayer.length;

        console.log("Mon plus court chemin est de taille " + shortestPathLengthForIA);
        console.log("Le plus court chemin de l'adversaire est " + shortestPathLengthForOtherPlayer);

        if(shortestPathLengthForIA > shortestPathLengthForOtherPlayer) {
            console.log("Le joueur adverse a un chemin plus court que le miens pour gagner");
            // On va tenter de maximiser la longueur du chemin de l'adversaire, en tentant de poser un mur entre chacune des cases du chemin renvoyé
            // par son shortestPath, et on pose le mur qui allonge le plus son chemin
            let wallToInstall = chooseWallToInstallToIncreaseShortestPathLengthForOtherPlayer(shortestPathForOtherPlayer, gameState);

            // On vérifie qu'un mur peut bien être posé sur le plus court chemin de l'adversaire pour le ralentir
            if(wallToInstall) {
                let stringForWallToInstall = "[";
                wallToInstall.forEach(wall => {
                    stringForWallToInstall += printPosition(wall);
                    stringForWallToInstall += ","
                })
                stringForWallToInstall += "]";
                console.log("Le meilleur mur pour ralentir mon adversaire est en position " + stringForWallToInstall);
                console.log("Mon joueur1 possède actuellement " + IAplayer.walls.length + " murs");

                // Si oui, on le pose
                // IAplayer.walls.push(wallToInstall);

                let wallToInstallForTeacher = convertOurWallToTopLeftCornerWall(wallToInstall);
                return {action: "wall", value: wallToInstallForTeacher};
            }
        }

        console.log("J'ai un chemin plus court que celui de mon adversaire pour gagner");
        if(isOtherPlayerOnTargetCell(nextPositionToGo, gameState)) {
            nextPositionToGo = manageOtherPlayerOnTargetCell(gameState);
            stringNextPositionToGo = convertMyPositionToTeacherPosition(nextPositionToGo);
        }
        console.log("J'avance donc sur la case " + printPosition(nextPositionToGo));
        IAplayer.position = nextPositionToGo;
        return {action: "move", value: stringNextPositionToGo};

    } else if(supposedPositionForOtherPlayer = canGuessOtherPlayerPosition(gameStateTeacher, gameState)) {
        console.log("Je ne vois pas mon adversaire mais je peux deviner sa position");
        console.log("La position supposée de mon adversaire est " + printPosition(supposedPositionForOtherPlayer));
        console.log("Je réapplique alors un nextMove en considérant que la position de mon adversaire est celle que j'ai devinée\n");
        let stringSupposedPositionForOtherPlayer = convertMyPositionToTeacherPosition(supposedPositionForOtherPlayer);
        let stringXposition = stringSupposedPositionForOtherPlayer[0];
        let stringYposition = stringSupposedPositionForOtherPlayer[1];
        for(let i = 0; i < 9; i++) {
            for(let j = 0; j < 9; j++) {
                if(gameStateTeacher.board[i][j] === 2) {
                    gameStateTeacher.board[i][j] = 0;
                } else if(i === stringXposition - 1 && j === stringYposition - 1) {
                    gameStateTeacher.board[i][j] = 2;
                }
            }
        }
        return nextMove(gameStateTeacher, gameState);
    } else {
        console.log("Je ne vois pas mon adversaire et je ne peux pas deviner sa position");
        let wallToInstallToSeeOtherPlayer = null;
        if(wallToInstallToSeeOtherPlayer = chooseWallToInstallToSeeOtherPlayer(gameState)) {
            let stringForWallToInstallToSeeOtherPlayer = "[";
            wallToInstallToSeeOtherPlayer.forEach(wall => {
                stringForWallToInstallToSeeOtherPlayer += printPosition(wall);
                stringForWallToInstallToSeeOtherPlayer += ","
            })
            stringForWallToInstallToSeeOtherPlayer += "]";
            console.log("Le meilleur mur à poser pour voir mon adversaire est " + stringForWallToInstallToSeeOtherPlayer);
            // IAplayer.walls.push(wallToInstallToSeeOtherPlayer);

            let wallToInstallToSeeOtherPlayerForTeacher = convertOurWallToTopLeftCornerWall(wallToInstallToSeeOtherPlayer);

            return {action: "wall", value: wallToInstallToSeeOtherPlayerForTeacher};
        } else {
            if(isOtherPlayerOnTargetCell(nextPositionToGo, gameState)) {
                nextPositionToGo = manageOtherPlayerOnTargetCell(gameState);
                stringNextPositionToGo = convertMyPositionToTeacherPosition(nextPositionToGo);
            }
            IAplayer.position = nextPositionToGo;
            return {action: "move", value: stringNextPositionToGo};
        }
    }
}

async function correction(rightMove) {
    return true;
}

async function updateBoard(gameStateTeacher,gameState ) {
    formerBoard = gameStateTeacher.board;
    convertGameStateTeacherToGameState(gameStateTeacher, gameState);
    let boardWalls = getBoardWallsInWallsList(gameState);
    formerNumberOfWallsOnBoard = boardWalls.length;
    return true;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function dijkstraAlgorithm(position, player, gameState, forbiddenPosition, ) {
    // Initialisation des variables
    let alreadyVisitedCells = [];
    if(forbiddenPosition) {
        alreadyVisitedCells.push(forbiddenPosition);
    }
    let cellsWithWeights = [];
    /* cellsWithWeights est un tableau de structure de la forme { position: position, pathLength: pathLength, predecessor: predecessor } avec
    position la case concernée, pathLength la distance pour atteindre cette case depuis notre position de base, et predecessor la case qui précède
    la case dont on est en train de calculer le chemin */
    let pathLength = 0;
    cellsWithWeights.push({position: position, pathLength: pathLength, predecessor: null});

    // On commence à travailler
    let shortestPathFinalPosition = getShortestPathFinalPosition(position, player, alreadyVisitedCells, cellsWithWeights, gameState);

    let shortestPath = reconstructPath(position, shortestPathFinalPosition, cellsWithWeights);
    return shortestPath;
}

function getShortestPathFinalPosition(position, player, alreadyVisitedCells, cellsWithWeights, gameState) {
    let currentPosition = {x: position.x, y: position.y};
    let winningPosition = null;
    if(player.id === "player1") {
        if(firstToPlay) {
            winningPosition = 0;
        } else {
            winningPosition = 16;
        }
    } else if(player.id === "player2") {
        if(firstToPlay) {
            winningPosition = 16;
        } else {
            winningPosition = 0;
        }
    }

    while(currentPosition.x !== winningPosition) {
        updateWeightsFromACell(currentPosition, alreadyVisitedCells, cellsWithWeights, gameState);
        currentPosition = getNextCellToWorkOn(alreadyVisitedCells, cellsWithWeights);
    }
    
    // Si on sort de la boucle while, ça veut dire qu'on a trouvé une cellule qui a un x qui vaut 16, donc une case qui nous fait gagner
    let finalPositionCell = cellsWithWeights.find(cell => equalsPositions(cell.position, currentPosition));
    return finalPositionCell.position;
}

// Cette fonction sert, pour une cellule donnée, à mettre à jour le poids de ses voisins, voisins pour lesquels on a encore jamais calculé le poids de ses voisins à lui
function updateWeightsFromACell(currentPosition, alreadyVisitedCells, cellsWithWeights, gameState) {
    alreadyVisitedCells.push(currentPosition);
    let currentCell = cellsWithWeights.find(cell => equalsPositions(cell.position, currentPosition));
    let currentPathLength = currentCell ? currentCell.pathLength : 0;

    let adjacentCellsPosition = getAdjacentCellsPositionsWithWalls(currentPosition, gameState);
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

function getIAPlayer(gameState) {
    return gameState.find(player => player.id === "player1");
}

function getOtherPlayer(gameState) {
    return gameState.find(player => player.id === "player2");
}

function canSeeTheOtherPlayer(gameStateTeacher) {
    let otherPlayerDetected = false
    gameStateTeacher.board.forEach(row => {
        row.forEach(cell => {
            if(cell === 2) {
                otherPlayerDetected = true;
            }
        });
    });
    return otherPlayerDetected;
}

// Cette méthode renvoi la position supposée du joueur adverse sans le voir réellement
function canGuessOtherPlayerPosition(gameStateTeacher, gameState) {
    let positionForVisibilityReduced = null;
    let boardWalls = getBoardWallsInWallsList(gameState);
    let numberOfWallsOnBoard = boardWalls.length;

    if(formerPositionOfOtherPlayer) {
        if(numberOfWallsOnBoard > formerNumberOfWallsOnBoard) { // Dans ce cas là, le joueur a posé un mur, donc il n'a pas bougé
            return formerPositionOfOtherPlayer;
        } else { // Dans ce cas là, le joueur n'a pas posé de mur donc il a forcément bougé
            let otherPlayer = getOtherPlayer(gameState);
            // On considère que si le joueur a bougé, il s'est déplacé le long du chemin le plus rapide le menant à la victoire
            let supposedShortestPathForOtherPlayer = dijkstraAlgorithm(formerPositionOfOtherPlayer, otherPlayer, gameState);
            formerPositionOfOtherPlayer = supposedShortestPathForOtherPlayer[0];
            // La formerPositionOfOtherPlayer est la position actuelle supposée ou non du joueur, mais c'est aussi la prochaine ancienne position
            // du joueur adverse, ce sera son ancienne position au prochain tour
            return(supposedShortestPathForOtherPlayer[0]);
        }
    } else if(formerBoard) {
        if(formerNumberOfWallsOnBoard === numberOfWallsOnBoard) { // On vérifie si la visibilité à changée mais pas à cause d'un mur
            if(positionForVisibilityReduced = visibilityReduced(formerBoard, gameStateTeacher.board)) {
                return positionForVisibilityReduced;
            }
        }
    }
    return null;
}

function visibilityReduced(formerBoard, currentBoard) {
    for(let i = 0; i < 9; i++) {
        for(let j = 0; j < 9; j++) {
            if((formerBoard[i][j] === 0 && currentBoard[i][j] === -1)) {
                // console.log("Une avancée du joueur a été détectée car une case a perdu en visibilité");
                // Dans ce cas là, le joueur est forcément sur une des 4 cases adjacentes à celle qui vient de passer de 0 à -1
                let stringPositionForCell = `${i + 1}${j + 1}`;
                let positionForCell = convertTeacherPositionToMyPosition(stringPositionForCell);
                // console.log("Position du changement de visibilité : " + printPosition(positionForCell));
                let possibleOtherPlayerCell = [];
                let possiblePositionForOtherPlayer = null;
                let stringPossiblePositionForOtherPlayer = "";

                if(positionForCell.x > 0) {
                    possiblePositionForOtherPlayer = {x: positionForCell.x - 2, y: positionForCell.y};
                    stringPossiblePositionForOtherPlayer = convertMyPositionToTeacherPosition(possiblePositionForOtherPlayer);
                    if(currentBoard[stringPossiblePositionForOtherPlayer[0] - 1][stringPossiblePositionForOtherPlayer[1] - 1] === -1) {
                        // On vérifie qu'on ne voit pas cette case, car si on la voyait, on verrais le joueur dessus
                        possibleOtherPlayerCell.push(possiblePositionForOtherPlayer);
                    }
                }
                if(positionForCell.x < 16) {
                    possiblePositionForOtherPlayer = {x: positionForCell.x + 2, y: positionForCell.y};
                    stringPossiblePositionForOtherPlayer = convertMyPositionToTeacherPosition(possiblePositionForOtherPlayer);
                    if(currentBoard[stringPossiblePositionForOtherPlayer[0] - 1][stringPossiblePositionForOtherPlayer[1] - 1] === -1) {
                        // On vérifie qu'on ne voit pas cette case, car si on la voyait, on verrais le joueur dessus
                        possibleOtherPlayerCell.push(possiblePositionForOtherPlayer);
                    }
                }
                if(positionForCell.y > 0) {
                    possiblePositionForOtherPlayer = {x: positionForCell.x, y: positionForCell.y - 2};
                    stringPossiblePositionForOtherPlayer = convertMyPositionToTeacherPosition(possiblePositionForOtherPlayer);
                    if(currentBoard[stringPossiblePositionForOtherPlayer[0] - 1][stringPossiblePositionForOtherPlayer[1] - 1] === -1) {
                        // On vérifie qu'on ne voit pas cette case, car si on la voyait, on verrais le joueur dessus
                        possibleOtherPlayerCell.push(possiblePositionForOtherPlayer);
                    }
                }
                if(positionForCell.y < 16) {
                    possiblePositionForOtherPlayer = {x: positionForCell.x, y: positionForCell.y + 2};
                    stringPossiblePositionForOtherPlayer = convertMyPositionToTeacherPosition(possiblePositionForOtherPlayer);
                    if(currentBoard[stringPossiblePositionForOtherPlayer[0] - 1][stringPossiblePositionForOtherPlayer[1] - 1] === -1) {
                        // On vérifie qu'on ne voit pas cette case, car si on la voyait, on verrais le joueur dessus
                        possibleOtherPlayerCell.push(possiblePositionForOtherPlayer);
                    }
                }

                // Maintenant qu'on a la liste des positions supectes, on cherche laquelle est la bonne
                if(possibleOtherPlayerCell.length === 0) {
                    // console.log("Il y a eu une erreur dans la détection de la possible position du joueur adverse");
                    return null;
                } else if(possibleOtherPlayerCell.length === 1) {
                    return possibleOtherPlayerCell[0];
                } else {
                    // On reparcours l'entiereté du tableau à la recherche d'un autre case dont la visibilité aurait diminué
                    for(let m = i; m < 9; m++) {
                        for(let n = 0; n < 9; n++) {
                            // Comme la première case changée est d'indice (i,j), on recommence la recherche à (i,0)
                            // pour éviter de refaire les i premières lignes
                            if((formerBoard[m][n] === 0 && currentBoard[m][n] === -1)) {
                                let stringPositionForCell2 = `${m + 1}${n + 1}`;
                                if(stringPositionForCell2 !== stringPositionForCell) {
                                    let positionForCell2 = convertTeacherPositionToMyPosition(stringPositionForCell2);
                                    let possiblePositionForOtherPlayer2 = null;

                                    if(positionForCell2.x > 0) {
                                        possiblePositionForOtherPlayer2 = {x: positionForCell2.x - 2, y: positionForCell2.y};
                                        for(let a = 0; a < possibleOtherPlayerCell.length; a++) {
                                            if(equalsPositions(possibleOtherPlayerCell[a], possiblePositionForOtherPlayer2)) {
                                                return possiblePositionForOtherPlayer2;
                                            }
                                        }
                                    }
                                    if(positionForCell2.x < 16) {
                                        possiblePositionForOtherPlayer2 = {x: positionForCell2.x + 2, y: positionForCell2.y};
                                        for(let a = 0; a < possibleOtherPlayerCell.length; a++) {
                                            if(equalsPositions(possibleOtherPlayerCell[a], possiblePositionForOtherPlayer2)) {
                                                return possiblePositionForOtherPlayer2;
                                            }
                                        }
                                    }
                                    if(positionForCell2.y > 0) {
                                        possiblePositionForOtherPlayer2 = {x: positionForCell2.x, y: positionForCell2.y - 2};
                                        for(let a = 0; a < possibleOtherPlayerCell.length; a++) {
                                            if(equalsPositions(possibleOtherPlayerCell[a], possiblePositionForOtherPlayer2)) {
                                                return possiblePositionForOtherPlayer2;
                                            }
                                        }
                                    }
                                    if(positionForCell2.y < 16) {
                                        possiblePositionForOtherPlayer2 = {x: positionForCell2.x, y: positionForCell2.y + 2};
                                        for(let a = 0; a < possibleOtherPlayerCell.length; a++) {
                                            if(equalsPositions(possibleOtherPlayerCell[a], possiblePositionForOtherPlayer2)) {
                                                return possiblePositionForOtherPlayer2;
                                            }
                                        }
                                    }
                                    // console.log("Problème, car cette case ne partage aucun voisin avec l'autre case");
                                }
                            }
                        }
                    }
                    // console.log("Aucune autre case n'a perdu en visibilité");
                    // On a déjà vérifié à ce stade qu'aucune autre case n'avait perdu en visibilité
                    // Ainsi, il ne nous reste plus qu'à parcourir la liste des voisins de chaque case suceptible de contenir le joueur adverse,
                    // et si ce voisin vaut 0 ou 1 et n'est pas l'unique case que nous avons trouvé à avoir perdu en visibilité, alors ce n'est pas
                    // cette case sur lequelle le joueur se situe, auquel cas ce voisin aurait perdu en visibilité également
                    let notPossibleOtherPlayerCell = [];
                    // console.log("Nombre de cases potentielles : " + possibleOtherPlayerCell.length);
                    for(let b = 0; b < possibleOtherPlayerCell.length; b++) {
                        // console.log("On s'intéresse à la case " + printPosition(possibleOtherPlayerCell[b]));
                        let adjacentCells = getAdjacentCellsPositions(possibleOtherPlayerCell[b]);
                        // console.log("Nombre de voisins : " + adjacentCells.length);
                        for(let c = 0; c < adjacentCells.length; c++) {
                            // console.log("On s'intéresse au voisin " + printPosition(adjacentCells[c]));
                            let stringPositionForAdjacentCell = convertMyPositionToTeacherPosition(adjacentCells[c]);
                            let xPosition = stringPositionForAdjacentCell[0];
                            let yPosition = stringPositionForAdjacentCell[1];
                            if((currentBoard[xPosition - 1][yPosition - 1] === 0)) {
                                if(!equalsPositions(adjacentCells[c], positionForCell)) {
                                    // console.log("La case " + printPosition(possibleOtherPlayerCell[b]) + " n'est pas possible");
                                    notPossibleOtherPlayerCell.push(possibleOtherPlayerCell[b]);
                                    break;
                                }
                            }
                        }
                    }
                    let filteredPossibleOtherPlayerCell = possibleOtherPlayerCell.filter(possibleCell =>
                        !notPossibleOtherPlayerCell.some(notPossibleCell =>
                            notPossibleCell.x === possibleCell.x && notPossibleCell.y === possibleCell.y
                        )
                    );
                    if(filteredPossibleOtherPlayerCell.length === 0) {
                        // console.log("Une erreur a été faite lors du filtrage");
                        return null;
                    } else if(filteredPossibleOtherPlayerCell.length === 1) {
                        return filteredPossibleOtherPlayerCell[0];
                    } else {
                        // console.log("Plusieurs cases sont encore possible pour le joueur adverse, on prend la première au hasard");
                        return filteredPossibleOtherPlayerCell[0];
                        // A améliorer en prenant la case la plus dangereuse
                    }
                }
            }
        }
    }
    // console.log("Aucun changement de visibilité apparent sur le board");
    return null;
}

function chooseWallToInstallToIncreaseShortestPathLengthForOtherPlayer(shortestPathForOtherPlayer, gameState) {
    let maxDistanceToReachArrival = 0;
    let possibleWallToInstall = []; 
    let wallToInstall = null;
    let otherPlayer = getOtherPlayer(gameState);
    let IAplayer = getIAPlayer(gameState);
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

        let wallsThatCanBeInstalled = getWallsThatCanBeInstalled(interX, interY, isVertical, gameState);

        if(wallsThatCanBeInstalled) { // Si wallsThatCanBeInstalled n'est pas null, CàD qu'un mur peut être posé via la position {interX, interY}
            wallsThatCanBeInstalled.forEach(wall => {
                IAplayer.walls.push(wall);  // On l'ajoute temporairement à la liste des murs pour être pris en compte par le shortestPath à venir

                let newShortestPathForOtherPlayer = dijkstraAlgorithm(otherPlayer.position, otherPlayer, gameState);
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

            let newShortestPathForIA = dijkstraAlgorithm(IAplayer.position, IAplayer, gameState);
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

function getWallsThatCanBeInstalled(interX, interY, isVertical, gameState) {
    let wallsThatCanBeInstalled = [];
    let wall = [];
    wall.push({x : interX, y : interY});

    // Dans ce cas là, on est dans un cas limite où un seul mur peut être posé car on touche un bord
    if(interX === 0 || interX === 16 || interY === 0 || interY === 16) {

        if(interX === 0) {                              // Dans ce cas là, le mur est forcément vertical
            wall.push({x : interX + 1, y : interY});
            wall.push({x : interX + 2, y : interY});
        } else if(interX === 16) {                      // Dans ce cas là, le mur est forcément vertical
            // On fait en sorte que les murs contiennent les positions dans un ordre croissant
            wall.pop();
            wall.push({x : interX - 2, y : interY});
            wall.push({x : interX - 1, y : interY});
            wall.push({x : interX, y : interY});
        } else if(interY === 0) {                       // Dans ce cas là, le mur est forcément horizontal
            wall.push({x : interX, y : interY + 1});
            wall.push({x : interX, y : interY + 2});
        } else if(interY === 16) {                      // Dans ce cas là, le mur est forcément horizontal
            wall.pop();
            wall.push({x : interX, y : interY - 2});
            wall.push({x : interX, y : interY - 1});
            wall.push({x : interX, y : interY});
        }

        if(canWallBeInstalledOnBoard(wall, gameState)) {
            wallsThatCanBeInstalled.push(wall);
            return wallsThatCanBeInstalled;
        } else {
            // // console.log("Dans ce cas limite, aucun mur ne peut être posé");
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
        if(canWallBeInstalledOnBoard(wall, gameState)) {
            wallsThatCanBeInstalled.push(wall);
        }

        // Mur possible n°2
        wall2.pop();
        wall2.push({x : interX - 2, y : interY});
        wall2.push({x : interX - 1, y : interY});
        wall2.push({x : interX, y : interY});
        if(canWallBeInstalledOnBoard(wall2, gameState)) {
            wallsThatCanBeInstalled.push(wall2);
        }

    } else {
        // Mur possible n°1
        wall.push({x : interX, y : interY + 1});
        wall.push({x : interX, y : interY + 2});
        if(canWallBeInstalledOnBoard(wall, gameState)) {
            wallsThatCanBeInstalled.push(wall);
        }
        wall2.pop();
        wall2.push({x : interX, y : interY - 2});
        wall2.push({x : interX, y : interY - 1});
        wall2.push({x : interX, y : interY});
        if(canWallBeInstalledOnBoard(wall2, gameState)) {
            wallsThatCanBeInstalled.push(wall2);
        }
    }

    if(wallsThatCanBeInstalled.length === 0) {
        return null;
    }

    return wallsThatCanBeInstalled;
}

function chooseWallToInstallToSeeOtherPlayer(gameState) {
    let interestingWalls = getInterestingWallsToSeeOtherPlayer();
    for(let i = 0; i < interestingWalls.length; i++) {
        if(canWallBeInstalledOnBoard(interestingWalls[i], gameState)) {
            return interestingWalls[i];
        }
    }
    // console.log("Aucun mur intéréssant ne peut être posé");
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

function canWallBeInstalledOnBoard(wallToInstall, gameState) {
    // Étape 1 : si le mur contient une position hors du plateau de jeu, false
    wallToInstall.forEach(element => {
        if(element.x < 0 || element.x > 16 || element.y < 0 || element.y > 16) {    // Le mur dépasse les limites du terrain
            return false;
        }
    });

    // Étape 2 : si aucun mur n'est posé sur le plateau, true
    let boardWallsInWallsList = getBoardWallsInWallsList(gameState);
    // //console.log("Actuellement, il y a " + boardWallsInWallsList.length + " murs sur le terrain");
    // Il n'y a pour l'instant aucun mur sur le terrain, tous les murs peuvent être posés
    if(boardWallsInWallsList.length === 0) {
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
    let boardWallsInPositionsList = getBoardWallsInPositionsList(gameState)          // On récupère la liste des positions occupées par un mur
    wallToInstall.forEach(element => {                                      // On y ajoute les positions du mur que l'on veut poser
        boardWallsInPositionsList.push(element);
    });
    if(!canPlayerReachArrival(boardWallsInPositionsList, gameState)) {                 // On regarde si ce mur bloque l'un des joueurs
        return false;                                                       // S'il ne bloque persone, le mur peut être installé
    }

    return true;
}

function canPlayerReachArrival(boardWallsInPositionsList, gameState) {
    let alreadyVisitedCell = []; // La liste des cases que l'on va visiter
    let canReach = false;

    let IAplayer = getIAPlayer(gameState);
    let canReachIAplayer = checkPathToReachTheEnd(IAplayer.position, alreadyVisitedCell, IAplayer.id, boardWallsInPositionsList, gameState);

    alreadyVisitedCell = [];    // On réinitialise la liste des cellules déjà visitées pour le joueur adverse

    let otherPlayer = getOtherPlayer(gameState);
    let canReachOtherPlayer = null;
    if(otherPlayer.position) {
        canReachOtherPlayer = checkPathToReachTheEnd(otherPlayer.position, alreadyVisitedCell, otherPlayer.id, boardWallsInPositionsList, gameState)
    } else {
        canReachOtherPlayer = true;
    }

    canReach = canReachIAplayer && canReachOtherPlayer;

    return canReach;
}

function checkPathToReachTheEnd(currentPosition, alreadyVisitedCell, playerID, boardWallsInPositionsList, gameState) {
    if(arrayOfPositionContainsPosition(alreadyVisitedCell, currentPosition)) { // Dans ce cas là, la cellule a déjà été visitée
        return false;
    }

    if(playerID === "player1") {
        if((firstToPlay && currentPosition.x === 0) || (!firstToPlay && currentPosition.x === 16)) {
            return true;
        }
    } else if(playerID === "player2") {
        if((!firstToPlay && currentPosition.x === 0) || (firstToPlay && currentPosition.x === 16)) {
            return true;
        }
    }

    alreadyVisitedCell.push(currentPosition);
    const adjacentCellsPositions = getAdjacentCellsPositionsWithWalls(currentPosition, gameState, boardWallsInPositionsList);
    for (const adjacentCellPosition of adjacentCellsPositions) {
        if (checkPathToReachTheEnd(adjacentCellPosition, alreadyVisitedCell, playerID, boardWallsInPositionsList, gameState)) {
            return true;
        }
    }
    return false;
}

function canPlayerStillInstallWall(playerID, gameState) {
    let IAplayer = getIAPlayer(gameState);
    let otherPlayer = getOtherPlayer(gameState);
    
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
    return "{x: " + position.x + ", y: " + position.y + "}";
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////// CETTE SECTION EST DÉDIÉE AUX FONCTIONS COPIÉES D'AUTRE FICHIERS POUR RENDRE CELUI-CI PARFAITEMENT INDÉPENDANT DES AUTRES //////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Notre structure de gameState à nous
// let gameState = {
//     players: [
//         {
//         id: null,
//         position: null,
//         walls: [],
//         isCurrentPlayer: false
//         }
//     ]
// };

function initializeGameState() {
    // Object.assign permet de mettre à jour l'état existant de gameState et non de remplacer l'objet original gameState par un nouvel objet,
    // ce qui signifie que toutes les références précédentes à l'objet gameState pointeront bien vers le nouvel état de gameState et pas l'ancien
    // Object.assign(gameState, {
    //     players: [
    //         {
    //             id: "player1",                           // Dans ce fichier, l'ia c'est nous
    //             position: { x: 16, y: 8 },          // donc on se place en bas du plateau
    //             walls: [],
    //             isCurrentPlayer: firstToPlay        // Cette variable est définie via isFirstToPlay, indiquant si notre IA joue en 1er ou non
    //         },
    //         {
    //             id: "player2",                           // Dans ce fichier, le p2 c'est l'ia adverse
    //             position: null,                     // donc on ne sait pas au départ où il se trouve
    //             walls: [],
    //             isCurrentPlayer: !firstToPlay       // Comme isFirstToPlay indique si notre IA joue en premier ou non, c'est l'inverse de cette valeur
    //         }
    //     ]
    // });
}

function initializeFormerBoard() {
    if(firstToPlay) {
        formerBoard = [
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
    } else {
        formerBoard = [
            [-1,-1,-1,-1,0,0,0,0,0],
            [-1,-1,-1,-1,0,0,0,0,0],
            [-1,-1,-1,-1,0,0,0,0,0],
            [-1,-1,-1,-1,0,0,0,0,0],
            [-1,-1,-1,-1,0,0,0,0,1],
            [-1,-1,-1,-1,0,0,0,0,0],
            [-1,-1,-1,-1,0,0,0,0,0],
            [-1,-1,-1,-1,0,0,0,0,0],
            [-1,-1,-1,-1,0,0,0,0,0]
        ];
    }
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
function convertGameStateTeacherToGameState(gameStateTeacher, gameState) {
    let IAplayer = getIAPlayer(gameState);
    IAplayer.walls = [];
    if(gameStateTeacher.ownWalls.length > 0) {
        IAplayer.walls = reconstructWallsListWithTopLeftCorners(gameStateTeacher.ownWalls);
    }

    let otherPlayer = getOtherPlayer(gameState);
    let otherPlayerCopy = {
        id: otherPlayer.id,
        position: otherPlayer.position,
        walls: otherPlayer.walls
    };
    otherPlayerCopy.walls = [];
    if(gameStateTeacher.opponentWalls.length > 0) {
        otherPlayerCopy.walls = reconstructWallsListWithTopLeftCorners(gameStateTeacher.opponentWalls);
    }

    IAplayer.position = null;       // On réinitialise cette position dans le doute mais elle ne devrait jamais être null
    otherPlayerCopy.position = null;    // On réinitialise cette position à null car le joueur adverse a pu disparaître entre temps

    for(let i = 0; i < 9; i++) {
        for(let j = 0; j < 9; j++) {
            if(gameStateTeacher.board[i][j] === 1) {           // Dans ce cas, il s'agit de la case sur laquelle mon bot se trouve
                teacherPositionForIA = `${i + 1}${j + 1}`;
                myPositionForIA = convertTeacherPositionToMyPosition(teacherPositionForIA);
                IAplayer.position = myPositionForIA;
            } else if(gameStateTeacher.board[i][j] === 2) {    // Dans ce cas, il s'agit de la case sur laquelle mon opposant se trouve
                teacherPositionForOtherPlayer = `${i + 1}${j + 1}`;
                myPositionForOtherPlayer = convertTeacherPositionToMyPosition(teacherPositionForOtherPlayer);
                // console.log("PAPI");
                otherPlayerCopy.position = myPositionForOtherPlayer;
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
function getAdjacentCellsPositionsWithWalls(cellPosition, gameState, boardWallsInPositionsList) {
    const adjacentCellsPositionsWithWalls = [];
    const adjacentCellsPositions = getAdjacentCellsPositions(cellPosition);
    for(const adjacentCellPosition of adjacentCellsPositions) {
        if(!checkBarriersBetween(cellPosition, adjacentCellPosition, gameState, boardWallsInPositionsList)) {
            adjacentCellsPositionsWithWalls.push(adjacentCellPosition);
        }
    }
    return adjacentCellsPositionsWithWalls;
}

// Cette méthode vérifie si deux positions sont séparées par un mur ou non
function checkBarriersBetween(startPosition, targetPosition, gameState, boardWallsInPositionsList) {
    const [x1, y1] = [startPosition.x, startPosition.y];
    const [x2, y2] = [targetPosition.x, targetPosition.y];

    const interX = x1 + (x2 - x1) / 2;
    const interY = y1 + (y2 - y1) / 2;
    let possibleWallPosition = {x: interX, y: interY};

    const walls = boardWallsInPositionsList ? boardWallsInPositionsList : getBoardWallsInPositionsList(gameState);

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
function getBoardWallsInPositionsList(gameState) {
    let boardWalls = [];
    gameState.forEach(player => {
        player.walls.forEach(wall => {
            wall.forEach(cell => {
                boardWalls.push(cell);
            });
        });
    });
    return boardWalls;
}

function getBoardWallsInWallsList(gameState) {
    let boardWalls = [];
    gameState.forEach(player => {
        player.walls.forEach(wall => {
            boardWalls.push(wall);
        });
    });
    return boardWalls;
}

/*function updateMyPositionOnBoard(stringPosition, gameStateTeacherBoard) {
    for(let i = 0; i < 9; i++) {
        for(let j = 0; j < 9; j++) {
            if(gameStateTeacherBoard[i][j] === 1) {
                gameStateTeacherBoard[i][j] = 0;
            } else if(i === stringPosition[0] - 1 && j === stringPosition[1] - 1) {
                gameStateTeacherBoard[i][j] = 1;
            }
        }
    }
}*/

function isOtherPlayerOnTargetCell(targetPosition, gameState) {
    let otherPlayer = getOtherPlayer(gameState);
    let otherPlayerPosition = otherPlayer.position;
    if(!otherPlayerPosition) {
        return false;
    } else {
        if(equalsPositions(otherPlayerPosition, targetPosition)) {
            // console.log("L'adversaire est sur la case où je veux aller");
            return true;
        }
    }
}

function manageOtherPlayerOnTargetCell(gameState) {
    let otherPlayer = getOtherPlayer(gameState);
    let IAplayer = getIAPlayer(gameState);
    let nextPosition = null;
    if(IAplayer.position.x < otherPlayer.position.x) { // Dans ce cas là, le joueur est en dessous de moi
        // console.log("Le joueur est en dessous de moi");
        nextPosition = {x: otherPlayer.position.x + 2, y: otherPlayer.position.y};
        if(nextPosition.x > 16 || checkBarriersBetween(otherPlayer.position, nextPosition, gameState)) { // Dans ce cas là, je ne peux pas enjamber le joueur
            nextPosition = dijkstraAlgorithm(IAplayer.position, IAplayer, gameState, otherPlayer.position)[0];
        }
        return nextPosition;
    } else if(IAplayer.position.x > otherPlayer.position.x) { // Dans ce cas là, le joueur est au dessus de moi
        // console.log("Le joueur est au dessus de moi");
        nextPosition = {x: otherPlayer.position.x - 2, y: otherPlayer.position.y};
        if(nextPosition.x < 0 || checkBarriersBetween(otherPlayer.position, nextPosition, gameState)) { // Dans ce cas là, je ne peux pas enjamber le joueur
            nextPosition = dijkstraAlgorithm(IAplayer.position, IAplayer, gameState, otherPlayer.position)[0];
        }
        return nextPosition;
    } else if(IAplayer.position.y < otherPlayer.position.y) { // Dans ce cas là, le joueur est à ma droite
        // console.log("Le joueur est à ma droite");
        nextPosition = {x: otherPlayer.position.x, y: otherPlayer.position.y + 2};
        if(nextPosition.y > 16 || checkBarriersBetween(otherPlayer.position, nextPosition, gameState)) { // Dans ce cas là, je ne peux pas enjamber le joueur
            nextPosition = dijkstraAlgorithm(IAplayer.position, IAplayer, gameState, otherPlayer.position)[0];
        }
        return nextPosition;
    } else if(IAplayer.position.y > otherPlayer.position.y) { // Dans ce cas là, le joueur est à ma gauche
        // console.log("Le joueur est à ma gauche");
        nextPosition = {x: otherPlayer.position.x, y: otherPlayer.position.y - 2};
        if(nextPosition.y < 0 || checkBarriersBetween(otherPlayer.position, nextPosition, gameState)) { // Dans ce cas là, je ne peux pas enjamber le joueur
            nextPosition = dijkstraAlgorithm(IAplayer.position, IAplayer, gameState, otherPlayer.position)[0];
        }
        return nextPosition;
    }
    // À noter que ces moves peuvent être illégaux si un mur se trouve derrière l'adversaire, mais tant pis car ils seront corrigés par le random
    // du prof
}

exports.setup = setup;
exports.nextMove = nextMove;
exports.correction = correction;
exports.updateBoard = updateBoard;