const token = localStorage.getItem('token');
var userSocket = io('http://localhost:8000', {
    query: {
        token: token
    }
});

userSocket.on('connect', function() {
    console.log('Connected to /api/user!');
});

userSocket.on('gameRequest', function(payload) {
    console.log('gameRequest', payload);
    if (window.confirm("Game request from " + payload.fromUsername + "\nDo you accept?")){
        userSocket.emit('gameRequestAccepted', payload.fromUserId);
    } else {
        userSocket.emit('gameRequestDeclined', payload.fromUserId);
    }
});

userSocket.on('gameRequestAccepted', function(payload) {
    console.log('gameRequestAccepted', payload);
});

userSocket.on('gameRequestDeclined', function(payload) {
    console.log('gameRequestDeclined', payload);
});
export default userSocket;