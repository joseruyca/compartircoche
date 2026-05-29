import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Card, Input, Muted, Pill, Screen, TopBar } from '../components/ui';
import { useApp } from '../context/AppContext';
import { GroupKind, GroupPrivacy } from '../domain/types';
import { colors, fonts, weekLabels } from '../theme/tokens';

export function CreateGroupScreen() {
  const app = useApp();
  const [kind, setKind] = useState<GroupKind>('sport');
  const [privacy, setPrivacy] = useState<GroupPrivacy>('private');
  const [name, setName] = useState('');
  const [activity, setActivity] = useState('');
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('20:00');
  const [days, setDays] = useState<number[]>([2,4]);
  const toggleDay = (i: number) => setDays(prev => prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i].sort());

  return <Screen>
    <TopBar back onBack={app.back} title="Crear grupo" subtitle="Empieza una nueva rutina" />
    <View style={styles.segment}><Pill selected={kind === 'sport'} icon="tennis" onPress={() => setKind('sport')}>Deporte</Pill><Pill selected={kind === 'cards'} icon="cards-playing" onPress={() => setKind('cards')}>Cartas</Pill><Pill selected={kind === 'other'} icon="dots-horizontal-circle-outline" onPress={() => setKind('other')}>Otro</Pill></View>
    <Card style={styles.form}>
      <View style={styles.row}><MaterialCommunityIcons name="account-group-outline" size={25} color={colors.muted}/><View style={{ flex: 1 }}><Input label="Nombre del grupo" value={name} onChangeText={setName} placeholder="Pádel Miércoles" /></View></View>
      <View style={styles.row}><MaterialCommunityIcons name="tennis" size={25} color={colors.muted}/><View style={{ flex: 1 }}><Input label="Tipo de actividad" value={activity} onChangeText={setActivity} placeholder="Pádel, poker, fútbol sala..." /></View></View>
      <View style={styles.daysBlock}><Text style={styles.blockLabel}>Días habituales</Text><View style={styles.days}>{weekLabels.map((d, i) => <Pill key={d} selected={days.includes(i)} onPress={() => toggleDay(i)} style={{ minWidth: 49, paddingHorizontal: 12 }}>{d}</Pill>)}</View></View>
      <View style={styles.row}><MaterialCommunityIcons name="clock-outline" size={25} color={colors.muted}/><View style={{ flex: 1 }}><Input label="Hora" value={time} onChangeText={setTime} placeholder="20:00" /></View></View>
      <View style={styles.row}><MaterialCommunityIcons name="map-marker-outline" size={25} color={colors.muted}/><View style={{ flex: 1 }}><Input label="Ubicación" value={location} onChangeText={setLocation} placeholder="Club Las Arenas" /></View></View>
      <View style={styles.privacyRow}><View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1 }}><MaterialCommunityIcons name="lock-outline" size={25} color={colors.muted}/><Text style={styles.blockLabel}>Privacidad</Text></View><View style={styles.privacyBtns}><Pill selected={privacy === 'public'} onPress={() => setPrivacy('public')}>Público</Pill><Pill selected={privacy === 'private'} onPress={() => setPrivacy('private')}>Privado</Pill></View></View>
    </Card>
    <Card style={styles.invite}>
      <View style={styles.inviteIcon}><MaterialCommunityIcons name="account-plus-outline" color={colors.teal} size={26}/></View>
      <View style={{ flex: 1 }}><Text style={styles.inviteTitle}>Invitar miembros</Text><Muted>Al crear el grupo se generará un código único para compartirlo.</Muted></View>
    </Card>
    <Button disabled={app.busy || !name || !activity} onPress={() => app.createGroup({ name, kind, activity, location, privacy, usual_days: days, usual_time: time })}>{app.busy ? 'Creando...' : 'Crear grupo'}</Button>
  </Screen>;
}

const styles = StyleSheet.create({
  segment: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginBottom: 16 },
  form: { padding: 16, marginBottom: 16 },
  row: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: colors.line, paddingTop: 2 },
  daysBlock: { borderBottomWidth: 1, borderBottomColor: colors.line, paddingVertical: 14 },
  blockLabel: { fontFamily: fonts.body, color: colors.muted, fontSize: 14, fontWeight: '800' },
  days: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  privacyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 14 },
  privacyBtns: { flexDirection: 'row', gap: 8 },
  invite: { padding: 18, backgroundColor: colors.mint, marginBottom: 16, flexDirection: 'row', gap: 14, alignItems: 'center' },
  inviteIcon: { width: 58, height: 58, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center' },
  inviteTitle: { fontFamily: fonts.body, color: colors.ink, fontSize: 18, fontWeight: '900', marginBottom: 4 }
});
