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
    if (window.confirm("Game request from " + payload.fromUsername + "\nDo you accept?")){
        window.location.href = `../gameAgainstFriend/gameFriend/gameAgainstFriend.html`
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

window.addEventListener('beforeunload', function () {
    if (token) {
        userSocket.emit('manualDisconnect', token);
    }
});



export default userSocket;