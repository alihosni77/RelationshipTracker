import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../src/theme';
import { fa } from '../src/i18n/fa';

const eventAt = new Date(Date.now() + 12 * 86400000 + 31 * 60000);
const modules = [
  ['💌', 'پیام‌ها', 'عادی، رمزدار و کپسول زمان', '/messages'],
  ['🎵', 'موسیقی مشترک', 'پلی‌لیست و اتاق شنیدن', '/music'],
  ['🧠', 'گفت‌وگوی هفتگی', 'نبض آرام رابطه', '/check-in'],
  ['📍', 'موقعیت مکانی', 'فقط با رضایت دوطرفه', '/location'],
  ['📅', 'رویدادها', 'تقویم و شمارش معکوس', '/events'],
  ['✦', 'نبض رابطه', 'بازخورد متعادل', '/ratings'],
  ['✨', 'ایده‌های قرار', 'با هم برنامه بسازید', '/activities'],
] as const;

function countdown() {
  const seconds = Math.max(0, Math.floor((eventAt.getTime() - Date.now()) / 1000));
  return `${Math.floor(seconds / 86400)}d ${String(Math.floor(seconds % 86400 / 3600)).padStart(2, '0')}h ${String(Math.floor(seconds % 3600 / 60)).padStart(2, '0')}m`;
}

export default function HomeScreen() {
  const [remaining, setRemaining] = useState(countdown());
  const [taps, setTaps] = useState(0);
  useEffect(() => { const id = setInterval(() => setRemaining(countdown()), 30000); return () => clearInterval(id); }, []);
  const sendLoveTap = async () => { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setTaps(n => n + 1); Alert.alert('Love sent', 'Your partner will feel a gentle vibration when they are connected.'); };
  return <ScrollView style={s.screen} contentContainerStyle={s.content}>
    <Text style={s.eyebrow}>{fa.sharedSpace}</Text><View style={s.heading}><View><Text style={s.title}>{fa.together}</Text><Text style={s.sub}>لحظه‌های کوچک، نزدیک به دل.</Text></View><View style={s.avatar}><Text style={s.avatarText}>A + S</Text></View></View>
    <View style={s.countdown}><Text style={s.label}>رویداد بعدی شما</Text><Text style={s.event}>شام زیر آسمان شب</Text><Text style={s.timer}>{remaining}</Text><Text style={s.hint}>جمعه · ساعت ۲۰</Text></View>
    <Text style={s.section}>امروز</Text><Pressable onPress={sendLoveTap} style={s.tap}><View style={s.heart}><Text style={s.heartText}>♥</Text></View><View style={s.flex}><Text style={s.tapTitle}>{fa.loveTap}</Text><Text style={s.detail}>{taps ? `${taps} لحظه‌ی دوست‌داشتنی امروز فرستاده شد` : 'بگذار بداند به یادش هستی'}</Text></View><Text style={s.arrow}>‹</Text></Pressable>
    <Text style={s.section}>بخش‌ها</Text><View style={s.grid}>{modules.map(([icon, title, detail, route]) => <Pressable key={title} onPress={() => router.push(route)} style={s.card}><Text style={s.icon}>{icon}</Text><Text style={s.cardTitle}>{title}</Text><Text style={s.detail}>{detail}</Text></Pressable>)}</View>
    <Text style={s.section}>سلامت و مراقبت</Text><Pressable onPress={() => router.push('/wellbeing')} style={s.well}><Text style={s.wellIcon}>✦</Text><View style={s.flex}><Text style={s.cardTitle}>همراهی آگاه از چرخه</Text><Text style={s.detail}>ثبت خصوصی و یادآوری‌های اختیاریِ حمایت‌گرانه.</Text></View><Text style={s.open}>باز کردن</Text></Pressable><Text style={s.privacy}>محافظت از حریم خصوصی · همه چیز اختیاری است · هر زمان می‌توانی اشتراک‌گذاری را متوقف کنی</Text>
  </ScrollView>;
}
const s = StyleSheet.create({screen:{flex:1,backgroundColor:theme.colors.background},content:{padding:22,paddingTop:58,paddingBottom:42},eyebrow:{color:theme.colors.primary,fontSize:11,fontWeight:'800',letterSpacing:1.8},heading:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:8},title:{color:theme.colors.text,fontSize:36,fontWeight:'800'},sub:{color:theme.colors.muted,marginTop:2},avatar:{width:52,height:52,borderRadius:26,alignItems:'center',justifyContent:'center',backgroundColor:'#30131D',borderWidth:1,borderColor:'#6D2035'},avatarText:{color:'#FDA4AF',fontSize:11,fontWeight:'800'},countdown:{backgroundColor:theme.colors.surface,borderColor:theme.colors.border,borderWidth:1,borderRadius:theme.radius.lg,padding:20,marginTop:26},label:{color:theme.colors.secondary,fontSize:10,fontWeight:'800',letterSpacing:1.5},event:{color:theme.colors.text,fontSize:19,fontWeight:'700',marginTop:8},timer:{color:theme.colors.text,fontSize:30,fontWeight:'800',letterSpacing:1,marginTop:14},hint:{color:theme.colors.muted,fontSize:12,marginTop:5},section:{color:theme.colors.muted,fontSize:11,fontWeight:'800',letterSpacing:1.5,marginTop:28,marginBottom:12},tap:{flexDirection:'row',alignItems:'center',gap:13,padding:15,borderRadius:theme.radius.md,backgroundColor:'#26131A',borderWidth:1,borderColor:'#572130'},heart:{width:42,height:42,borderRadius:21,backgroundColor:theme.colors.primary,alignItems:'center',justifyContent:'center'},heartText:{color:'#fff',fontSize:20},flex:{flex:1},tapTitle:{color:theme.colors.text,fontSize:16,fontWeight:'700'},detail:{color:theme.colors.muted,fontSize:11,lineHeight:16,marginTop:5},arrow:{color:theme.colors.primary,fontSize:29},grid:{flexDirection:'row',flexWrap:'wrap',gap:12},card:{width:'48%',minHeight:150,backgroundColor:theme.colors.surface,borderColor:theme.colors.border,borderWidth:1,borderRadius:theme.radius.md,padding:15},icon:{fontSize:24},cardTitle:{color:theme.colors.text,fontSize:16,fontWeight:'700',marginTop:12},well:{flexDirection:'row',alignItems:'center',gap:11,backgroundColor:theme.colors.surface,borderColor:theme.colors.border,borderWidth:1,borderRadius:theme.radius.md,padding:15},wellIcon:{color:'#C4B5FD',fontSize:24},open:{color:theme.colors.primary,fontWeight:'800',fontSize:12},privacy:{color:theme.colors.muted,fontSize:11,lineHeight:17,textAlign:'center',marginTop:28,paddingHorizontal:16}});
