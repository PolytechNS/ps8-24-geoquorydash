const createChatCollection = require('../../models/users/chats');
const {parseJSON} = require("../../utils/utils");
const createUserCollection = require("../../models/users/users");

async function createNewChat(user1, user2) {
    const chatsCollection = await createChatCollection();
    const chat = {
        users: [user1, user2],
        messages: {
            [user1]: [],
            [user2]: []
        }
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
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(chat.messages));
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

module.exports = { createNewChat, getMessages };
