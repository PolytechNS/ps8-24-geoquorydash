import { AuthService } from '../Services/authService.js';

const token = localStorage.getItem('token');

if (token) {
    console.log('Token:', token);
    document.getElementsByClassName('sentence')[0].style.display = 'block';
    document.getElementsByClassName('sentence')[1].style.display = 'block';
    document.getElementById('signup-btn').style.display = 'none';
    document.getElementById('login-btn').style.display = 'none';

    const deconnexionButton = document.getElementById('logout-btn');
    deconnexionButton.style.display = 'block';

    deconnexionButton.addEventListener('click', function(event) {
        event.preventDefault();

        if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
            AuthService.username(token)
                .then(authUsername => {
                    console.log('Username:', authUsername);
                    AuthService.logout(authUsername)
                        .then(data => {
                            console.log('Logout data:', data);
                            localStorage.clear();
                            alert('Vous êtes déconnecté');
                            const modal = window.parent.document.querySelector('.modal');
                            modal.style.display = 'none';
                        })
                        .catch(error => {
                            console.error('Logout error:', error);
                            alert('Erreur lors de la déconnexion');
                        });
                })
                .catch(error => {
                    console.error('Error fetching username:', error);
                });

        }
    });
}