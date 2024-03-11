const burgerMenuButton = document.getElementById('burger-menu-button');
const burgerMenuContainer = document.getElementById('burger-menu-container');
let burgerMenuLoaded = false;

burgerMenuButton.addEventListener('click', async () => {
    if (!burgerMenuLoaded) {
        await loadBurgerMenu();
        burgerMenuLoaded = true;
    }
    const burgerMenu = document.querySelector('.burger-menu');
    burgerMenu.classList.toggle('show');

    burgerMenuButton.classList.toggle('open', burgerMenu.classList.contains('show'));
});

async function loadBurgerMenu() {
    const response = await fetch('../burgerMenu/burgerMenu.html');
    const html = await response.text();
    burgerMenuContainer.innerHTML = html;

    const deconnexionButton = document.getElementById('deconnexionButton');
    deconnexionButton.addEventListener('click', function(event) {
        event.preventDefault();

        if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
            localStorage.clear();
            window.location.href = '../home.html';
        }
    });
}
