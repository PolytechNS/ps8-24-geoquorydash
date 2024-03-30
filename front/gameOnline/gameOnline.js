import socket from "../sockets/socketConnection.js";

const buttonInteractionPin = document.getElementById('pin');
const topPopup = document.getElementById('top-popup');
const bottomPopup = document.getElementById('bottom-popup');
let canClick = false; // Variable pour suivre si le bouton est cliquable

window.onload = function() {
    localStorage.setItem('gameStateID', 'waitingForMatch');
    socket.emit('findMatch', localStorage.getItem('token'));
}

socket.on('matchFound', () => {
    askTextButtonInteraction();
});

function askTextButtonInteraction() {
    let roomId = localStorage.getItem('roomId');
    let token = localStorage.getItem('token');
    console.log('EMIT askTextButtonInteraction')
    socket.emit('askTextButtonInteraction', token, roomId, socket.id);
}


socket.on('answerTextButtonInteraction', (text, playerId) => {
    console.log('ON answerTextButtonInteraction ', text, playerId);

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

            setTimeout(() => {
                canClick = true;
            }, 300);

        } else {
            interactionContainer.style.display = 'flex';
            topPopup.classList.remove('visible');
            bottomPopup.classList.remove('visible');

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
});

function setTextButtonInteraction(text, interactionContainer, playerId) {
    for (let i = 0; i < 6; i++) {
        const button = document.createElement('div');
        button.classList.add('interaction');
        button.innerHTML = text[i];
        button.onclick = function() {
            if (!canClick) return;
            let myPosition = playerId === 'player1' ? 'top' : 'bottom';
            console.log('EMIT displayText ', text[i], myPosition);
            socket.emit('displayText', localStorage.getItem('roomId'), text[i], myPosition);

            if (interactionContainer.classList.contains('active')) {
                interactionContainer.classList.remove('active');
            }
        }
        interactionContainer.appendChild(button);
        console.log(interactionContainer);
    }
    interactionContainer.style.visibility = 'hidden;'
    interactionContainer.style.display = 'flex';

    topPopup.style.marginTop = `${interactionContainer.offsetHeight*0.1}px`;
    bottomPopup.style.marginBottom = `${interactionContainer.offsetHeight*0.1}px`;
}

socket.on('displayText', (text, position) => {
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
        buttonInteractionPin.src = '../img/game/Pins_NotUsable.png';
    }, 100);

    setTimeout(() => {
        popUpToTrigger.classList.remove('visible');
        buttonInteractionPin.classList.remove('active');
        buttonInteractionPin.src = '../img/game/Pins.png';
        canClick = true;
    }, 2000);
});



window.onbeforeunload = function() {
    localStorage.removeItem('gameStateID');
    localStorage.removeItem('roomId');
}