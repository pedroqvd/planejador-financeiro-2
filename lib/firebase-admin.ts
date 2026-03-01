import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (projectId && clientEmail && privateKey) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
        } else {
            console.warn('Firebase admin credentials missing. Skip initialization.');
        }
    } catch (error) {
        console.error('Firebase admin initialization error', error);
    }
}

export const sendPushNotification = async (fcmToken: string, title: string, body: string, data?: any) => {
    try {
        const message = {
            notification: {
                title,
                body,
            },
            data: data || {},
            token: fcmToken,
        };

        const response = await admin.messaging().send(message);
        console.log('Successfully sent push notification:', response);
        return true;
    } catch (error) {
        console.error('Error sending push notification:', error);
        return false;
    }
};
