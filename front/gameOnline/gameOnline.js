import socket from "../sockets/socketConnection.js";

window.onload = function() {
    console.log('AZY');
    localStorage.setItem('gameStateID', 'waitingForMatch');
    socket.emit('findMatch', localStorage.getItem('token'));
}

window.onbeforeunload = function() {
    localStorage.removeItem('gameStateID');
    localStorage.removeItem('roomId');
}