import { SettingsService } from '../Services/settingsService.js';

window.onload = function() {
    const token = localStorage.getItem('token');
    if (token) {
        SettingsService.getConfiguration(token).then(data => {
            const configurationPossible = data.genericConfiguration;
            const personalConfiguration = data.personalConfiguration;
            setupConfiguration(configurationPossible, personalConfiguration);
        });
        setupSaveButton(token);
    }
}

function setupConfiguration(configurationPossible, personalConfiguration){
    const buttonContainer = document.getElementById('interaction-container');
    for (let i = 0; i < personalConfiguration.textInGameInteraction.length; i++) { // Assurez-vous d'utiliser la longueur de personalConfiguration
        const button = document.createElement('button');
        button.innerHTML = personalConfiguration.textInGameInteraction[i];
        button.onclick = function() {
            const modal = document.getElementById('modal-container');
            modal.style.display = 'flex';

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

function setupSaveButton(token){
    const saveButton = document.getElementById('save-button');
    saveButton.onclick = function() {
        const buttons = document.querySelectorAll('#interaction-container button');
        const textInGameInteraction = [];
        buttons.forEach(button => {
            textInGameInteraction.push(button.innerHTML);
        });

        SettingsService.saveConfiguration(token, { textInGameInteraction: textInGameInteraction }).then(() => {
            alert('Configuration enregistrée');
        });
    }
}

document.getElementById('prevBtn').addEventListener('click', function() {
    moveCarousel(-1);
});

document.getElementById('nextBtn').addEventListener('click', function() {
    moveCarousel(1);
});

let currentSlide = 0;

function moveCarousel(direction) {
    const slides = document.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;
    currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
    const movePercentage = -(100 * currentSlide);
    document.querySelector('.carousel-wrapper').style.transform = `translateX(${movePercentage}%)`;
}