import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { theme } from '../src/theme';

type Feature = 'music' | 'events' | 'ratings' | 'check-in' | 'activities' | 'location' | 'wellbeing';
const copy: Record<Feature, { icon: string; title: string; subtitle: string }> = {
  music: { icon: '🎵', title: 'Shared music', subtitle: 'Build the soundtrack of your relationship.' },
  events: { icon: '📅', title: 'Shared events', subtitle: 'Keep the next meaningful moment in sight.' },
  ratings: { icon: '✦', title: 'Relationship pulse', subtitle: 'A balanced reflection, never a judgment.' },
  'check-in': { icon: '🧠', title: 'Weekly check-in', subtitle: 'A little honesty goes a long way.' },
  activities: { icon: '✨', title: 'Date ideas', subtitle: 'Choose something you will both enjoy.' },
  location: { icon: '📍', title: 'Location sharing', subtitle: 'Always explicit. Always reversible.' },
  wellbeing: { icon: '🌷', title: 'Cycle-aware support', subtitle: 'Private support, shared only by choice.' },
};

export default function FeatureScreen() {
  const raw = useLocalSearchParams<{ feature?: string }>().feature;
  const feature = (raw && raw in copy ? raw : 'events') as Feature;
  const [enabled, setEnabled] = useState(false);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const meta = copy[feature];
  const save = () => { Alert.alert('Saved privately', input ? 'Your update is ready to sync with your shared space.' : 'Your preference has been updated.'); setInput(''); };
  return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.content}>
    <Pressable onPress={() => router.back()}><Text style={s.back}>‹  Back</Text></Pressable><Text style={s.icon}>{meta.icon}</Text><Text style={s.title}>{meta.title}</Text><Text style={s.subtitle}>{meta.subtitle}</Text>
    {feature === 'music' && <><Card title="Shared playlist" body="Create a Spotify playlist with both partners as editors. Playback sync starts only after both accounts connect."/><Button label="Connect Spotify" onPress={() => Alert.alert('Spotify connection', 'OAuth must be completed with your Spotify Client ID before playback can be enabled.')} /></>}
    {feature === 'events' && <><Card title="Next event" body="Dinner under the stars · Friday, 20:00 · 12 days remaining"/><TextInput value={input} onChangeText={setInput} placeholder="Add an event title" placeholderTextColor={theme.colors.muted} style={s.input}/><Button label="Add shared event" onPress={save}/></>}
    {feature === 'ratings' && <><Card title="How are we doing?" body="Each person’s ratings carry equal weight. A score appears only after enough feedback from both of you."/>{[1,2,3,4,5].map(n => <Pressable key={n} onPress={() => setScore(n)} style={[s.option, score === n && s.selected]}><Text style={s.optionText}>{n} · {['Needs care','A little off','Okay','Good','Wonderful'][n - 1]}</Text></Pressable>)}<Button label="Save private reflection" onPress={save}/></>}
    {feature === 'check-in' && <><Card title="This week’s question" body="What is one thing your partner did that made you feel appreciated?"/><TextInput value={input} onChangeText={setInput} multiline placeholder="Write your answer…" placeholderTextColor={theme.colors.muted} style={[s.input,s.area]}/><Button label="Save answer" onPress={save}/></>}
    {feature === 'activities' && <><Card title="Tonight’s idea" body="Make a three-song playlist for each other, then take a screen-free evening walk."/><Button label="Save this idea" onPress={save}/><Button label="Show another" onPress={() => Alert.alert('Another idea', 'Cook a meal using one ingredient chosen by each of you.')} secondary/></>}
    {feature === 'location' && <Consent title="Share my live location" body="Your partner can only see this while you choose to share. Set an expiry before enabling it." enabled={enabled} setEnabled={setEnabled}/>} 
    {feature === 'wellbeing' && <Consent title="Share supportive reminders" body="Cycle information is private by default. This never affects relationship scores and can be withdrawn immediately." enabled={enabled} setEnabled={setEnabled}/>} 
  </ScrollView></SafeAreaView>;
}
function Card({ title, body }: { title: string; body: string }) { return <View style={s.card}><Text style={s.cardTitle}>{title}</Text><Text style={s.body}>{body}</Text></View>; }
function Button({ label, onPress, secondary }: { label: string; onPress: () => void; secondary?: boolean }) { return <Pressable style={[s.button, secondary && s.secondary]} onPress={onPress}><Text style={[s.buttonText, secondary && s.secondaryText]}>{label}</Text></Pressable>; }
function Consent({ title, body, enabled, setEnabled }: { title:string; body:string; enabled:boolean; setEnabled:(value:boolean)=>void }) { return <View style={s.card}><View style={s.consentHead}><Text style={s.cardTitle}>{title}</Text><Switch value={enabled} onValueChange={setEnabled} trackColor={{ true: theme.colors.primary }}/></View><Text style={s.body}>{body}</Text><Text style={s.notice}>{enabled ? 'Enabled — you can stop this at any time.' : 'Not shared.'}</Text></View>; }
const s=StyleSheet.create({safe:{flex:1,backgroundColor:theme.colors.background},content:{padding:22,paddingTop:18,paddingBottom:42},back:{color:theme.colors.primary,fontWeight:'800',fontSize:15},icon:{fontSize:34,marginTop:28},title:{color:theme.colors.text,fontSize:32,fontWeight:'800',marginTop:10},subtitle:{color:theme.colors.muted,fontSize:15,lineHeight:22,marginTop:6,marginBottom:24},card:{backgroundColor:theme.colors.surface,borderWidth:1,borderColor:theme.colors.border,borderRadius:theme.radius.md,padding:18,marginBottom:13},cardTitle:{color:theme.colors.text,fontSize:17,fontWeight:'800'},body:{color:theme.colors.muted,fontSize:13,lineHeight:20,marginTop:8},input:{backgroundColor:theme.colors.surface,borderWidth:1,borderColor:theme.colors.border,borderRadius:theme.radius.md,padding:15,color:theme.colors.text,fontSize:15,marginBottom:13},area:{height:130,textAlignVertical:'top'},button:{backgroundColor:theme.colors.primary,borderRadius:theme.radius.md,padding:16,alignItems:'center',marginBottom:10},buttonText:{color:'#fff',fontSize:15,fontWeight:'800'},secondary:{backgroundColor:theme.colors.surface,borderWidth:1,borderColor:theme.colors.border},secondaryText:{color:theme.colors.text},option:{borderRadius:theme.radius.md,padding:15,backgroundColor:theme.colors.surface,borderWidth:1,borderColor:theme.colors.border,marginBottom:9},selected:{backgroundColor:'#4C1121',borderColor:theme.colors.primary},optionText:{color:theme.colors.text,fontWeight:'700'},consentHead:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},notice:{color:theme.colors.success,fontSize:12,fontWeight:'700',marginTop:14}});
