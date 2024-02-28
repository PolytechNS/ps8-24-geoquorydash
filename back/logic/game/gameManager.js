const { computeMove, computeMoveForAI } = require("../ai/ai.js")
const { dijkstraAlgorithm } = require("../ai/geoquorydash.js");
const createUserCollection = require('../../models/users/users');
// const { getAdjacentCellsPositionsWithWalls } = require("./gameEngine");
// const fogOfWarInstance = require("./fogOfWarController.js");

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
        opponentWalls: [[]], // contient une position et un isVertical
        ownWalls: [[]], // pareil
        board: [[]]
    };

    constructor() {
/*        console.log('GameManager constructor');
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
        return this;*/
    }

    async initializeGameStateFromDB() {
        try {
            const usersCollection = await createUserCollection();
            const userGameState = await usersCollection.findOne({ username: "lucie" });
            if (userGameState && userGameState.gameState) {
                // console.log('GameState initialized from DB:');
                return userGameState.gameState;
            } else {
                console.error('Les données de l\'état du jeu sont manquantes ou incorrectes.');
            }
        } catch (error) {
            console.error('Erreur lors de l\'utilisation de getGameState:', error);
            throw error;
        }
    }

    async initializeGameState() {
        const userGameState = await this.initializeGameStateFromDB();
        if (userGameState) {
            this.gameState = userGameState;
            // console.log('GameState DB');
        } else {
            console.log('GameState default');
        }
    }

    initializeDefaultGameState() {
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
                    isCurrentPlayer: true
                }
            ]
        };
        console.log(this.gameState);
    }

    // convertGameStateToGameStateTeacher() {
    //     let IAplayer = this.gameState.players.find(player => player.id === "ia");
    //     let IAplayerWalls = IAplayer.walls;
    //     this.gameStateTeacher.ownWalls = [];
    //     this.addWallsToAPlayer(IAplayerWalls, this.gameStateTeacher.ownWalls);
    //     let otherPlayer = this.gameState.players.find(player => player.id === "p2");
    //     let otherPlayerWalls = otherPlayer.walls;
    //     this.gameStateTeacher.opponentWalls = [];
    //     this.addWallsToAPlayer(otherPlayerWalls, this.gameStateTeacher.opponentWalls);
    //     this.gameStateTeacher.board = [[]];
    //     this.gameStateTeacher.board = this.rearrangeVisibilityMapToBoard(fogOfWarInstance.visibilityMap);
    //     let convertedIAplayerPosition = this.convertMyPositionToTeacherPosition(IAplayer.position);
    //     this.gameStateTeacher.board[parseInt(convertedIAplayerPosition[0]) - 1][parseInt(convertedIAplayerPosition[1]) - 1] = 1;
    //     let convertedOtherPlayerPosition = this.convertMyPositionToTeacherPosition(otherPlayer.position);
    //     this.gameStateTeacher.board[parseInt(convertedOtherPlayerPosition[0]) - 1][parseInt(convertedOtherPlayerPosition[1]) - 1] = 2;
    // }

    convertGameStateTeacherToGameState() {
        let IAplayer = this.gameState.players.find(player => player.id === "ia");
        IAplayer.walls = [];
        IAplayer.walls = reconstructWallsListWithTopLeftCorners(this.gameStateTeacher.ownWalls);

        let otherPlayer = this.gameState.players.find(player => player.id === "p2");
        otherPlayer.walls = [];
        otherPlayer.walls = reconstructWallsListWithTopLeftCorners(this.gameStateTeacher.opponentWalls);

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
            let start = 81 - 9 * (i + 1);
            let end = start + 9;
            for(let j = start; j < end; j++) {
                if(array[start] >= 0) {
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
    computeMoveForAI(getAdjacentCellsPositionsWithWalls){
        let iaPlayer = this.gameState.players.find(player => player.id === "ia");
        let iaPosition = iaPlayer.position;
        return dijkstraAlgorithm(iaPosition, getAdjacentCellsPositionsWithWalls);
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
