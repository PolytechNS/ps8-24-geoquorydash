const createChatCollection = require('../../models/users/chats');

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
    const { user1, user2 } = req.body;
    const chatsCollection = await createChatCollection();
    const chat = await chatsCollection.findOne({ users: { $all: [user1, user2] } });
    if (!chat) {
        return res.status(404).send('Chat not found');
    } else {
        return res.send(chat.messages);
    }
}

module.exports = { createNewChat };
