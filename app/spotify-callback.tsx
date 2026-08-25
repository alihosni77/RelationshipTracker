import { router } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';
import { theme } from '../src/theme';

export default function SpotifyCallback(){
  useEffect(()=>{ const timer=setTimeout(()=>router.replace('/home'),900); return()=>clearTimeout(timer); },[]);
  return <SafeAreaView style={s.safe}><Text style={s.text}>اتصال Spotify انجام شد. در حال بازگشت…</Text></SafeAreaView>;
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:theme.colors.background,alignItems:'center',justifyContent:'center',padding:24},text:{color:theme.colors.text,fontSize:16,textAlign:'center',fontWeight:'800'}});
