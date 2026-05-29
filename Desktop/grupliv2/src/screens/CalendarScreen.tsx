import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AvatarStack, Button, Card, EmptyState, H2, IconTile, Muted, RoundIcon, Screen, TopBar } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors, fonts, weekLabels } from '../theme/tokens';
import { buildMonthGrid, dateKey, monthName, timeFromIso } from '../utils/date';

export function CalendarScreen() {
  const app = useApp();
  const group = app.getGroup(app.nav.params?.groupId);
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState(dateKey(new Date()));
  const cells = useMemo(() => buildMonthGrid(month), [month]);
  if (!group) return <Screen><EmptyState title="Sin grupo" text="Selecciona un grupo primero." /></Screen>;
  const events = group.events.filter(e => dateKey(new Date(e.starts_at)) === selected);
  const eventsByDay = new Set(group.events.map(e => dateKey(new Date(e.starts_at))));
  const changeMonth = (delta: number) => setMonth(d => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  return <Screen>
    <TopBar back onBack={() => app.go('groupHome', { groupId: group.id })} title="Calendario" subtitle={group.name} right={<AvatarStack names={group.members.map(m => m.profile.full_name)} extra={Math.max(0, group.members.length - 4)}/>} />
    <Card style={styles.monthCard}>
      <View style={styles.monthNav}><RoundIcon name="chevron-left" onPress={() => changeMonth(-1)} size={48}/><Text style={styles.monthTitle}>{monthName(month)}</Text><RoundIcon name="chevron-right" onPress={() => changeMonth(1)} size={48}/></View>
      <View style={styles.weekRow}>{weekLabels.map(d => <Text key={d} style={styles.week}>{d.toUpperCase()}</Text>)}</View>
      <View style={styles.grid}>{cells.map((cell, i) => {
        const key = dateKey(cell.date);
        const active = key === selected;
        const has = eventsByDay.has(key);
        return <TouchableOpacity key={`${key}-${i}`} onPress={() => setSelected(key)} style={[styles.day, active ? styles.dayActive : null]}><Text style={[styles.dayText, !cell.inMonth ? styles.dayMuted : null, active ? styles.dayTextActive : null]}>{cell.label}</Text>{has ? <View style={[styles.dot, active ? { backgroundColor: colors.white } : null]}/> : null}</TouchableOpacity>;
      })}</View>
    </Card>
    <View style={styles.section}><IconTile name="calendar-text-outline"/><View><H2>Eventos del día</H2><Muted>{selected.split('-').reverse().join('/')}</Muted></View></View>
    {events.map(event => <Card key={event.id} pressable onPress={() => app.go('event', { groupId: group.id, eventId: event.id })} style={styles.eventCard}><View style={[styles.eventIcon, { backgroundColor: group.color }]}><MaterialCommunityIcons name="calendar-check" color={colors.white} size={30}/></View><View style={{ flex: 1 }}><H2>{event.title}</H2><View style={styles.eventMeta}><Muted><MaterialCommunityIcons name="clock-outline"/> {timeFromIso(event.starts_at)}</Muted><Muted><MaterialCommunityIcons name="map-marker-outline"/> {event.location || group.location}</Muted></View></View><MaterialCommunityIcons name="chevron-right" size={24} color={colors.muted}/></Card>)}
    {events.length === 0 ? <EmptyState title="Día libre" text="No hay quedadas en este día." /> : null}
    <Button icon="plus" disabled={app.busy} onPress={() => app.createEvent(group.id, selected)}>Nueva quedada</Button>
  </Screen>;
}

const styles = StyleSheet.create({
  monthCard: { padding: 18, marginBottom: 22 },
  monthNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  monthTitle: { fontFamily: fonts.body, color: colors.ink, fontWeight: '900', fontSize: 22 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  week: { width: `${100/7}%`, textAlign: 'center', color: colors.muted, fontSize: 12, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  day: { width: `${100/7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
  dayActive: { backgroundColor: colors.teal },
  dayText: { fontFamily: fonts.body, fontSize: 19, color: colors.ink, fontWeight: '700' },
  dayMuted: { color: colors.faint },
  dayTextActive: { color: colors.white },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.teal, marginTop: 5 },
  section: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 12 },
  eventCard: { flexDirection: 'row', gap: 14, alignItems: 'center', padding: 14, marginBottom: 12 },
  eventIcon: { width: 72, height: 72, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  eventMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 }
});
