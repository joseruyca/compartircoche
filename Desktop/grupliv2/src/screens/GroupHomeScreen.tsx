import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AvatarStack, Body, Card, EmptyState, H2, IconTile, Muted, RoundIcon, Screen } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors, fonts } from '../theme/tokens';
import { computeBalances, euros } from '../utils/money';
import { shortDate, timeFromIso } from '../utils/date';

export function GroupHomeScreen() {
  const app = useApp();
  const group = app.getGroup(app.nav.params?.groupId);
  if (!group) return <Screen><EmptyState title="Grupo no encontrado" text="Vuelve a inicio y selecciona un grupo." onAction={() => app.reset('groups')} action="Ir a inicio" /></Screen>;
  const next = group.events[0];
  const confirmed = next ? Object.values(next.attendance).filter(v => v === 'going').length : 0;
  const balances = computeBalances(group);
  const myBalance = app.user ? balances[app.user.id] || 0 : 0;
  const cards = [
    { title: 'Calendario', text: 'Ver próximos eventos', icon: 'calendar-blank-outline', bg: colors.mint, color: colors.teal, route: 'calendar' },
    { title: 'Asistencia', text: 'Confirmar asistencia', icon: 'account-check-outline', bg: colors.sand, color: colors.gold, route: 'event' },
    { title: 'Finanzas', text: 'Gastos y balance', icon: 'chart-pie', bg: colors.lavender, color: colors.indigo, route: 'finances' },
    { title: 'Torneos', text: 'Ver torneos del grupo', icon: 'trophy-outline', bg: colors.sand, color: colors.gold, route: 'tournaments' },
    { title: 'Miembros', text: `${group.members.length} miembros del grupo`, icon: 'account-group-outline', bg: colors.lavender, color: colors.indigo, route: 'members' }
  ];
  return <Screen padded={false}>
    <View style={[styles.hero, { backgroundColor: group.accent || colors.mint }]}>
      <View style={styles.heroTop}><RoundIcon name="chevron-left" onPress={() => app.reset('groups')} bg="rgba(255,255,255,0.75)"/><View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}><MaterialCommunityIcons name="bell-outline" size={25} color={colors.ink}/><AvatarStack names={group.members.map(m => m.profile.full_name)} /></View></View>
      <View style={styles.heroContent}><View style={[styles.groupIcon, { backgroundColor: group.color }]}><MaterialCommunityIcons name={group.kind === 'cards' ? 'cards-playing' : group.kind === 'sport' ? 'tennis' : 'calendar-star'} color={colors.white} size={44}/></View><View style={{ flex: 1 }}><Text style={styles.heroTitle}>{group.name}</Text><View style={styles.badge}><Text style={styles.badgeText}>{group.activity}</Text></View><Muted style={{ marginTop: 6 }}><MaterialCommunityIcons name="map-marker-outline"/> {group.location || 'Sin ubicación'}</Muted></View></View>
    </View>
    <View style={styles.body}>
      <View style={styles.stats}>
        <Card style={styles.stat}><IconTile name="calendar" size={42}/><Muted>Próxima quedada</Muted><Body style={styles.statValue}>{next ? `${shortDate(next.starts_at)} · ${timeFromIso(next.starts_at)}` : 'Sin fecha'}</Body></Card>
        <Card style={styles.stat}><IconTile name="account-group" bg={colors.sand} color={colors.gold} size={42}/><Muted>Confirmados</Muted><Body style={styles.statValue}>{confirmed}/{group.members.length}</Body></Card>
        <Card style={styles.stat}><IconTile name="wallet-outline" bg={colors.lavender} color={colors.indigo} size={42}/><Muted>Balance</Muted><Body style={styles.statValue}>{euros(myBalance)}</Body></Card>
      </View>
      <View style={styles.grid}>{cards.map(card => <Card key={card.title} pressable onPress={() => app.go(card.route as any, { groupId: group.id, eventId: next?.id })} style={card.route === 'tournaments' || card.route === 'members' ? styles.tileWide : styles.tile}><IconTile name={card.icon} bg={card.bg} color={card.color}/><H2 style={{ marginTop: 14 }}>{card.title}</H2><Muted>{card.text}</Muted></Card>)}</View>
      <View style={styles.sectionHead}><H2>Actividad reciente</H2><Muted>Ver todo ›</Muted></View>
      <Card style={styles.activity}>{group.expenses.slice(0,3).map((e, i) => <View key={e.id} style={[styles.activityRow, i ? { borderTopWidth: 1, borderTopColor: colors.line } : null]}><IconTile name="receipt-text-outline" bg={colors.sand} color={colors.gold}/><View style={{ flex: 1 }}><Body>{e.title}</Body><Muted>{euros(e.amount)}</Muted></View><Muted>{shortDate(e.paid_at)}</Muted></View>)}{group.expenses.length === 0 ? <Muted>No hay actividad todavía.</Muted> : null}</Card>
    </View>
  </Screen>;
}

const styles = StyleSheet.create({
  hero: { minHeight: 305, paddingHorizontal: 24, paddingTop: 18, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroContent: { flexDirection: 'row', gap: 20, alignItems: 'center', marginTop: 34 },
  groupIcon: { width: 108, height: 108, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontFamily: fonts.display, color: colors.ink, fontSize: 40, lineHeight: 46 },
  badge: { alignSelf: 'flex-start', marginTop: 8, backgroundColor: colors.mint, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  badgeText: { color: colors.teal, fontWeight: '900' },
  body: { paddingHorizontal: 24, marginTop: -38, paddingBottom: 20 },
  stats: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  stat: { flex: 1, padding: 14, minHeight: 132 },
  statValue: { fontWeight: '900', marginTop: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { width: '48%', padding: 17, minHeight: 158 },
  tileWide: { width: '48%', padding: 17, minHeight: 122 },
  sectionHead: { marginTop: 24, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activity: { padding: 14 },
  activityRow: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 12 }
});
