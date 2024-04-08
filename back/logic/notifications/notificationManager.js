class NotificationManager {
    chatNotifications = {};
    friendRequests = {};

    constructor() {}

    addChatNotification(userId, fromUsername) {
        if (!this.chatNotifications[userId]) {
            this.chatNotifications[userId] = [];
        }
        this.chatNotifications[userId].push(fromUsername);
    }

    addFriendRequest(userId, fromUsername) {
        if (!this.friendRequests[userId]) {
            this.friendRequests[userId] = [];
        }
        this.friendRequests[userId].push(fromUsername);
    }

    removeChatNotification(userId, fromUsername) {
        if (this.chatNotifications[userId]) {
            const index = this.chatNotifications[userId].indexOf(fromUsername);
            if (index > -1) {
                this.chatNotifications[userId].splice(index, 1);
            }
        }
    }

    removeFriendRequest(userId, fromUsername) {
        if (this.friendRequests[userId]) {
            const index = this.friendRequests[userId].indexOf(fromUsername);
            if (index > -1) {
                this.friendRequests[userId].splice(index, 1);
            }
        }
    }

    getChatNotifications(userId) {
        return this.chatNotifications[userId] || [];
    }

    getFriendRequests(userId) {
        return this.friendRequests[userId] || [];
    }
}

const notificationManager = new NotificationManager();
module.exports = notificationManager;
