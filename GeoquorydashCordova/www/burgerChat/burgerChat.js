import { AuthService } from '../Services/authService.js';
import { FriendsService } from '../Services/friendsService.js';
import { ChatService } from '../Services/chatService.js';
import userSocket from "../sockets/userSocketConnection.js";

const burgerChatButton = document.getElementById('burger-chat-button');
const burgerChatContainer = document.getElementById('burger-chat-container');
let burgerChatLoaded = false;

let token = localStorage.getItem('token');
if (burgerChatButton && token){
    ChatService.getNotifications(token).then(r => {
        console.log(r);
        if (r){
            if (r.length > 0) burgerChatButton.firstElementChild.src = `../img/chat/chat_notif.png`;
        }
    }).catch(e => {
        console.error('Error fetching notifications:', e);
    })
}

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


    const friendsResultsChat = document.getElementById('friendsResultsChat');
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
    async function displayFriendsResults(results) {
        friendsResultsChat.innerHTML = '';
        let notificationFromUsernames;
        await ChatService.getNotifications(token).then(r => {
            notificationFromUsernames = r;
            console.log('notificationFromUsernames ', notificationFromUsernames);
        });
        const ul = document.createElement('ul');

        results.forEach(result => {
            const li = document.createElement('li');
            const container = document.createElement('div');
            const link = document.createElement('a');
            link.href = `../profilePage/profile.html?username=${result.username}`;
            link.textContent = result.username;
            link.target = "_blank";

            const chatButton = document.createElement('button');
            chatButton.classList.add('chat');
            chatButton.id = `chat-${result.username}`;
            chatButton.addEventListener('click', () => {
                openChatWindow(result.username);
            });
            console.log('result.username ', result.username);
            if (notificationFromUsernames && notificationFromUsernames.includes(result.username)) {
                console.log('notificationFromUsernames.includes(result.username) ', result.username);
                chatButton.style.backgroundImage = 'url("../img/chat/chat_notif.png")';
            }

            container.appendChild(link);
            container.appendChild(chatButton);
            li.appendChild(container);
            ul.appendChild(li);
        });

        friendsResultsChat.appendChild(ul);
    }

    async function openChatWindow(friendName) {
        friendsResultsChat.style.display = 'none';

        const chatSection = document.getElementById('chatSection');

        chatSection.style.display = 'flex';
        chatSection.innerHTML = '';

        const friendNameHeader = document.createElement('div');
        friendNameHeader.classList.add('friend-name-header');
        friendNameHeader.textContent = friendName;

        const backButton = document.createElement('a');
        backButton.classList.add('back-button');
        backButton.href = '#';
        backButton.addEventListener('click', function() {
            friendsResultsChat.style.display = 'flex';
            chatSection.style.display = 'none';
        });

        const backButtonImg = document.createElement('img');
        backButtonImg.src = '../img/chat/back.png';
        backButtonImg.alt = 'Back';
        backButton.appendChild(backButtonImg);

        const headerSection = document.createElement('div');
        headerSection.classList.add('header-section');
        headerSection.appendChild(backButton);
        headerSection.appendChild(friendNameHeader);
        chatSection.appendChild(headerSection);

        const chatArea = document.createElement('div');
        chatArea.classList.add('chat-area');
        chatSection.appendChild(chatArea);

        const token = localStorage.getItem('token');
        if (token) {
            try {
                AuthService.username(token)
                    .then(authUsername => {
                        ChatService.getMessages(authUsername, friendName)
                        ChatService.getMessages(authUsername, friendName)
                            .then(messages => {
                                messages.forEach(message => {
                                    const messageElement = document.createElement('div');
                                    messageElement.textContent = message.content;

                                    if (message.sender === authUsername) {
                                        messageElement.classList.add('own-message');
                                    } else {
                                        messageElement.classList.add('friend-message');
                                    }

                                    chatArea.appendChild(messageElement);
                                });

                                // Défilement automatique vers le bas après avoir ajouté les messages
                                chatArea.scrollTop = chatArea.scrollHeight;
                            })
                            .catch(error => {
                                console.error('Error fetching messages:', error);
                            });
                    })
                    .catch(error => {
                        console.error('Error fetching username:', error);
                    });
            } catch (error) {
                console.error('Error fetching username:', error);
            }
        } else {
            console.error('Token not found');
        }

        const messageInputContainer = document.createElement('div');
        messageInputContainer.classList.add('message-input-container');

        const messageInput = document.createElement('input');
        messageInput.setAttribute('type', 'text');
        messageInput.setAttribute('placeholder', ' ');
        messageInputContainer.appendChild(messageInput);

        const sendButton = document.createElement('button');
        sendButton.addEventListener('click', () => {
            const message = messageInput.value.trim();
            if (message !== '') {
                sendMessage(friendName, message)
                    .then(() => {
                        messageInput.value = '';
                        openChatWindow(friendName);
                    })
            }
        });
        messageInputContainer.appendChild(sendButton);
        chatSection.appendChild(messageInputContainer);
    }

    async function sendMessage(receiver, message) {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                AuthService.username(token)
                    .then(sender => {
                        ChatService.sendMessage(sender, receiver, message)
                            .then(response => {
                                userSocket.emit('message', { sender, receiver, message });
                                const chatArea = document.querySelector('.chat-area');
                                const messageElement = document.createElement('div');
                                messageElement.textContent = message;
                                messageElement.classList.add('own-message');
                                chatArea.appendChild(messageElement);
                            })
                            .catch(error => {
                                console.error('Error sending message:', error);
                            });
                    })
                    .catch(error => {
                        console.error('Error fetching sender username:', error);
                    });
            } catch (error) {
                console.error('Error fetching sender username:', error);
            }
        } else {
            console.error('Token not found');
        }
    }


}


