import { AuthService } from '../Services/authService.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = loginForm.querySelector('[name="username"]').value;
        const password = loginForm.querySelector('[name="password"]').value;

        AuthService.login(username, password)
            .then(data => {
                console.log('Login success:', data);
                localStorage.setItem('token', data.token);
                window.location.href = '../home.html';
                alert('Connexion effectuée');
            })
            .catch(error => {
                console.error('Login error:', error);
                alert('Identifiant inexistant ou mot de passe incorrect, veuillez reessayer ou vous inscrire.');
            });
    });
});