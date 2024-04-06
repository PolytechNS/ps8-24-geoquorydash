const createChatCollection = require('../../models/users/chats');
const { parseJSON } = require("../../utils/utils");
const {createUserCollection} = require("../../models/users/users");

async function createNewChat(user1, user2) {
    const chatsCollection = await createChatCollection();
    const chat = {
        users: [user1, user2],
        messages: []
    };
    await chatsCollection.insertOne(chat);
}

async function getMessages(req, res) {
    parseJSON(req, async (err, { username1, username2 }) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }

        try {
            const chatsCollection = await createChatCollection();
            const chat = await chatsCollection.findOne({
                users: { $all: [username1, username2] }
            });
            if (chat) {
                // Récupérer tous les messages et trier par timestamp
                const messages = chat.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(messages));
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            }
        } catch (error) {
            console.error('Error when getting messages:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal server error');
        }
    });
}

async function sendMessage(req, res) {
    parseJSON(req, async (err, { sender, receiver, message }) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }

        try {
            const timestamp = new Date().toISOString();
            const chatsCollection = await createChatCollection();
            const chat = await chatsCollection.findOne({
                users: { $all: [sender, receiver] }
            });
            if (chat) {
                const newMessage = {
                    sender: sender,
                    content: message,
                    timestamp: timestamp
                };
                chat.messages.push(newMessage);
                await chatsCollection.updateOne(
                    { _id: chat._id },
                    { $set: { messages: chat.messages } }
                );
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Message sent');
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            }
        } catch (error) {
            console.error('Error when sending message:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal server error');
        }
    });
}

module.exports = { createNewChat, getMessages, sendMessage };
