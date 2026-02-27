// Este arquivo vai pra raiz da pasta /public/

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// O cliente vai preencher com suas credenciais do Firebase geradas no Console
const firebaseConfig = {
    apiKey: 'REPLACE_WITH_YOUR_API_KEY',
    authDomain: 'REPLACE_WITH_YOUR_AUTH_DOMAIN',
    projectId: 'REPLACE_WITH_YOUR_PROJECT_ID',
    storageBucket: 'REPLACE_WITH_YOUR_STORAGE_BUCKET',
    messagingSenderId: 'REPLACE_WITH_YOUR_MESSAGING_SENDER_ID',
    appId: 'REPLACE_WITH_YOUR_APP_ID'
};

try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Lida com background messages
    messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Recebeu background message ', payload);

        const notificationTitle = payload.notification?.title || 'WealthCash AI';
        const notificationOptions = {
            body: payload.notification?.body,
            icon: '/favicon.svg',
            badge: '/favicon.svg', // ícone menor pra Android status bar
            vibrate: [200, 100, 200, 100, 200, 100, 200], // vibração urgente
            data: payload.data, // pode mandar URLs aqui
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    });

} catch (e) {
    console.error('Falha ao registrar firebase-messaging-sw:', e);
}
