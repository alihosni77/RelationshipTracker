import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { api } from '../src/services/api';
import { encryptWithPassphrase } from '../src/services/crypto';
import { theme } from '../src/theme';
import type { MessageKind } from '../src/types/domain';

const labels: Record<MessageKind, string> = { normal: 'عادی', encrypted: 'رمزدار', time_capsule: 'کپسول زمان' };
type Message = { id: string; sender_id: string; kind: MessageKind; ciphertext: string; key_envelope?: string; unlock_at?: string; created_at: string };

export default function MessagesScreen() {
  const [kind, setKind] = useState<MessageKind>('normal');
  const [text, setText] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const helper = useMemo(
    () => kind === 'encrypted'
      ? 'رمز فقط روی دستگاه استفاده می‌شود و سرور ciphertext را نگه می‌دارد.'
      : kind === 'time_capsule'
        ? 'این پیام به‌عنوان کپسول با زمان بازشدن ۲۴ ساعت بعد ثبت می‌شود.'
        : 'پیام عادی فوراً در فضای مشترک ثبت می‌شود.',
    [kind],
  );

  const load = async () => {
    try {
      const result = await api<{ messages: Message[] }>('/v1/messages');
      setMessages(result.messages);
    } catch {
      // Keep the screen renderable when auth or network is not ready.
    }
  };

  useEffect(() => { load(); }, []);

  const send = async () => {
    if (!text.trim() || busy) return;
    if (kind === 'encrypted' && passphrase.length < 8) {
      return Alert.alert('رمز کوتاه است', 'برای پیام رمزدار حداقل ۸ کاراکتر انتخاب کن.');
    }
    setBusy(true);
    try {
      let ciphertext = text.trim();
      let keyEnvelope: string | undefined;
      let unlockAt: string | undefined;
      if (kind === 'encrypted') ({ ciphertext, keyEnvelope } = await encryptWithPassphrase(text.trim(), passphrase));
      if (kind === 'time_capsule') unlockAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await api('/v1/messages', { method: 'POST', body: JSON.stringify({ kind, ciphertext, keyEnvelope, unlockAt }) });
      setText('');
      setPassphrase('');
      await load();
    } catch (error) {
      Alert.alert('ارسال ناموفق', error instanceof Error ? error.message : 'خطای ناشناخته');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.page}>
          <Pressable accessibilityRole="button" accessibilityLabel="بازگشت" onPress={() => router.back()} style={s.back}>
            <Text style={s.backText}>← بازگشت</Text>
          </Pressable>

          <View style={s.header}>
            <View style={s.headerIcon}><Text style={s.headerIconText}>✉</Text></View>
            <Text style={s.eyebrow}>حرف‌هایی برای هم</Text>
            <Text style={s.title}>پیام‌های شما</Text>
            <Text style={s.sub}>گاهی یک جمله می‌تواند تمام چیزی باشد که لازم است.</Text>
          </View>

          <View style={s.composer}>
            <View style={s.composerHeading}>
              <Text style={s.composerTitle}>یک پیام تازه</Text>
              <Text style={s.composerMeta}>فضای خصوصی شما</Text>
            </View>

            <Text style={s.label}>نوع پیام</Text>
            <View style={s.types}>
              {(Object.keys(labels) as MessageKind[]).map(value => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: kind === value }}
                  key={value}
                  onPress={() => setKind(value)}
                  style={({ pressed }) => [s.pill, kind === value && s.pillActive, pressed && s.pillPressed]}
                >
                  <Text style={[s.pillText, kind === value && s.pillTextActive]}>{labels[value]}</Text>
                </Pressable>
              ))}
            </View>

            {kind === 'encrypted' && (
              <>
                <Text style={[s.label, s.fieldLabel]}>رمز این پیام</Text>
                <TextInput
                  accessibilityLabel="رمز پیام"
                  value={passphrase}
                  onChangeText={setPassphrase}
                  secureTextEntry
                  placeholder="حداقل ۸ کاراکتر"
                  placeholderTextColor={theme.colors.muted}
                  style={s.input}
                />
              </>
            )}

            <Text style={[s.label, s.fieldLabel]}>متن پیام</Text>
            <TextInput
              accessibilityLabel="پیام"
              value={text}
              onChangeText={setText}
              multiline
              placeholder="هر چیزی که دوست داری بهش بگی…"
              placeholderTextColor={theme.colors.muted}
              style={[s.input, s.area]}
              textAlignVertical="top"
            />
            <View style={s.helperRow}><Text style={s.helperIcon}>◇</Text><Text style={s.helper}>{helper}</Text></View>

            <Pressable
              accessibilityRole="button"
              disabled={busy || !text.trim()}
              style={({ pressed }) => [s.send, (busy || !text.trim()) && s.sendDisabled, pressed && s.sendPressed]}
              onPress={send}
            >
              <Text style={s.sendText}>{busy ? 'در حال ارسال…' : 'فرستادن پیام'}</Text>
              <Text style={s.sendArrow}>←</Text>
            </Pressable>
          </View>

          <View style={s.listHeader}>
            <View>
              <Text style={s.sectionTitle}>پیام‌های ثبت‌شده</Text>
              <Text style={s.sectionSub}>یادداشت‌هایی که در فضای شما مانده‌اند</Text>
            </View>
            <View style={s.countBadge}><Text style={s.countText}>{messages.length}</Text></View>
          </View>

          {messages.length === 0 ? (
            <View style={s.empty}>
              <View style={s.emptyIcon}><Text style={s.emptyIconText}>♡</Text></View>
              <Text style={s.emptyTitle}>اولین پیام، هنوز نوشته نشده</Text>
              <Text style={s.emptyBody}>چیزی کوچک و صادقانه بنویس؛ لازم نیست کامل باشد.</Text>
            </View>
          ) : messages.map(message => (
            <View key={message.id} style={s.message}>
              <View style={s.messageTop}>
                <Text style={s.messageKind}>{labels[message.kind]}</Text>
                <Text style={s.messageDate}>{new Date(message.created_at).toLocaleDateString('fa-IR')}</Text>
              </View>
              {message.unlock_at && <Text style={s.unlockAt}>بازشدن: {new Date(message.unlock_at).toLocaleString('fa-IR')}</Text>}
              <Text style={s.messageText}>{message.kind === 'encrypted' ? '🔐 پیام رمزدار' : message.ciphertext}</Text>
            </View>
          ))}

          <Text style={s.privacy}>حریم خصوصی مهم است؛ محتوای پیام را در اعلان‌ها نمایش ندهید.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 40 },
  page: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  back: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', paddingHorizontal: 3 },
  backText: { color: theme.colors.muted, fontWeight: '800', fontSize: 12 },
  header: { alignItems: 'stretch', marginTop: 13, marginBottom: 24 },
  headerIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: theme.colors.surfaceWarm, borderWidth: 1, borderColor: 'rgba(240,90,120,0.30)', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', marginBottom: 17 },
  headerIconText: { color: theme.colors.primarySoft, fontSize: 22 },
  eyebrow: { color: theme.colors.primarySoft, fontSize: 11, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  title: { color: theme.colors.text, fontSize: 30, lineHeight: 40, fontWeight: '900', marginTop: 5, textAlign: 'right', writingDirection: 'rtl' },
  sub: { color: theme.colors.muted, fontSize: 12, lineHeight: 21, marginTop: 5, textAlign: 'right', writingDirection: 'rtl' },
  composer: { padding: 17, borderRadius: theme.radius.xl, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadow.card },
  composerHeading: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: 21 },
  composerTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '900', writingDirection: 'rtl' },
  composerMeta: { color: theme.colors.muted, fontSize: 9, writingDirection: 'rtl' },
  label: { color: theme.colors.textSoft, fontWeight: '800', fontSize: 11, textAlign: 'right', writingDirection: 'rtl' },
  types: { flexDirection: 'row-reverse', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  pill: { minHeight: 40, justifyContent: 'center', borderRadius: theme.radius.pill, paddingVertical: 8, paddingHorizontal: 13, backgroundColor: theme.colors.backgroundSoft, borderWidth: 1, borderColor: theme.colors.border },
  pillActive: { backgroundColor: 'rgba(240,90,120,0.13)', borderColor: 'rgba(240,90,120,0.55)' },
  pillPressed: { opacity: 0.82 },
  pillText: { color: theme.colors.muted, fontWeight: '700', fontSize: 11, writingDirection: 'rtl' },
  pillTextActive: { color: theme.colors.primarySoft, fontWeight: '900' },
  fieldLabel: { marginTop: 19, marginBottom: 8 },
  input: { backgroundColor: theme.colors.backgroundSoft, borderWidth: 1, borderColor: theme.colors.borderStrong, borderRadius: theme.radius.md, paddingHorizontal: 14, paddingVertical: 13, color: theme.colors.text, fontSize: 13, marginTop: 10, textAlign: 'right', writingDirection: 'rtl' },
  area: { minHeight: 132, lineHeight: 22 },
  helperRow: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 7, marginTop: 11 },
  helperIcon: { color: theme.colors.secondarySoft, fontSize: 15 },
  helper: { flex: 1, color: theme.colors.muted, fontSize: 10, lineHeight: 17, textAlign: 'right', writingDirection: 'rtl' },
  send: { minHeight: 52, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderRadius: theme.radius.md, backgroundColor: theme.colors.primary, marginTop: 18 },
  sendDisabled: { opacity: 0.48 },
  sendPressed: { opacity: 0.86 },
  sendText: { color: '#160910', fontWeight: '900', fontSize: 13, writingDirection: 'rtl' },
  sendArrow: { color: '#160910', fontSize: 18, fontWeight: '900' },
  listHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginTop: 31, marginBottom: 13 },
  sectionTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  sectionSub: { color: theme.colors.muted, fontSize: 10, marginTop: 4, textAlign: 'right', writingDirection: 'rtl' },
  countBadge: { minWidth: 34, height: 34, borderRadius: 12, backgroundColor: theme.colors.surfaceElevated, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  countText: { color: theme.colors.textSoft, fontSize: 12, fontWeight: '900' },
  empty: { alignItems: 'center', paddingHorizontal: 22, paddingVertical: 28, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, borderStyle: 'dashed', backgroundColor: theme.colors.surface },
  emptyIcon: { width: 52, height: 52, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceWarm, marginBottom: 13 },
  emptyIconText: { color: theme.colors.primarySoft, fontSize: 31 },
  emptyTitle: { color: theme.colors.text, fontSize: 13, fontWeight: '900', textAlign: 'center', writingDirection: 'rtl' },
  emptyBody: { color: theme.colors.muted, fontSize: 11, lineHeight: 19, textAlign: 'center', marginTop: 6, writingDirection: 'rtl' },
  message: { padding: 15, borderRadius: theme.radius.lg, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 10 },
  messageTop: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  messageKind: { color: theme.colors.secondarySoft, fontSize: 10, fontWeight: '900', writingDirection: 'rtl' },
  messageDate: { color: theme.colors.muted, fontSize: 10 },
  unlockAt: { color: theme.colors.warning, fontSize: 10, textAlign: 'right', marginTop: 9, writingDirection: 'rtl' },
  messageText: { color: theme.colors.text, fontSize: 13, lineHeight: 22, fontWeight: '600', marginTop: 11, textAlign: 'right', writingDirection: 'rtl' },
  privacy: { color: theme.colors.muted, fontSize: 9, lineHeight: 16, textAlign: 'center', marginTop: 22, paddingHorizontal: 14, writingDirection: 'rtl' },
});
