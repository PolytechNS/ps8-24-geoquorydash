const { retrieveTextInGameInteractionFromDatabase } = require('../../models/users/configuration.js');

class ChatManager {
    textToDisplay = {};

    constructor() {
        this.textToDisplay["default"] = [
            "Bien joué !",
            "Tu es trop fort !",
            "Tu as vraiment du talent !",
            "Tu es un génie !",
            "Tu es incroyable !",
            "Tu es un champion !",
            "RRRR !",
            "C'est pas gentil !",
            "Tu es nul !",
            "Tu es vraiment pas doué !",
            "Peut mieux faire !",
            "C'est triste !"
        ]
    }

    getTextToIndex(id, index) {
        return this.textToDisplay[id ? id : "default"][index];
    }

    async retrieveTextInGameInteraction(userId) {
        let text = await retrieveTextInGameInteractionFromDatabase(userId);
        this.textToDisplay[userId] = text;
        return text;
    }
}

const chatManager = new ChatManager();
module.exports = chatManager;