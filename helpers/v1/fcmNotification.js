const admin = require("firebase-admin");

const serviceAccount = require("./firebaseAdminSdkJson.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const messaging = admin.messaging();

module.exports = class FcmNotification { 

    async  sendFCMNotification(message) {
        try {
            const result = await messaging.sendEachForMulticast(message);
            console.log(result.successCount + ' messages were sent successfully');
            return result;
        } catch (error) {
            console.error("Error sending notification:", error);
            throw error;
        }
    }


    async sendFCMNotificationToTopic(topic, message) {
        console.log("Sending notification to topic:--- ", topic);
        try {
            const result = await messaging.sendToTopic(topic, message);
            return result;
        } catch (error) {
            console.error("Error sending notification to topic: ", topic, error);
            throw error;
        }
    }

}