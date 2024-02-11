var socket = io();

socket.on('connect', function() {
    console.log('Connexion réussie!');
});