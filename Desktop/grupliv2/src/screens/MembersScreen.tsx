import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Button, Card, EmptyState, H2, Muted, Screen, TopBar } from '../components/ui';
import { useApp } from '../context/AppContext';
import { attendanceAverage, computeBalances, euros } from '../utils/money';
import { colors, fonts } from '../theme/tokens';

export function MembersScreen() {
  const app = useApp();
  const group = app.getGroup(app.nav.params?.groupId);
  if (!group) return <Screen><EmptyState title="Sin grupo" text="Selecciona un grupo primero." /></Screen>;
  const balances = computeBalances(group);
  return <Screen>
    <TopBar back onBack={() => app.go('groupHome', { groupId: group.id })} title="Miembros" subtitle={`${group.name} · ${group.members.length} miembros`} />
    <View style={styles.actions}><Button icon="account-plus-outline" style={{ flex: 1 }}>Invitar</Button><Button variant="secondary" icon="qrcode" style={{ flex: 1 }}>Código</Button></View>
    <Card style={styles.code}><Muted>Código de invitación</Muted><Text style={styles.codeText}>{group.invite_code}</Text></Card>
    <Card style={styles.list}>{group.members.map((m, i) => {
      const balance = balances[m.profile_id] || 0;
      return <View key={m.profile_id} style={[styles.member, i ? { borderTopWidth: 1, borderTopColor: colors.line } : null]}><Avatar name={m.profile.full_name} size={54}/><View style={{ flex: 1 }}><View style={styles.nameRow}><Text style={styles.name}>{m.profile.full_name}</Text><View style={styles.role}><Text style={styles.roleText}>{m.role === 'owner' ? 'Owner' : m.role === 'admin' ? 'Admin' : 'Miembro'}</Text></View></View><Muted>{balance >= 0 ? 'Balance individual' : 'Debe'} · {euros(balance)} · Asistencia {attendanceAverage(group, m.profile_id)}%</Muted></View><MaterialCommunityIcons name="chevron-right" size={23} color={colors.muted}/></View>;
    })}</Card>
    <Card style={styles.settings}><H2>Ajustes del grupo</H2>{['Editar grupo','Privacidad','Notificaciones'].map((x, i) => <View key={x} style={[styles.setting, i ? { borderTopWidth: 1, borderTopColor: colors.line } : null]}><MaterialCommunityIcons name={i===0?'pencil-outline':i===1?'lock-outline':'bell-outline'} size={24} color={colors.muted}/><View style={{ flex: 1 }}><Text style={styles.settingTitle}>{x}</Text><Muted>{i===0?'Nombre, foto y descripción':i===1?'Solo miembros pueden ver el grupo':'Gestionar alertas y recordatorios'}</Muted></View><MaterialCommunityIcons name="chevron-right" size={23} color={colors.muted}/></View>)}</Card>
  </Screen>;
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  code: { padding: 18, marginBottom: 16, backgroundColor: colors.mint },
  codeText: { fontFamily: fonts.display, fontSize: 34, color: colors.teal, marginTop: 4 },
  list: { paddingHorizontal: 16, marginBottom: 16 },
  member: { flexDirection: 'row', gap: 14, alignItems: 'center', paddingVertical: 14 },
  nameRow: { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  name: { fontFamily: fonts.display, color: colors.ink, fontSize: 24 },
  role: { backgroundColor: colors.mint, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 4 },
  roleText: { color: colors.teal, fontWeight: '900', fontSize: 12 },
  settings: { padding: 16 },
  setting: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  settingTitle: { color: colors.ink, fontWeight: '800', fontSize: 16 }
});
