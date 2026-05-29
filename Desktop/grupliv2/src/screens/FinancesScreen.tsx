import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Button, Card, EmptyState, H2, IconTile, Muted, Screen, TopBar } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors, fonts } from '../theme/tokens';
import { computeBalances, euros, memberName, settlementSuggestions } from '../utils/money';
import { shortDate, timeFromIso } from '../utils/date';

export function FinancesScreen() {
  const app = useApp();
  const group = app.getGroup(app.nav.params?.groupId);
  if (!group) return <Screen><EmptyState title="Sin grupo" text="Selecciona un grupo primero." /></Screen>;
  const balances = computeBalances(group);
  const mine = app.user ? balances[app.user.id] || 0 : 0;
  const theyOwe = Object.entries(balances).filter(([id, v]) => id !== app.user?.id && v < 0).reduce((s, [, v]) => s + Math.abs(v), 0);
  const iOwe = Math.max(0, -mine);
  const totalSpent = group.expenses.reduce((s, e) => s + e.amount, 0);
  const pending = settlementSuggestions(group).reduce((s, x) => s + x.amount, 0);
  return <Screen>
    <TopBar title="Finanzas" subtitle="Cuentas claras del grupo" />
    <Card style={styles.balanceCard}>
      <Muted>Tu balance</Muted><Text style={styles.balance}>{euros(mine)}</Text>
      <View style={styles.spark}/>
      <View style={styles.balanceGrid}><View style={styles.balanceMini}><IconTile name="arrow-up" size={40} bg={colors.mint}/><View><Muted>Te deben</Muted><Text style={styles.miniText}>{euros(theyOwe)}</Text></View></View><View style={styles.balanceMini}><IconTile name="arrow-down" size={40} bg={colors.sand} color={colors.amber}/><View><Muted>Debes</Muted><Text style={styles.miniText}>{euros(iOwe)}</Text></View></View></View>
    </Card>
    <View style={styles.stats}><Card style={styles.stat}><IconTile name="receipt-text-outline" bg={colors.mint}/><Muted>Total gastado</Muted><Text style={styles.statValue}>{euros(totalSpent)}</Text></Card><Card style={styles.stat}><IconTile name="clock-outline" bg={colors.sand} color={colors.gold}/><Muted>Pendiente</Muted><Text style={styles.statValue}>{euros(pending)}</Text></Card><Card style={styles.stat}><IconTile name="check" bg={colors.lavender} color={colors.indigo}/><Muted>Pagado</Muted><Text style={styles.statValue}>{euros(group.settlements.filter(s => s.status === 'paid').reduce((a,b)=>a+b.amount,0))}</Text></Card></View>
    <View style={styles.sectionHead}><H2>Movimientos</H2><Muted>Ver todos ›</Muted></View>
    <Card style={styles.movements}>{group.expenses.slice(0,5).map((e, i) => <View key={e.id} style={[styles.movement, i ? { borderTopWidth: 1, borderTopColor: colors.line } : null]}><IconTile name={e.category === 'food' ? 'food-outline' : e.category === 'gear' ? 'tennis-ball' : 'calendar-check'} bg={colors.sand} color={colors.gold}/><View style={{ flex: 1 }}><Text style={styles.moveTitle}>{e.title}</Text><Muted>Pagado por {memberName(group.members, e.paid_by)} · {e.participant_ids.length || group.members.length} participantes</Muted></View><View style={{ alignItems: 'flex-end' }}><Text style={styles.amount}>- {euros(e.amount)}</Text><Muted>{shortDate(e.paid_at)}, {timeFromIso(e.paid_at)}</Muted></View></View>)}{group.expenses.length === 0 ? <Muted>No hay gastos todavía.</Muted> : null}</Card>
    <View style={styles.sectionHead}><H2>Para saldar cuentas</H2><Muted>Ver todas ›</Muted></View>
    <Card style={styles.movements}>{settlementSuggestions(group).slice(0,4).map((s, i) => <View key={`${s.fromId}-${s.toId}`} style={[styles.settle, i ? { borderTopWidth: 1, borderTopColor: colors.line } : null]}><Avatar name={memberName(group.members, s.fromId)} size={32}/><MaterialCommunityIcons name="arrow-right" color={colors.muted} size={18}/><Avatar name={memberName(group.members, s.toId)} size={32}/><Text style={styles.settleText}>{memberName(group.members, s.fromId)} paga {euros(s.amount)} a {memberName(group.members, s.toId)}</Text></View>)}{settlementSuggestions(group).length === 0 ? <Muted>No hay deudas pendientes.</Muted> : null}</Card>
    <Button icon="plus" onPress={() => app.go('newExpense', { groupId: group.id })} style={{ marginTop: 16 }}>Nuevo gasto</Button>
  </Screen>;
}

const styles = StyleSheet.create({
  balanceCard: { padding: 22, backgroundColor: '#EDF9F4', marginBottom: 14 },
  balance: { fontFamily: fonts.display, color: colors.teal, fontSize: 52, lineHeight: 58, marginTop: 8 },
  spark: { height: 1, backgroundColor: colors.teal, opacity: 0.2, marginVertical: 16 },
  balanceGrid: { flexDirection: 'row', gap: 10 },
  balanceMini: { flex: 1, flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)', padding: 12, borderRadius: 18 },
  miniText: { fontFamily: fonts.body, color: colors.ink, fontSize: 18, fontWeight: '900' },
  stats: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, padding: 14, minHeight: 122 },
  statValue: { fontFamily: fonts.body, color: colors.ink, fontSize: 18, fontWeight: '900', marginTop: 5 },
  sectionHead: { marginTop: 22, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  movements: { padding: 14 },
  movement: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 12 },
  moveTitle: { fontFamily: fonts.display, color: colors.ink, fontSize: 21 },
  amount: { fontFamily: fonts.body, color: colors.ink, fontSize: 18, fontWeight: '900' },
  settle: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 11 },
  settleText: { flex: 1, color: colors.ink, fontWeight: '700' }
});
