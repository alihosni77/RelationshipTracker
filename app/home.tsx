import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../src/theme';

const eventAt = new Date(Date.now() + 12 * 86400000 + 31 * 60000);
const modules = [
  ['💌', 'Messages', 'Normal, secret & time capsules', '/messages'],
  ['🎵', 'Shared music', 'Playlist & listening room', 'music'],
  ['🧠', 'Check-in', 'A gentle relationship pulse', 'check-in'],
  ['📍', 'Location', 'Only with mutual consent', 'location'],
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
    <Text style={s.eyebrow}>YOUR SHARED SPACE</Text><View style={s.heading}><View><Text style={s.title}>Together</Text><Text style={s.sub}>Small moments, held close.</Text></View><View style={s.avatar}><Text style={s.avatarText}>A + S</Text></View></View>
    <View style={s.countdown}><Text style={s.label}>NEXT SHARED EVENT</Text><Text style={s.event}>Dinner under the stars</Text><Text style={s.timer}>{remaining}</Text><Text style={s.hint}>Friday · 20:00</Text></View>
    <Text style={s.section}>TODAY</Text><Pressable onPress={sendLoveTap} style={s.tap}><View style={s.heart}><Text style={s.heartText}>♥</Text></View><View style={s.flex}><Text style={s.tapTitle}>Send a love tap</Text><Text style={s.detail}>{taps ? `${taps} loving moments sent today` : 'Let them know they are on your mind'}</Text></View><Text style={s.arrow}>›</Text></Pressable>
    <Text style={s.section}>EXPLORE</Text><View style={s.grid}>{modules.map(([icon, title, detail, route]) => <Pressable key={title} onPress={() => route === '/messages' ? router.push(route) : Alert.alert(`${title} is next`, 'The native permissions and integration foundation are ready; this flow is the next feature module.') } style={s.card}><Text style={s.icon}>{icon}</Text><Text style={s.cardTitle}>{title}</Text><Text style={s.detail}>{detail}</Text></Pressable>)}</View>
    <Text style={s.section}>WELLBEING</Text><Pressable onPress={() => Alert.alert('Cycle-aware support', 'This data is private by default. Partner visibility must be explicitly enabled.')} style={s.well}><Text style={s.wellIcon}>✦</Text><View style={s.flex}><Text style={s.cardTitle}>Cycle-aware support</Text><Text style={s.detail}>Private tracking and optional caring reminders.</Text></View><Text style={s.open}>Open</Text></Pressable><Text style={s.privacy}>Private by design · Every shared feature is opt-in · Pause sharing anytime</Text>
  </ScrollView>;
}
const s = StyleSheet.create({screen:{flex:1,backgroundColor:theme.colors.background},content:{padding:22,paddingTop:58,paddingBottom:42},eyebrow:{color:theme.colors.primary,fontSize:11,fontWeight:'800',letterSpacing:1.8},heading:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:8},title:{color:theme.colors.text,fontSize:36,fontWeight:'800'},sub:{color:theme.colors.muted,marginTop:2},avatar:{width:52,height:52,borderRadius:26,alignItems:'center',justifyContent:'center',backgroundColor:'#30131D',borderWidth:1,borderColor:'#6D2035'},avatarText:{color:'#FDA4AF',fontSize:11,fontWeight:'800'},countdown:{backgroundColor:theme.colors.surface,borderColor:theme.colors.border,borderWidth:1,borderRadius:theme.radius.lg,padding:20,marginTop:26},label:{color:theme.colors.secondary,fontSize:10,fontWeight:'800',letterSpacing:1.5},event:{color:theme.colors.text,fontSize:19,fontWeight:'700',marginTop:8},timer:{color:theme.colors.text,fontSize:30,fontWeight:'800',letterSpacing:1,marginTop:14},hint:{color:theme.colors.muted,fontSize:12,marginTop:5},section:{color:theme.colors.muted,fontSize:11,fontWeight:'800',letterSpacing:1.5,marginTop:28,marginBottom:12},tap:{flexDirection:'row',alignItems:'center',gap:13,padding:15,borderRadius:theme.radius.md,backgroundColor:'#26131A',borderWidth:1,borderColor:'#572130'},heart:{width:42,height:42,borderRadius:21,backgroundColor:theme.colors.primary,alignItems:'center',justifyContent:'center'},heartText:{color:'#fff',fontSize:20},flex:{flex:1},tapTitle:{color:theme.colors.text,fontSize:16,fontWeight:'700'},detail:{color:theme.colors.muted,fontSize:11,lineHeight:16,marginTop:5},arrow:{color:theme.colors.primary,fontSize:29},grid:{flexDirection:'row',flexWrap:'wrap',gap:12},card:{width:'48%',minHeight:150,backgroundColor:theme.colors.surface,borderColor:theme.colors.border,borderWidth:1,borderRadius:theme.radius.md,padding:15},icon:{fontSize:24},cardTitle:{color:theme.colors.text,fontSize:16,fontWeight:'700',marginTop:12},well:{flexDirection:'row',alignItems:'center',gap:11,backgroundColor:theme.colors.surface,borderColor:theme.colors.border,borderWidth:1,borderRadius:theme.radius.md,padding:15},wellIcon:{color:'#C4B5FD',fontSize:24},open:{color:theme.colors.primary,fontWeight:'800',fontSize:12},privacy:{color:theme.colors.muted,fontSize:11,lineHeight:17,textAlign:'center',marginTop:28,paddingHorizontal:16}});
