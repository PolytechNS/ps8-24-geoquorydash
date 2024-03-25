import {AuthService} from "../Services/authService";
import {FriendsService} from "../Services/friendsService";

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
            const link = document.createElement('a');
            link.href = `../profilePage/profile.html?username=${result}`;
            link.textContent = result;
            link.target = "_blank";
            li.appendChild(link);
            ul.appendChild(li);
        });

        friendsResults.appendChild(ul);
    }
}
