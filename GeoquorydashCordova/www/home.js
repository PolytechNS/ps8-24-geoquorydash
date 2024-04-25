import { AuthService } from './Services/authService.js';
import { StatService } from "./Services/statService.js";
import { FriendsService } from './Services/friendsService.js';
import { AchievementsService } from './Services/achievementsService.js';

var accountModal = document.getElementById("accountModal");
var signupModal = document.getElementById("signupModal");
var loginModal = document.getElementById("loginModal");
var rankModal = document.getElementById("rankModal");
var skinModal = document.getElementById("skinModal");


var token;
updateToken();

function updateToken() {
    token = localStorage.getItem('token');
}

initializeAccountButtonImage(token);

var handleDeconnexionClick = function(event) {
    event.preventDefault();
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
        accountButtonImage.src = 'img/home/button_login.png';
        localStorage.clear();
        updateToken();
        alert('Vous êtes déconnecté');
        const modal = window.parent.document.querySelector('.modal');
        modal.style.display = 'none';
        window.plugins.OneSignal.logout();
    }
};


// PAGE HOME -> PAGE ACCOUNT
document.addEventListener("DOMContentLoaded", function() {
    var openAccountPage = document.getElementById("openAccountPage");
    var closeAccountModalButton = document.getElementById("close-account-modal-button");

    openAccountPage.addEventListener("click", function(e) {
        e.preventDefault();
        accountModal.style.display = "flex";
        
        const deconnexionButton = document.getElementById('logout-btn');
        if (token) {
            console.log('On a un token');
            document.getElementById('openSignupPage').style.display = 'none';
            document.getElementById('openLoginPage').style.display = 'none';
            document.getElementById('connect_text_1').style.display = 'none';
            document.getElementById('connect_text_2').style.display = 'none';

            deconnexionButton.style.display = 'block';
            document.getElementById('connectedMSG').style.display = 'block';
            document.getElementById('disconnectTip').style.display = 'block';
            deconnexionButton.removeEventListener('click', handleDeconnexionClick);
            deconnexionButton.addEventListener('click', handleDeconnexionClick);
        } else {
            // Assurez-vous de gérer correctement le cas où le token n'existe pas
            document.getElementById('openSignupPage').style.display = 'block';
            document.getElementById('openLoginPage').style.display = 'block';
            document.getElementById('connect_text_1').style.display = 'block';
            document.getElementById('connect_text_2').style.display = 'block';
    
            deconnexionButton.style.display = "none";
            document.getElementById('connectedMSG').style.display = 'none';
            document.getElementById('disconnectTip').style.display = 'none';
        }
    });

    closeAccountModalButton.addEventListener("click", function() {
        accountModal.style.display = "none";
    });

    window.addEventListener("click", function(event) {
        if (event.target === accountModal) {
            accountModal.style.display = "none";
        }
    });

    if (token) {
        AuthService.username(token)
            .then(authUsername => {
                window.plugins.OneSignal.login(authUsername.toString());
                FriendsService.getRequests(authUsername)
                    .then(requests => {
                        if (requests.length > 0){
                            const openFriendsPage = document.getElementById("openFriendsPage");
                            const notif = openFriendsPage.querySelector('.notif');
                            notif.classList.add('active');
                        }
                    });
            });
    }
});


document.addEventListener('deviceready', OneSignalInit, false);

function OneSignalInit() {
    // Initialise OneSignal avec votre App ID
    window.plugins.OneSignal.initialize("08eb66f6-d744-4291-b6b9-ff5ae40aa7a2");
    // window.plugins.OneSignal.logout();

    // Active le niveau de log détaillé pour OneSignal (6 pour le debug)
    window.plugins.OneSignal.Debug.setLogLevel(6);

    // Ajout d'un écouteur pour les clics sur les notifications
    // Remarque : Assurez-vous que la méthode `addEventListener` pour les notifications est bien disponible et correctement définie dans index.js.
    // Le code original utilise une syntaxe TypeScript pour la déclaration de l'event, il faut la convertir en JavaScript pur.
    const listener = function(event) {
        const notificationPayload = JSON.stringify(event);
        console.log(notificationPayload);
    };
    window.plugins.OneSignal.Notifications.addEventListener("click", listener);

    // Demande la permission pour les notifications
    // Assurez-vous que la méthode `requestPermission` est bien disponible et correctement définie dans index.js.
    window.plugins.OneSignal.Notifications.requestPermission(true).then(function(accepted) {
        console.log("User accepted notifications: " + accepted);
    });
}

// PAGE HOME -> PAGE SIGNUP
document.addEventListener("DOMContentLoaded", function() {
    var openSignupPage = document.getElementById("openSignupPage");
    var closeSignupModalButton = document.getElementById("close-signup-modal-button");

    openSignupPage.addEventListener("click", function(e) {
        e.preventDefault();
        accountModal.style.display = "none";
        signupModal.style.display = "flex";
    });

    closeSignupModalButton.addEventListener("click", function() {
        document.getElementById('signupForm').querySelector('[name="username"]').value = '';
        document.getElementById('signupForm').querySelector('[name="password"]').value = '';
        signupModal.style.display = "none";
    });

    window.addEventListener("click", function(event) {
        if (event.target === signupModal) {
            document.getElementById('signupForm').querySelector('[name="username"]').value = '';
            document.getElementById('signupForm').querySelector('[name="password"]').value = '';
            signupModal.style.display = "none";
        }
    });
});

// PAGE HOME -> PAGE LOGIN
document.addEventListener("DOMContentLoaded", function() {
    var openLoginPage = document.getElementById("openLoginPage");
    var closeLoginModalButton = document.getElementById("close-login-modal-button");

    openLoginPage.addEventListener("click", function(e) {
        e.preventDefault();
        accountModal.style.display = "none";
        loginModal.style.display = "flex";
    });

    closeLoginModalButton.addEventListener("click", function() {
        document.getElementById('loginForm').querySelector('[name="username"]').value = '';
        document.getElementById('loginForm').querySelector('[name="password"]').value = '';
        loginModal.style.display = "none";
    });

    window.addEventListener("click", function(event) {
        if (event.target === loginModal) {
            document.getElementById('loginForm').querySelector('[name="username"]').value = '';
            document.getElementById('loginForm').querySelector('[name="password"]').value = '';
            loginModal.style.display = "none";
        }
    });
});

// PAGE LOGIN -> PAGE SIGNUP
document.addEventListener("DOMContentLoaded", function() {
    var openSignupPage = document.getElementById("signupButton");
    var closeSignupModalButton = document.getElementById("close-signup-modal-button");

    openSignupPage.addEventListener("click", function(e) {
        e.preventDefault();
        document.getElementById('loginForm').querySelector('[name="username"]').value = '';
        document.getElementById('loginForm').querySelector('[name="password"]').value = '';
        loginModal.style.display = "none";
        signupModal.style.display = "flex";
    });

    closeSignupModalButton.addEventListener("click", function() {
        document.getElementById('signupForm').querySelector('[name="username"]').value = '';
        document.getElementById('signupForm').querySelector('[name="password"]').value = '';
        signupModal.style.display = "none";
    });

    window.addEventListener("click", function(event) {
        if (event.target === signupModal) {
            document.getElementById('signupForm').querySelector('[name="username"]').value = '';
            document.getElementById('signupForm').querySelector('[name="password"]').value = '';
            signupModal.style.display = "none";
        }
    });
});

// PAGE HOME -> PAGE FRIENDS
document.addEventListener("DOMContentLoaded", function() {
    var friendsModal = document.getElementById("friendsModal");
    var openFriendsPage = document.getElementById("openFriendsPage");
    var friendsListTab = document.getElementById("friendsListTab");
    var friendsSearchTab = document.getElementById("friendsSearchTab");
    var friendsRequestTab = document.getElementById("friendsRequestTab");
    var openFriendsListTab = document.getElementById("openFriendsListTab");
    var openFriendsSearchTab = document.getElementById("openFriendsSearchTab");
    var openFriendsRequestTab = document.getElementById("openFriendsRequestTab");
    var closeFriendsModalButton = document.getElementById("close-friends-modal-button");

    const friendsResults = document.getElementById('friendsResults');
    const addFriendsText = document.getElementById('add_friends_text');
    const requestResults = document.getElementById('requestResults');
    const noPendingDemandText = document.getElementById('no_pending_demand_text');

    if (token) {
        AuthService.username(token)
            .then(authUsername => {
                FriendsService.getRequests(authUsername)
                    .then(requests => {
                        if (requests.length > 0){
                            openFriendsRequestTab.src = '../img/friends/requestButtonNotif.png';
                        }
                    });
            });
    }

    openFriendsPage.addEventListener("click", function(e) {
        if(token) {
            e.preventDefault();
            friendsModal.style.display = "flex";
            friendsListTab.style.display = "flex";
            openFriendsSearchTab.style.opacity = "0.5";
            openFriendsRequestTab.style.opacity = "0.5";
            openFriendsListTab.style.opacity = "1";
            
            displayFriendsListTab(friendsResults, addFriendsText);
        } else {
            alert('Vous devez être connecté pour accéder à vos amis');
        }
        
    });

    openFriendsListTab.addEventListener("click", function(e) {
        e.preventDefault();
        friendsSearchTab.style.display = "none";
        friendsRequestTab.style.display = "none";
        friendsListTab.style.display = "flex";
        openFriendsSearchTab.style.opacity = "0.5";
        openFriendsRequestTab.style.opacity = "0.5";
        openFriendsListTab.style.opacity = "1";

        displayFriendsListTab(friendsResults, addFriendsText);
    });

    openFriendsSearchTab.addEventListener("click", function(e) {
        e.preventDefault();
        friendsListTab.style.display = "none";
        friendsRequestTab.style.display = "none";
        friendsSearchTab.style.display = "flex";
        
        openFriendsRequestTab.style.opacity = "0.5";
        openFriendsListTab.style.opacity = "0.5";
        openFriendsSearchTab.style.opacity = "1";

        const searchForm = document.getElementById('friendsForm');
        const searchResults = document.getElementById('searchResults');

        searchForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const username = searchForm.querySelector('[name="search"]').value;
            FriendsService.searchUsers(username)
                .then(data => {
                    displaySearchResults(data, searchResults);
                })
                .catch(error => {
                    console.error(error);
                });
        });
    });

    openFriendsRequestTab.addEventListener("click", function(e) {
        e.preventDefault();
        friendsListTab.style.display = "none";
        friendsSearchTab.style.display = "none";
        friendsRequestTab.style.display = "flex";

        openFriendsListTab.style.opacity = "0.5";
        openFriendsSearchTab.style.opacity = "0.5";
        openFriendsRequestTab.style.opacity = "1";

        if (token) {
            AuthService.username(token)
                .then(authUsername => {
                    FriendsService.getRequests(authUsername)
                        .then(requests => {
                            displayRequestResults(requests, requestResults);
                            if (requestResults.children.length === 0) {
                                requestResults.style.display = 'none';
                                noPendingDemandText.style.display = 'flex';
                            } else {
                                noPendingDemandText.style.display = 'none';
                                requestResults.style.display = 'flex';
                            }
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

    closeFriendsModalButton.addEventListener("click", function() {
        document.getElementById('friendsForm').reset();
        document.getElementById('searchResults').innerHTML = '';
        friendsModal.style.display = "none";
        friendsListTab.style.display = "none";
        friendsSearchTab.style.display = "none";
        friendsRequestTab.style.display = "none";
    });

    window.addEventListener("click", function(event) {
        if (event.target === friendsModal) {
            document.getElementById('friendsForm').reset();
            document.getElementById('searchResults').innerHTML = '';
            friendsModal.style.display = "none";
            friendsListTab.style.display = "none";
            friendsSearchTab.style.display = "none";
            friendsRequestTab.style.display = "none";
        }
    });
});

// PAGE HOME -> PAGE STATS
document.addEventListener("DOMContentLoaded", function() {
    var statModal = document.getElementById("statModal");
    var openStatPage = document.getElementById("openStatPage");
    var closeStatModalButton = document.getElementById("close-stat-modal-button");

    openStatPage.addEventListener("click", function(e) {
        if (token){
            e.preventDefault();
            statModal.style.display = "flex";
            const statItems = document.querySelectorAll('.stat-item span');
            StatService.getStat(token)
                .then(data => {
                    if(statItems.length === 6) { // On vérifie qu'on bien récupéré le bon nombre de stats
                        statItems[0].textContent = data.numberOfPlayedGames;
                        if (data.playingTimeDuration >= 60) {
                            const hours = Math.floor(data.playingTimeDuration / 60);
                            const minutes = data.playingTimeDuration % 60;
                            statItems[1].textContent = hours + "h" + minutes;
                        } else {
                            statItems[1].textContent = data.playingTimeDuration + "min";
                        }
                        statItems[2].textContent = data.numberOfVictory;
                        statItems[3].textContent = data.numberOfMoves;
                        statItems[4].textContent = data.numberOfWallsInstalled;
                        statItems[5].textContent = data.fastestWinNumberOfMoves + " coups";
                    }
                })
                .catch(error => {
                    console.error('Erreur lors de la récupération des données:', error);
                    alert('Erreur lors de la récupération des données');
                });
        } else {
            alert('Vous devez être connecté pour consulter vos statistiques');
        }
    });

    closeStatModalButton.addEventListener("click", function() {
        statModal.style.display = "none";
    });

    window.addEventListener("click", function(event) {
        if (event.target === statModal) {
            statModal.style.display = "none";
        }
    });
});

document.addEventListener("DOMContentLoaded", function() {
   const profileButton = document.getElementById('profilePage');
    profileButton.addEventListener('click', function(event) {
         event.preventDefault();
         if (token) {
              AuthService.username(token)
                .then(authUsername => {
                     window.location.href = `./profilePage/profile.html?username=${authUsername}`;
                })
                .catch(error => {
                     console.error('Error fetching username:', error);
                });
         } else {
              alert('Vous devez être connecté pour accéder à votre profil');
         }
    });
});

// MODULE D'INSCRIPTION
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = signupForm.querySelector('[name="username"]').value;
        const password = signupForm.querySelector('[name="password"]').value;
        if (username === '') {
            alert('Veuillez renseigner un nom d’utilisateur');
            return;
        } else if (password === '') {
            alert('Veuillez renseigner un mot de passe');
            return;
        }
        AuthService.signUp(username, password)
            .then(data => {
                console.log("On vient de se signup");
                StatService.associateStatToNewUser(username)
                .then(data2 => {
                    console.log("L'association s'est bien passée");
                })
                .catch(error => {
                    console.error('Statistics error:', error);
                });
                AchievementsService.associateAchievementsToNewUser(username)
                .then(data3 => {
                    console.log("La création d'achievements s'est bien passée");
                })
                .catch(error => {
                    console.error('Statistics error:', error);
                });
                signupModal.style.display = "none";
                loginModal.style.display= "flex";
                alert('Inscription effectuée');
            })
            .catch(error => {
                console.error('Signup error:', error);
                // Utilisez le message d'erreur pour déterminer la nature de l'erreur
                if (error.message === 'Username already exists') {
                    alert('Ce nom d’utilisateur existe déjà. Veuillez en choisir un autre.');
                } else {
                    alert('Inscription impossible, veuillez réessayer.');
                }
            });
        document.getElementById('signupForm').querySelector('[name="username"]').value = '';
        document.getElementById('signupForm').querySelector('[name="password"]').value = '';
    });
});

// MODULE DE CONNEXION
document.addEventListener('DOMContentLoaded', () => {
    const accountButtonImage = document.getElementById('accountButtonImage');
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = loginForm.querySelector('[name="username"]').value;
        const password = loginForm.querySelector('[name="password"]').value;
        console.log(username);
        console.log(password);
        accountButtonImage.src = 'img/home/button_logout.png';

        AuthService.login(username, password)
            .then(data => {
                localStorage.setItem('token', data.token);
                alert('Bienvenue ' + username + ' !');
                loginModal.style.display = "none";
                updateToken();
                window.plugins.OneSignal.login(username.toString());
            })
            .catch(error => {
                console.error('Login error:', error);
                alert('Identifiant inexistant ou mot de passe incorrect, veuillez reessayer ou vous inscrire.');
            });
        document.getElementById('loginForm').querySelector('[name="username"]').value = '';
        document.getElementById('loginForm').querySelector('[name="password"]').value = '';
    });
});

// PAGE HOME -> PAGE RANK
document.addEventListener("DOMContentLoaded", function() {
    var openRankPage = document.getElementById("openRankPage");
    const rankResults = document.getElementById('rankResults');
    var closeRankModalButton = document.getElementById("close-rank-modal-button");

    openRankPage.addEventListener("click", function (e) {
        e.preventDefault();
        rankModal.style.display = "flex";
        StatService.getAllRanking()
        .then(rank => {
            console.log("ON MET À JOUR LES RANKS");
            displayRankResults(rank.ranking);
        })
        .catch(error => {
            console.error('Error fetching rank:', error);
        });
    });

    function displayRankResults(results) {
        rankResults.innerHTML = '';

        results.forEach((result, index) => {
            const li = document.createElement('li');
            const div = document.createElement('div');
            div.textContent = `${index + 1}. ${result.username}`;
            li.appendChild(div);
            li.style.cursor = 'pointer';
            li.addEventListener('click', function(event) {
                event.preventDefault();
                window.location.href = `./profilePage/profile.html?username=${result.username}`;
            });
            rankResults.appendChild(li);
        });
    }

    closeRankModalButton.addEventListener("click", function() {
        rankModal.style.display = "none";
    });

    window.addEventListener("click", function(event) {
        if (event.target === rankModal) {
            rankModal.style.display = "none";
        }
    });
});

// PAGE HOME -> PAGE SKIN
document.addEventListener("DOMContentLoaded", function() {
    var openSkinPage = document.getElementById("openSkinPage");
    var closeSkinModalButton = document.getElementById("close-skin-modal-button");
    const skinImages = document.querySelectorAll('#possible-skins img');
    const displaySkinImage = document.querySelector('#display-skin img');

    openSkinPage.addEventListener("click", function (e) {
        if(token) {
            e.preventDefault();
            skinModal.style.display = "flex";

            AuthService.getSkin(token)
            .then(data => {
                console.log("On a bien reçu le skin : " + data.skinURL);
                displaySkinImage.src = 'img/skin/' + data.skinURL;
            })
            .catch(error => {
                console.error('Erreur de récuparéation du skin :', error);
            });

            var url = null;
            var filename = null;
            skinImages.forEach(image => {
                image.addEventListener('click', function() {
                    url = image.src; // 'img/skin/Cube001.png' par exemple
                    filename = url.split('/').pop(); // 'Cube001.png' par exemple
                    console.log("URL : " + url + "filename : " + filename);

                    AuthService.udpateSkin(token, filename)
                    .then(data => {
                        console.log("Réponse du back : " + data.message);
                    })
                    .catch(error => {
                        console.error('Error udpating skin:', error);
                    });
                    displaySkinImage.src = image.src;
                });
            });
        } else {
            alert("Vous devez être connecté pour accéder à vos skins");
        }
        
    });

    closeSkinModalButton.addEventListener("click", function() {
        skinModal.style.display = "none";
    });

    window.addEventListener("click", function(event) {
        if (event.target === skinModal) {
            skinModal.style.display = "none";
        }
    });
});


/**************** FONCTIONS DE GESTION DES AMIS ****************/
function displayFriendsListTab(friendsResults, addFriendsText) {
    if (token) {
        AuthService.username(token)
            .then(authUsername => {
                FriendsService.getFriends(authUsername)
                    .then(friends => {
                        displayFriendsResults(friends, friendsResults);
                        if (friendsResults.children.length === 0) {
                            friendsResults.style.display = 'none';
                            addFriendsText.style.display = 'flex';
                        } else {
                            addFriendsText.style.display = 'none';
                            friendsResults.style.display = 'flex';
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching requests:', error);
                    });
            })
            .catch(error => {
                console.error('Error fetching username:', error);
            });

    }
}

function displayFriendsResults(results, friendsResults) {
    friendsResults.innerHTML = '';

    results.forEach(result => {
        const li = document.createElement('li');
        const div = document.createElement('div');
        div.textContent = result.username;
        li.appendChild(div);
        li.style.cursor = 'pointer';
        li.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = `./profilePage/profile.html?username=${result.username}`;
        });
        friendsResults.appendChild(li);
    });
}

function displaySearchResults(results, searchResults) {
    searchResults.innerHTML = '';

    results.forEach(result => {
        const li = document.createElement('li');
        const div = document.createElement('div');
        div.textContent = result.username;
        li.appendChild(div);
        li.style.cursor = 'pointer';
        li.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = `./profilePage/profile.html?username=${result.username}`;
        });
        searchResults.appendChild(li);
    });
}

function displayRequestResults(results, requestResults) {
    requestResults.innerHTML = '';

    results.forEach(result => {
        const li = document.createElement('li');
        const div = document.createElement('div');
        div.textContent = result;
        li.appendChild(div);
        li.style.cursor = 'pointer';
        li.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = `./profilePage/profile.html?username=${result.username}`;
        });

        const acceptDeniedContainer = document.createElement('div');
        acceptDeniedContainer.classList.add('accept-denied-container');

        const acceptButton = document.createElement('button');
        acceptButton.classList.add('accept');
        acceptButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Arrête la propagation de l'événement au parent
            handleFriendRequest('accept', result);
        });

        const deniedButton = document.createElement('button');
        deniedButton.classList.add('denied');
        deniedButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Arrête la propagation de l'événement au parent
            handleFriendRequest('accept', result);
        });

        acceptDeniedContainer.appendChild(acceptButton);
        acceptDeniedContainer.appendChild(deniedButton);

        li.appendChild(acceptDeniedContainer);
        requestResults.appendChild(li);
    });
}

// Fonction pour mettre à jour la liste des demandes d'amis
function updateRequestResults() {
    AuthService.username(token)
        .then(authUsername => {
            FriendsService.getRequests(authUsername)
                .then(requests => {
                    const requestResults = document.getElementById('requestResults');
                    const noPendingDemandText = document.getElementById('no_pending_demand_text');
                    displayRequestResults(requests, requestResults);

                    // Vérifiez si la liste des demandes est vide après la mise à jour
                    if (requestResults.children.length === 0) {
                        // Masquez la liste des résultats des demandes d'amis
                        requestResults.style.display = 'none';
                        // Affichez l'image indiquant qu'il n'y a pas de demandes en attente
                        noPendingDemandText.style.display = 'flex';
                    } else {
                        // Si la liste des demandes n'est pas vide, assurez-vous que l'image noPendingDemandText est masquée
                        noPendingDemandText.style.display = 'none';
                        requestResults.style.display = 'flex';
                    }
                })
                .catch(error => {
                    console.error('Error fetching requests:', error);
                });
        })
        .catch(error => {
            console.error('Error fetching username:', error);
        });
}

// Fonction pour gérer les demandes d'amis (acceptation ou refus)
function handleFriendRequest(action, friendUsername) {
    AuthService.username(token)
        .then(authUsername => {
            if (action === 'accept') {
                FriendsService.acceptFriend(authUsername, friendUsername)
                    .then(() => updateRequestResults()) // Mise à jour de la liste après acceptation
                    .catch(error => console.error('Error accepting friend:', error));
            } else if (action === 'deny') {
                FriendsService.deniedFriend(authUsername, friendUsername)
                    .then(() => updateRequestResults()) // Mise à jour de la liste après refus
                    .catch(error => console.error('Error denying friend:', error));
            }
        })
        .catch(error => console.error('Error fetching username:', error));
}


document.addEventListener("DOMContentLoaded", function() {
    var openAccountPage = document.getElementById("openAccountPage");
    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);
    var openModal = urlParams.get('openModal');
    console.log("on passe ici");
    if (openModal === 'true') {
        accountModal.style.display = "flex";
        var newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        console.log("true");
    }else{
        accountModal.style.display = "none";
        console.log("false")
    }

});


document.addEventListener("DOMContentLoaded", function() {
    const settingButton = document.getElementById('settingPage');
    settingButton.addEventListener('click', function(event) {
        event.preventDefault();
        if (token) {
            AuthService.username(token)
                .then(authUsername => {
                    window.location.href = `./settingsPage/settings.html?username=${authUsername}`;

                })
                .catch(error => {
                    console.error('Error fetching username:', error);
                });
        } else {
            alert('Vous devez être connecté pour accéder aux paramètres');
        }
    });
});

window.addEventListener('load', resizeImageBasedOnHeight);
window.addEventListener('resize', resizeImageBasedOnHeight);

function initializeAccountButtonImage(token) {
    if(token) {
        accountButtonImage.src = 'img/home/button_logout.png';
    } else {
        accountButtonImage.src = 'img/home/button_login.png';
    }
}

// function resizeImageBasedOnHeight() {
//     const image = document.querySelector('.top-image');
//     if (image.offsetHeight >= 40 * window.innerHeight / 100) {
//         image.style.width = 'auto';
//     } else {
//         image.style.width = '80%';
//     }
// }