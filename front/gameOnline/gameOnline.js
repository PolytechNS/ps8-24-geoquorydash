import socket from "../sockets/socketConnection.js";

window.onload = function() {
    console.log('AZY');
    localStorage.setItem('gameStateID', 'waitingForMatch');
    socket.emit('findMatch', localStorage.getItem('token'));
    askTextButtonInteraction();
}

function askTextButtonInteraction() {
    let roomId = localStorage.getItem('roomId');
    let token = localStorage.getItem('token');
    console.log('EMIT askTextButtonInteraction')
    socket.emit('askTextButtonInteraction', token);
}

socket.on('answerTextButtonInteraction', (text) => {
    console.log('ON answerTextButtonInteraction ', text );
    setTextButtonInteraction(text);
});

function setTextButtonInteraction(text) {
    const buttonContainer = document.getElementById('interaction-container');
    for (let i = 0; i < 6; i++) {
        const button = document.createElement('button');
        button.innerHTML = text[i];
        button.onclick = function() {
            socket.emit('displayText', localStorage.getItem('roomId'), text[i]);
        }
        buttonContainer.appendChild(button);
    }
}

window.onbeforeunload = function() {
    localStorage.removeItem('gameStateID');
    localStorage.removeItem('roomId');
}

socket.on('displayText', (text) => {
    alert(text);
});