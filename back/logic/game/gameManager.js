const { nextMove } = require("../ai/geoquorydash.js");
const { setup } = require("../ai/geoquorydash.js");
const { retrieveGameStateFromDB } = require("../../models/game/gameDataBaseManager.js");

class GameManager {
    gameStateList = {};

    gameState = {
        players: [
            {
            position: null,
            id: null,
            walls: [],
            isCurrentPlayer: false
            }
        ]
    };

    gameStateTeacherList = {};
    gameStateTeacher = {
        opponentWalls: [],    // Contient un tableau de tableau, eux même contenant une position et un isVertical
        ownWalls: [],         // Pareil
        board: []
    };

    constructor() {}

    async resumeGame(gameStateID) {
        try {
            const gameState = await retrieveGameStateFromDB(gameStateID);
            if (gameState) {
                this.gameStateList[gameStateID] = gameState;
                return gameState;
            }
            return null;
        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
            return null;
        }
    }


    initializeDefaultGameState(id) {
        this.gameStateList[id] = {
            players: [
                {
                    id: "player1",
                    position: {x: 0, y: 8},
                    walls: [],
                    isCurrentPlayer: false
                },
                {
                    id: "player2",
                    position: {x: 16, y: 8},
                    walls: [],
                    isCurrentPlayer: true
                }
            ],
            isGameActive: true
        };
        this.gameStateTeacherList[id] = {
            opponentWalls: [],
            ownWalls: [],
            board: []
        };
    }

    initializeDefaultOnlineGameState(id) {
        // genere un booleen aleatoire pour savoir qui commence
        let randomBoolean = Math.random() >= 0.5;
        this.gameStateList[id] = {
            players: [
                {
                    id: "player1",
                    position: { x: 0, y: 8 },
                    walls: [],
                    isCurrentPlayer: randomBoolean
                },
                {
                    id: "player2",
                    position: {x: 16, y: 8},
                    walls: [],
                    isCurrentPlayer: !randomBoolean
                }
            ],
            isGameActive: true
        };
    }

    initializeDefaultOnlineGameState(id) {
        // genere un booleen aleatoire pour savoir qui commence
        let randomBoolean = Math.random() >= 0.5;
        this.gameStateList[id] = {
            players: [
                {
                    id: "player1",
                    position: { x: 0, y: 8 },
                    walls: [],
                    isCurrentPlayer: randomBoolean
                },
                {
                    id: "player2",
                    position: { x: 16, y: 8 },
                    walls: [],
                    isCurrentPlayer: !randomBoolean
                }
            ],
            isGameActive: true
        };
    }

    convertGameStateToGameStateTeacher(visibilityMap, id) {
        // Dans cette partie, nous sommes l'ia, donc les murs de l'ia seront ownWalls
        let IAplayer = this.gameStateList[id].players.find(player => player.id === "player1");
        let IAplayerWalls = IAplayer.walls;
        this.gameStateTeacherList[id].ownWalls = [];
        this.addWallsToAPlayer(IAplayerWalls, this.gameStateTeacherList[id].ownWalls);

        // Le joueur local p2 est le joueur adverse par rapport à l'ia, donc ses murs seront dans opponentWalls
        let localPlayer = this.gameStateList[id].players.find(player => player.id === "player2");
        let localPlayerWalls = localPlayer.walls;
        this.gameStateTeacherList[id].opponentWalls = [];
        this.addWallsToAPlayer(localPlayerWalls, this.gameStateTeacherList[id].opponentWalls);

        this.gameStateTeacherList[id].board = [];
        this.gameStateTeacherList[id].board = this.rearrangeVisibilityMapToBoard(visibilityMap);
        let convertedIAplayerPosition = this.convertMyPositionToTeacherPosition(IAplayer.position);
        this.gameStateTeacherList[id].board[parseInt(convertedIAplayerPosition[0]) - 1][parseInt(convertedIAplayerPosition[1]) - 1] = 1;
        let convertedLocalPlayerPosition = this.convertMyPositionToTeacherPosition(localPlayer.position);
        // On regarde si notre ia est censée voir le joueur local via la visibilityMap
        if(this.gameStateTeacherList[id].board[parseInt(convertedLocalPlayerPosition[0]) - 1][parseInt(convertedLocalPlayerPosition[1]) - 1] >= 0) {
            // Si oui, on met le joueur
            this.gameStateTeacherList[id].board[parseInt(convertedLocalPlayerPosition[0]) - 1][parseInt(convertedLocalPlayerPosition[1]) - 1] = 2;
        }
    }

    convertGameStateTeacherToGameState() {
        let IAplayer = this.gameState.players.find(player => player.id === "player1");
        IAplayer.walls = [];
        IAplayer.walls = reconstructWallsListWithTopLeftCorners(this.gameStateTeacher.ownWalls);

        let localPlayer = this.gameState.players.find(player => player.id === "player2");
        localPlayer.walls = [];
        localPlayer.walls = reconstructWallsListWithTopLeftCorners(this.gameStateTeacher.opponentWalls);

        for(let i = 0; i < 9; i++) {
            for(let j = 0; j < 9; j++) {
                if(this.gameStateTeacher.board[i][j] === 1) {           // Dans ce cas, il s'agit de la case sur laquelle mon bot se trouve
                    var teacherPosition = `${i}${j}`;
                    var myPosition = this.convertTeacherPositionToMyPosition(teacherPosition);
                    IAplayer.position = myPosition;
                } else if(this.gameStateTeacher.board[i][j] === 2) {    // Dans ce cas, il s'agit de la case sur laquelle mon opposant se trouve
                    var teacherPosition = `${i}${j}`;
                    var myPosition = this.convertTeacherPositionToMyPosition(teacherPosition);
                    otherPlayer.position = myPosition;
                }
            }
        }
    }

    reconstructWallsListWithTopLeftCorners(walls) {
        var wallsList = [];
        walls.forEach(wall => {
            let oneWall = [];
            var topLeftCornerPosition = this.convertTeacherPositionToMyPosition(wall[0]);
            if(wall[1] === 1) {     // Dans ce cas là, le mur est vertical
                oneWall.push({x: topLeftCornerPosition.x, y: topLeftCornerPosition.y + 1});
                oneWall.push({x: topLeftCornerPosition.x + 1, y: topLeftCornerPosition.y + 1});
                oneWall.push({x: topLeftCornerPosition.x + 2, y: topLeftCornerPosition.y + 1});
            } else {                // Dans ce cas là, le mur est horizontal
                oneWall.push({x: topLeftCornerPosition.x + 1, y: topLeftCornerPosition.y});
                oneWall.push({x: topLeftCornerPosition.x + 1, y: topLeftCornerPosition.y + 1});
                oneWall.push({x: topLeftCornerPosition.x + 1, y: topLeftCornerPosition.y + 2});
            }
            wallsList.push(oneWall);
        });
        return wallsList;
    }

    rearrangeVisibilityMapToBoard(array) {
        let result = [];
        for (let i = 0; i < 9; i++) {
            let intermediateArray = [];
            let start = 81 - 9 + i;
            for(let j = 0; j < 9; j++) {
                if(array[start - 9*j] >= 0) {
                    intermediateArray.push(0);
                } else {
                    intermediateArray.push(-1);
                }
            }
            result.push(intermediateArray);
        }
        return result;
    }

    addWallsToAPlayer(playerWalls, gameStateTeacherPlayerWalls) {
        playerWalls.forEach(wall => {
            let isVertical = 1;
            if(wall[0].x === wall[1].x) {
                // Dans ce cas là, le mur est horizontal
                isVertical = 0;
                let topLeftSquarePosition = {x: wall[0].x - 1, y: wall[0].y};
                let topLeftSquareTeacherPosition = this.convertMyPositionToTeacherPosition(topLeftSquarePosition);
                gameStateTeacherPlayerWalls.push([topLeftSquareTeacherPosition, isVertical]);
            } else {
                // isVertical reste à 1
                let topLeftSquarePosition = {x: wall[0].x, y: wall[0].y - 1};
                let topLeftSquareTeacherPosition = this.convertMyPositionToTeacherPosition(topLeftSquarePosition);
                gameStateTeacherPlayerWalls.push([topLeftSquareTeacherPosition, isVertical]);
            }
        });
    }

    convertMyPositionToTeacherPosition(myPosition) {
        let teacherPosition = {x: (myPosition.y / 2) + 1, y: 10 - ((myPosition.x / 2) + 1)};
        return `${teacherPosition.x}${teacherPosition.y}`;
    }

    convertTeacherPositionToMyPosition(teacherPosition) {
        let xTeacherPosition = parseInt(teacherPosition[0]);
        let yTeacherPosition = parseInt(teacherPosition[1]);
        let myPosition = {x: 2*(9 - yTeacherPosition), y: 2*(xTeacherPosition - 1)};
        return myPosition;
    }

    async computeMyAINextMove(gameStateTeacher, getAdjacentCellsPositionsWithWalls) {
        var myGameState = this.convertGameStateTeacherToGameState(gameStateTeacher);
        let nextPositionToGo = await computeMoveForAI(getAdjacentCellsPositionsWithWalls);
        let stringNextPositionToGo = this.convertMyPositionToTeacherPosition(nextPositionToGo);
        return stringNextPositionToGo;
    }

    // Methods to manage the game
    computeMoveForAI(visibilityMap, id){
        console.log(this.gameStateList[id].players[0].walls);
        // console.log("\n");
        // console.log("On va tenter de convertir le gameState en gameStateTeacher");

        // console.log("Affichage de la visibility map : ");
        let result = [];
        for (let i = 0; i < 9; i++) {
            let intermediateArray = [];
            let start = 81 - 9 + i;
            for(let j = 0; j < 9; j++) {
                intermediateArray.push(visibilityMap[start - 9*j]);
            }
            result.push(intermediateArray);
        }
        // this.printBoard(result);

        this.convertGameStateToGameStateTeacher(visibilityMap, id);
        // console.log("Nombre de mur de l'adversaire : " + this.gameStateTeacherList[id].opponentWalls.length);
        // console.log("Nombre de mur du joueur courant (ia) : " + this.gameStateTeacherList[id].ownWalls.length);
        // console.log("Affichage du board : ");
        this.printBoard(this.gameStateTeacherList[id].board);
        // console.log("Fin de la conversion du gameState en gameStateTeacher\n");
        return nextMove(this.gameStateTeacherList[id], this.gameStateList[id].players);
    }

    async computeNextMoveForAI(getAdjacentCellsPositionsWithWalls) {
        return await nextMove(getAdjacentCellsPositionsWithWalls);
    }

    printBoard(board) {
        for(let i = 8; i >= 0; i--) {
            let stringToPrint = "| ";
            for(let j = 0; j < 9; j++) {
                stringToPrint += board[j][i];
                if(board[j][i] >= 0) {
                    stringToPrint += " ";
                }
                stringToPrint += " ";
            }
            stringToPrint += "|";
            console.log(stringToPrint);
        }
        console.log("\n");
    }

    validateMove(move) {
        let pos;
        for (let player of this.gameState.players) {
            if (player.id === 'ia') {
                pos = player.position;
                break;
            }
        }

        pos.x=move.x;
        pos.y=move.y;
    }

    getGameState() {
        return this.gameState;
    }

    getPlayerById(playerId) {
        return this.gameState.players.find(player => player.id === playerId);
    }

    getPlayers(gameStateID) {
        return this.gameStateList[gameStateID].players;
    }

    getBoardWalls(gameStateID) {
        let boardWalls = [];
        this.gameStateList[gameStateID].players.forEach(player => {
            player.walls.forEach(wall => {
                wall.forEach(cell => {
                    boardWalls.push(cell);
                });
            });
        });
        return boardWalls;
    }

    getCurrentPlayer(id) {
        return this.gameStateList[id].players.find(player => player.isCurrentPlayer);
    }

    getOtherPlayer(id) {
        return this.gameStateList[id].players.find(player => !player.isCurrentPlayer);
    }

    isGameActive(id) {
        return this.gameStateList[id].isGameActive;
    }

    endGame(id) {
        this.gameStateList[id].isGameActive = false;
    }
}

const gameManagerInstance = new GameManager();
module.exports = gameManagerInstance;
