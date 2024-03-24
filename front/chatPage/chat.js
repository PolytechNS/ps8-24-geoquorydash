let chatOpen = false;

function toggleChat() {
    const chatBox = document.querySelector('.chat-box');
    chatOpen = !chatOpen;
    if (chatOpen) {
        chatBox.style.height = '300px';
    } else {
        chatBox.style.height = '0';
    }
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value;
    if (message.trim() !== '') {
        const chatMessages = document.getElementById('chatMessages');
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        messageInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}
