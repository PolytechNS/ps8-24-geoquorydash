// const { computeMove, computeMoveForAI } = require("../ai/ai.js")
const { nextMove } = require("../ai/geoquorydash.js");
const { setup } = require("../ai/geoquorydash.js");
//const fogOfWarInstance = require("./fogOfWarController.js");

class GameManager {
    gridMap = [];

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

    gameStateTeacher = {
        opponentWalls: [],    // Contient un tableau de tableau, eux même contenant une position et un isVertical
        ownWalls: [],         // Pareil
        board: []
    };

    constructor() {
        this.gridMap = new Array(17).fill(0).map(() => new Array(17).fill(0));
        this.gameState = {
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
                    isCurrentPlayer: true // Au départ, le user courant est le joueur 2
                }
            ]
        };

        setup(2);
        console.log("Setup fait");


        return this;
    }

    convertGameStateToGameStateTeacher(fogOfWar) {
        // Dans cette partie, nous sommes l'ia, donc les murs de l'ia seront ownWalls
        let IAplayer = this.gameState.players.find(player => player.id === "ia");
        let IAplayerWalls = IAplayer.walls;
        this.gameStateTeacher.ownWalls = [];
        this.addWallsToAPlayer(IAplayerWalls, this.gameStateTeacher.ownWalls);

        // Le joueur local p2 est le joueur adverse par rapport à l'ia, donc ses murs seront dans opponentWalls
        let localPlayer = this.gameState.players.find(player => player.id === "p2");
        let localPlayerWalls = localPlayer.walls;
        this.gameStateTeacher.opponentWalls = [];
        this.addWallsToAPlayer(localPlayerWalls, this.gameStateTeacher.opponentWalls);

        this.gameStateTeacher.board = [];
        this.gameStateTeacher.board = this.rearrangeVisibilityMapToBoard(fogOfWar.visibilityMap);
        let convertedIAplayerPosition = this.convertMyPositionToTeacherPosition(IAplayer.position);
        this.gameStateTeacher.board[parseInt(convertedIAplayerPosition[0]) - 1][parseInt(convertedIAplayerPosition[1]) - 1] = 1;
        let convertedLocalPlayerPosition = this.convertMyPositionToTeacherPosition(localPlayer.position);
        // On regarde si notre ia est censée voir le joueur local via la visibilityMap
        if(this.gameStateTeacher.board[parseInt(convertedLocalPlayerPosition[0]) - 1][parseInt(convertedLocalPlayerPosition[1]) - 1] >= 0) {
            // Si oui, on met le joueur
            this.gameStateTeacher.board[parseInt(convertedLocalPlayerPosition[0]) - 1][parseInt(convertedLocalPlayerPosition[1]) - 1] = 2;
        }
    }

    convertGameStateTeacherToGameState() {
        let IAplayer = this.gameState.players.find(player => player.id === "ia");
        IAplayer.walls = [];
        IAplayer.walls = reconstructWallsListWithTopLeftCorners(this.gameStateTeacher.ownWalls);

        let localPlayer = this.gameState.players.find(player => player.id === "p2");
        localPlayer.walls = [];
        localPlayer.walls = reconstructWallsListWithTopLeftCorners(this.gameStateTeacher.opponentWalls);

        for(let i = 0; i < 9; i++) {
            for(let j = 0; j < 9; j++) {
                if(this.gameStateTeacher.board[i][j] === 1) {           // Dans ce cas, il s'agit de la case sur laquelle mon bot se trouve
                    teacherPosition = `${i}${j}`;
                    myPosition = this.convertTeacherPositionToMyPosition(teacherPosition);
                    IAplayer.position = myPosition;
                } else if(this.gameStateTeacher.board[i][j] === 2) {    // Dans ce cas, il s'agit de la case sur laquelle mon opposant se trouve
                    teacherPosition = `${i}${j}`;
                    myPosition = this.convertTeacherPositionToMyPosition(teacherPosition);
                    localPlayer.position = myPosition;
                }
            }
        }
    }

    reconstructWallsListWithTopLeftCorners(walls) {
        wallsList = [];
        walls.forEach(wall => {
            let oneWall = [];
            topLeftCornerPosition = this.convertTeacherPositionToMyPosition(wall[0]);
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

    // Cette méthode n'est pas appelée 
    /*async computeMyAINextMove(gameStateTeacher, getAdjacentCellsPositionsWithWalls) {
        myGameState = this.convertGameStateTeacherToGameState(gameStateTeacher);
        let nextPositionToGo = await this.computeMoveForAI(getAdjacentCellsPositionsWithWalls);
        let stringNextPositionToGo = this.convertMyPositionToTeacherPosition(nextPositionToGo);
        return stringNextPositionToGo;
    }*/

    // Methods to manage the game
    computeMoveForAI(fogOfWar){
        console.log("\n");
        console.log("On va tenter de convertir le gameState en gameStateTeacher");

        console.log("Affichage de la visibility map : ");
        let result = [];
        for (let i = 0; i < 9; i++) {
            let intermediateArray = [];
            let start = 81 - 9 + i;
            for(let j = 0; j < 9; j++) {
                intermediateArray.push(fogOfWar.visibilityMap[start - 9*j]);
            }
            result.push(intermediateArray);
        }
        this.printBoard(result);

        this.convertGameStateToGameStateTeacher(fogOfWar);
        console.log("Nombre de mur de l'adversaire : " + this.gameStateTeacher.opponentWalls.length);
        console.log("Nombre de mur du joueur courant (ia) : " + this.gameStateTeacher.ownWalls.length);
        console.log("Affichage du board : ");
        this.printBoard(this.gameStateTeacher.board);
        console.log("Fin de la conversion du gameState en gameStateTeacher\n");
        return nextMove(this.gameStateTeacher);
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

    getBoardWalls() {
        let boardWalls = [];
        this.gameState.players.forEach(player => {
            player.walls.forEach(wall => {
                wall.forEach(cell => {
                    boardWalls.push(cell);
                });
            });
        });
        return boardWalls;
    }

    getCurrentPlayer() {
        return this.gameState.players.find(player => player.isCurrentPlayer === true);
    }
}

const gameManagerInstance = new GameManager();
module.exports = gameManagerInstance;
