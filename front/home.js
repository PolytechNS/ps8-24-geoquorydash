import { AuthService } from './Services/authService.js';
import { StatService } from "./Services/statService.js";

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
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
        localStorage.clear();
        updateToken();
        alert('Vous êtes déconnecté');
        const modal = window.parent.document.querySelector('.modal');
        modal.style.display = 'none';
    }
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
    var friendsFrame = document.getElementById("friendsFrame");

    openFriendsPage.addEventListener("click", function(e) {
        e.preventDefault();
        friendsFrame.src = "friendsPage/friends.html";
        friendsModal.style.display = "flex";
    });

    window.addEventListener("click", function(event) {
        if (event.target === friendsModal) {
            friendsModal.style.display = "none";
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
                    alert('Erreur lors de la récupération des données');
                });
        } else {
            alert('Vous devez être connecté pour consulter vos statistiques');
        }
    });

    window.addEventListener("click", function(event) {
        if (event.target === statModal) {
            statModal.style.display = "none";
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
                alert('Bienvenue ' + username + ' !');
                loginModal.style.display = "none";
                updateToken();
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

        const ul= document.createElement('ul');

        results.forEach(result => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = `../profilePage/profile.html?username=${result}`;
            link.textContent = result.username;
            link.target = "_blank";
            li.appendChild(link);
            ul.appendChild(li);
        });

        rankResults.appendChild(ul);
    }

});