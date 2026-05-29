import React from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fonts, radius, shadow, space } from '../theme/tokens';
import { initials } from '../utils/money';

export function AppFrame({ children }: { children: React.ReactNode }) {
  return <View style={styles.outer}><View style={styles.frame}>{children}</View></View>;
}

export function Screen({ children, scroll = true, padded = true }: { children: React.ReactNode; scroll?: boolean; padded?: boolean }) {
  const content = <View style={[styles.screenContent, padded ? null : styles.noPadding]}>{children}</View>;
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      {scroll ? <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>{content}</ScrollView> : content}
    </SafeAreaView>
  );
}

export function Display({ children, style }: any) { return <Text style={[styles.display, style]}>{children}</Text>; }
export function H1({ children, style }: any) { return <Text style={[styles.h1, style]}>{children}</Text>; }
export function H2({ children, style }: any) { return <Text style={[styles.h2, style]}>{children}</Text>; }
export function Body({ children, style }: any) { return <Text style={[styles.body, style]}>{children}</Text>; }
export function Muted({ children, style }: any) { return <Text style={[styles.muted, style]}>{children}</Text>; }
export function Caption({ children, style }: any) { return <Text style={[styles.caption, style]}>{children}</Text>; }

export function TopBar({ title, subtitle, back, onBack, right, brand = 'Grupli', compact = false }: any) {
  return (
    <View style={[styles.header, compact ? { marginBottom: 12 } : null]}>
      <View style={styles.topRow}>
        {back ? <RoundIcon name="chevron-left" onPress={onBack} /> : <Text style={styles.brand}>{brand}</Text>}
        {right || <View style={styles.headerActions}><View style={styles.bellWrap}><MaterialCommunityIcons name="bell-outline" size={25} color={colors.ink}/><View style={styles.dot}/></View><Avatar name="Jose Rubio" size={42}/></View>}
      </View>
      {title ? <Display style={compact ? styles.displayCompact : null}>{title}</Display> : null}
      {subtitle ? <Muted style={styles.subtitle}>{subtitle}</Muted> : null}
    </View>
  );
}

export function SectionHeader({ title, action, onAction, icon }: any) {
  return <View style={styles.sectionHeader}>{icon ? <IconTile name={icon} size={42}/> : null}<View style={{ flex: 1 }}><H2>{title}</H2></View>{action ? <TouchableOpacity onPress={onAction} activeOpacity={0.75}><Muted style={{ color: colors.navy, fontWeight: '800' }}>{action} ›</Muted></TouchableOpacity> : null}</View>;
}

export function RoundIcon({ name, onPress, color = colors.ink, bg = colors.card, size = 44 }: any) {
  return <TouchableOpacity onPress={onPress} activeOpacity={0.78} style={[styles.round, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}><MaterialCommunityIcons name={name} color={color} size={Math.round(size * 0.55)}/></TouchableOpacity>;
}

export function Card({ children, style, pressable, onPress }: { children: React.ReactNode; style?: ViewStyle | any; pressable?: boolean; onPress?: () => void }) {
  const content = <View style={[styles.card, style]}>{children}</View>;
  return pressable ? <Pressable onPress={onPress} style={({ pressed }) => [pressed ? styles.pressed : null]}>{content}</Pressable> : content;
}

export function GlassCard({ children, style }: any) { return <View style={[styles.glassCard, style]}>{children}</View>; }

export function IconTile({ name, bg = colors.mint, color = colors.teal, size = 48 }: any) {
  return <View style={[styles.iconTile, { backgroundColor: bg, width: size, height: size, borderRadius: Math.round(size * 0.34) }]}><MaterialCommunityIcons name={name} size={Math.round(size * 0.48)} color={color}/></View>;
}

export function Pill({ children, selected, onPress, tone = 'teal', icon, style }: any) {
  const activeBg = tone === 'navy' ? colors.navy : tone === 'gold' ? colors.gold : colors.teal;
  const bg = selected ? activeBg : colors.card;
  const fg = selected ? colors.white : colors.muted;
  return <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.pill, { backgroundColor: bg, borderColor: selected ? bg : colors.line }, style]}>{icon ? <MaterialCommunityIcons name={icon} size={17} color={fg}/> : null}<Text style={[styles.pillText, { color: fg }]} numberOfLines={1}>{children}</Text></TouchableOpacity>;
}

export function Button({ children, onPress, variant = 'primary', icon, disabled, style }: any) {
  const primary = variant === 'primary';
  const danger = variant === 'danger';
  return (
    <TouchableOpacity disabled={disabled} activeOpacity={0.82} onPress={onPress} style={[styles.button, primary ? styles.buttonPrimary : danger ? styles.buttonDanger : styles.buttonSecondary, disabled ? styles.disabled : null, style]}>
      {icon ? <MaterialCommunityIcons name={icon} size={20} color={primary || danger ? colors.white : colors.ink}/> : null}
      <Text style={[styles.buttonText, { color: primary || danger ? colors.white : colors.ink }]}>{children}</Text>
    </TouchableOpacity>
  );
}

export function Input({ label, value, onChangeText, placeholder, keyboardType = 'default', secureTextEntry = false, multiline = false }: any) {
  return <View style={styles.inputWrap}><Text style={styles.inputLabel}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.faint} keyboardType={keyboardType} secureTextEntry={secureTextEntry} multiline={multiline} autoCapitalize={keyboardType === 'email-address' ? 'none' : undefined} style={[styles.input, multiline ? styles.inputMultiline : null]}/></View>;
}

export function Avatar({ name, size = 36 }: { name?: string | null; size?: number }) {
  const palette = [colors.teal, colors.navy, colors.gold, colors.indigo, colors.coral];
  const idx = (name || 'U').split('').reduce((s, c) => s + c.charCodeAt(0), 0) % palette.length;
  return <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: palette[idx] }]}><Text style={[styles.avatarText, { fontSize: Math.max(11, size * 0.31) }]}>{initials(name).toUpperCase()}</Text></View>;
}

export function AvatarStack({ names, extra = 0 }: { names: string[]; extra?: number }) {
  const visible = names.filter(Boolean).slice(0, 4);
  return <View style={styles.avatarStack}>{visible.map((n, i) => <View key={`${n}-${i}`} style={{ marginLeft: i ? -10 : 0 }}><Avatar name={n} size={32}/></View>)}{extra > 0 ? <View style={[styles.moreAvatar, { marginLeft: visible.length ? -10 : 0 }]}><Text style={styles.moreText}>+{extra}</Text></View> : null}</View>;
}

export function EmptyState({ icon = 'folder-open-outline', title, text, action, onAction }: any) {
  return <Card style={styles.empty}><IconTile name={icon} size={64} bg={colors.mint}/><H2 style={styles.centered}>{title}</H2><Muted style={styles.emptyText}>{text}</Muted>{action ? <Button onPress={onAction} style={{ marginTop: 18 }}>{action}</Button> : null}</Card>;
}

export function LoadingState({ text = 'Cargando...' }: any) {
  return <View style={styles.loading}><ActivityIndicator color={colors.teal}/><Muted style={{ marginTop: 10 }}>{text}</Muted></View>;
}

export function ErrorBanner({ message, onClose }: any) {
  if (!message) return null;
  return <TouchableOpacity onPress={onClose} activeOpacity={0.8} style={styles.errorBanner}><MaterialCommunityIcons name={String(message).toLowerCase().includes('cread') || String(message).toLowerCase().includes('guard') ? 'check-circle-outline' : 'alert-circle-outline'} color={String(message).toLowerCase().includes('cread') || String(message).toLowerCase().includes('guard') ? colors.green : colors.red} size={19}/><Text style={styles.errorText}>{message}</Text></TouchableOpacity>;
}

export const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: colors.bgSoft, alignItems: 'center' },
  frame: { flex: 1, width: '100%', maxWidth: Platform.OS === 'web' ? 480 : undefined, backgroundColor: colors.bg, overflow: 'hidden', borderLeftWidth: Platform.OS === 'web' ? 1 : 0, borderRightWidth: Platform.OS === 'web' ? 1 : 0, borderColor: colors.line },
  safe: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { paddingBottom: 116 },
  screenContent: { paddingHorizontal: 24, paddingTop: 8 },
  noPadding: { paddingHorizontal: 0 },
  header: { marginBottom: 20 },
  topRow: { minHeight: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontFamily: fonts.display, fontSize: 30, color: colors.navy, letterSpacing: -0.45 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  bellWrap: { position: 'relative' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.coral, position: 'absolute', right: 2, top: 1 },
  round: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line, ...shadow.card },
  display: { fontFamily: fonts.display, color: colors.ink, fontSize: 58, lineHeight: 62, letterSpacing: -1.45 },
  displayCompact: { fontSize: 44, lineHeight: 49 },
  h1: { fontFamily: fonts.display, color: colors.ink, fontSize: 35, lineHeight: 40, letterSpacing: -0.55 },
  h2: { fontFamily: fonts.display, color: colors.ink, fontSize: 24, lineHeight: 29, letterSpacing: -0.2 },
  body: { fontFamily: fonts.body, color: colors.ink, fontSize: 16, lineHeight: 23 },
  muted: { fontFamily: fonts.body, color: colors.muted, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.body, color: colors.muted, fontSize: 12, lineHeight: 17, letterSpacing: 0.2 },
  subtitle: { fontSize: 21, lineHeight: 29, marginTop: 6 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, ...shadow.card, overflow: 'hidden' },
  glassCard: { backgroundColor: colors.glass, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, ...shadow.soft },
  pressed: { opacity: 0.86, transform: [{ scale: 0.992 }] },
  iconTile: { alignItems: 'center', justifyContent: 'center' },
  pill: { minHeight: 42, borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  pillText: { fontFamily: fonts.body, fontWeight: '800', fontSize: 15 },
  button: { minHeight: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, paddingHorizontal: 18 },
  buttonPrimary: { backgroundColor: colors.navy, ...shadow.card },
  buttonSecondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.lineStrong },
  buttonDanger: { backgroundColor: colors.coral },
  buttonText: { fontFamily: fonts.body, fontWeight: '900', fontSize: 17, letterSpacing: 0.1 },
  disabled: { opacity: 0.45 },
  inputWrap: { marginBottom: 14 },
  inputLabel: { fontFamily: fonts.body, color: colors.muted, fontSize: 13, marginBottom: 7, fontWeight: '800' },
  input: { minHeight: 56, borderRadius: 17, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 16, fontFamily: fonts.body, color: colors.ink, fontSize: 16 },
  inputMultiline: { height: 92, textAlignVertical: 'top', paddingTop: 14 },
  avatar: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.card, ...shadow.card },
  avatarText: { color: colors.white, fontFamily: fonts.body, fontWeight: '900' },
  avatarStack: { flexDirection: 'row', alignItems: 'center' },
  moreAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.cardAlt, borderWidth: 2, borderColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  moreText: { color: colors.ink, fontWeight: '900', fontSize: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 22, marginBottom: 12 },
  empty: { padding: space.xl, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  centered: { marginTop: 16, textAlign: 'center' },
  emptyText: { marginTop: 8, textAlign: 'center' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  errorBanner: { position: 'absolute', top: Platform.OS === 'web' ? 18 : 56, left: 18, right: 18, zIndex: 99, minHeight: 52, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.lineStrong, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 14, ...shadow.lift },
  errorText: { flex: 1, color: colors.ink, fontWeight: '800', fontSize: 13 }
});
