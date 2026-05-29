import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Card, EmptyState, H2, IconTile, Muted, Pill, Screen, TopBar } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors, fonts } from '../theme/tokens';
import { standings } from '../utils/tournaments';
import { shortDate, timeFromIso } from '../utils/date';

export function TournamentsScreen() {
  const app = useApp();
  const group = app.getGroup(app.nav.params?.groupId);
  if (!group) return <Screen><EmptyState title="Sin grupo" text="Selecciona un grupo primero." /></Screen>;
  const tournament = group.tournaments[0];
  const rows = standings(tournament);
  return <Screen>
    <TopBar title="Torneos" subtitle="Compite y sigue la clasificación" />
    <View style={styles.segment}><Pill selected>Liga</Pill><Pill selected={false}>Eliminatoria</Pill><Pill selected={false}>Americano</Pill></View>
    {!tournament ? <EmptyState icon="trophy-outline" title="Crea el primer torneo" text="Grupli generará equipos y partidos base para que puedas empezar a registrar resultados." action="Crear torneo" onAction={() => app.createStarterTournament(group.id)} /> : <>
      <Card style={styles.table}><View style={styles.cardHead}><IconTile name="trophy"/><H2>Clasificación</H2><MaterialCommunityIcons name="chevron-right" color={colors.muted} size={22}/></View><View style={styles.tableHeader}><Text style={[styles.th,{flex:1.8}]}> </Text><Text style={styles.th}>PTS</Text><Text style={styles.th}>PJ</Text><Text style={styles.th}>G</Text><Text style={styles.th}>E</Text><Text style={styles.th}>P</Text><Text style={styles.th}>DIF</Text></View>{rows.map((row, i) => <View key={row.team.id} style={styles.tableRow}><Text style={styles.rank}>{i+1}</Text><View style={[styles.teamDot,{backgroundColor: row.team.color || colors.teal}]}/><Text style={[styles.team,{flex:1.5}]}>{row.team.name}</Text><Text style={styles.td}>{row.pts}</Text><Text style={styles.td}>{row.pj}</Text><Text style={styles.td}>{row.g}</Text><Text style={styles.td}>{row.e}</Text><Text style={styles.td}>{row.p}</Text><Text style={[styles.td,{color: row.dif >=0 ? colors.green : colors.red}]}>{row.dif > 0 ? '+' : ''}{row.dif}</Text></View>)}</Card>
      <Card style={styles.matches}><View style={styles.cardHead}><IconTile name="calendar-clock"/><H2>Próximos partidos</H2><MaterialCommunityIcons name="chevron-right" color={colors.muted} size={22}/></View>{tournament.matches.slice(0,4).map(m => { const a = tournament.teams.find(t => t.id === m.team_a_id); const b = tournament.teams.find(t => t.id === m.team_b_id); return <View key={m.id} style={styles.match}><MaterialCommunityIcons name="soccer" size={22} color={colors.muted}/><View style={{flex:1}}><Text style={styles.matchTitle}>{a?.name}  vs  {b?.name}</Text><Muted>{shortDate(m.starts_at)} · {timeFromIso(m.starts_at)}</Muted></View><Button variant="secondary" onPress={() => app.go('match', { groupId: group.id, tournamentId: tournament.id, matchId: m.id })}>{m.status === 'finished' ? 'Editar' : 'Resultado'}</Button></View>; })}</Card>
      <View style={styles.stats}><Card style={styles.stat}><IconTile name="calendar"/><Text style={styles.statBig}>{tournament.matches.length}</Text><Muted>Jornadas</Muted></Card><Card style={styles.stat}><IconTile name="account-group" bg={colors.sand} color={colors.gold}/><Text style={styles.statBig}>{tournament.teams.length}</Text><Muted>Equipos</Muted></Card><Card style={styles.stat}><IconTile name="scoreboard-outline" bg={colors.lavender} color={colors.indigo}/><Text style={styles.statBig}>{tournament.matches.filter(m => m.status === 'finished').length}</Text><Muted>Resultados</Muted></Card></View>
      <Button icon="plus" onPress={() => app.createStarterTournament(group.id)}>Crear torneo</Button>
    </>}
  </Screen>;
}

const styles = StyleSheet.create({
  segment: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  table: { padding: 16, marginBottom: 16 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  tableHeader: { flexDirection: 'row', paddingBottom: 8 },
  th: { width: 34, color: colors.muted, fontWeight: '800', fontSize: 12, textAlign: 'center' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderTopWidth: 1, borderTopColor: colors.line },
  rank: { width: 24, color: colors.ink, fontWeight: '700' },
  teamDot: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
  team: { fontFamily: fonts.body, color: colors.ink, fontWeight: '800' },
  td: { width: 34, textAlign: 'center', color: colors.ink, fontWeight: '800' },
  matches: { padding: 16, marginBottom: 16 },
  match: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.line },
  matchTitle: { color: colors.ink, fontWeight: '800', fontSize: 16 },
  stats: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  stat: { flex: 1, padding: 14 },
  statBig: { fontSize: 24, fontWeight: '900', color: colors.ink, marginTop: 8 }
});
