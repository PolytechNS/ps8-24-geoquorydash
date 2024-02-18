# Pour que notre serveur nodejs se base sur l’image voulue 
FROM node:18-slim

# Pour définir le répertoire de travail dans le conteneur, là où seront exécutées les commandes RUN, CMD,  COPY…
WORKDIR /app

# Pour ajouter les fichiers de définition des dépendances
COPY package*.json ./

# Pour installer les dépendances
RUN npm install

# Pour copier les fichiers sources de l’application dans le conteneur
COPY back .

# Pour copier les fichiers sources de l’application dans le conteneur
COPY front ./front

# Pour exposer le port sur lequel l’application d’exécute
EXPOSE 8000

# Pour démarrer l’application, en tapant en réalité dans le terminal du conteneur la commande ‘’node index.js’’
CMD ["node", "index.js"]