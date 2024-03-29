import { AuthService } from './Services/authService.js';

var accountModal = document.getElementById("accountModal");
var signupModal = document.getElementById("signupModal");
var loginModal = document.getElementById("loginModal");

var token;
updateToken();

function updateToken() {
    token = localStorage.getItem('token');
}

// PAGE HOME -> PAGE ACCOUNT
document.addEventListener("DOMContentLoaded", function() {
    var openAccountPage = document.getElementById("openAccountPage");

    openAccountPage.addEventListener("click", function(e) {
        e.preventDefault();
        accountModal.style.display = "flex";
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
        e.preventDefault();
        statModal.style.display = "flex";
    });

    window.addEventListener("click", function(event) {
        if (event.target === statModal) {
            statModal.style.display = "none";
        }
    });
});

// MODULE D'INSCRIPTION
document.addEventListener('DOMContentLoaded', () => {
    console.log("TEST");
    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = signupForm.querySelector('[name="username"]').value;
        const password = signupForm.querySelector('[name="password"]').value;
        AuthService.signUp(username, password)
            .then(data => {
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
    console.log("TEST 2");
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
                updateDeconnexionVisibility();
            })
            .catch(error => {
                console.error('Login error:', error);
                alert('Identifiant inexistant ou mot de passe incorrect, veuillez reessayer ou vous inscrire.');
            });
        document.getElementById('loginForm').querySelector('[name="username"]').value = '';
        document.getElementById('loginForm').querySelector('[name="password"]').value = '';
    });
});

function updateDeconnexionVisibility() {
    const deconnexionButton = document.getElementById('logout-btn');
    if (token) {
        console.log("TEST 3")
        document.getElementById('openSignupPage').style.display = 'none';
        document.getElementById('openLoginPage').style.display = 'none';

        deconnexionButton.style.display = 'block';

        deconnexionButton.addEventListener('click', function(event) {
            event.preventDefault();

            if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
                localStorage.clear();
                alert('Vous êtes déconnecté');
                const modal = window.parent.document.querySelector('.modal');
                modal.style.display = 'none';
                updateToken();
                updateDeconnexionVisibility();
            }
        });
    } else {
        document.getElementById('openSignupPage').style.display = 'block';
        document.getElementById('openLoginPage').style.display = 'block';

        deconnexionButton.style.display = "none";
    }
}
