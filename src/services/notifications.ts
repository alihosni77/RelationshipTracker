import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { api } from './api';

export async function registerPushNotifications() {
  if (!Device.isDevice) return false;
  const permissions = await Notifications.getPermissionsAsync();
  let status = permissions.status;
  if (status !== 'granted') status = (await Notifications.requestPermissionsAsync()).status;
  if (status !== 'granted') return false;
  try {
    const token = await Notifications.getExpoPushTokenAsync();
    await api('/v1/devices/push-token', { method: 'POST', body: JSON.stringify({ expoPushToken: token.data }) });
    return true;
  } catch {
    return false;
  }
}
