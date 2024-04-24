import { ProfileService } from '../Services/profileService.js';
import { AuthService }  from "../Services/authService.js";
import { FriendsService } from "../Services/friendsService.js";
import { StatService } from "../Services/statService.js";
import { AchievementsService } from '../Services/achievementsService.js';
import userSocket from "../sockets/userSocketConnection.js";

document.addEventListener('DOMContentLoaded', () => {
    const myProfile = document.querySelector('.profile-container-me');
    const profile = document.querySelector('.profile-container-friend');
    const addFriendBtn = document.getElementById('add-friend-btn');

    const params = new URLSearchParams(window.location.search);
    let username = params.get('username');
    if(!username) {
        console.log("Pas de username associé à cette page pour le moment");
    }
    const token = localStorage.getItem('token');
    if (token) {
        AuthService.username(token)
            .then(authUsername => {
                if(!username) {
                    username = authUsername;
                    updateMyProfileContent(username);
                    retrieveAchievements();
                } else {
                    if (authUsername === username) {
                        updateMyProfileContent(username);
                        retrieveAchievements();
                    } else {
                        updateFriendProfileContent(username);
                        retrieveAchievements(username);
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching username:', error);
            });
    }

    function retrieveAchievements(friendUsername) {
        AuthService.username(token)
            .then(authUsername => {
                if (friendUsername) {
                    authUsername = friendUsername;
                }
                /**** CETTE PARTIE EST UNE SIMPLE MISE À JOUR DES ACHIEVEMENTS D'AMI ****/
                FriendsService.getFriends(authUsername)
                    .then(friends => {
                        const numberOfFriends = friends.length;
                        AchievementsService.updateFriendsAchievements(authUsername, numberOfFriends)
                            .then(() => {
                                /**** FIN DE LA MISE À JOUR DES ACHIEVEMENTS D'AMI ****/
                                AchievementsService.getAchievements(authUsername).then(data => {
                                    const achievements = data.achievementsStructure.achievements;
                                    var achievementsContainer = null;
                                    if(friendUsername) {
                                        achievementsContainer = document.getElementById('friendAchievementsContainer');
                                    } else {
                                        achievementsContainer = document.getElementById('achievementsContainer');
                                    }
                                    achievements.forEach(achievement => {
                                        const achievementElement = document.createElement('div');
                                        achievementElement.classList.add('achievement');
                                        const imageContainer = document.createElement('div');
                                        imageContainer.classList.add('imageContainer');
                                        const achievementImage = document.createElement('img');
                                        achievementImage.classList.add('achievement-image');
                                        const achievementImageSrc = "../img/profile/" + achievement.url;
                                        achievementImage.src = achievementImageSrc;
                                        const achievementContent = document.createElement('div');
                                        achievementContent.classList.add('achievement-content');
                                        const achievementTitle = document.createElement('span');
                                        achievementTitle.classList.add('achievement-title');
                                        achievementTitle.textContent = achievement.nom;
                                        const achievementDescription = document.createElement('span');
                                        achievementDescription.classList.add('achievement-description');
                                        achievementDescription.textContent = achievement.description;
                                        imageContainer.appendChild(achievementImage);
                                        achievementContent.appendChild(achievementTitle);
                                        achievementContent.appendChild(achievementDescription);
                                        achievementElement.appendChild(imageContainer);
                                        achievementElement.appendChild(achievementContent);
                                        achievementsContainer.appendChild(achievementElement);
                                    });
                                }).catch(error => {
                                    console.error('Erreur lors de la récupération des achievements:', error);
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

    function updateFriendProfileContent(username) {
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
                            updateButtonImage('../img/profile/delete.png');
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

    function popUp(text) {
        var modal = document.getElementById("myModal");
        var modalContent = document.querySelector('.modal-content');

        var textContent = document.querySelector('.modal-content p')
        textContent.textContent = text;

        modal.style.display = "flex";

        return new Promise((resolve, reject) => {
            document.getElementById('confirmBtn').addEventListener('click', () => {
                resolve(true); // Résolu si l'utilisateur confirme
                modal.style.display = "none";
            });
            document.getElementById('cancelBtn').addEventListener('click', () => {
                resolve(false); // Résolu si l'utilisateur annule
                modal.style.display = "none";
            });
        });
    }

    addFriendBtn.addEventListener('click', () => {
        const token = localStorage.getItem('token');
        if (token) {
            AuthService.username(token)
                .then(currentUser => {
                    if (addFriendBtn.style.backgroundImage.includes('add.png')) {
                        popUp("Voulez-vous ajouter cet ami ?")
                            .then((confirmation) => {
                                if (confirmation) {
                                    FriendsService.addFriend(currentUser, username)
                                        .then(response => {
                                            userSocket.emit('addFriendRequest', currentUser, username);
                                            updateButtonImage('../img/profile/cancel.png');
                                        })
                                        .catch(error => {
                                            console.error('Error sending friend request:', error);
                                        });
                                }
                            });
                    } else if (addFriendBtn.style.backgroundImage.includes('cancel.png')) {
                        popUp("Voulez-vous annuler la demande d'ami ?")
                            .then((confirmation) => {
                                if (confirmation) {
                                    FriendsService.cancelFriend(currentUser, username)
                                        .then(response => {
                                            updateButtonImage('../img/profile/add.png');
                                        })
                                        .catch(error => {
                                            console.error('Error sending friend request:', error);
                                        });
                                }
                            });
                    } else if (addFriendBtn.style.backgroundImage.includes('delete.png')) {
                        popUp("Voulez-vous supprimer cet ami ?")
                            .then((confirmation) => {
                                if (confirmation) {
                                    FriendsService.removeFriend(currentUser, username)
                                        .then(response => {
                                            updateButtonImage('../img/profile/add.png');
                                        })
                                        .catch(error => {
                                            console.error('Error sending friend request:', error);
                                        });
                                }
                            });
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
            link.onclick = function(event) {
                event.preventDefault();
                window.location.href = `../profilePage/profile.html?username=${result.username}`;
            };
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
        modalContainer.style.display = 'block';

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





