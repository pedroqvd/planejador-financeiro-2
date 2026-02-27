import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

// URL do ambiente local ou de produção
const APP_URL = process.env.EXPO_PUBLIC_APP_URL || 'http://10.0.2.2:3000'; // 10.0.2.2 é o localhost do Android Emulator

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#0A0A0A" />
      <WebView
        source={{ uri: APP_URL }}
        style={styles.webview}
        bounces={false}
        allowsBackForwardNavigationGestures
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    paddingTop: Platform.OS === 'android' ? 25 : 0, // Padding para status bar no Android puro se necessário
  },
  webview: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
});
