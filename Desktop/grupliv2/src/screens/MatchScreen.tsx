import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Card, EmptyState, H2, Muted, Screen, TopBar } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors, fonts } from '../theme/tokens';

export function MatchScreen() {
  const app = useApp();
  const group = app.getGroup(app.nav.params?.groupId);
  const tournament = group?.tournaments.find(t => t.id === app.nav.params?.tournamentId);
  const match = tournament?.matches.find(m => m.id === app.nav.params?.matchId);
  const teamA = tournament?.teams.find(t => t.id === match?.team_a_id);
  const teamB = tournament?.teams.find(t => t.id === match?.team_b_id);
  const [a, setA] = useState((match?.score_a?.[0] || 0).toString());
  const [b, setB] = useState((match?.score_b?.[0] || 0).toString());
  if (!group || !tournament || !match) return <Screen><EmptyState title="Partido no encontrado" text="Vuelve a torneos." /></Screen>;
  return <Screen>
    <TopBar back onBack={app.back} title="Resultado" subtitle="Guarda el marcador del partido" />
    <Card style={styles.scoreCard}>
      <View style={styles.team}><View style={[styles.dot,{backgroundColor: teamA?.color || colors.teal}]}/><H2>{teamA?.name}</H2></View>
      <View style={styles.scoreRow}><TextInput value={a} onChangeText={setA} keyboardType="number-pad" style={styles.score}/><Text style={styles.vs}>-</Text><TextInput value={b} onChangeText={setB} keyboardType="number-pad" style={styles.score}/></View>
      <View style={styles.team}><View style={[styles.dot,{backgroundColor: teamB?.color || colors.gold}]}/><H2>{teamB?.name}</H2></View>
    </Card>
    <Card style={{ padding: 18, marginBottom: 16 }}><H2>Detalle</H2><Muted style={{ marginTop: 8 }}>Puedes usar esta pantalla para registrar resultados rápidos. La clasificación se actualiza automáticamente.</Muted></Card>
    <Button onPress={() => app.saveMatch(match.id, [Number(a) || 0], [Number(b) || 0])}>Guardar resultado</Button>
  </Screen>;
}

const styles = StyleSheet.create({
  scoreCard: { padding: 22, alignItems: 'center', marginBottom: 16 },
  team: { flexDirection: 'row', gap: 10, alignItems: 'center', marginVertical: 10 },
  dot: { width: 22, height: 22, borderRadius: 11 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 18, marginVertical: 22 },
  score: { width: 96, height: 88, borderRadius: 24, backgroundColor: colors.bgSoft, textAlign: 'center', fontFamily: fonts.display, fontSize: 46, color: colors.ink, outlineStyle: 'none' as any },
  vs: { fontFamily: fonts.display, fontSize: 44, color: colors.muted }
});
