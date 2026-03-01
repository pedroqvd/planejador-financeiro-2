import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, Platform, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useEffect, useRef, useState } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Configura o comportamento das notificações quando o app está aberto (Foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// URL do ambiente local ou de produção
const APP_URL = process.env.EXPO_PUBLIC_APP_URL || 'http://10.0.2.2:3000'; // 10.0.2.2 é o localhost do Android Emulator

async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permission not granted to get push token for push notification!');
      return;
    }

    try {
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('✅ Expo Native Push Token:', token);
    } catch (e) {
      console.log('Error getting push token', e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [expoPushToken, setExpoPushToken] = useState('');

  useEffect(() => {
    // Ao abrir o app nativo, solicitamos permissão para notificações
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token || ''));

    // Escuta notificações clicadas pelo usuário
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notificação Clicada!', response);
      // Aqui poderíamos forçar o webview a navegar para uma página específica
      // webViewRef.current?.injectJavaScript(`window.location.href = '/dashboard';`);
    });

    return () => {
      responseListener.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#0A0A0A" />
      <WebView
        ref={webViewRef}
        source={{ uri: APP_URL }}
        style={styles.webview}
        bounces={false}
        allowsBackForwardNavigationGestures
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        // Injeta o token nativo dentro do localStorage do navegador web envelopado (opcional)
        injectedJavaScript={`
          if ("${expoPushToken}") {
            window.localStorage.setItem('expoPushToken', "${expoPushToken}");
          }
          true;
        `}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  webview: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
});
