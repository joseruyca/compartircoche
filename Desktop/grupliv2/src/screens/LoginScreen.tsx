import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, Card, Input, Muted, Screen, TopBar } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/tokens';

export function LoginScreen() {
  const app = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return <Screen>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TopBar back onBack={app.back} title="Iniciar sesión" subtitle="Entra para organizar tus grupos reales." />
      <Card style={styles.card}>
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="tu@email.com" keyboardType="email-address" />
        <Input label="Contraseña" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
        <Button disabled={app.busy || !email || !password} onPress={() => app.signIn(email, password)}>{app.busy ? 'Entrando...' : 'Entrar'}</Button>
        <Button variant="secondary" onPress={() => app.go('register')} style={{ marginTop: 12 }}>Crear cuenta nueva</Button>
      </Card>
      <View style={styles.note}><Muted style={{ textAlign: 'center' }}>Sin datos falsos: Grupli trabaja con usuarios y grupos reales de Supabase.</Muted></View>
    </KeyboardAvoidingView>
  </Screen>;
}

const styles = StyleSheet.create({
  card: { padding: 18, marginTop: 8 },
  note: { marginTop: 18, backgroundColor: colors.cardAlt, borderRadius: 20, padding: 15 }
});
