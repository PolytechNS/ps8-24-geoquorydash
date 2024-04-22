const token = localStorage.getItem('token');
const location = window.location.pathname;
var userSocket = io('/api/user', {
        query: {
            token: token,
            location: location
        }
    });

userSocket.on('connect', function() {
    console.log('Connected to /api/user! ');
});

userSocket.on('updateSocket', function(data) {
    console.log('Socket updated', userSocket.userId);
});

userSocket.on('gameRequest', function(payload) {
    console.log('gameRequest', payload);
    if (window.confirm("Game request from " + payload.fromUsername + "\nDo you accept?")){
        window.location.href = `../gameAgainstFriend/gameAgainstFriend.html?fromUsername=${payload.fromUsername}`;
    } else {
        userSocket.emit('gameRequestDeclined', payload.fromUserId);
    }
});

userSocket.on('gameRequestAccepted', function(payload) {
    console.log('gameRequestAccepted', payload);

});

userSocket.on('gameRequestDeclined', function(payload) {
    alert('Game request declined ');
    window.location.href = '/';
});

userSocket.on('message', function(data) {
    const timestamp = new Date().getTime(); // Génère le timestamp actuel

    const burgerChatButton = document.getElementById('burger-chat-button')
    burgerChatButton.firstElementChild.src = `../img/chat/chat_notif.png?${timestamp}`;

    const senderChatButton = document.getElementById('chat-' + data.sender);
    if (senderChatButton) {
        console.log('data', data);
        senderChatButton.style.backgroundImage = `url('../img/chat/chat_notif.png?${timestamp}')`;
    }
});

userSocket.on('updateGlobalChatNotifications', function(data) {
    console.log('chatNotifications', data);
    const burgerChatButton = document.getElementById('burger-chat-button');
    if (data){
        burgerChatButton.firstElementChild.src = `../img/chat/chat_notif.png`;
    } else {
        burgerChatButton.firstElementChild.src = `../img/chat/chat.png`;
    }
});

userSocket.on('removeChatNotification', function(username) {
    const senderChatButton = document.getElementById('chat-' + username);
    if (senderChatButton) {
        senderChatButton.style.backgroundImage = `url('../img/chat/chat.png')`;
    }
});

userSocket.on('friendRequest', function(fromUsername) {
    const popup = document.getElementById('friend-request-modal');
    
    // On affiche la popup
    popup.style.display = 'flex';
    setTimeout(() => {
        popup.firstElementChild.classList.add('active');
    }, 100);
    
    
    // On fait disparaître la popup après 3 secondes
    setTimeout(() => {
        popup.firstElementChild.classList.remove('active');
    }, 3000);
    setTimeout(() => {
        popup.style.display = 'none';
    }, 3300);
});


window.addEventListener('beforeunload', function () {
    if (token) {
        userSocket.emit('manualDisconnect', token);
    }
});



export default userSocket;