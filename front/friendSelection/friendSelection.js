import { AuthService } from "../Services/authService.js";
import { FriendsService } from "../Services/friendsService.js";
import userSocket from "../sockets/userSocketConnection.js";

var friendsList = [];

AuthService.username(localStorage.getItem('token')).then(authUsername => {
    console.log(authUsername);
    FriendsService.getFriends(authUsername).then(friends => {
        friends.forEach(friend => {
            friendsList.push(friend);
            const friendElement = document.createElement('div');
            friendElement.setAttribute('id', friend.username);
            friendElement.classList.add('friend');
            friendElement.textContent = friend.username;

            if (friend.status === 'online') {
                friendElement.classList.add('online');
                friendElement.onclick = function() {
                    window.location.href = `../gameAgainstFriend/gameAgainstFriend.html?toUsername=${friend.username}`
                };
            } else {
                friendElement.classList.add('offline');
            }

            document.getElementById('friends-container').appendChild(friendElement);
        });
    });
});

userSocket.on('updateStatus', ({username, status}) => {
    console.log(`Update status for ${username} to ${status}`);
    const friendElement = document.getElementById(username);
    if (status === 'online') {
        friendElement.classList.remove('offline');
        friendElement.classList.add('online');
        friendElement.onclick = function() {
            window.location.href = `../gameAgainstFriend/gameAgainstFriend.html?toUsername${username}`;
        };
    } else {
        friendElement.classList.remove('online');
        friendElement.classList.add('offline');
        friendElement.onclick = null;
    }
});
