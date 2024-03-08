class GameOnlineManager {
    waitingPlayersSockets = [];
    constructor() {}

    addPlayerSocketToWaitList(socket) {
        this.waitingPlayersSockets.push(socket);
    }

    tryMatchmaking = (io) => {
        // This example uses a simple first-come, first-served approach.
        // You could enhance it with more sophisticated matchmaking logic based on player levels or ratings.
        while (this.waitingPlayersSockets.length >= 2) {
            const socket1 = this.waitingPlayersSockets.shift();
            const socket2 = this.waitingPlayersSockets.shift();

            // Create a new game room and notify the matched players
            const roomId = socket1.id + "_" + socket2.id; // Example room ID generation logic
            socket1.join(roomId);
            socket2.join(roomId);

            // Notify players they have been matched and the game is starting
            io.of('/api/game').to(roomId).emit('matchFound', roomId);
        }
    };


}

const GameOnlineManagerInstance = new GameOnlineManager();
module.exports = GameOnlineManagerInstance;