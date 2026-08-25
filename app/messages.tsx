import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { api } from '../src/services/api';
import { encryptWithPassphrase } from '../src/services/crypto';
import { theme } from '../src/theme';
import type { MessageKind } from '../src/types/domain';

const labels: Record<MessageKind, string> = { normal: 'عادی', encrypted: 'رمزدار', time_capsule: 'کپسول زمان' };
type Message = { id:string; sender_id:string; kind:MessageKind; ciphertext:string; key_envelope?:string; unlock_at?:string; created_at:string };

export default function MessagesScreen() {
  const [kind, setKind] = useState<MessageKind>('normal');
  const [text, setText] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const helper = useMemo(() => kind === 'encrypted' ? 'رمز فقط روی دستگاه استفاده می‌شود و سرور ciphertext را نگه می‌دارد.' : kind === 'time_capsule' ? 'این نمونه یک کپسول با بازشدن ۲۴ ساعت بعد ایجاد می‌کند.' : 'پیام عادی فوراً در فضای مشترک ثبت می‌شود.', [kind]);
  const load = async () => { try { const result = await api<{messages:Message[]}>('/v1/messages'); setMessages(result.messages); } catch { /* authentication may not be configured yet */ } };
  useEffect(() => { load(); }, []);
  const send = async () => {
    if (!text.trim() || busy) return;
    if (kind === 'encrypted' && passphrase.length < 8) return Alert.alert('رمز کوتاه است', 'برای پیام رمزدار حداقل ۸ کاراکتر انتخاب کن.');
    setBusy(true);
    try {
      let ciphertext=text.trim(); let keyEnvelope:string|undefined; let unlockAt:string|undefined;
      if(kind==='encrypted') ({ciphertext,keyEnvelope}=await encryptWithPassphrase(text.trim(),passphrase));
      if(kind==='time_capsule') unlockAt=new Date(Date.now()+24*60*60*1000).toISOString();
      await api('/v1/messages',{method:'POST',body:JSON.stringify({kind,ciphertext,keyEnvelope,unlockAt})});
      setText(''); setPassphrase(''); await load();
    } catch(error) { Alert.alert('ارسال ناموفق',error instanceof Error?error.message:'خطای ناشناخته'); }
    finally { setBusy(false); }
  };
  return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.content}>
    <Pressable onPress={() => router.back()}><Text style={s.back}>‹ بازگشت</Text></Pressable>
    <Text style={s.title}>پیام‌ها</Text><Text style={s.sub}>یک یادداشت واقعی برای عزیزت</Text>
    <Text style={s.label}>نوع پیام</Text><View style={s.types}>{(Object.keys(labels) as MessageKind[]).map(value => <Pressable key={value} onPress={() => setKind(value)} style={[s.pill,kind===value&&s.pillActive]}><Text style={[s.pillText,kind===value&&s.pillTextActive]}>{labels[value]}</Text></Pressable>)}</View>
    {kind==='encrypted'&&<TextInput accessibilityLabel="رمز پیام" value={passphrase} onChangeText={setPassphrase} secureTextEntry placeholder="رمز این پیام" placeholderTextColor={theme.colors.muted} style={s.input}/>} 
    <TextInput accessibilityLabel="پیام" value={text} onChangeText={setText} multiline placeholder="یک پیام از دل بنویس…" placeholderTextColor={theme.colors.muted} style={[s.input,s.area]}/><Text style={s.helper}>{helper}</Text>
    <Pressable disabled={busy} style={s.send} onPress={send}><Text style={s.sendText}>{busy?'در حال ارسال…':'ارسال پیام'}</Text></Pressable>
    <Text style={s.section}>پیام‌های بازشده</Text>
    {messages.length===0?<Text style={s.empty}>هنوز پیامی ثبت نشده است.</Text>:messages.map(m=><View key={m.id} style={s.message}><Text style={s.messageKind}>{labels[m.kind]}{m.unlock_at?` · ${new Date(m.unlock_at).toLocaleString()}`:''}</Text><Text style={s.messageText}>{m.kind==='encrypted'?'🔐 پیام رمزدار':m.ciphertext}</Text></View>)}
  </ScrollView></SafeAreaView>;
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:theme.colors.background},content:{padding:22,paddingTop:18,paddingBottom:42},back:{color:theme.colors.primary,fontWeight:'800',fontSize:14},title:{color:theme.colors.text,fontSize:32,fontWeight:'900',marginTop:20},sub:{color:theme.colors.muted,fontSize:14,marginTop:4,marginBottom:26},label:{color:theme.colors.muted,fontWeight:'800',fontSize:10,letterSpacing:1.4},types:{flexDirection:'row',gap:8,marginTop:12,flexWrap:'wrap'},pill:{borderRadius:20,paddingVertical:10,paddingHorizontal:13,backgroundColor:theme.colors.surface,borderWidth:1,borderColor:theme.colors.border},pillActive:{backgroundColor:'#4C1121',borderColor:theme.colors.primary},pillText:{color:theme.colors.muted,fontWeight:'700',fontSize:12},pillTextActive:{color:'#FDA4AF'},input:{backgroundColor:theme.colors.surface,borderWidth:1,borderColor:theme.colors.border,borderRadius:theme.radius.md,padding:15,color:theme.colors.text,fontSize:15,marginTop:14},area:{height:150,textAlignVertical:'top'},helper:{color:theme.colors.muted,fontSize:12,lineHeight:18,marginTop:10},send:{backgroundColor:theme.colors.primary,alignItems:'center',padding:16,borderRadius:theme.radius.md,marginTop:18},sendText:{color:'#fff',fontWeight:'900'},section:{color:theme.colors.muted,fontWeight:'800',fontSize:11,letterSpacing:1.4,marginTop:30,marginBottom:10},empty:{color:theme.colors.muted,textAlign:'center',paddingVertical:28},message:{backgroundColor:theme.colors.surface,borderWidth:1,borderColor:theme.colors.border,borderRadius:theme.radius.md,padding:14,marginBottom:9},messageKind:{color:theme.colors.secondary,fontSize:10,fontWeight:'800'},messageText:{color:theme.colors.text,fontSize:14,fontWeight:'700',marginTop:8}});
