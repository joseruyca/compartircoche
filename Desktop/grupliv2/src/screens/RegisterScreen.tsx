import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, Card, Input, Muted, Screen, TopBar } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/tokens';

export function RegisterScreen() {
  const app = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return <Screen>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TopBar back onBack={app.back} title="Crear cuenta" subtitle="Tu espacio para grupos, pagos y torneos." />
      <Card style={styles.card}>
        <Input label="Nombre" value={name} onChangeText={setName} placeholder="Jose Rubio" />
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="tu@email.com" keyboardType="email-address" />
        <Input label="Contraseña" value={password} onChangeText={setPassword} placeholder="Mínimo 6 caracteres" secureTextEntry />
        <Button disabled={app.busy || !name || !email || password.length < 6} onPress={() => app.signUp(name, email, password)}>{app.busy ? 'Creando...' : 'Crear cuenta'}</Button>
        <Button variant="secondary" onPress={() => app.go('login')} style={{ marginTop: 12 }}>Ya tengo cuenta</Button>
      </Card>
      <View style={styles.note}><Muted style={{ textAlign: 'center' }}>Si Supabase tiene confirmación por email activada, tendrás que confirmar el correo antes de entrar.</Muted></View>
    </KeyboardAvoidingView>
  </Screen>;
}

const styles = StyleSheet.create({
  card: { padding: 18, marginTop: 8 },
  note: { marginTop: 18, backgroundColor: colors.cardAlt, borderRadius: 20, padding: 15 }
});
