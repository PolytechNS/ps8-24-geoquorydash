const { parseJSON } = require('../../utils/utils.js');
const {createUserCollection, findUserIdByUsername} = require('../../models/users/users');
const createNewChat = require('../chat/chatController').createNewChat;
const usersConnected = require('../../usersConnected');

async function searchUsers(req, res) {
    parseJSON(req, async (err, { username }) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }

        try {
            const usersCollection = await createUserCollection();
            const users = await usersCollection.find({ username: { $regex: username, $options: 'i' } }).toArray();
            if (users) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(users));
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('User not found');
            }
        } catch (error) {
            console.error('Error during login:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal server error');
        }
    });
}

async function addFriend(req, res) {
    parseJSON(req, async (err, { currentUser, targetUser }) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }

        try {
            const usersCollection = await createUserCollection();
            const result = await usersCollection.updateOne(
                { username: targetUser },
                { $addToSet: { friendRequests: currentUser } }
            );
            if (result.modifiedCount > 0) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Friend request sent successfully' }));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'User not found' }));
            }
        } catch (error) {
            console.error('Error sending friend request:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal server error');
        }
    });
}

async function cancelFriend(req, res) {
    parseJSON(req, async (err, { currentUser, targetUser }) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }

        try {
            const usersCollection = await createUserCollection();
            const result = await usersCollection.updateOne(
                { username: targetUser },
                { $pull: { friendRequests: currentUser } }
            );
            if (result.modifiedCount > 0) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Friend request removed successfully' }));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'User not found' }));
            }
        } catch (error) {
            console.error('Error removing friend request:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal server error');
        }
    });
}

async function getRequests(req, res) {
    parseJSON(req, async (err, { currentUser }) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }

        try {
            const usersCollection = await createUserCollection();
            const user = await usersCollection.findOne({ username: currentUser });
            if (user) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(user.friendRequests));
            } else {
                console.log('User not found');
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('User not found');
            }
        } catch (error) {
            console.error('Error fetching friend requests:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal server error');
        }
    });
}

async function acceptFriend(req, res) {
    parseJSON(req, async (err, { currentUser, targetUser }) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }

        try {
            const usersCollection = await createUserCollection();
            const result = await usersCollection.updateOne(
                { username: currentUser },
                { $pull: { friendRequests: targetUser }, $addToSet: { friends: targetUser } }
            );
            const result2 = await usersCollection.updateOne(
                { username: targetUser },
                { $pull: { friendRequests: currentUser }, $addToSet: { friends: currentUser } }
            );
            if (result.modifiedCount > 0 && result2.modifiedCount > 0) {
                await createNewChat(currentUser, targetUser);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Friend added successfully' }));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'User not found' }));
            }
        } catch (error) {
            console.error('Error accepting friend request:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal server error');
        }
    });
}

async function deniedFriend(req, res) {
    parseJSON(req, async (err, { currentUser, targetUser }) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }

        try {
            const usersCollection = await createUserCollection();
            const result = await usersCollection.updateOne(
                { username: currentUser },
                { $pull: { friendRequests: targetUser } }
            );
            if (result.modifiedCount > 0) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Friend request removed successfully' }));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'User not found' }));
            }
        } catch (error) {
            console.error('Error removing friend request:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal server error');
        }
    });
}

async function getFriends(req, res) {
    parseJSON(req, async (err, { currentUser }) => {
        if (err) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }

        try {
            const usersCollection = await createUserCollection();
            const user = await usersCollection.findOne({ username: currentUser });
            if (user) {
                res.writeHead(200, { 'Content-Type': 'application/json' });

                console.log(user.friends);

                let friends = [];
                for (const friendUsername of user.friends) {
                    const friendId = await findUserIdByUsername(friendUsername);
                    friends.push({
                        id: friendId.toString(),
                        username: friendUsername
                    });
                }

                console.log(friends);

                let response  = [];
                friends.forEach(friend => {
                    if (usersConnected.usersConnected[friend.id]){
                        response.push({
                            username: friend.username,
                            status: 'online'
                        });
                    } else {
                        response.push({
                            username: friend.username,
                            status: 'offline'
                        });
                    }
                });

                console.log(response);

                res.end(JSON.stringify(response));
            } else {
                console.log('User not found');
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('User not found');
            }
        } catch (error) {
            console.error('Error fetching friends list:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal server error');
        }
    });
}


module.exports = {searchUsers, addFriend, cancelFriend, getRequests, acceptFriend, deniedFriend, getFriends};
