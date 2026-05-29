import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, AvatarStack, Card, EmptyState, H2, IconTile, Muted, Pill, Screen, TopBar } from '../components/ui';
import { useApp } from '../context/AppContext';
import { AttendanceStatus } from '../domain/types';
import { colors, fonts } from '../theme/tokens';
import { timeFromIso, weekdayLabel } from '../utils/date';

const statusLabel: Record<AttendanceStatus, string> = { going: 'Voy', maybe: 'Duda', no: 'No voy', pending: 'Pendiente' };
const statusColor: Record<AttendanceStatus, string> = { going: colors.green, maybe: colors.amber, no: colors.red, pending: colors.muted };

export function EventScreen() {
  const app = useApp();
  const group = app.getGroup(app.nav.params?.groupId);
  const event = group?.events.find(e => e.id === app.nav.params?.eventId) || group?.events[0];
  if (!group || !event) return <Screen><EmptyState title="No hay quedada" text="Crea una quedada desde el calendario." /></Screen>;
  const counts = { going: 0, maybe: 0, no: 0 };
  Object.values(event.attendance).forEach((s: any) => { if (counts[s as 'going'] !== undefined) counts[s as 'going']++; });
  const choose = (status: AttendanceStatus) => app.setAttendance(group.id, event.id, status);
  return <Screen>
    <TopBar back onBack={app.back} title={event.title} subtitle={`${weekdayLabel(event.starts_at)} · ${timeFromIso(event.starts_at)} · ${event.location || group.location || ''}`} />
    <Card style={styles.attendance}>
      <H2>Asistencia</H2>
      <AvatarStack names={group.members.map(m => m.profile.full_name)} extra={Math.max(0, group.members.length - 4)} />
      <View style={styles.counts}><View><Text style={[styles.count, { color: colors.green }]}>{counts.going}</Text><Muted>asistirán</Muted></View><View style={styles.divider}/><View><Text style={[styles.count, { color: colors.amber }]}>{counts.maybe}</Text><Muted>duda</Muted></View><View style={styles.divider}/><View><Text style={[styles.count, { color: colors.red }]}>{counts.no}</Text><Muted>no</Muted></View></View>
    </Card>
    <View style={styles.options}><Card pressable onPress={() => choose('going')} style={[styles.option, { backgroundColor: colors.mint }]}><IconTile name="check" bg={colors.green} color={colors.white}/><H2>Voy</H2><Muted>Cuenta conmigo</Muted></Card><Card pressable onPress={() => choose('maybe')} style={[styles.option, { backgroundColor: colors.sand }]}><IconTile name="help" bg={colors.sand} color={colors.amber}/><H2>Duda</H2><Muted>Aún no lo sé</Muted></Card><Card pressable onPress={() => choose('no')} style={[styles.option, { backgroundColor: colors.rose }]}><IconTile name="close" bg={colors.rose} color={colors.red}/><H2>No voy</H2><Muted>No podré ir</Muted></Card></View>
    <Card style={styles.list}><View style={styles.listHeader}><H2>Lista de asistentes</H2><MaterialCommunityIcons name="chevron-right" size={22}/></View>{group.members.map((m, i) => { const st = event.attendance[m.profile_id] || 'pending'; return <View key={m.profile_id} style={[styles.member, i ? { borderTopWidth: 1, borderTopColor: colors.line } : null]}><Avatar name={m.profile.full_name} size={34}/><Text style={styles.memberName}>{m.profile.full_name}</Text><Text style={[styles.status, { color: statusColor[st] }]}>{statusLabel[st]}</Text></View>; })}</Card>
    <Card style={styles.notes}><H2>Notas</H2>{event.notes?.length ? event.notes.map(n => <Muted key={n} style={{ marginTop: 8 }}>• {n}</Muted>) : <Muted style={{ marginTop: 8 }}>Sin notas todavía.</Muted>}</Card>
  </Screen>;
}

const styles = StyleSheet.create({
  attendance: { padding: 20, gap: 16, marginBottom: 16 },
  counts: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderWidth: 1, borderColor: colors.line, borderRadius: 20, padding: 14 },
  count: { fontFamily: fonts.body, fontSize: 26, fontWeight: '900', textAlign: 'center' },
  divider: { height: 42, width: 1, backgroundColor: colors.line },
  options: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  option: { flex: 1, minHeight: 144, padding: 14, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 18, marginBottom: 16 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  member: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  memberName: { flex: 1, fontFamily: fonts.body, color: colors.ink, fontSize: 16, fontWeight: '700' },
  status: { fontFamily: fonts.body, fontWeight: '900' },
  notes: { padding: 18 }
});
