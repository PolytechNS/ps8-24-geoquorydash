const token = localStorage.getItem('token');

if (token) {
    document.getElementById('signup-btn').style.display = 'none';
    document.getElementById('login-btn').style.display = 'none';

    const deconnexionButton = document.getElementById('logout-btn');
    deconnexionButton.style.display = 'block';

    deconnexionButton.addEventListener('click', function(event) {
        event.preventDefault();

        if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
            localStorage.clear();
            alert('Vous êtes déconnecté');
            const modal = window.parent.document.querySelector('.modal');
            modal.style.display = 'none';
        }
    });
}