import { AuthService } from '../Services/authService.js';

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = signupForm.querySelector('[name="username"]').value;
        const password = signupForm.querySelector('[name="password"]').value;
        AuthService.signUp(username, password)
            .then(data => {
                window.location.href = '../loginPage/login.html';
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
    });
});
