import gameSocket from "../sockets/gameSocketConnection.js";
import {confirmationPopup, popUp} from "../gamePage/fogOfWar.js";

const buttonInteractionPin = document.getElementById('pin');
const topPopup = document.getElementById('top-popup');
const bottomPopup = document.getElementById('bottom-popup');
let canClick = false; // Variable pour suivre si le bouton est cliquable

window.onload = function() {
    localStorage.setItem('gameStateID', 'waitingForMatch');
    gameSocket.emit('findMatch', localStorage.getItem('token'));

    var modal = document.getElementById("myModalWait");
    var modalContent = document.querySelector('.modal-content-wait');

    var textContent = document.querySelector('.modal-content-wait p')
    textContent.textContent = "En attente d'un adversaire...";
    modalContent.appendChild(textContent);

    modal.style.display = "flex";
}

gameSocket.on('matchFound', function(roomId) {
    localStorage.setItem('roomId', roomId);
    confirmationPopup(askTextButtonInteraction);
});

function askTextButtonInteraction() {
    let roomId = localStorage.getItem('roomId');
    let token = localStorage.getItem('token');
    console.log('EMIT askTextButtonInteraction')
    gameSocket.emit('askTextButtonInteraction', token, roomId, gameSocket.id);
}


gameSocket.on('answerTextButtonInteraction', (text, playerId) => {
    var interactionContainer;
    if(playerId === 'player1') {
        interactionContainer = document.getElementById('top-interaction-container');
    } else {
        interactionContainer = document.getElementById('bottom-interaction-container');
    }

    setTextButtonInteraction(text, interactionContainer, playerId);


    buttonInteractionPin.onclick = function() {
        if (!canClick) return;
        canClick = false; // On ne peut plus cliquer

        if (interactionContainer.classList.contains('active')) {
            interactionContainer.classList.remove('active');
            buttonInteractionPin.classList.remove('active');
            setCursorToButtonInteractions(interactionContainer, 'context-menu');
            setTimeout(() => {
                canClick = true;
            }, 300);

        } else {
            interactionContainer.style.display = 'flex';
            topPopup.classList.remove('visible');
            bottomPopup.classList.remove('visible');
            setCursorToButtonInteractions(interactionContainer, 'pointer');

            setTimeout(() => {
                interactionContainer.classList.add('active');
                buttonInteractionPin.classList.add('active');
                canClick = true;
            }, 10);
        }

        setTimeout(() => {
            canClick = true;
        }, 300);
    };

    canClick = true;
    buttonInteractionPin.src = '../img/game/Pins.png';
    buttonInteractionPin.style.cursor = 'pointer';
});

function setTextButtonInteraction(text, interactionContainer, playerId) {
    for (let i = 0; i < 6; i++) {
        const button = document.createElement('div');
        button.classList.add('interaction');
        button.innerHTML = text[i];
        button.style.cursor = 'context-menu';
        button.onclick = function() {
            if (!canClick) return;
            if (interactionContainer.classList.contains('active')) {
                let myPosition = playerId === 'player1' ? 'top' : 'bottom';
                console.log('EMIT displayText ', text[i], myPosition);
                gameSocket.emit('displayText', localStorage.getItem('roomId'), text[i], myPosition);

                if (interactionContainer.classList.contains('active')) {
                    interactionContainer.classList.remove('active');
                }
                setCursorToButtonInteractions(interactionContainer, 'context-menu');
            }
        }
        interactionContainer.appendChild(button);
    }
    interactionContainer.style.visibility = 'hidden;'
    interactionContainer.style.display = 'flex';

    topPopup.style.marginTop = `${interactionContainer.offsetHeight*0.1}px`;
    bottomPopup.style.marginBottom = `${interactionContainer.offsetHeight*0.1}px`;
}

function setCursorToButtonInteractions(interactionContainer, style) {
    for (let i = 0; i < interactionContainer.children.length; i++) {
        interactionContainer.children[i].style.cursor = style;
    }
}

gameSocket.on('displayText', (text, position) => {
    let popUpToTrigger;

    if (position === 'top') {
        popUpToTrigger = topPopup;
        document.getElementById('top-popup-content').textContent = text;
    } else {
        popUpToTrigger = bottomPopup;
        document.getElementById('bottom-popup-content').textContent = text;
    }
    let interactionContainers = document.getElementsByClassName('interaction-container');

    canClick = false; // On ne peut plus cliquer

    for (let i = 0; i < interactionContainers.length; i++) {
        if (interactionContainers[i].classList.contains('active')) {
            interactionContainers[i].classList.remove('active');
        }
    }

    setTimeout(() => {
        popUpToTrigger.classList.add('visible');
        popUpToTrigger.style.cursor = 'context-menu';
        buttonInteractionPin.src = '../img/game/Pins_NotUsable.png';
        buttonInteractionPin.style.cursor = 'context-menu';
    }, 100);

    setTimeout(() => {
        popUpToTrigger.classList.remove('visible');
        buttonInteractionPin.classList.remove('active');
        buttonInteractionPin.style.cursor = 'pointer';
        buttonInteractionPin.src = '../img/game/Pins.png';
        canClick = true;
    }, 2000);
});



let isExiting = false;

window.addEventListener('beforeunload', (event) => {
    isExiting = true;
    event.preventDefault();
    event.returnValue = '';
});

window.addEventListener('unload', () => {
    if (isExiting) {
        gameSocket.emit('leaveGame', localStorage.getItem('token'), localStorage.getItem('gameStateID'), localStorage.getItem('roomId'));
        localStorage.removeItem('gameStateID');
        localStorage.removeItem('roomId');
    }
});