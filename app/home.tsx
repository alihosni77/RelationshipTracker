import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, getToken } from '../src/services/api';
import { connectRealtime } from '../src/services/realtime';
import { registerPushNotifications } from '../src/services/notifications';
import { theme } from '../src/theme';
import { fa } from '../src/i18n/fa';

const modules = [
  { icon: '✉', title: 'پیام‌های شما', detail: 'حرف‌هایی که فقط برای هم است', route: '/messages', tint: theme.colors.primarySoft },
  { icon: '♫', title: 'موسیقی مشترک', detail: 'آهنگ‌هایی برای حالِ دونفره', route: '/music', tint: theme.colors.secondarySoft },
  { icon: '✦', title: 'لحظه‌های مهم', detail: 'قرارها، تاریخ‌ها و شمارش معکوس', route: '/events', tint: theme.colors.warning },
  { icon: '♡', title: 'نبض رابطه', detail: 'بازخورد آرام و خصوصی', route: '/ratings', tint: theme.colors.success },
  { icon: '✧', title: 'قرار بعدی', detail: 'ایده‌هایی برای باهم بودن', route: '/activities', tint: theme.colors.secondarySoft },
  { icon: '⌖', title: 'موقعیت', detail: 'فقط با رضایت روشن شما', route: '/location', tint: theme.colors.primarySoft },
] as const;

type Couple = { id: string; members: { id: string; display_name: string }[] };
type Event = { id: string; title: string; starts_at: string };
type Countdown = { days: string; hours: string; minutes: string; seconds: string };

function countdown(date?: string): Countdown {
  if (!date) return { days: '––', hours: '––', minutes: '––', seconds: '––' };
  const total = Math.max(0, Math.floor((new Date(date).getTime() - Date.now()) / 1000));
  return {
    days: String(Math.floor(total / 86400)).padStart(2, '0'),
    hours: String(Math.floor((total % 86400) / 3600)).padStart(2, '0'),
    minutes: String(Math.floor((total % 3600) / 60)).padStart(2, '0'),
    seconds: String(total % 60).padStart(2, '0'),
  };
}

export default function HomeScreen() {
  const [couple, setCouple] = useState<Couple | null>(null);
  const [nextEvent, setNextEvent] = useState<Event>();
  const [remaining, setRemaining] = useState(countdown());
  const [taps, setTaps] = useState(0);
  const [pressing, setPressing] = useState(false);

  useEffect(() => {
    let stop = () => {};
    (async () => {
      try {
        await registerPushNotifications();
        const result = await api<{ couple: Couple | null }>('/v1/couples/me');
        setCouple(result.couple);
        const eventResult = await api<{ events: Event[] }>('/v1/events');
        const next = eventResult.events.find(event => new Date(event.starts_at).getTime() > Date.now());
        setNextEvent(next);
        setRemaining(countdown(next?.starts_at));
        if (result.couple) {
          const token = await getToken();
          if (token) stop = connectRealtime(result.couple.id, token, async event => {
            if (event.type === 'love_tap') {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setTaps(value => value + 1);
            }
          });
        }
      } catch {
        // The home screen remains useful while offline; data is simply unavailable.
      }
    })();
    return () => stop();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setRemaining(countdown(nextEvent?.starts_at)), 1000);
    return () => clearInterval(id);
  }, [nextEvent?.starts_at]);

  const partnerLabel = useMemo(
    () => couple ? (couple.members[1]?.display_name ?? 'پارتنر شما') : 'پارتنر شما',
    [couple],
  );

  const sendLoveTap = async () => {
    if (pressing) return;
    setPressing(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await api('/v1/love-taps', { method: 'POST', body: '{}' });
      setTaps(value => value + 1);
    } catch {
      Alert.alert('اتصال لازم است', 'برای فرستادن لمس عشق باید به فضای مشترک وصل باشی.');
    } finally {
      setTimeout(() => setPressing(false), 380);
    }
  };

  return (
    <View style={s.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        <View style={s.page}>
          <View style={s.topRow}>
            <View style={s.brandCluster}>
              <View style={s.brandMark}><Text style={s.brandHeart}>♡</Text></View>
              <View>
                <Text style={s.brandName}>{fa.appName}</Text>
                <Text style={s.brandCaption}>A SPACE FOR TWO</Text>
              </View>
            </View>
            <View style={s.privateBadge}><View style={s.privateDot} /><Text style={s.privateText}>فضای خصوصی</Text></View>
          </View>

          <View style={s.greetingBlock}>
            <Text style={s.eyebrow}>{fa.sharedSpace}</Text>
            <Text style={s.greeting}>سلام، خوش اومدی.</Text>
            <Text style={s.sub}>{couple ? 'فضای مشترک تو و ' + partnerLabel : 'یک فضای مشترک بسازید؛ قدم‌به‌قدم و باهم.'}</Text>
          </View>

          <View style={s.hero}>
            <View style={s.heroDecorLarge} />
            <View style={s.heroDecorSmall} />
            <View style={s.heroTop}>
              <View style={s.heroIcon}><Text style={s.heroIconText}>✦</Text></View>
              <Text style={s.heroKicker}>لحظه‌ی بعدی شما</Text>
            </View>
            <Text style={s.heroTitle}>{nextEvent?.title ?? 'یک خاطره در راه است'}</Text>
            <Text style={s.heroDate}>{nextEvent ? new Date(nextEvent.starts_at).toLocaleString('fa-IR') : 'اولین قرار یا تاریخ مهم‌تان را ثبت کنید.'}</Text>
            <View style={s.timer}>
              {([
                ['days', 'روز'],
                ['hours', 'ساعت'],
                ['minutes', 'دقیقه'],
                ['seconds', 'ثانیه'],
              ] as const).map(([key, label], index) => (
                <View key={key} style={s.timerCell}>
                  <Text style={s.timerValue}>{remaining[key]}</Text>
                  <Text style={s.timerLabel}>{label}</Text>
                  {index < 3 && <View style={s.timerDivider} />}
                </View>
              ))}
            </View>
            <Pressable accessibilityRole="button" onPress={() => router.push('/events')} style={({ pressed }) => [s.heroButton, pressed && s.pressed]}>
              <Text style={s.heroButtonText}>رفتن به لحظه‌ها</Text>
              <Text style={s.heroButtonArrow}>←</Text>
            </Pressable>
          </View>

          <View style={s.sectionHeading}>
            <View style={s.sectionCopy}>
              <Text style={s.sectionTitle}>گاهی یک لمس کافیه.</Text>
              <Text style={s.sectionSub}>برای گفتنِ «به یادت بودم»؛ بدون حتی یک کلمه.</Text>
            </View>
            <View style={s.tapCounter}><Text style={s.tapCounterValue}>{taps}</Text><Text style={s.tapCounterLabel}>لمس امروز</Text></View>
          </View>

          <Pressable accessibilityRole="button" accessibilityLabel="ارسال لمس عشق به پارتنر" onPress={sendLoveTap} style={({ pressed }) => [s.loveCard, (pressed || pressing) && s.lovePressed]}>
            <View style={s.loveIconOuter}><View style={s.loveIconInner}><Text style={s.loveIconText}>♥</Text></View></View>
            <View style={s.loveCopy}>
              <Text style={s.loveTitle}>{pressing ? 'در حال فرستادن…' : 'یک ضربه‌ی عشق بفرست'}</Text>
              <Text style={s.loveBody}>یک ویبره‌ی لطیف، برای یادآوری حضورت.</Text>
            </View>
            <View style={s.loveArrowCircle}><Text style={s.loveArrow}>←</Text></View>
          </Pressable>

          <View style={s.sectionHeading}>
            <View style={s.sectionCopy}>
              <Text style={s.sectionTitle}>دنیای دونفره‌تان</Text>
              <Text style={s.sectionSub}>چیزهای مهم، با فاصله‌ی یک لمس</Text>
            </View>
            <Text style={s.sectionMeta}>۶ فضا</Text>
          </View>

          <View style={s.grid}>
            {modules.map((module, index) => (
              <Pressable
                accessibilityRole="button"
                key={module.title}
                onPress={() => router.push(module.route)}
                style={({ pressed }) => [s.card, index === 0 && s.cardFeatured, pressed && s.cardPressed]}
              >
                <View style={[s.cardIcon, { backgroundColor: index === 0 ? 'rgba(240,90,120,0.14)' : theme.colors.surfaceElevated }]}>
                  <Text style={[s.cardIconText, { color: module.tint }]}>{module.icon}</Text>
                </View>
                <Text style={s.cardTitle}>{module.title}</Text>
                <Text style={s.cardDetail}>{module.detail}</Text>
                <View style={s.cardFooter}><View style={[s.cardAccent, { backgroundColor: module.tint }]} /><Text style={s.cardArrow}>←</Text></View>
              </Pressable>
            ))}
          </View>

          <Pressable accessibilityRole="button" onPress={() => router.push('/wellbeing')} style={({ pressed }) => [s.wellness, pressed && s.cardPressed]}>
            <View style={s.wellIcon}><Text style={s.wellIconText}>◇</Text></View>
            <View style={s.wellCopy}>
              <Text style={s.wellTitle}>با آگاهی، کنار هم</Text>
              <Text style={s.wellBody}>اطلاعات حساس، رضایت و اختیار تو همیشه مهم‌اند.</Text>
            </View>
            <Text style={s.wellArrow}>←</Text>
          </Pressable>

          <View style={s.footer}>
            <View style={s.footerLine} />
            <Text style={s.footerText}>حریم خصوصی اولویت ماست · هر اشتراک‌گذاری باید با رضایت باشد</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 40 },
  page: { width: '100%', maxWidth: 860, alignSelf: 'center' },
  topRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  brandCluster: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  brandMark: { width: 40, height: 40, borderRadius: 14, backgroundColor: theme.colors.surfaceWarm, borderWidth: 1, borderColor: 'rgba(240,90,120,0.34)', alignItems: 'center', justifyContent: 'center' },
  brandHeart: { color: theme.colors.primarySoft, fontSize: 24, lineHeight: 29 },
  brandName: { color: theme.colors.text, fontSize: 14, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  brandCaption: { color: theme.colors.muted, fontSize: 8, letterSpacing: 1.5, marginTop: 2 },
  privateBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: theme.radius.pill, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  privateDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.success },
  privateText: { color: theme.colors.textSoft, fontSize: 10, writingDirection: 'rtl' },
  greetingBlock: { marginTop: 32, alignItems: 'stretch' },
  eyebrow: { color: theme.colors.primarySoft, fontSize: 11, fontWeight: '900', letterSpacing: 0.4, textAlign: 'right', writingDirection: 'rtl' },
  greeting: { color: theme.colors.text, fontSize: 30, lineHeight: 42, fontWeight: '900', textAlign: 'right', marginTop: 5, writingDirection: 'rtl' },
  sub: { color: theme.colors.muted, fontSize: 12, lineHeight: 21, textAlign: 'right', marginTop: 2, writingDirection: 'rtl' },
  hero: { position: 'relative', overflow: 'hidden', marginTop: 24, padding: 21, borderRadius: theme.radius.xl, backgroundColor: '#171722', borderWidth: 1, borderColor: '#343044', ...theme.shadow.card },
  heroDecorLarge: { position: 'absolute', top: -82, right: -45, width: 230, height: 230, borderRadius: 115, backgroundColor: 'rgba(180,154,247,0.08)', borderWidth: 1, borderColor: 'rgba(180,154,247,0.13)' },
  heroDecorSmall: { position: 'absolute', bottom: -78, left: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(240,90,120,0.08)' },
  heroTop: { flexDirection: 'row-reverse', alignItems: 'center', gap: 9 },
  heroIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: 'rgba(180,154,247,0.15)', alignItems: 'center', justifyContent: 'center' },
  heroIconText: { color: theme.colors.secondarySoft, fontSize: 17 },
  heroKicker: { color: theme.colors.secondarySoft, fontSize: 11, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl' },
  heroTitle: { color: theme.colors.text, fontSize: 23, lineHeight: 32, fontWeight: '900', textAlign: 'right', marginTop: 13, writingDirection: 'rtl' },
  heroDate: { color: theme.colors.muted, fontSize: 11, lineHeight: 18, textAlign: 'right', marginTop: 3, writingDirection: 'rtl' },
  timer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 23, paddingVertical: 15, paddingHorizontal: 7, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  timerCell: { flex: 1, alignItems: 'center', position: 'relative' },
  timerValue: { color: theme.colors.text, fontSize: 26, fontWeight: '900', fontVariant: ['tabular-nums'] },
  timerLabel: { color: theme.colors.muted, fontSize: 10, marginTop: 3, writingDirection: 'rtl' },
  timerDivider: { position: 'absolute', right: 0, top: 8, height: 30, width: 1, backgroundColor: theme.colors.borderStrong },
  heroButton: { minHeight: 44, alignSelf: 'flex-start', flexDirection: 'row-reverse', alignItems: 'center', gap: 12, marginTop: 18, paddingHorizontal: 15, borderRadius: theme.radius.pill, backgroundColor: theme.colors.surfaceElevated, borderWidth: 1, borderColor: theme.colors.borderStrong },
  heroButtonText: { color: theme.colors.text, fontSize: 11, fontWeight: '800', writingDirection: 'rtl' },
  heroButtonArrow: { color: theme.colors.secondarySoft, fontSize: 17 },
  sectionHeading: { flexDirection: 'row-reverse', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 30, marginBottom: 13, gap: 12 },
  sectionCopy: { flex: 1, alignItems: 'stretch' },
  sectionTitle: { color: theme.colors.text, fontSize: 17, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  sectionSub: { color: theme.colors.muted, fontSize: 11, lineHeight: 18, marginTop: 4, textAlign: 'right', writingDirection: 'rtl' },
  tapCounter: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, minWidth: 66 },
  tapCounterValue: { color: theme.colors.primarySoft, fontSize: 18, fontWeight: '900' },
  tapCounterLabel: { color: theme.colors.muted, fontSize: 8, marginTop: 1, writingDirection: 'rtl' },
  loveCard: { flexDirection: 'row-reverse', alignItems: 'center', gap: 13, padding: 15, borderRadius: theme.radius.lg, backgroundColor: theme.colors.surfaceWarm, borderWidth: 1, borderColor: 'rgba(240,90,120,0.30)', ...theme.shadow.glow },
  lovePressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  loveIconOuter: { width: 52, height: 52, borderRadius: 19, backgroundColor: 'rgba(240,90,120,0.12)', alignItems: 'center', justifyContent: 'center' },
  loveIconInner: { width: 37, height: 37, borderRadius: 14, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  loveIconText: { color: '#210B12', fontSize: 17 },
  loveCopy: { flex: 1, alignItems: 'stretch' },
  loveTitle: { color: theme.colors.text, fontSize: 14, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  loveBody: { color: theme.colors.muted, fontSize: 10, lineHeight: 16, textAlign: 'right', marginTop: 4, writingDirection: 'rtl' },
  loveArrowCircle: { width: 31, height: 31, borderRadius: 16, backgroundColor: 'rgba(240,90,120,0.12)', alignItems: 'center', justifyContent: 'center' },
  loveArrow: { color: theme.colors.primarySoft, fontSize: 16 },
  sectionMeta: { color: theme.colors.muted, fontSize: 10, paddingBottom: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 11 },
  card: { width: '48.2%', minHeight: 155, padding: 15, borderRadius: theme.radius.lg, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadow.soft },
  cardFeatured: { borderColor: 'rgba(240,90,120,0.28)', backgroundColor: '#19141D' },
  cardPressed: { opacity: 0.86, transform: [{ scale: 0.985 }] },
  cardIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  cardIconText: { fontSize: 21, fontWeight: '700' },
  cardTitle: { color: theme.colors.text, fontSize: 13, fontWeight: '900', textAlign: 'right', marginTop: 13, writingDirection: 'rtl' },
  cardDetail: { color: theme.colors.muted, fontSize: 10, lineHeight: 16, textAlign: 'right', marginTop: 5, writingDirection: 'rtl' },
  cardFooter: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  cardAccent: { width: 19, height: 3, borderRadius: 2, opacity: 0.8 },
  cardArrow: { color: theme.colors.muted, fontSize: 15 },
  wellness: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, marginTop: 15, padding: 15, borderRadius: theme.radius.lg, backgroundColor: theme.colors.surfaceElevated, borderWidth: 1, borderColor: theme.colors.border },
  wellIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(180,154,247,0.12)', alignItems: 'center', justifyContent: 'center' },
  wellIconText: { color: theme.colors.secondarySoft, fontSize: 22 },
  wellCopy: { flex: 1, alignItems: 'stretch' },
  wellTitle: { color: theme.colors.text, fontSize: 12, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  wellBody: { color: theme.colors.muted, fontSize: 10, lineHeight: 16, marginTop: 4, textAlign: 'right', writingDirection: 'rtl' },
  wellArrow: { color: theme.colors.secondarySoft, fontSize: 18 },
  footer: { alignItems: 'center', marginTop: 27, gap: 12, paddingHorizontal: 12 },
  footerLine: { width: 38, height: 2, borderRadius: 2, backgroundColor: theme.colors.borderStrong },
  footerText: { color: theme.colors.muted, fontSize: 9, lineHeight: 16, textAlign: 'center', writingDirection: 'rtl' },
  pressed: { opacity: 0.88 },
});
