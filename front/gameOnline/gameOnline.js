import socket from "../sockets/socketConnection.js";

window.onload = function() {
    socket.emit('findMatch', localStorage.getItem('token'));
}

const button = document.getElementById('newGameButton');
button.addEventListener('click', function() {
    socket.emit('test', 'test');
});