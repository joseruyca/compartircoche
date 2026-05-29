import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AvatarStack, Button, Card, EmptyState, H2, IconTile, Input, Muted, Screen, TopBar } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors, fonts } from '../theme/tokens';
import { euros, computeBalances } from '../utils/money';
import { shortDate, timeFromIso } from '../utils/date';

export function GroupsScreen() {
  const app = useApp();
  const [code, setCode] = useState('');
  const totalEvents = app.groups.reduce((s, g) => s + g.events.length, 0);
  const totalMembers = app.groups.reduce((s, g) => s + g.members.length, 0);

  return <Screen>
    <TopBar title="Mis grupos" subtitle="Todo organizado sin chats infinitos." />

    <View style={styles.summaryRow}>
      <Card style={styles.summaryCard}><Text style={styles.summaryNumber}>{app.groups.length}</Text><Muted>Grupos</Muted></Card>
      <Card style={styles.summaryCard}><Text style={styles.summaryNumber}>{totalEvents}</Text><Muted>Quedadas</Muted></Card>
      <Card style={styles.summaryCard}><Text style={styles.summaryNumber}>{totalMembers}</Text><Muted>Miembros</Muted></Card>
    </View>

    {app.groups.length === 0 ? <>
      <EmptyState icon="account-group-outline" title="Crea tu primer grupo" text="Organiza quedadas, asistencia, cuentas y torneos desde una app pensada para grupos reales." action="Crear grupo" onAction={() => app.go('createGroup')} />
      <Card style={styles.joinCard}>
        <H2>Unirme con código</H2>
        <Muted style={{ marginTop: 6 }}>Pega el código de invitación que te hayan pasado.</Muted>
        <Input label="Código" value={code} onChangeText={setCode} placeholder="AB12CD34" />
        <Button variant="secondary" disabled={!code} onPress={() => app.joinGroup(code)}>Unirme al grupo</Button>
      </Card>
    </> : <>
      <View style={styles.actions}><Button icon="plus" onPress={() => app.go('createGroup')} style={{ flex: 1 }}>Crear grupo</Button><Button variant="secondary" icon="refresh" onPress={app.refresh}>Actualizar</Button></View>
      <Card style={styles.joinCard}>
        <Input label="Código de invitación" value={code} onChangeText={setCode} placeholder="AB12CD34" />
        <Button variant="secondary" disabled={!code} onPress={() => app.joinGroup(code)}>Unirme</Button>
      </Card>
      {app.groups.map(group => {
        const next = group.events[0];
        const balances = computeBalances(group);
        const total = Object.values(balances).reduce((s, v) => s + Math.max(0, v), 0);
        return <Card key={group.id} pressable onPress={() => app.go('groupHome', { groupId: group.id })} style={styles.groupCard}>
          <View style={[styles.groupIcon, { backgroundColor: group.color || colors.teal }]}><MaterialCommunityIcons name={group.kind === 'cards' ? 'cards-playing' : group.kind === 'sport' ? 'tennis' : 'calendar-star'} color={colors.white} size={34}/></View>
          <View style={{ flex: 1 }}>
            <View style={styles.groupTop}><H2>{group.name}</H2><MaterialCommunityIcons name="chevron-right" color={colors.muted} size={24}/></View>
            <Muted>{group.activity} · {group.members.length} miembros</Muted>
            <View style={styles.metaRow}>
              <View style={styles.meta}><MaterialCommunityIcons name="calendar" color={colors.teal} size={17}/><Text style={styles.metaText}>{next ? `${shortDate(next.starts_at)} · ${timeFromIso(next.starts_at)}` : 'Sin quedadas'}</Text></View>
              <View style={styles.meta}><MaterialCommunityIcons name="wallet-outline" color={colors.gold} size={17}/><Text style={styles.metaText}>{euros(total)}</Text></View>
            </View>
            <AvatarStack names={group.members.map(m => m.profile.full_name)} extra={Math.max(0, group.members.length - 4)} />
          </View>
        </Card>;
      })}
    </>}
  </Screen>;
}

const styles = StyleSheet.create({
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  summaryCard: { flex: 1, padding: 14, minHeight: 94, justifyContent: 'center' },
  summaryNumber: { fontFamily: fonts.display, color: colors.ink, fontSize: 35, lineHeight: 39 },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  joinCard: { padding: 16, marginBottom: 16 },
  groupCard: { padding: 16, marginBottom: 14, flexDirection: 'row', gap: 15 },
  groupIcon: { width: 78, height: 78, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  groupTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaRow: { flexDirection: 'row', gap: 10, marginTop: 12, marginBottom: 12, flexWrap: 'wrap' },
  meta: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: colors.cardAlt, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99 },
  metaText: { fontFamily: fonts.body, color: colors.ink, fontSize: 12, fontWeight: '800' }
});
