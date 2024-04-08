import { ProfileService } from '../Services/profileService.js';
import { AuthService }  from "../Services/authService.js";
import { FriendsService } from "../Services/friendsService.js";
import { StatService } from "../Services/statService.js";
import { AchievementsService } from '../Services/achievementsService.js';

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
        AuthService.username(token)
            .then(authUsername => {
                FriendsService.getFriends(authUsername)
                    .then(friends => {
                        const numberOfFriends = friends.length;
                        console.log("Nombre d'amis : " + numberOfFriends);
                        AchievementsService.updateFriendsAchievements(authUsername, numberOfFriends)
                            .then(() => {
                                AchievementsService.getAchievements(token).then(data => {
                                    console.log(data);
                                    const achievements = data.achievementsStructure.achievements;
                                    const achievementsContainer = document.getElementById('achievementsContainer');
                                    achievements.forEach(achievement => {
                                        console.log("Un de plus");
                                        const achievementElement = document.createElement('div');
                                        achievementElement.classList.add('achievement');
                                        const achievementTitle = document.createElement('h3');
                                        achievementTitle.textContent = achievement.nom;
                                        const achievementDescription = document.createElement('p');
                                        achievementDescription.textContent = achievement.description;
                                        achievementElement.appendChild(achievementTitle);
                                        achievementElement.appendChild(achievementDescription);
                                        achievementsContainer.appendChild(achievementElement);
                                    });
                                    console.log("Fini");
                                }).catch(error => {
                                    console.error('Erreur lors de la récupération des achievements:', error);
                                    alert('Erreur lors de la récupération des achievements.');
                                });
                            })
                            .catch(error => {
                                console.error('Error fetching requests:', error);
                            });
                    })
                    .catch(error => {
                        console.error('Error fetching requests:', error);
                    });
            })
            .catch(error => {
                console.error('Error fetching username:', error);
            });
    }

    function updateProfileContent(username) {
        myProfile.style.display = 'none';
        profile.style.display = 'flex';
        const profilePictureElement = document.getElementById('profile-picture-friend');
        const usernameElement = document.getElementById('username-friend');
        usernameElement.textContent = username;
        const rankElement = document.getElementById('ranking-friend');
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
        StatService.getRanking(username)
            .then(ranking => {
                if (ranking.ranking !== 0) {
                    rankElement.innerText = ranking.ranking;
                }
            })
            .catch(error => {
                console.error('Error fetching ranking:', error);
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
        const myRankElement = document.getElementById('ranking-me');
        StatService.getRanking(username)
            .then(ranking => {
                if (ranking.ranking !== 0) {
                    myRankElement.innerText = ranking.ranking;
                }
            });
        ProfileService.picture(username)
            .then(profileData => {
                if (profileData.profilePicture) {
                    myProfilePictureElement.src = profileData.profilePicture;
                } else {
                    console.log("Pas de photo de profil");
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
                        FriendsService.cancelFriend(currentUser, username)
                            .then(response => {
                                alert(response.message);
                                updateButtonImage('../img/profile/add.png');
                            })
                            .catch(error => {
                                console.error('Error sending friend request:', error);
                            });
                    } else if (addFriendBtn.style.backgroundImage.includes('friend.png')) {
                        // Confirmation de suppression d'ami
                        if (confirm("Êtes-vous sûr de vouloir supprimer cet ami ?")) {
                            // Si l'utilisateur confirme, supprimez l'ami
                            FriendsService.removeFriend(currentUser, username)
                                .then(response => {
                                    alert(response.message);
                                    updateButtonImage('../img/profile/add.png');
                                })
                                .catch(error => {
                                    console.error('Error sending friend request:', error);
                                });
                        }
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

document.addEventListener('DOMContentLoaded', () => {
    const myProfilePictureElement = document.getElementById('profile-picture-me');
    const modalContainer = document.getElementById('modal-container');
    const modalOptionsContainer = document.getElementById('modal-options-container');

    myProfilePictureElement.addEventListener('click', () => {
        if(confirm("Voulez-vous changer votre photo de profil ?")) {
            modalContainer.style.display = 'block';
        }
    });

    modalOptionsContainer.addEventListener('click', (event) => {
        if (event.target.tagName === 'IMG') {
            const imageUrl = event.target.src;
            AuthService.username(localStorage.getItem('token'))
                .then(username => {
                    ProfileService.updatePicture(username, imageUrl)
                        .then(response => {
                            if (response.profilePicture) {
                                myProfilePictureElement.src = response.profilePicture;
                                modalContainer.style.display = 'none';
                                location.reload();
                            }
                        })
                        .catch(error => {
                            console.error('Error updating profile picture:', error);
                        });
                })
                .catch(error => {
                    console.error('Error fetching username:', error);
                });
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target === modalContainer) {
            modalContainer.style.display = 'none';
        }
    });
});





