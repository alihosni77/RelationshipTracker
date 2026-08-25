import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nManager } from 'react-native';
import { theme } from '../src/theme';
I18nManager.allowRTL(true);
export default function RootLayout() { return <><StatusBar style="light"/><Stack screenOptions={{headerShown:false,contentStyle:{backgroundColor:theme.colors.background}}}><Stack.Screen name="index"/><Stack.Screen name="home"/><Stack.Screen name="messages"/></Stack></>; }
