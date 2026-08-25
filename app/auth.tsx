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
    if (!email || password.length < 12 || (mode==='register' && !name)) return Alert.alert('اطلاعات ناقص', 'ایمیل، رمز حداقل ۱۲ کاراکتری و نام را کامل کن.');
    setBusy(true);
    try {
      const result = mode==='login' ? await auth.login({ email, password }) : await auth.register({ email, password, displayName: name });
      await setToken(result.accessToken);
      router.replace('/home');
    } catch (error) { Alert.alert('خطا', error instanceof Error ? error.message : 'خطای ناشناخته'); }
    finally { setBusy(false); }
  };
  return <SafeAreaView style={s.safe}><View style={s.content}>
    <Text style={s.brand}>هم‌قدم</Text><Text style={s.title}>{mode==='login'?'خوش برگشتی':'فضای مشترک خودت را بساز'}</Text><Text style={s.sub}>این فضا فقط برای دو نفر طراحی شده است.</Text>
    {mode==='register' && <TextInput style={s.input} value={name} onChangeText={setName} placeholder="نام" placeholderTextColor={theme.colors.muted}/>} 
    <TextInput style={s.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="ایمیل" placeholderTextColor={theme.colors.muted}/>
    <TextInput style={s.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="رمز عبور" placeholderTextColor={theme.colors.muted}/>
    <Pressable disabled={busy} style={s.button} onPress={submit}><Text style={s.buttonText}>{busy?'در حال پردازش…':mode==='login'?'ورود':'ثبت‌نام'}</Text></Pressable>
    <Pressable onPress={()=>setMode(mode==='login'?'register':'login')}><Text style={s.switch}>{mode==='login'?'حساب نداری؟ ثبت‌نام کن':'حساب داری؟ وارد شو'}</Text></Pressable>
  </View></SafeAreaView>;
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:theme.colors.background},content:{justifyContent:'center',flex:1,padding:24},brand:{color:theme.colors.primary,fontWeight:'900',fontSize:15,letterSpacing:2,textAlign:'right'},title:{color:theme.colors.text,fontSize:34,fontWeight:'900',textAlign:'right',marginTop:12},sub:{color:theme.colors.muted,textAlign:'right',lineHeight:22,marginTop:8,marginBottom:28},input:{backgroundColor:theme.colors.surface,borderWidth:1,borderColor:theme.colors.border,borderRadius:theme.radius.md,color:theme.colors.text,padding:15,marginBottom:12,textAlign:'right'},button:{backgroundColor:theme.colors.primary,padding:16,borderRadius:theme.radius.md,alignItems:'center',marginTop:6},buttonText:{color:'#fff',fontWeight:'900'},switch:{color:theme.colors.secondary,textAlign:'center',marginTop:20,fontWeight:'800'}});
