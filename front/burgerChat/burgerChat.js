import { AuthService } from '../Services/authService.js';
import { FriendsService } from '../Services/friendsService.js';

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


    const friendsResults = document.getElementById('friendsResults');
    const token = localStorage.getItem('token');
    if (token) {
        AuthService.username(token)
            .then(authUsername => {
                FriendsService.getFriends(authUsername)
                    .then(friends => {
                        displayFriendsResults(friends);
                    })
                    .catch(error => {
                        console.error('Error fetching requests:', error);
                    });
            })
            .catch(error => {
                console.error('Error fetching username:', error);
            });

    }
    function displayFriendsResults(results) {
        friendsResults.innerHTML = '';

        const ul= document.createElement('ul');

        results.forEach(result => {
            const li = document.createElement('li');
            const container = document.createElement('div');
            const link = document.createElement('a');
            link.href = `../profilePage/profile.html?username=${result}`;
            link.textContent = result;
            link.target = "_blank";

            const chatButton = document.createElement('button');
            chatButton.classList.add('chat');
            chatButton.addEventListener('click', () => {
                openChatWindow(result);
            });

            container.appendChild(link);
            container.appendChild(chatButton);
            li.appendChild(container);
            ul.appendChild(li);
        });

        friendsResults.appendChild(ul);
    }

    function openChatWindow(friendName) {
        // Masquer tous les friendsResults
        friendsResults.style.display = 'none';

        // Créer une section de chat
        const chatSection = document.createElement('div');
        chatSection.classList.add('chat-section');
        burgerChatContainer.appendChild(chatSection);

        // Afficher le nom de l'ami en haut à droite
        const friendNameHeader = document.createElement('div');
        friendNameHeader.classList.add('friend-name-header');
        friendNameHeader.textContent = friendName;
        chatSection.appendChild(friendNameHeader);

        // Créer une zone de chat prenant toute la hauteur de la fenêtre
        const chatArea = document.createElement('div');
        chatArea.classList.add('chat-area');
        chatSection.appendChild(chatArea);

        // Créer des messages pour l'ami et pour vous-même
        // Ajouter une barre de saisie de texte avec un bouton d'envoi
        // (non implémenté ici)

        // Vous pouvez ajouter la logique pour la barre de saisie de texte
        // et le bouton d'envoi ici
    }

}


