import { AppGroup, EventItem, Expense, GroupKind, GroupPrivacy, Profile, Settlement, Tournament } from '../domain/types';
import { isoForLocalDateAndTime } from '../utils/date';
import { requireSupabase } from './supabase';

function asNumber(value: any) { return Number(value || 0); }

export async function ensureProfile(user: any, fullName?: string) {
  const sb = requireSupabase();
  const name = fullName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';
  const payload = { id: user.id, full_name: name, username: user.email?.split('@')[0] || null, avatar_url: user?.user_metadata?.avatar_url || null };
  const { data, error } = await sb.from('profiles').upsert(payload, { onConflict: 'id' }).select('*').single();
  if (error) throw error;
  return data as Profile;
}

export async function fetchProfile(userId: string) {
  const sb = requireSupabase();
  const { data, error } = await sb.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function fetchGroupsForUser(userId: string): Promise<AppGroup[]> {
  const sb = requireSupabase();
  const { data: memberships, error: memberError } = await sb.from('group_members').select('group_id, profile_id, role').eq('profile_id', userId);
  if (memberError) throw memberError;
  const groupIds = (memberships || []).map((m: any) => m.group_id);
  if (!groupIds.length) return [];

  const [groupsRes, allMembersRes, eventsRes, expensesRes, settlementsRes, tournamentsRes] = await Promise.all([
    sb.from('groups').select('*').in('id', groupIds).order('created_at', { ascending: false }),
    sb.from('group_members').select('group_id, profile_id, role, profiles(id, full_name, username, avatar_url)').in('group_id', groupIds),
    sb.from('events').select('*').in('group_id', groupIds).order('starts_at', { ascending: true }),
    sb.from('expenses').select('*').in('group_id', groupIds).order('paid_at', { ascending: false }),
    sb.from('settlements').select('*').in('group_id', groupIds).order('created_at', { ascending: false }),
    sb.from('tournaments').select('*').in('group_id', groupIds).order('created_at', { ascending: false })
  ]);

  for (const res of [groupsRes, allMembersRes, eventsRes, expensesRes, settlementsRes, tournamentsRes]) if (res.error) throw res.error;

  const events = eventsRes.data || [];
  const eventIds = events.map((e: any) => e.id);
  const expenseIds = (expensesRes.data || []).map((e: any) => e.id);
  const tournamentIds = (tournamentsRes.data || []).map((t: any) => t.id);

  const [attendanceRes, participantsRes, teamsRes, matchesRes] = await Promise.all([
    eventIds.length ? sb.from('event_attendance').select('*').in('event_id', eventIds) : Promise.resolve({ data: [], error: null } as any),
    expenseIds.length ? sb.from('expense_participants').select('*').in('expense_id', expenseIds) : Promise.resolve({ data: [], error: null } as any),
    tournamentIds.length ? sb.from('tournament_teams').select('*').in('tournament_id', tournamentIds) : Promise.resolve({ data: [], error: null } as any),
    tournamentIds.length ? sb.from('matches').select('*').in('tournament_id', tournamentIds).order('starts_at', { ascending: true }) : Promise.resolve({ data: [], error: null } as any)
  ]);
  for (const res of [attendanceRes, participantsRes, teamsRes, matchesRes]) if (res.error) throw res.error;

  const teamIds = (teamsRes.data || []).map((t: any) => t.id);
  const teamMembersRes = teamIds.length ? await sb.from('tournament_team_members').select('*').in('team_id', teamIds) : { data: [], error: null } as any;
  if (teamMembersRes.error) throw teamMembersRes.error;

  return (groupsRes.data || []).map((g: any) => {
    const groupMembers = (allMembersRes.data || []).filter((m: any) => m.group_id === g.id).map((m: any) => ({
      group_id: m.group_id,
      profile_id: m.profile_id,
      role: m.role,
      profile: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
    }));

    const groupEvents: EventItem[] = events.filter((e: any) => e.group_id === g.id).map((e: any) => {
      const attendance: Record<string, any> = {};
      (attendanceRes.data || []).filter((a: any) => a.event_id === e.id).forEach((a: any) => { attendance[a.profile_id] = a.status; });
      return { ...e, notes: e.notes || [], attendance };
    });

    const groupExpenses: Expense[] = (expensesRes.data || []).filter((e: any) => e.group_id === g.id).map((e: any) => ({
      ...e,
      amount: asNumber(e.amount),
      participant_ids: (participantsRes.data || []).filter((p: any) => p.expense_id === e.id).map((p: any) => p.profile_id)
    }));

    const groupTournaments: Tournament[] = (tournamentsRes.data || []).filter((t: any) => t.group_id === g.id).map((t: any) => {
      const teams = (teamsRes.data || []).filter((team: any) => team.tournament_id === t.id).map((team: any) => ({
        ...team,
        member_ids: (teamMembersRes.data || []).filter((tm: any) => tm.team_id === team.id).map((tm: any) => tm.profile_id)
      }));
      const matches = (matchesRes.data || []).filter((m: any) => m.tournament_id === t.id).map((m: any) => ({ ...m, score_a: m.score_a || [], score_b: m.score_b || [] }));
      return { ...t, teams, matches };
    });

    return {
      ...g,
      usual_days: g.usual_days || [],
      usual_time: g.usual_time || '20:00',
      members: groupMembers,
      events: groupEvents,
      expenses: groupExpenses,
      settlements: (settlementsRes.data || []).filter((s: any) => s.group_id === g.id).map((s: any) => ({ ...s, amount: asNumber(s.amount) })) as Settlement[],
      tournaments: groupTournaments
    } as AppGroup;
  });
}

function nextDateForDays(days: number[], time: string) {
  const today = new Date();
  for (let offset = 0; offset < 21; offset++) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    const mondayIndex = (d.getDay() + 6) % 7;
    if (!days.length || days.includes(mondayIndex)) {
      const key = `${d.getFullYear()}-${`${d.getMonth()+1}`.padStart(2,'0')}-${`${d.getDate()}`.padStart(2,'0')}`;
      return isoForLocalDateAndTime(key, time);
    }
  }
  return new Date().toISOString();
}

export async function createGroup(input: { ownerId: string; name: string; kind: GroupKind; activity: string; location: string; privacy: GroupPrivacy; usual_days: number[]; usual_time: string; }) {
  const sb = requireSupabase();
  const color = input.kind === 'cards' ? '#07123C' : input.kind === 'sport' ? '#005D5B' : '#C7933B';
  const accent = input.kind === 'cards' ? '#EAEAF8' : input.kind === 'sport' ? '#E5F4EE' : '#F3E5C8';
  const { data: group, error } = await sb.from('groups').insert({
    owner_id: input.ownerId,
    name: input.name,
    kind: input.kind,
    activity: input.activity,
    location: input.location,
    privacy: input.privacy,
    usual_days: input.usual_days,
    usual_time: input.usual_time,
    color,
    accent
  }).select('*').single();
  if (error) throw error;

  await sb.from('events').insert({
    group_id: group.id,
    title: 'Quedada semanal',
    starts_at: nextDateForDays(input.usual_days, input.usual_time),
    location: input.location,
    notes: ['Confirmar asistencia antes del mismo día'],
    event_type: 'meetup',
    created_by: input.ownerId
  });
  return group.id as string;
}

export async function createEvent(input: { groupId: string; userId: string; title: string; dateKey: string; time: string; location?: string | null; }) {
  const sb = requireSupabase();
  const { data, error } = await sb.from('events').insert({
    group_id: input.groupId,
    title: input.title,
    starts_at: isoForLocalDateAndTime(input.dateKey, input.time),
    location: input.location,
    notes: [],
    event_type: 'meetup',
    created_by: input.userId
  }).select('*').single();
  if (error) throw error;
  return data.id as string;
}

export async function setAttendance(input: { eventId: string; profileId: string; status: 'going' | 'maybe' | 'no' | 'pending' }) {
  const sb = requireSupabase();
  const { error } = await sb.from('event_attendance').upsert({ event_id: input.eventId, profile_id: input.profileId, status: input.status, updated_at: new Date().toISOString() }, { onConflict: 'event_id,profile_id' });
  if (error) throw error;
}

export async function createExpense(input: { groupId: string; userId: string; title: string; amount: number; paidBy: string; participantIds: string[]; category: 'venue' | 'food' | 'gear' | 'other' }) {
  const sb = requireSupabase();
  const { data: expense, error } = await sb.from('expenses').insert({
    group_id: input.groupId,
    title: input.title,
    amount: input.amount,
    paid_by: input.paidBy,
    category: input.category,
    created_by: input.userId
  }).select('*').single();
  if (error) throw error;
  if (input.participantIds.length) {
    const share = Math.round((input.amount / input.participantIds.length) * 100) / 100;
    const rows = input.participantIds.map(profile_id => ({ expense_id: expense.id, profile_id, share_amount: share }));
    const participants = await sb.from('expense_participants').insert(rows);
    if (participants.error) throw participants.error;
  }
  return expense.id as string;
}

export async function createSettlement(input: { groupId: string; fromId: string; toId: string; amount: number; status?: 'pending' | 'paid' }) {
  const sb = requireSupabase();
  const { error } = await sb.from('settlements').insert({
    group_id: input.groupId,
    from_profile_id: input.fromId,
    to_profile_id: input.toId,
    amount: input.amount,
    status: input.status || 'pending',
    paid_at: input.status === 'paid' ? new Date().toISOString() : null
  });
  if (error) throw error;
}

export async function joinGroup(code: string) {
  const sb = requireSupabase();
  const { error } = await sb.rpc('join_group_with_code', { code });
  if (error) throw error;
}

export async function createStarterTournament(group: AppGroup, userId: string) {
  const sb = requireSupabase();
  const { data: tournament, error } = await sb.from('tournaments').insert({
    group_id: group.id,
    name: 'Liga del grupo',
    format: 'league',
    created_by: userId
  }).select('*').single();
  if (error) throw error;
  const memberNames = group.members.slice(0, 6).map((m, i) => m.profile.full_name || `Jugador ${i + 1}`);
  const pairNames = memberNames.length >= 4 ? ['Pareja A', 'Pareja B', 'Pareja C', 'Pareja D'] : ['Equipo A', 'Equipo B', 'Equipo C', 'Equipo D'];
  const { data: teams, error: teamsError } = await sb.from('tournament_teams').insert(pairNames.map((name, i) => ({ tournament_id: tournament.id, name, color: ['#005D5B','#C7933B','#43438D','#D95E4F'][i] }))).select('*');
  if (teamsError) throw teamsError;
  const now = new Date();
  const matches = [];
  for (let i = 0; i < (teams || []).length - 1; i += 2) {
    const d = new Date(now); d.setDate(now.getDate() + 7 + i * 3); d.setHours(20,0,0,0);
    matches.push({ tournament_id: tournament.id, team_a_id: teams![i].id, team_b_id: teams![i+1].id, starts_at: d.toISOString(), location: group.location || '', status: 'scheduled' });
  }
  if (matches.length) {
    const m = await sb.from('matches').insert(matches);
    if (m.error) throw m.error;
  }
  return tournament.id as string;
}

export async function saveMatchScore(input: { matchId: string; scoreA: number[]; scoreB: number[] }) {
  const sb = requireSupabase();
  const { error } = await sb.from('matches').update({ score_a: input.scoreA, score_b: input.scoreB, status: 'finished', updated_at: new Date().toISOString() }).eq('id', input.matchId);
  if (error) throw error;
}
