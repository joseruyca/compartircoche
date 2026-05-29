import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fonts, shadow } from '../theme/tokens';
import { ScreenName } from '../domain/types';

type Tab = { key: ScreenName; label: string; icon: any; activeIcon?: any };
const tabs: Tab[] = [
  { key: 'groups', label: 'Inicio', icon: 'home-outline', activeIcon: 'home' },
  { key: 'calendar', label: 'Calendario', icon: 'calendar-blank-outline', activeIcon: 'calendar-blank' },
  { key: 'finances', label: 'Finanzas', icon: 'chart-pie', activeIcon: 'chart-pie' },
  { key: 'tournaments', label: 'Torneos', icon: 'trophy-outline', activeIcon: 'trophy' },
  { key: 'profile', label: 'Perfil', icon: 'account-outline', activeIcon: 'account' }
];

export function BottomTabs({ active, onPress }: { active: ScreenName; onPress: (key: ScreenName) => void }) {
  return <View style={styles.wrap}>{tabs.map(tab => {
    const selected = active === tab.key || (active === 'groupHome' && tab.key === 'groups') || (active === 'members' && tab.key === 'groups');
    return <TouchableOpacity key={tab.key} onPress={() => onPress(tab.key)} activeOpacity={0.72} style={styles.tab}>
      <MaterialCommunityIcons name={selected ? (tab.activeIcon || tab.icon) : tab.icon} size={26} color={selected ? colors.navy : colors.faint}/>
      <Text style={[styles.label, { color: selected ? colors.navy : colors.muted, fontWeight: selected ? '900' : '600' }]}>{tab.label}</Text>
      {selected ? <View style={styles.activeLine}/> : <View style={styles.placeholder}/>} 
    </TouchableOpacity>;
  })}</View>;
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 90, backgroundColor: 'rgba(255,253,248,0.97)', borderTopWidth: 1, borderTopColor: colors.line, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 12, ...shadow.soft },
  tab: { alignItems: 'center', justifyContent: 'center', minWidth: 64, gap: 4 },
  label: { fontFamily: fonts.body, fontSize: 12 },
  activeLine: { width: 30, height: 3, borderRadius: 3, backgroundColor: colors.navy, marginTop: 3 },
  placeholder: { width: 30, height: 3, marginTop: 3 }
});
