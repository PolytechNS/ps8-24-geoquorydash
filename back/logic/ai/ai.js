// This function doesn't handle walls.
function computeMove(gameState) {
    let pos;
    for (let player of gameState.players) {
        if (player.id === 'ia') {
            pos = player.position;
            break;
        }
    }

    let possibleMoves = [];
    // Check if moving left is possible.
    if (pos.y > 0) possibleMoves.push({x: pos.x, y: pos.y-2});
    // Check if moving right is possible.
    if (pos.y < 16) possibleMoves.push({x: pos.x, y: pos.y+2});
    // Check if moving down is possible.
    if (pos.x > 0) possibleMoves.push({x: pos.x-2, y: pos.y});
    // Check if moving up is possible.
    if (pos.y < 16) possibleMoves.push({x: pos.x+2, y: pos.y});

    // Get a random integer between 0 and possibleMoves.length-1
    let moveIndex = Math.floor(Math.random()*possibleMoves.length);

    return possibleMoves[moveIndex];
}

module.exports = { computeMove };
