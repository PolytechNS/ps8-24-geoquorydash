import { API_ENDPOINT } from '../js/config.js';

export const GameService = {
    history(token) {
        return fetch(`${API_ENDPOINT}/api/game/history`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                authorization: `Bearer ${token}`
            }
        }).then(response => {
                if (!response.ok) {
                    throw new Error('Réponse réseau non ok');
                }
                return response.json();
            });
    },


    sendNotificationToAll(message) {
        fetch('/api/send-notification', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message })
    })
        .then(response => response.json())
        .then(data => console.log('Notification envoyée', data))
        .catch(error => console.error('Erreur:', error));
    },
    listenForNotifications() {
        fetch('/listen-for-notifications')
            .then(response => response.json())
            .then(notification => {
                console.log('Notification reçue:', notification);
                // Supposons que l'utilisateur accepte la notification
                sendNotificationResponse(notification.id, 'acceptée');
                // Continue d'écouter pour plus de notifications
                listenForNotifications();
            })
            .catch(error => {
                console.error('Erreur lors de l\'écoute des notifications:', error);
                // Continue d'écouter même en cas d'erreur
                listenForNotifications();
            });
    },

    sendNotificationResponse(notificationId, response) {
        fetch('/respond-to-notification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ notificationId: notificationId, response: response })
        })
        .then(response => response.json())
        .then(data => console.log('Réponse à la notification envoyée', data))
        .catch(error => console.error('Erreur lors de l\'envoi de la réponse:', error));
    }


};
