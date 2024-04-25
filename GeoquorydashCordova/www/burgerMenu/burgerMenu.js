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
    const connexionButton = document.getElementById('connexionButton');
    if (localStorage.getItem('token')) {
        deconnexionButton.style.display = 'block';
        connexionButton.style.display = 'none';
    } else {
        deconnexionButton.style.display = 'none';
        connexionButton.style.display = 'block';
    }

    deconnexionButton.addEventListener('click', function(event) {
        var modal = document.getElementById("myModal");
        var modalContent = document.querySelector('.modal-content');

        var textContent = document.querySelector('.modal-content p')
        textContent.textContent = "Êtes-vous sûr de vouloir vous déconnecter?";

        modal.style.display = "flex";

        var okButton = document.getElementById('confirmBtn');
        okButton.onclick = function() {
            localStorage.clear();
            modal.style.display = "none";
            window.location.href = '../home.html';
        };

        var cancelButton = document.getElementById('cancelBtn');
        cancelButton.onclick = function() {
            modal.style.display = "none";
        };
    });
}
