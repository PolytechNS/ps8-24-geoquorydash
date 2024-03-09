class GameOnlineManager {
    waitingPlayersSockets = [];
    constructor() {}

    addPlayerSocketToWaitList(socket) {
        console.log('Player added to wait list');
        this.waitingPlayersSockets.push(socket);
    }

    isPlayerInWaitList(socket) {
        console.log(this.waitingPlayersSockets);
        return this.waitingPlayersSockets.includes(socket);
    }

    removePlayerSocketFromWaitList(socket) {
        const index = this.waitingPlayersSockets.indexOf(socket);
        if (index > -1) {
            console.log('Player removed from wait list');
            this.waitingPlayersSockets.splice(index, 1);
        }
    }

    tryMatchmaking = (io) => {
        while (this.waitingPlayersSockets.length >= 2) {
            const socket1 = this.waitingPlayersSockets.shift();
            const socket2 = this.waitingPlayersSockets.shift();

            const roomId = socket1.id + "_" + socket2.id;
            socket1.join(roomId);
            socket2.join(roomId);

            io.of('/api/game').to(roomId).emit('matchFound', roomId);
        }
    };


}

const GameOnlineManagerInstance = new GameOnlineManager();
module.exports = GameOnlineManagerInstance;