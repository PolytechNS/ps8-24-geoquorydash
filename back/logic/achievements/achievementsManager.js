const { updateAchievementsInDatabase } = require('../../models/users/achievements.js');

class AchievementsManager {
    achievements = [];
    constructor() {
        this.achievements = [
            // Mettre des images par la suite
            {
                "id": 1,
                "nom": "Un stratège est né",
                "description": "Gagnez une partie pour la première fois."
            },
            {
                "id": 2,
                "nom": "J'ai pas le temps",
                "description": "Gagnez une partie en moins d'une minute.",
            },
            {
                "id": 3,
                "nom": "Tu veux un curly ?",
                "description": "Ajoutez votre 1er ami.",
            },
            {
                "id": 4,
                "nom": "Trop famous",
                "description": "Ajoutez 5 amis à votre liste d'amis.",
            },
            {
                "id": 5,
                "nom": "Marathonien",
                "description": "Jouez un total de 50 parties.",
            },
            {
                "id": 5,
                "nom": "Point faible : trop fort",
                "description": "Gagnez 5 parties d'affilée.",
            },
            {
                "id": 6,
                "nom": "Português",
                "description": "Tu as posé tous tes murs lors d'une partie. (Tu comptes construire quoi au juste ??)"
            }
        ]
    };

    async checkNewAchievements(userId, temporaryStat, statistics) {
        // console.log("On regarde si le joueur a gagné pour la première fois");
        if(statistics.numberOfVictory === 1) {
            // console.log("Le joueur a gagné pour la première fois");
            await updateAchievementsInDatabase(userId, this.achievements[0]);
        }

        // console.log("On regarde si la game a duré moins d'une minute");
        const lastGame = statistics.winLooseArray.slice(-1);
        if(temporaryStat.playingTimeDuration < 60000 && lastGame[0] === "win") {
            // console.log("La game a duré moins d'une minute");
            await updateAchievementsInDatabase(userId, this.achievements[1]);
        }

        /*console.log("On regarde si le joueur a ajouté son premier ami");
        if(statistics.numberOfFriends === 1) {
            await updateAchievementsInDatabase(userId, this.achievements[2])
        }

        console.log("On regarde si le joueur a ajouté 5 amis");
        if(statistics.numberOfFriends === 5) {
            await updateAchievementsInDatabase(userId, this.achievements[3])
        }*/

        // console.log("On regarde si le joueur a joué 50 parties");
        if(statistics.numberOfPlayedGames === 50) {
            // console.log("Le joueur a joué 50 parties");
            await updateAchievementsInDatabase(userId, this.achievements[4]);
        }

        // console.log("On regarde si le joueur a gagné 5 parties d'affilée");
        const lastFive = statistics.winLooseArray.slice(-5); // Get the last 5 elements of the array
        if(lastFive.every(result => result === "win") && lastFive.length >= 5) {
            // console.log("Le joueur a gagné 5 parties d'affilée");
            await updateAchievementsInDatabase(userId, this.achievements[5]);
        }

        // console.log("On regarde si le joueur a posé tous ses murs lors d'une partie");
        if(temporaryStat.numberOfWallsInstalled === 10) {
            // console.log("Le joueur a posé tous ses murs lors d'une partie");
            await updateAchievementsInDatabase(userId, this.achievements[6]);
        }
    }

    async checkNewFriendsAchievements(userId, numberOfFriends) {
        // console.log("On regarde si le joueur a ajouté son premier ami");
        if(numberOfFriends === 1) {
            // console.log("Le joueur a ajouté son premier ami");
            await updateAchievementsInDatabase(userId, this.achievements[2])
        }

        // console.log("On regarde si le joueur a ajouté 5 amis");
        if(numberOfFriends === 5) {
            // console.log("Le joueur a ajouté 5 amis");
            await updateAchievementsInDatabase(userId, this.achievements[3])
        }
    
    }
}

const achievementsManagerInstance = new AchievementsManager();
module.exports = achievementsManagerInstance;