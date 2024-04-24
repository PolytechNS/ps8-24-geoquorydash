import {OneSignal_API_KEY, OneSignal_APP_ID} from "../js/config.js";


/**
 * Sends a push notification using OneSignal API.
 *
 * @param {string} message The message content for the notification.
 * @param {Array<string>} externalIds Array of external user IDs to send the notification to.
 */
async function sendMobileNotification(message, externalIds) {
    const url = 'https://api.onesignal.com/notifications';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${OneSignal_API_KEY}` // REST API Key should be securely stored and used
    };

    const body = JSON.stringify({
        app_id: OneSignal_APP_ID,
        contents: { en: message },
        include_external_user_ids: externalIds
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body
        });

        const data = await response.json();
        console.log('Notification sent successfully:', data);
        return data;
    } catch (error) {
        console.error('Error sending notification:', error);
        throw error;
    }
}

export { sendMobileNotification };
