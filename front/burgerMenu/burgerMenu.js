const burgerMenuButton = document.getElementById('burger-menu-button');
const burgerMenuContainer = document.getElementById('burger-menu-container');
const burgerMenuImage = burgerMenuButton.querySelector('img');
let burgerMenuLoaded = false;

burgerMenuButton.addEventListener('click', async () => {
    if (!burgerMenuLoaded) {
        await loadBurgerMenu();
        burgerMenuLoaded = true;
    }
    setTimeout(() => {
        const burgerMenu = document.querySelector('.burger-menu');
        burgerMenu.classList.toggle('show');

        if (burgerMenu.classList.contains('show')) {
            burgerMenuImage.classList.add('rotate-image');
            burgerMenuImage.classList.remove('rotate-image-reverse');
            burgerMenuButton.style.left = 'calc(17vw + 20px)'; // Transition appliquée lors du changement
        } else {
            burgerMenuImage.classList.add('rotate-image-reverse');
            burgerMenuImage.classList.remove('rotate-image');
            burgerMenuButton.style.left = '20px'; // Transition appliquée lors du changement
        }
        

        burgerMenuButton.classList.toggle('open', burgerMenu.classList.contains('show'));
    }, 0);
});

async function loadBurgerMenu() {
    const response = await fetch('../burgerMenu/burgerMenu.html');
    const html = await response.text();
    burgerMenuContainer.innerHTML = html;

    const deconnexionButton = document.getElementById('deconnexionButton');
    const connexionButton = document.getElementById('connexionButton');
    if (localStorage.getItem('token')) {
        deconnexionButton.style.display = 'block';
        connexionButton.style.display = 'none';
    } else {
        deconnexionButton.style.display = 'none';
        connexionButton.style.display = 'block';
    }

    deconnexionButton.addEventListener('click', function(event) {
        event.preventDefault();

        if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
            localStorage.clear();
            alert('Vous êtes déconnecté');
            window.location.href = '../home.html';
        }
    });
}

