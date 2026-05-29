import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Body, Button, Card, Display, Muted, Screen } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors, fonts, shadow } from '../theme/tokens';

export function WelcomeScreen() {
  const app = useApp();
  return <Screen scroll={false}>
    <View style={styles.wrap}>
      <Text style={styles.logo}>Grupli</Text>
      <Display style={styles.title}>Organiza tus grupos sin caos</Display>
      <Muted style={styles.subtitle}>Quedadas, finanzas y torneos. Todo en un solo lugar.</Muted>

      <View style={styles.hero}>
        <View style={styles.blobLeft}/><View style={styles.blobRight}/>
        <View style={[styles.float, styles.calendar]}><MaterialCommunityIcons name="calendar-check" color={colors.white} size={42}/><View style={styles.microDot}/></View>
        <View style={[styles.float, styles.people]}><MaterialCommunityIcons name="account-group" color={colors.indigo} size={40}/><Text style={styles.heroNumber}>8/10</Text></View>
        <View style={[styles.money]}><Text style={styles.moneyText}>+18 €</Text><View style={styles.moneyLine}/><View style={[styles.moneyLine, { width: 98 }]}/></View>
        <View style={[styles.float, styles.trophy]}><MaterialCommunityIcons name="trophy" color={colors.white} size={42}/></View>
        <View style={styles.ball}><MaterialCommunityIcons name="soccer" size={38} color={colors.ink}/></View>
      </View>

      {!app.hasSupabaseConfig ? <Card style={styles.config}><Body>Faltan variables de Supabase.</Body><Muted>Configura EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY antes de usar datos reales.</Muted></Card> : null}

      <View style={styles.ctaBlock}>
        <Button onPress={() => app.go('login')}>Iniciar sesión</Button>
        <Button onPress={() => app.go('register')} variant="secondary" style={{ marginTop: 12 }}>Crear cuenta</Button>
      </View>

      <View style={styles.sep}><View style={styles.sepLine}/><Muted>o continúa con</Muted><View style={styles.sepLine}/></View>
      <Button variant="secondary" icon="apple" onPress={() => app.go('login')}>Continuar con Apple</Button>
      <Button variant="secondary" icon="google" onPress={() => app.go('login')} style={{ marginTop: 10 }}>Continuar con Google</Button>
      <Muted style={styles.terms}>Al continuar, aceptas nuestros Términos de servicio y nuestra Política de privacidad.</Muted>
    </View>
  </Screen>;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: 42 },
  logo: { fontFamily: fonts.display, color: colors.navy, fontSize: 31, letterSpacing: -0.25 },
  title: { marginTop: 30, maxWidth: 370 },
  subtitle: { fontSize: 22, lineHeight: 31, marginTop: 19, maxWidth: 340 },
  hero: { height: 300, marginTop: 18, position: 'relative' },
  blobLeft: { position: 'absolute', left: 0, bottom: 30, width: 180, height: 138, borderTopLeftRadius: 90, borderTopRightRadius: 90, backgroundColor: '#E5F3EC' },
  blobRight: { position: 'absolute', right: 0, bottom: 30, width: 190, height: 122, borderTopLeftRadius: 90, backgroundColor: '#F4EBD9' },
  float: { position: 'absolute', borderRadius: 24, alignItems: 'center', justifyContent: 'center', ...shadow.soft },
  calendar: { left: 72, top: 64, width: 112, height: 112, backgroundColor: colors.teal, transform: [{ rotate: '-3deg' }] },
  microDot: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.tealDark, position: 'absolute', right: 10, bottom: 12 },
  people: { right: 52, top: 23, width: 128, height: 112, backgroundColor: '#F1F3FA', borderWidth: 1, borderColor: colors.line },
  heroNumber: { marginTop: 8, fontSize: 18, color: colors.muted, fontWeight: '800' },
  money: { position: 'absolute', left: 118, top: 143, width: 226, height: 116, borderRadius: 23, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, padding: 25, transform: [{ rotate: '-4deg' }], ...shadow.soft },
  moneyText: { color: colors.teal, fontSize: 29, fontWeight: '900' },
  moneyLine: { width: 122, height: 11, borderRadius: 8, backgroundColor: colors.line, marginTop: 14 },
  trophy: { right: 42, top: 122, width: 100, height: 100, backgroundColor: colors.coral },
  ball: { right: 88, bottom: 9, width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, ...shadow.soft },
  config: { padding: 14, marginBottom: 4, backgroundColor: colors.sand },
  ctaBlock: { marginTop: 2 },
  sep: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 17 },
  sepLine: { flex: 1, height: 1, backgroundColor: colors.line },
  terms: { textAlign: 'center', marginTop: 17, fontSize: 13, lineHeight: 20 }
});
