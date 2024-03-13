import { ProfileService } from '../Services/profileService.js';
import { AuthService }  from "../Services/authService.js";
import { FriendsService } from "../Services/friendsService.js"; // Import du service FriendsService

document.addEventListener('DOMContentLoaded', () => {
    const myProfile = document.querySelector('.profile-container-me');
    const profile = document.querySelector('.profile-container');
    const addFriendBtn = document.getElementById('add-friend-btn');

    const params = new URLSearchParams(window.location.search);
    let username = params.get('username');
    const token = localStorage.getItem('token');
    if (token) {
        if (!username) {
            AuthService.username(token)
                .then(authUsername => {
                    username = authUsername;
                    updateMyProfileContent(username);
                })
                .catch(error => {
                    console.error('Error fetching username:', error);
                });

        } else {
            AuthService.username(token)
                .then(authUsername => {
                    if (authUsername === username) {
                        updateMyProfileContent(username);
                    } else {
                        updateProfileContent(username);
                    }
                })
                .catch(error => {
                    console.error('Error fetching username:', error);
                });
        }
    }

    function updateProfileContent(username) {
        myProfile.style.display = 'none';
        profile.style.display = 'flex';
        const profilePictureElement = document.getElementById('profile-picture-friend');
        const usernameElement = document.getElementById('username-friend');
        usernameElement.textContent = username;
        ProfileService.picture(username)
            .then(profileData => {
                if (profileData.profilePicture) {
                    profilePictureElement.src = profileData.profilePicture;
                } else {
                    profilePictureElement.src = '../img/Skin002.png';
                }
            })
            .catch(error => {
                console.error('Error fetching profile data:', error);
            });
    }

    function updateMyProfileContent(username) {
        myProfile.style.display = 'flex';
        profile.style.display = 'none';
        const myProfilePictureElement = document.getElementById('profile-picture-me');
        const myUsernameElement = document.getElementById('username-me');
        myUsernameElement.textContent = username;
        ProfileService.picture(username)
            .then(profileData => {
                if (profileData.profilePicture) {
                    myProfilePictureElement.src = profileData.profilePicture;
                } else {
                    myProfilePictureElement.src = '../img/Skin002.png';
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
