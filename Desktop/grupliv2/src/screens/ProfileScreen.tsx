import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Avatar, Button, Card, H2, Muted, Screen, TopBar } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors, fonts } from '../theme/tokens';

export function ProfileScreen() {
  const app = useApp();
  const name = app.profile?.full_name || app.user?.email || 'Usuario';
  return <Screen>
    <TopBar title="Perfil" subtitle="Tu cuenta y ajustes" />
    <Card style={styles.profile}><Avatar name={name} size={82}/><View style={{ flex: 1 }}><H2>{name}</H2><Muted>{app.user?.email}</Muted></View></Card>
    <Card style={styles.panel}><H2>Resumen</H2><View style={styles.stats}><View><Text style={styles.stat}>{app.groups.length}</Text><Muted>Grupos</Muted></View><View><Text style={styles.stat}>{app.groups.reduce((s,g)=>s+g.events.length,0)}</Text><Muted>Quedadas</Muted></View><View><Text style={styles.stat}>{app.groups.reduce((s,g)=>s+g.tournaments.length,0)}</Text><Muted>Torneos</Muted></View></View></Card>
    <Card style={styles.panel}><H2>Producto final</H2><Muted style={{ marginTop: 8 }}>Esta versión usa Supabase real para auth, grupos, eventos, asistencia, gastos y torneos. Sin datos locales falsos.</Muted></Card>
    <Button variant="danger" icon="logout" onPress={app.signOut}>Cerrar sesión</Button>
  </Screen>;
}

const styles = StyleSheet.create({
  profile: { padding: 18, flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 16 },
  panel: { padding: 18, marginBottom: 16 },
  stats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 },
  stat: { fontFamily: fonts.display, color: colors.ink, fontSize: 38, textAlign: 'center' }
});
