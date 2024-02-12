import { AuthService } from '../Services/AuthService.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = loginForm.querySelector('[name="username"]').value;
        const password = loginForm.querySelector('[name="password"]').value;

        AuthService.login(username, password)
            .then(data => {
                alert('Connecté');
                console.log('Login success:', data);
                localStorage.setItem('token', data.token);
                window.location.href = '../home.html';
            })
            .catch(error => {
                console.error('Login error:', error);
                alert('Nom d\'utilisateur ou mot de passe incorrect');
            });
    });
});
