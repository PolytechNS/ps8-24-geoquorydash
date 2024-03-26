import { SettingsService } from '../Services/settingsService.js';

window.onload = function() {
    const token = localStorage.getItem('token');
    if (token) {
        SettingsService.configuration(token).then(data => {
            const configurationPossible = data.genericConfiguration;
            const personalConfiguration = data.personalConfiguration;
            setupConfiguration(configurationPossible, personalConfiguration);
        });
    }
}

function setupConfiguration(configurationPossible, personalConfiguration){
    const buttonContainer = document.getElementById('interaction-container');
    for (let i = 0; i < personalConfiguration.textInGameInteraction.length; i++) { // Assurez-vous d'utiliser la longueur de personalConfiguration
        const button = document.createElement('button');
        button.innerHTML = personalConfiguration.textInGameInteraction[i];
        button.onclick = function() {
            const modal = document.getElementById('modal-container');
            modal.style.display = 'block';

            const optionsContainer = document.getElementById('modal-options-container');
            optionsContainer.innerHTML = ''; // Efface les options précédentes

            configurationPossible.forEach((text, index) => {
                const option = document.createElement('div');
                option.innerHTML = text;
                option.onclick = () => {
                    button.innerHTML = text;
                    modal.style.display = 'none';
                };
                optionsContainer.appendChild(option);
            });
        }
        buttonContainer.appendChild(button);
    }
}


