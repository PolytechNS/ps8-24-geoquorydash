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
        return configuration.every(element => this.allTextInteraction.includes(element));
    }

}

const configurationManager = new ConfigurationManager();
module.exports = configurationManager;