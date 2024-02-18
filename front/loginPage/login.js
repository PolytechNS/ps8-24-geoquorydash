import { AuthService } from '../Services/AuthService.js';

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
                alert('Connexion effectuée');
                const modal = window.parent.document.querySelector('.modal');
                modal.style.display = 'none';
            })
            .catch(error => {
                console.error('Login error:', error);
            });
    });
});
