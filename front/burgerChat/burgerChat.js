const burgerChatButton = document.getElementById('burger-chat-button');
const burgerChatContainer = document.getElementById('burger-chat-container');
let burgerChatLoaded = false;

burgerChatButton.addEventListener('click', async () => {
    if (!burgerChatLoaded) {
        await loadBurgerChat();
        burgerChatLoaded = true;
    }
    const burgerChat = document.querySelector('.burger-chat');
    burgerChat.classList.toggle('show');

    burgerChatButton.classList.toggle('open', burgerChat.classList.contains('show'));
});

async function loadBurgerChat() {
    const response = await fetch('../burgerChat/burgerChat.html');
    const html = await response.text();
    burgerChatContainer.innerHTML = html;

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

