const { getPossibleMove } = require("../gameEngine/gameEngine");

// This function doesn't handle walls.
function computeMove(gameState) {
    let pos;
    for (let player of gameState.players) {
        if (player.id === 'ia') {
            pos = player.position;
            break;
        }
    }

    let possibleMoves = getPossibleMove();

    // Get a random integer between 0 and possibleMoves.length-1
    let moveIndex = Math.floor(Math.random()*possibleMoves.length);

    return possibleMoves[moveIndex];
}

module.exports = { computeMove };