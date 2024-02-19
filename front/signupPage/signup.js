import { AuthService } from '../Services/authService.js';

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = signupForm.querySelector('[name="username"]').value;
        const password = signupForm.querySelector('[name="password"]').value;
        AuthService.signUp(username, password)
            .then(data => {
                console.log('Signup success:', data);
                localStorage.setItem('token', data.token);
                window.location.href = '../loginPage/login.html';
                alert('Inscription effectuée');
            })
            .catch(error => {
                console.error('Signup error:', error);
                alert('Insription impossible, veuillez reessayer.');
            });
    });
});
