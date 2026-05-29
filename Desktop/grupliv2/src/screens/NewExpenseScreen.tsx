import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Avatar, Button, Card, EmptyState, H2, Input, Muted, Pill, Screen, TopBar } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors, fonts } from '../theme/tokens';
import { euros } from '../utils/money';

export function NewExpenseScreen() {
  const app = useApp();
  const group = app.getGroup(app.nav.params?.groupId);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(app.user?.id || '');
  const [category, setCategory] = useState<'venue'|'food'|'gear'|'other'>('venue');
  const [participants, setParticipants] = useState<string[]>(group?.members.map(m => m.profile_id) || []);
  if (!group) return <Screen><EmptyState title="Sin grupo" text="Selecciona un grupo primero." /></Screen>;
  const numeric = Number(amount.replace(',', '.')) || 0;
  const share = participants.length ? numeric / participants.length : 0;
  const toggle = (id: string) => setParticipants(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  return <Screen>
    <TopBar back onBack={app.back} title="Nuevo gasto" />
    <View style={styles.segment}><Pill selected icon="receipt-text-outline">Gasto</Pill><Pill selected={false} icon="account-cash-outline">Saldo</Pill></View>
    <Card style={styles.form}>
      <Input label="Concepto" value={title} onChangeText={setTitle} placeholder="Reserva pista" />
      <Input label="Importe" value={amount} onChangeText={setAmount} placeholder="40" keyboardType="decimal-pad" />
      <Muted style={{ marginBottom: 8 }}>Pagó</Muted>
      <View style={styles.people}>{group.members.map(m => <Pill key={m.profile_id} selected={paidBy === m.profile_id} onPress={() => setPaidBy(m.profile_id)}>{m.profile.full_name.split(' ')[0]}</Pill>)}</View>
      <Muted style={{ marginTop: 16, marginBottom: 8 }}>Categoría</Muted>
      <View style={styles.people}>{(['venue','food','gear','other'] as any[]).map(c => <Pill key={c} selected={category === c} onPress={() => setCategory(c)}>{c === 'venue' ? 'Pista' : c === 'food' ? 'Comida' : c === 'gear' ? 'Material' : 'Otro'}</Pill>)}</View>
      <Muted style={{ marginTop: 16, marginBottom: 8 }}>Repartir entre</Muted>
      <View style={styles.people}>{group.members.map(m => <Pill key={m.profile_id} selected={participants.includes(m.profile_id)} onPress={() => toggle(m.profile_id)}>{m.profile.full_name.split(' ')[0]}</Pill>)}</View>
    </Card>
    <Card style={styles.summary}><View style={styles.summaryTop}><H2>Resumen del reparto</H2><View style={styles.ok}><Text style={styles.okText}>Equitativo</Text></View></View><Text style={styles.share}>{euros(share)} <Text style={styles.shareSmall}>por persona</Text></Text><Muted>Total {euros(numeric)}</Muted>{group.members.filter(m => participants.includes(m.profile_id)).slice(0,5).map(m => <View key={m.profile_id} style={styles.row}><View style={styles.rowPerson}><Avatar name={m.profile.full_name} size={28}/><Text style={styles.rowName}>{m.profile.full_name}</Text></View><Text style={styles.rowMoney}>{euros(share)}</Text></View>)}</Card>
    <Button disabled={app.busy || !title || !numeric || !participants.length} onPress={() => app.createExpense({ groupId: group.id, title, amount: numeric, paidBy, participantIds: participants, category })}>Guardar gasto</Button>
  </Screen>;
}

const styles = StyleSheet.create({
  segment: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  form: { padding: 16, marginBottom: 16 },
  people: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  summary: { padding: 18, marginBottom: 16, backgroundColor: '#F5FBF8' },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ok: { backgroundColor: colors.mint, borderWidth: 1, borderColor: 'rgba(0,93,91,0.2)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  okText: { color: colors.teal, fontWeight: '900' },
  share: { marginTop: 14, fontFamily: fonts.body, color: colors.ink, fontSize: 25, fontWeight: '900' },
  shareSmall: { fontSize: 18, fontWeight: '500' },
  row: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowPerson: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowName: { color: colors.ink, fontWeight: '700' },
  rowMoney: { color: colors.ink, fontWeight: '900' }
});
