import { ProfileService } from '../Services/profileService.js';
import { AuthService }  from "../Services/authService.js";
import { FriendsService } from "../Services/friendsService.js";

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
                    profilePictureElement.src = '../img/profile/picture.png';
                }
            })
            .catch(error => {
                console.error('Error fetching profile data:', error);
            });
        AuthService.username(token)
            .then(currentUser => {
                ProfileService.button(username, currentUser)
                    .then(buttonData => {
                        if (buttonData.button === 'friends') {
                            updateButtonImage('../img/profile/friend.png');
                        } else if(buttonData.button === 'pending') {
                            updateButtonImage('../img/profile/cancel.png');
                        } else {
                            updateButtonImage('../img/profile/add.png');
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching username:', error);
                    });
            })
            .catch(error => {
            console.error('Error fetching current user:', error);
        });
    }

    function updateButtonImage(imageUrl) {
        const addFriendBtn = document.getElementById('add-friend-btn');
        addFriendBtn.style.backgroundImage = `url(${imageUrl})`;
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
                    myProfilePictureElement.src = '../img/profile/picture.png';
                }
            })
            .catch(error => {
                console.error('Error fetching profile data:', error);
            });
        FriendsService.getFriends(username)
            .then(friends => {
                displayFriendsResults(friends);
            })
            .catch(error => {
                console.error('Error fetching requests:', error);
            });
    }

    addFriendBtn.addEventListener('click', () => {
        const token = localStorage.getItem('token');
        if (token) {
            AuthService.username(token)
                .then(currentUser => {
                    if (addFriendBtn.style.backgroundImage.includes('add.png')) {
                        FriendsService.addFriend(currentUser, username)
                            .then(response => {
                                alert(response.message);
                                updateButtonImage('../img/profile/cancel.png');
                            })
                            .catch(error => {
                                console.error('Error sending friend request:', error);
                            });
                    } else if (addFriendBtn.style.backgroundImage.includes('cancel.png')) {
                        FriendsService.removeFriend(currentUser, username)
                            .then(response => {
                                alert(response.message);
                                updateButtonImage('../img/profile/add.png');
                            })
                            .catch(error => {
                                console.error('Error sending friend request:', error);
                            });
                    } else {
                    }
                })
                .catch(error => {
                    console.error('Error fetching current user:', error);
                });
        }
    });

    function displayFriendsResults(results) {
        const friendsResults = document.getElementById('friendsResults');
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
