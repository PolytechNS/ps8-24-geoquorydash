const geoquorydash = require('./geoquorydash');

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

    let opponentWalls2 = [

    ];
    let ownWalls2 = [
        ["16",1],
        ["27",0]
    ];
    let formerboard2 = [
        [0,0,0,0,0,-1,-1,-1,-1],
        [0,0,0,0,-1,-1,-1,-1,-1],
        [0,0,0,0,-1,-1,-1,-1,-1],
        [0,0,0,0,-1,-1,-1,-1,-1],
        [1,0,0,0,0,-1,-1,-1,-1],
        [0,0,0,0,0,-1,-1,-1,-1],
        [0,0,0,0,0,-1,-1,-1,-1],
        [0,0,0,0,0,-1,-1,-1,-1],
        [0,0,0,0,0,-1,-1,-1,-1]
    ];
    let board2 = [
        [0,0,0,0,0,-1,-1,-1,-1],
        [0,0,0,0,-1,-1,-1,-1,-1],
        [0,0,0,0,-1,-1,-1,-1,-1],
        [0,0,0,0,-1,-1,-1,-1,-1],
        [1,0,0,0,0,-1,-1,-1,-1],
        [0,0,0,0,0,-1,-1,-1,-1],
        [0,0,0,0,0,-1,-1,-1,-1],
        [0,0,0,0,0,-1,-1,-1,-1],
        [0,0,0,0,0,-1,-1,-1,-1]
    ];

    let opponentWalls3 = [
        ["57",0]
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
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,1,2,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0]
    ];

    let opponentWalls4 = [];
    let ownWalls4 = [];
    let board4 = [[0,0,0,0,0,-1,-1,-1,-1],[0,0,0,0,0,-1,-1,-1,-1],[0,0,0,0,0,-1,-1,-1,-1],[0,0,0,0,0,-1,-1,-1,-1],[1,0,0,0,0,-1,-1,-1,-1],[0,0,0,0,0,-1,-1,-1,-1],[0,0,0,0,0,-1,-1,-1,-1],[0,0,0,0,0,-1,-1,-1,-1],[0,0,0,0,0,-1,-1,-1,-1]];

    console.log("-----------------------------------------------------------------------");
    await geoquorydash.setup(1);
    console.log("Le setup a bien été effectué\n");
    console.log("Le jeu a avancé et l'état du plateau de jeu est désormais :\n")
    let gameStateTeacherStruct = {
        opponentWalls: [],        // Contient des tableaux, eux mêmes contenant une position et un isVertical
        ownWalls: [],             // Pareil
        board: []
    };
    gameStateTeacherStruct.opponentWalls = opponentWalls3;
    gameStateTeacherStruct.ownWalls = ownWalls4;
    gameStateTeacherStruct.board = board3;
    printBoard(gameStateTeacherStruct.board);
    //formerPositionOfOtherPlayer = {x: 2, y: 8};
    let start = Date.now();
    await geoquorydash.nextMove(gameStateTeacherStruct).then((move) => {
        console.log("NEXT MOVE: ",move);
        let timeTaken = Date.now() - start;
        console.log("Total time taken : " + timeTaken + " milliseconds");
    });
    console.log("-----------------------------------------------------------------------");
}

main();