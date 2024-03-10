import socket from "../sockets/socketConnection.js";

window.onload = function() {
    socket.emit('findMatch', localStorage.getItem('token'));
}
