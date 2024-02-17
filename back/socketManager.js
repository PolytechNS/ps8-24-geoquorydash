const socketIo = require('socket.io');
const gameManager = require('./logic/game/gameManager');
const fogOfWar = require('./logic/game/fogOfWarController');
const { movePlayer, getPossibleMove, updateWalls, moveIA , turn} = require("./logic/game/gameEngine");

const setupSocket = (server) => {
    const io = socketIo(server);

    io.of('/api/game').on('connection', (socket) => {
         console.log('ON Connection');
         //console.log('EMIT initializeBoard');
        socket.emit("initializeBoard", gameManager.gameState, fogOfWar.visibilityMap);
        fogOfWar.updateBoardVisibility();
        //fogOfWar.displayVisibilityMap();

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });

        socket.on('movePlayer', (targetPosition) => {
             //console.log("ON movePlayer, targetPosition recu : ", targetPosition);

            movePlayer(targetPosition);
            fogOfWar.updateBoardVisibility();

            turn();
            fogOfWar.updateBoardVisibility();

            // console.log("position joueur 1 : ", gameManager.gameState.players[0].position);
            // console.log("position joueur 2 : ", gameManager.gameState.players[1].position);
            // console.log('');

            // console.log("EMIT updateBoard");
            socket.emit('updateBoard', gameManager.gameState, fogOfWar.visibilityMap);
        });

        socket.on('possibleMoveRequest', () => {
            // console.log("ON possibleMoveRequest");
            let possibleMove = getPossibleMove();

            // console.log("EMIT possibleMoveList");
            socket.emit('possibleMoveList', possibleMove);
        });

        socket.on('toggleWall', (wall, isVertical) => {
            // console.log("ON toggleWall");
            updateWalls(wall, isVertical);
            fogOfWar.updateBoardVisibility();

            // console.log("EMIT updateBoard");
            socket.emit('updateBoard', gameManager.gameState, fogOfWar.visibilityMap);
        })
    });
}

module.exports = setupSocket;