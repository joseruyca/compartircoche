import { AppGroup, GroupMember } from '../domain/types';

export function euros(value: number) {
  const fixed = Number(value || 0).toLocaleString('es-ES', { minimumFractionDigits: value % 1 ? 2 : 0, maximumFractionDigits: 2 });
  return `${fixed} €`;
}

export function initials(name?: string | null) {
  const parts = (name || 'Usuario').trim().split(/\s+/);
  return (parts[0]?.[0] || 'U') + (parts[1]?.[0] || '');
}

export function memberName(members: GroupMember[], id: string) {
  return members.find(m => m.profile_id === id)?.profile.full_name || 'Usuario';
}

export function computeBalances(group: AppGroup) {
  const balances: Record<string, number> = {};
  group.members.forEach(m => { balances[m.profile_id] = 0; });
  group.expenses.forEach(expense => {
    const participantIds = expense.participant_ids.length ? expense.participant_ids : group.members.map(m => m.profile_id);
    const share = participantIds.length ? expense.amount / participantIds.length : 0;
    balances[expense.paid_by] = (balances[expense.paid_by] || 0) + expense.amount;
    participantIds.forEach(id => { balances[id] = (balances[id] || 0) - share; });
  });
  group.settlements.filter(s => s.status === 'paid').forEach(s => {
    balances[s.from_profile_id] = (balances[s.from_profile_id] || 0) - s.amount;
    balances[s.to_profile_id] = (balances[s.to_profile_id] || 0) + s.amount;
  });
  return balances;
}

export function settlementSuggestions(group: AppGroup) {
  const balances = computeBalances(group);
  const debtors = Object.entries(balances).filter(([, v]) => v < -0.01).map(([id, v]) => ({ id, value: -v })).sort((a, b) => b.value - a.value);
  const creditors = Object.entries(balances).filter(([, v]) => v > 0.01).map(([id, v]) => ({ id, value: v })).sort((a, b) => b.value - a.value);
  const result: { fromId: string; toId: string; amount: number }[] = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].value, creditors[j].value);
    if (amount > 0.01) result.push({ fromId: debtors[i].id, toId: creditors[j].id, amount: Math.round(amount * 100) / 100 });
    debtors[i].value -= amount;
    creditors[j].value -= amount;
    if (debtors[i].value < 0.01) i++;
    if (creditors[j].value < 0.01) j++;
  }
  return result;
}

export function attendanceAverage(group: AppGroup, profileId: string) {
  const events = group.events;
  if (!events.length) return 0;
  const going = events.filter(e => e.attendance[profileId] === 'going').length;
  return Math.round((going / events.length) * 100);
}
