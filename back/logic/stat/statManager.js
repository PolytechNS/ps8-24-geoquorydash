const { updateStatInDatabase } = require("../../models/users/stat.js");

class StatManager {
    temporaryStatArray = [];
    constructor() {};

    getTemporaryStatById(userId) {
        return this.temporaryStatArray.find(temporaryStat => temporaryStat.userId === userId);
    }

    createTemporaryStat(userId, opponentUserId, gameType, playerId) {
        try {
            const temporaryStat = {
                userId : userId,
                opponentUserId : opponentUserId,
                gameType : gameType,    // Ce sera local ou online
                playerId : playerId,    // Ce sera player1 ou player2
                playingTimeDuration : Date.now(),
                numberOfMoves : 0,
                numberOfWallsInstalled : 0
            };
            this.temporaryStatArray.push(temporaryStat);
        } catch (error) {
            console.error("Error while creating temporary stat:", error);
        }
    }

    updateTemporaryStat(userId, moveType) {
        try {
            var temporaryStat = this.getTemporaryStatById(userId);
            if(moveType === "move") {
                temporaryStat.numberOfMoves += 1;
            } else if(moveType === "wall") {
                temporaryStat.numberOfWallsInstalled += 1;
            }
        } catch (error) {
            console.error("Error while updating temporary stat:", error);
        }
    }

    async updateStat(userId, gameEndTime, winnerId) {
        try {
            var temporaryStatIndex = this.temporaryStatArray.findIndex(temporaryStat => temporaryStat.userId === userId);
            
            if(temporaryStatIndex !== -1) {
                var temporaryStat = this.temporaryStatArray[temporaryStatIndex];
                temporaryStat.playingTimeDuration = gameEndTime - temporaryStat.playingTimeDuration;
                await updateStatInDatabase(userId, temporaryStat, winnerId);
                console.log("Les stats du joueur gagnant ont été mises à jour");
    
                if(temporaryStat.opponentUserId) {
                    var opponentTemporaryStatIndex = this.temporaryStatArray.findIndex(stat => stat.userId === temporaryStat.opponentUserId);
                    
                    if(opponentTemporaryStatIndex !== -1) {
                        var opponentTemporaryStat = this.temporaryStatArray[opponentTemporaryStatIndex];
                        opponentTemporaryStat.playingTimeDuration = gameEndTime - opponentTemporaryStat.playingTimeDuration;
                        await updateStatInDatabase(opponentTemporaryStat.userId, opponentTemporaryStat, winnerId);
                        console.log("Les stats du joueur perdant ont été mises à jour");
                        // Supprimer l'élément de l'adversaire de la liste
                        this.temporaryStatArray.splice(opponentTemporaryStatIndex, 1);
                    }
                }
    
                // On remet à jour l'index de l'élément du joueur gagnant au cas où la suppression du précédent l'aurais bougé
                temporaryStatIndex = this.temporaryStatArray.findIndex(temporaryStat => temporaryStat.userId === userId);
                // Supprimer l'élément du joueur gagnant de la liste
                this.temporaryStatArray.splice(temporaryStatIndex, 1);
            }
        } catch (error) {
            console.log("Une erreur a été relevée dans la mise à jour de la database");
        }
    }
    
}

const statManagerInstance = new StatManager();
module.exports = statManagerInstance;