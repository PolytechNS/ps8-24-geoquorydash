// This function doesn't handle walls.
function computeMoveForAI(gameState, getPossibleMove) {

    let possibleMoves = getPossibleMove;

    // Get a random integer between 0 and possibleMoves.length-1
    let moveIndex = Math.floor(Math.random()*possibleMoves.length);

    return possibleMoves[moveIndex];
}

module.exports = { computeMoveForAI };

// CETTE FONCTION N'EST JAMAIS APPELÉE DANS L'ÉTAT ACTUEL DES CHOSES