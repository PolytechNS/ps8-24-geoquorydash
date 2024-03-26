class ConfigurationManager {
    allTextInteraction = [
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
    constructor() {}

    isConfigurationValid(configuration) {
        try {
            this.allTextInteraction.includes(configuration);
            return true;
        } catch (error) {
            return false;
        }
    }
}

const configurationManager = new ConfigurationManager();
module.exports = configurationManager;