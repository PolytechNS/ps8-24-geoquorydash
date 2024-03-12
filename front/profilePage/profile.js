import { ProfileService } from '../Services/profileService.js';
import { AuthService }  from "../Services/authService.js";
import { FriendsService } from "../Services/friendsService.js"; // Import du service FriendsService

document.addEventListener('DOMContentLoaded', () => {
    const profilePicture = document.querySelector('.profile-picture');
    const usernameElement = document.querySelector('.username');
    const addFriendBtn = document.getElementById('add-friend-btn');

    const params = new URLSearchParams(window.location.search);
    let username = params.get('username');

    if (!username) {
        const token = localStorage.getItem('token');
        if (token) {
            AuthService.username(token)
                .then(username => {
                    updateProfileContent(username);
                })
                .catch(error => {
                    console.error('Error fetching username:', error);
                });
        }
    } else {
        updateProfileContent(username);
    }

    function updateProfileContent(username) {
        usernameElement.textContent = username;
        ProfileService.picture(username)
            .then(profileData => {
                if (profileData.profilePicture) {
                    profilePicture.src = profileData.profilePicture;
                } else {
                    profilePicture.src = '../img/Skin002.png';
                }
            })
            .catch(error => {
                console.error('Error fetching profile data:', error);
            });
    }

    addFriendBtn.addEventListener('click', () => {
        const token = localStorage.getItem('token');
        if (token) {
            AuthService.username(token)
                .then(currentUser => {
                    FriendsService.addFriend(currentUser, username)
                        .then(response => {
                            console.log('Friend request sent successfully.');
                            alert(response.message);
                        })
                        .catch(error => {
                            console.error('Error sending friend request:', error);
                        });
                })
                .catch(error => {
                    console.error('Error fetching current user:', error);
                });
        }
    });
});
