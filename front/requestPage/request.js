import { FriendsService } from '../Services/friendsService.js';
import {AuthService} from "../Services/authService.js";

document.addEventListener('DOMContentLoaded', () => {
    const requestResults = document.getElementById('requestResults');
    const token = localStorage.getItem('token');
    if (token) {
        AuthService.username(token)
            .then(authUsername => {
                FriendsService.getRequests(authUsername)
                    .then(requests => {
                        displayRequestResults(requests);
                    })
                    .catch(error => {
                        console.error('Error fetching requests:', error);
                    });
            })
            .catch(error => {
                console.error('Error fetching username:', error);
            });

    }
    function displayRequestResults(results) {
        requestResults.innerHTML = '';

        const ul= document.createElement('ul');

        results.forEach(result => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = `../profilePage/profile.html?username=${result}`;
            link.textContent = result;
            link.target = "_blank";

            const acceptButton = document.createElement('button');
            acceptButton.classList.add('accept');
            acceptButton.addEventListener('click', () => {
                AuthService.username(token)
                    .then(authUsername => {
                        FriendsService.acceptFriend(authUsername, result)
                            .then(response => {
                                alert(response.message);
                                updateRequestResults();
                            })
                            .catch(error => {
                                console.error('Error adding friend:', error);
                            });
                    }
                );
            });

            const deniedButton = document.createElement('button');
            deniedButton.classList.add('denied');
            deniedButton.addEventListener('click', () => {
                AuthService.username(token)
                    .then(authUsername => {
                        FriendsService.deniedFriend(authUsername, result)
                            .then(response => {
                                alert(response.message);
                                updateRequestResults();
                            })
                            .catch(error => {
                                console.error('Error removing friend:', error);
                            });
                    }
                );
            });

            li.appendChild(link);
            li.appendChild(acceptButton);
            li.appendChild(deniedButton);
            ul.appendChild(li);
        });

        requestResults.appendChild(ul);
    }

    function updateRequestResults() {
        AuthService.username(token)
            .then(authUsername => {
                FriendsService.getRequests(authUsername)
                    .then(requests => {
                        displayRequestResults(requests);
                    })
                    .catch(error => {
                        console.error('Error fetching requests:', error);
                    });
            })
            .catch(error => {
                console.error('Error fetching username:', error);
            });
    }

});
