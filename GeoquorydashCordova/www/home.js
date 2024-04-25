import { AuthService } from './Services/authService.js';
import { StatService } from "./Services/statService.js";
import { FriendsService } from './Services/friendsService.js';
import { AchievementsService } from './Services/achievementsService.js';

var accountModal = document.getElementById("accountModal");
var signupModal = document.getElementById("signupModal");
var loginModal = document.getElementById("loginModal");
var rankModal = document.getElementById("rankModal");


var token;
updateToken();

function updateToken() {
    token = localStorage.getItem('token');
}


var handleDeconnexionClick = function(event) {
    event.preventDefault();
    var modal = document.getElementById("myModalTempDeco");
    var modalContent = document.querySelector('.modal-content-temp-deco');

    var textContent = document.querySelector('.modal-content-temp-deco p')
    textContent.textContent = "Êtes-vous sûr de vouloir vous déconnecter?";

    modal.style.display = "flex";

    var okButton = document.getElementById('confirmBtn');
    okButton.onclick = function() {
        localStorage.clear();
        modal.style.display = "none";
        window.location.href = '../home.html';
    };

    var cancelButton = document.getElementById('cancelBtn');
    cancelButton.onclick = function() {
        modal.style.display = "none";
    };
};


// PAGE HOME -> PAGE ACCOUNT
document.addEventListener("DOMContentLoaded", function() {
    var openAccountPage = document.getElementById("openAccountPage");

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
            document.getElementById('deconnect_text_1').style.display = 'block';
            document.getElementById('deconnect_text_2').style.display = 'block';
            deconnexionButton.removeEventListener('click', handleDeconnexionClick);
            deconnexionButton.addEventListener('click', handleDeconnexionClick);
        } else {
            // Assurez-vous de gérer correctement le cas où le token n'existe pas
            document.getElementById('openSignupPage').style.display = 'block';
            document.getElementById('openLoginPage').style.display = 'block';
            document.getElementById('connect_text_1').style.display = 'block';
            document.getElementById('connect_text_2').style.display = 'block';
    
            deconnexionButton.style.display = "none";
            document.getElementById('deconnect_text_1').style.display = 'none';
            document.getElementById('deconnect_text_2').style.display = 'none';
        }
    });

    window.addEventListener("click", function(event) {
        if (event.target === accountModal) {
            accountModal.style.display = "none";
        }
    });

    if (token) {
        AuthService.username(token)
            .then(authUsername => {
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

// PAGE HOME -> PAGE SIGNUP
document.addEventListener("DOMContentLoaded", function() {
    var openSignupPage = document.getElementById("openSignupPage");

    openSignupPage.addEventListener("click", function(e) {
        e.preventDefault();
        accountModal.style.display = "none";
        signupModal.style.display = "flex";
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

    openLoginPage.addEventListener("click", function(e) {
        e.preventDefault();
        accountModal.style.display = "none";
        loginModal.style.display = "flex";
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

    openSignupPage.addEventListener("click", function(e) {
        e.preventDefault();
        document.getElementById('loginForm').querySelector('[name="username"]').value = '';
        document.getElementById('loginForm').querySelector('[name="password"]').value = '';
        loginModal.style.display = "none";
        signupModal.style.display = "flex";
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
            var modal = document.getElementById("myModalTemp");
            var modalContent = document.querySelector('.modal-content-temp');
            var textContent = document.querySelector('.modal-content-temp p')
            textContent.textContent = "Vous devez être connecté pour accéder à vos amis";
            modal.style.display = "flex";
            // Fermer la popup automatiquement après 4 secondes
            setTimeout(() => {
                modal.style.display = "none";
            }, 1000);
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
                    var modal = document.getElementById("myModalTemp");
                    var modalContent = document.querySelector('.modal-content-temp');
                    var textContent = document.querySelector('.modal-content-temp p')
                    textContent.textContent = "Lors de la récupération des données, une erreur est survenue";
                    modal.style.display = "flex";
                    // Fermer la popup automatiquement après 4 secondes
                    setTimeout(() => {
                        modal.style.display = "none";
                    }, 1000);
                });
        } else {
            var modal = document.getElementById("myModalTemp");
            var modalContent = document.querySelector('.modal-content-temp');
            var textContent = document.querySelector('.modal-content-temp p')
            textContent.textContent = "Vous devez être connecté pour accéder à vos statistiques";
            modal.style.display = "flex";
            // Fermer la popup automatiquement après 4 secondes
            setTimeout(() => {
                modal.style.display = "none";
            }, 1000);
        }
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
             var modal = document.getElementById("myModalTemp");
             var modalContent = document.querySelector('.modal-content-temp');
             var textContent = document.querySelector('.modal-content-temp p')
             textContent.textContent = "Vous devez être connecté pour accéder à votre profil";
             modal.style.display = "flex";
             // Fermer la popup automatiquement après 4 secondes
             setTimeout(() => {
                 modal.style.display = "none";
             }, 1000);
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
            var modal = document.getElementById("myModalTempSign");
            var modalContent = document.querySelector('.modal-content-temp-sign');
            var textContent = document.querySelector('.modal-content-temp-sign p')
            textContent.textContent = "Vous devez renseigner un nom d'utilisateur";
            modal.style.display = "flex";
            // Fermer la popup automatiquement après 4 secondes
            setTimeout(() => {
                modal.style.display = "none";
            }, 1000);
        } else if (password === '') {
            var modal = document.getElementById("myModalTempSign");
            var modalContent = document.querySelector('.modal-content-temp-sign');
            var textContent = document.querySelector('.modal-content-temp-sign p')
            textContent.textContent = "Vous devez renseigner un mot de passe";
            modal.style.display = "flex";
            // Fermer la popup automatiquement après 4 secondes
            setTimeout(() => {
                modal.style.display = "none";
            }, 1000);
        }
        AuthService.signUp(username, password)
            .then(data => {
                StatService.associateStatToNewUser(username)
                .then(data2 => {
                })
                .catch(error => {
                    console.error('Statistics error:', error);
                });
                AchievementsService.associateAchievementsToNewUser(username)
                .then(data3 => {
                })
                .catch(error => {
                    console.error('Statistics error:', error);
                });
                signupModal.style.display = "none";
                loginModal.style.display= "flex";
                var modal = document.getElementById("myModalTempLog");
                var modalContent = document.querySelector('.modal-content-temp-log');
                var textContent = document.querySelector('.modal-content-temp-log p')
                textContent.textContent = "Inscription réussie, vous pouvez maintenant vous connecter";
                modal.style.display = "flex";
                // Fermer la popup automatiquement après 4 secondes
                setTimeout(() => {
                    modal.style.display = "none";
                }, 1000);
            })
            .catch(error => {
                console.error('Signup error:', error);
                // Utilisez le message d'erreur pour déterminer la nature de l'erreur
                if (error.message === 'Username already exists') {
                    var modal = document.getElementById("myModalTempSign");
                    var modalContent = document.querySelector('.modal-content-temp-sign');
                    var textContent = document.querySelector('.modal-content-temp-sign p')
                    textContent.textContent = "Ce nom d'utilisateur est déjà pris, veuillez en choisir un autre";
                    modal.style.display = "flex";
                    // Fermer la popup automatiquement après 4 secondes
                    setTimeout(() => {
                        modal.style.display = "none";
                    }, 1000);
                } else {
                    var modal = document.getElementById("myModalTempSign");
                    var modalContent = document.querySelector('.modal-content-temp-sign');
                    var textContent = document.querySelector('.modal-content-temp-sign p')
                    textContent.textContent = "Une erreur est survenue lors de l'inscription, veuillez réessayer";
                    modal.style.display = "flex";
                    // Fermer la popup automatiquement après 4 secondes
                    setTimeout(() => {
                        modal.style.display = "none";
                    }, 1000);
                }
            });
        document.getElementById('signupForm').querySelector('[name="username"]').value = '';
        document.getElementById('signupForm').querySelector('[name="password"]').value = '';
    });
});

// MODULE DE CONNEXION
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = loginForm.querySelector('[name="username"]').value;
        const password = loginForm.querySelector('[name="password"]').value;
        console.log(username);
        console.log(password);

        AuthService.login(username, password)
            .then(data => {
                localStorage.setItem('token', data.token);
                loginModal.style.display = "none";
                var modal = document.getElementById("myModalTemp");
                var modalContent = document.querySelector('.modal-content-temp');
                var textContent = document.querySelector('.modal-content-temp p')
                textContent.textContent = "Bienvenue " + username + " !";
                modal.style.display = "flex";
                // Fermer la popup automatiquement après 4 secondes
                setTimeout(() => {
                    modal.style.display = "none";
                }, 1000);
                updateToken();
            })
            .catch(error => {
                console.error('Login error:', error);
                var modal = document.getElementById("myModalTempLog");
                var modalContent = document.querySelector('.modal-content-temp-log');
                var textContent = document.querySelector('.modal-content-temp-log p')
                textContent.textContent = "Nom d'utilisateur ou mot de passe incorrect";
                modal.style.display = "flex";
                // Fermer la popup automatiquement après 4 secondes
                setTimeout(() => {
                    modal.style.display = "none";
                }, 1000);
            });
        document.getElementById('loginForm').querySelector('[name="username"]').value = '';
        document.getElementById('loginForm').querySelector('[name="password"]').value = '';
    });
});

// PAGE HOME -> PAGE RANK
document.addEventListener("DOMContentLoaded", function() {
    var openRankPage = document.getElementById("openRankPage");

    openRankPage.addEventListener("click", function (e) {
        e.preventDefault();
        rankModal.style.display = "flex";
    });

    const rankResults = document.getElementById('rankResults');
    StatService.getAllRanking()
        .then(rank => {
            displayRankResults(rank.ranking);
        })
        .catch(error => {
            console.error('Error fetching rank:', error);
        });

    function displayRankResults(results) {
        rankResults.innerHTML = '';

        results.forEach((result, index) => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.onclick = function(event) {
                event.preventDefault();
                window.location.href = `./profilePage/profile.html?username=${result.username}`;
            };
            link.textContent = `${index + 1}. ${result.username}`;
            link.target = "_blank";
            li.appendChild(link);
            rankResults.appendChild(li);
        });
    }

    window.addEventListener("click", function(event) {
        if (event.target === rankModal) {
            rankModal.style.display = "none";
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
        const link = document.createElement('a');
        link.onclick = function(event) {
            event.preventDefault();
            window.location.href = `./profilePage/profile.html?username=${result.username}`;
        };
        link.textContent = result.username;
        link.target = "_blank";
        li.appendChild(link);
        friendsResults.appendChild(li);
    });
}

function displaySearchResults(results, searchResults) {
    searchResults.innerHTML = '';

    results.forEach(result => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.onclick = function(event) {
            event.preventDefault();
            window.location.href = `./profilePage/profile.html?username=${result.username}`;
        };
        link.textContent = result.username;
        link.target = "_blank";
        li.appendChild(link);
        searchResults.appendChild(li);
    });
}

function displayRequestResults(results, requestResults) {
    requestResults.innerHTML = '';

    results.forEach(result => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.onclick = function(event) {
            event.preventDefault();
            window.location.href = `./profilePage/profile.html?username=${result}`;
        };
        link.textContent = result;
        link.target = "_blank";

        const acceptDeniedContainer = document.createElement('div');
        acceptDeniedContainer.classList.add('accept-denied-container');

        const acceptButton = document.createElement('button');
        acceptButton.classList.add('accept');
        acceptButton.addEventListener('click', () => handleFriendRequest('accept', result));

        const deniedButton = document.createElement('button');
        deniedButton.classList.add('denied');
        deniedButton.addEventListener('click', () => handleFriendRequest('deny', result));

        acceptDeniedContainer.appendChild(acceptButton);
        acceptDeniedContainer.appendChild(deniedButton);

        li.appendChild(link);
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

