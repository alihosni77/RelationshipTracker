import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { auth, setToken } from '../src/services/api';
import { theme } from '../src/theme';

export default function AuthScreen() {
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || password.length < 12 || (mode === 'register' && !name.trim())) {
      return Alert.alert('اطلاعات ناقص', 'ایمیل، رمز حداقل ۱۲ کاراکتری و نام را کامل کن.');
    }
    setBusy(true);
    try {
      const result = mode === 'login'
        ? await auth.login({ email: email.trim(), password })
        : await auth.register({ email: email.trim(), password, displayName: name.trim() });
      await setToken(result.accessToken);
      router.replace('/home');
    } catch (error) {
      Alert.alert('ورود انجام نشد', error instanceof Error ? error.message : 'خطای ناشناخته');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.canvas}>
        <Pressable accessibilityRole="button" accessibilityLabel="بازگشت" onPress={() => router.back()} style={s.back}><Text style={s.backText}>← بازگشت</Text></Pressable>
        <View style={s.brandMark}><Text style={s.brandMarkText}>♡</Text></View>
        <Text style={s.eyebrow}>فضای امن شما</Text>
        <Text style={s.title}>{mode === 'login' ? 'خوش برگشتی' : 'از همین‌جا شروع کنید'}</Text>
        <Text style={s.sub}>{mode === 'login' ? 'به لحظه‌های مشترکت برگرد.' : 'یک فضای خصوصی بساز؛ بعد پارتنرت را دعوت کن.'}</Text>

        <View style={s.form}>
          {mode === 'register' && <>
            <Text style={s.label}>نام نمایشی</Text>
            <TextInput accessibilityLabel="نام نمایشی" style={s.input} value={name} onChangeText={setName} placeholder="اسمت را وارد کن" placeholderTextColor={theme.colors.muted} autoCapitalize="words" returnKeyType="next" />
          </>}
          <Text style={s.label}>ایمیل</Text>
          <TextInput accessibilityLabel="ایمیل" style={s.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" textContentType="emailAddress" placeholder="you@example.com" placeholderTextColor={theme.colors.muted} returnKeyType="next" />
          <Text style={s.label}>رمز عبور</Text>
          <TextInput accessibilityLabel="رمز عبور" style={s.input} value={password} onChangeText={setPassword} secureTextEntry autoComplete={mode === 'login' ? 'current-password' : 'new-password'} textContentType={mode === 'login' ? 'password' : 'newPassword'} placeholder="حداقل ۱۲ کاراکتر" placeholderTextColor={theme.colors.muted} returnKeyType="done" onSubmitEditing={submit} />
          <Text style={s.helper}>برای امنیت بیشتر، از رمز طولانی و منحصربه‌فرد استفاده کن.</Text>
          <Pressable accessibilityRole="button" disabled={busy} style={({ pressed }) => [s.button, pressed && s.pressed, busy && s.disabled]} onPress={submit}>
            <Text style={s.buttonText}>{busy ? 'در حال پردازش…' : mode === 'login' ? 'ورود به فضای مشترک' : 'ساخت حساب'}</Text>
            <Text style={s.buttonArrow}>←</Text>
          </Pressable>
        </View>

        <View style={s.switchRow}>
          <Text style={s.switchHint}>{mode === 'login' ? 'هنوز حساب نداری؟' : 'قبلاً حساب ساختی؟'}</Text>
          <Pressable accessibilityRole="button" onPress={() => setMode(mode === 'login' ? 'register' : 'login')} hitSlop={8}>
            <Text style={s.switch}>{mode === 'login' ? 'ثبت‌نام' : 'ورود'}</Text>
          </Pressable>
        </View>
        <View style={s.privacyRow}><Text style={s.privacyIcon}>◇</Text><Text style={s.privacy}>حریم خصوصی از ابتدا بخشی از طراحی هم‌قدم است.</Text></View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  canvas: { flex: 1, width: '100%', maxWidth: 620, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 14, paddingBottom: 22, justifyContent: 'center' },
  back: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', paddingHorizontal: 3 },
  backText: { color: theme.colors.muted, fontSize: 12, fontWeight: '700' },
  brandMark: { width: 52, height: 52, borderRadius: 18, backgroundColor: theme.colors.surfaceWarm, borderWidth: 1, borderColor: 'rgba(240,90,120,0.38)', alignItems: 'center', justifyContent: 'center', marginTop: 22 },
  brandMarkText: { color: theme.colors.primarySoft, fontSize: 31, fontWeight: '600' },
  eyebrow: { color: theme.colors.primarySoft, fontSize: 12, fontWeight: '800', textAlign: 'right', marginTop: 23, writingDirection: 'rtl' },
  title: { color: theme.colors.text, fontSize: 32, lineHeight: 42, fontWeight: '900', textAlign: 'right', marginTop: 8, writingDirection: 'rtl' },
  sub: { color: theme.colors.muted, fontSize: 14, lineHeight: 24, textAlign: 'right', marginTop: 8, marginBottom: 24, writingDirection: 'rtl' },
  form: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.xl, padding: 18, ...theme.shadow.card },
  label: { color: theme.colors.textSoft, fontSize: 12, fontWeight: '800', textAlign: 'right', marginBottom: 8, marginTop: 7, writingDirection: 'rtl' },
  input: { minHeight: 52, backgroundColor: theme.colors.backgroundSoft, borderWidth: 1, borderColor: theme.colors.borderStrong, borderRadius: theme.radius.md, color: theme.colors.text, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10, textAlign: 'right', writingDirection: 'rtl', fontSize: 14 },
  helper: { color: theme.colors.muted, fontSize: 11, lineHeight: 18, textAlign: 'right', marginTop: -2, marginBottom: 16, writingDirection: 'rtl' },
  button: { minHeight: 54, borderRadius: theme.radius.md, backgroundColor: theme.colors.primary, paddingHorizontal: 16, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  pressed: { opacity: 0.88 },
  disabled: { opacity: 0.6 },
  buttonText: { color: '#160910', fontSize: 14, fontWeight: '900', writingDirection: 'rtl' },
  buttonArrow: { color: '#160910', fontSize: 19, fontWeight: '800' },
  switchRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 22 },
  switchHint: { color: theme.colors.muted, fontSize: 12, writingDirection: 'rtl' },
  switch: { color: theme.colors.secondarySoft, fontSize: 12, fontWeight: '900', writingDirection: 'rtl' },
  privacyRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 28 },
  privacyIcon: { color: theme.colors.secondarySoft, fontSize: 16 },
  privacy: { color: theme.colors.muted, fontSize: 10, textAlign: 'center', writingDirection: 'rtl' },
});
