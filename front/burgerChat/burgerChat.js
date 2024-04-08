import { AuthService } from '../Services/authService.js';
import { FriendsService } from '../Services/friendsService.js';
import { ChatService } from '../Services/chatService.js';

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
    function displayFriendsResults(results) {
        friendsResultsChat.innerHTML = '';

        const ul= document.createElement('ul');

        results.forEach(result => {
            const li = document.createElement('li');
            const container = document.createElement('div');
            const link = document.createElement('a');
            link.href = `../profilePage/profile.html?username=${result.username}`;
            link.textContent = result.username;
            link.target = "_blank";

            const chatButton = document.createElement('button');
            chatButton.classList.add('chat');
            chatButton.addEventListener('click', () => {
                openChatWindow(result.username);
            });

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

        const backButton = document.createElement('button');
        backButton.classList.add('back-button');
        backButton.img = '../img/chat/back.png';
        backButton.addEventListener('click', function() {
            friendsResultsChat.style.display = 'flex';
            chatSection.style.display = 'none';
        });

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
                                console.log('Message sent:', response);
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


