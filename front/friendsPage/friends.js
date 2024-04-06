import { FriendsService } from '../Services/friendsService.js';
import {AuthService} from "../Services/authService.js";

document.addEventListener('DOMContentLoaded', () => {
    const friendsResults = document.getElementById('friendsResults');
    const token = localStorage.getItem('token');
    if (token) {
        AuthService.username(token)
            .then(authUsername => {
                FriendsService.getFriends(authUsername)
                    .then(friends => {
                        displayFriendsResults(friends);
                    })
                    .catch(error => {
                        console.error('Error fetching requests:', error);
                    });
            })
            .catch(error => {
                console.error('Error fetching username:', error);
            });

    }
    function displayFriendsResults(results) {
        friendsResults.innerHTML = '';

        const ul= document.createElement('ul');

        results.forEach(result => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = `../profilePage/profile.html?username=${result.username}`;
            link.textContent = result.username;
            link.target = "_blank";
            li.appendChild(link);
            ul.appendChild(li);
        });

        friendsResults.appendChild(ul);
    }

});
