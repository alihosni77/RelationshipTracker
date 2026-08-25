import { router } from 'expo-router';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../src/theme';

export default function IndexScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>RELATIONSHIP TRACKER</Text>
        <Text style={styles.title}>Two people.{"\n"}One shared space.</Text>
        <Text style={styles.subtitle}>
          Messages, memories, music, events and little moments designed for two.
        </Text>

        <Pressable style={styles.primary} onPress={() => router.push('/home')}>
          <Text style={styles.primaryText}>Enter your space</Text>
        </Pressable>

        <Text style={styles.privacy}>Privacy-first • Consent-based sharing • End-to-end focused</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, justifyContent: 'center', padding: 28 },
  eyebrow: { color: theme.colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  title: { color: theme.colors.text, fontSize: 42, lineHeight: 46, fontWeight: '800', marginTop: 14 },
  subtitle: { color: theme.colors.muted, fontSize: 16, lineHeight: 24, marginTop: 18, maxWidth: 360 },
  primary: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md, padding: 17, alignItems: 'center', marginTop: 36 },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  privacy: { color: theme.colors.muted, fontSize: 12, textAlign: 'center', marginTop: 20 }
});
