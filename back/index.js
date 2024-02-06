const http = require('http');
const express = require('express');
const socketIo = require('socket.io');

// Import des gestionnaires de requêtes pour les fichiers et l'API
const fileQuery = require('./queryManagers/front.js');
const apiQuery = require('./queryManagers/api.js');

// Création de l'application Express
const app = express();

// Création du serveur HTTP à partir de l'application Express
const server = http.createServer(app);

// Création de l'instance Socket.IO en utilisant le serveur HTTP
const io = socketIo(server);

// Middleware pour gérer les requêtes REST
app.use('/api', (req, res, next) => {
    // Passer la requête au gestionnaire API
    apiQuery.manage(req, res);
});

// Middleware pour gérer les requêtes de fichiers
app.use('/', (req, res, next) => {
    // Passer la requête au gestionnaire de fichiers
    fileQuery.manage(req, res);
});

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
    console.log('Un utilisateur s\'est connecté.');

    // Gestion des événements Socket.IO
    socket.on('chat message', (msg) => {
        console.log('Nouveau message : ' + msg);
        // Diffusion du message à tous les utilisateurs connectés
        io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        console.log('Un utilisateur s\'est déconnecté.');
    });
});

// Lancement du serveur
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
