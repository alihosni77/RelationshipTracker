import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { theme } from '../src/theme';

const cards = [
  ['💌', 'Messages', 'Normal · Encrypted · Time Capsule'],
  ['🎵', 'Shared Music', 'Spotify playlists & listening together'],
  ['❤️', 'Love Tap', 'Send a little reminder that you care'],
  ['📅', 'Events', 'Shared calendar & next countdown'],
  ['🧠', 'Relationship Check-in', 'Periodic relationship assessments'],
  ['📍', 'Location', 'Consent-based partner location sharing']
] as const;

export default function HomeScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>YOUR SHARED SPACE</Text>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Together</Text>
          <Text style={styles.subtitle}>Your relationship, in one place.</Text>
        </View>
        <View style={styles.avatar}><Text style={styles.avatarText}>♡</Text></View>
      </View>

      <View style={styles.countdown}>
        <Text style={styles.countdownLabel}>NEXT MOMENT</Text>
        <Text style={styles.countdownTitle}>Your next shared event</Text>
        <Text style={styles.countdownValue}>-- : -- : --</Text>
        <Text style={styles.countdownHint}>Connect your calendar to begin.</Text>
      </View>

      <Text style={styles.section}>QUICK ACCESS</Text>
      <View style={styles.grid}>
        {cards.map(([icon, title, description]) => (
          <View style={styles.card} key={title}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDescription}>{description}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 22, paddingTop: 58, paddingBottom: 40 },
  greeting: { color: theme.colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  title: { color: theme.colors.text, fontSize: 36, fontWeight: '800' },
  subtitle: { color: theme.colors.muted, marginTop: 3 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: theme.colors.primary, fontSize: 25 },
  countdown: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.lg, padding: 20, marginTop: 26 },
  countdownLabel: { color: theme.colors.secondary, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  countdownTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '700', marginTop: 8 },
  countdownValue: { color: theme.colors.text, fontSize: 32, fontWeight: '800', letterSpacing: 2, marginTop: 14 },
  countdownHint: { color: theme.colors.muted, fontSize: 12, marginTop: 4 },
  section: { color: theme.colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginTop: 30, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: 16, width: '48%', minHeight: 150 },
  icon: { fontSize: 25 },
  cardTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '700', marginTop: 12 },
  cardDescription: { color: theme.colors.muted, fontSize: 11, lineHeight: 17, marginTop: 5 }
});
