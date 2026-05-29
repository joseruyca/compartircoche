import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppGroup, AttendanceStatus, GroupKind, GroupPrivacy, Nav, Profile, ScreenName } from '../domain/types';
import { hasSupabaseConfig, supabase } from '../services/supabase';
import * as repo from '../services/repository';
import { dateKey } from '../utils/date';

type AppContextValue = {
  nav: Nav;
  user: any;
  profile: Profile | null;
  groups: AppGroup[];
  loading: boolean;
  busy: boolean;
  error: string;
  info: string;
  hasSupabaseConfig: boolean;
  go: (name: ScreenName, params?: any) => void;
  reset: (name: ScreenName, params?: any) => void;
  back: () => void;
  clearMessage: () => void;
  activeGroup: () => AppGroup | null;
  getGroup: (id?: string) => AppGroup | null;
  refresh: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  createGroup: (input: { name: string; kind: GroupKind; activity: string; location: string; privacy: GroupPrivacy; usual_days: number[]; usual_time: string; }) => Promise<void>;
  joinGroup: (code: string) => Promise<void>;
  createEvent: (groupId: string, selectedDate: string) => Promise<void>;
  setAttendance: (groupId: string, eventId: string, status: AttendanceStatus) => Promise<void>;
  createExpense: (input: { groupId: string; title: string; amount: number; paidBy: string; participantIds: string[]; category: 'venue' | 'food' | 'gear' | 'other' }) => Promise<void>;
  createStarterTournament: (groupId: string) => Promise<void>;
  saveMatch: (matchId: string, scoreA: number[], scoreB: number[]) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [navStack, setNavStack] = useState<Nav[]>([{ name: 'welcome' }]);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [groups, setGroups] = useState<AppGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const nav = navStack[navStack.length - 1];
  const clearMessage = () => { setError(''); setInfo(''); };

  const go = useCallback((name: ScreenName, params?: any) => setNavStack(prev => [...prev, { name, params }]), []);
  const reset = useCallback((name: ScreenName, params?: any) => setNavStack([{ name, params }]), []);
  const back = useCallback(() => setNavStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev), []);

  const load = useCallback(async (currentUser?: any) => {
    if (!hasSupabaseConfig || !currentUser) { setGroups([]); setProfile(null); return; }
    const profileData = await repo.ensureProfile(currentUser);
    const groupData = await repo.fetchGroupsForUser(currentUser.id);
    setProfile(profileData);
    setGroups(groupData);
    setSelectedGroupId(prev => prev && groupData.some(g => g.id === prev) ? prev : groupData[0]?.id || null);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function boot() {
      try {
        if (!supabase) { setLoading(false); return; }
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        const currentUser = data.session?.user || null;
        setUser(currentUser);
        if (currentUser) {
          await load(currentUser);
          reset('groups');
        }
      } catch (e: any) { setError(e.message || 'No se pudo iniciar Grupli.'); }
      finally { if (mounted) setLoading(false); }
    }
    boot();
    const sub = supabase?.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user || null;
      setUser(nextUser);
      if (nextUser) { try { await load(nextUser); reset('groups'); } catch (e: any) { setError(e.message); } }
      else { setProfile(null); setGroups([]); setSelectedGroupId(null); reset('welcome'); }
    });
    return () => { mounted = false; sub?.data.subscription.unsubscribe(); };
  }, [load, reset]);

  const run = useCallback(async (fn: () => Promise<void>, ok?: string) => {
    setBusy(true); clearMessage();
    try { await fn(); if (ok) setInfo(ok); }
    catch (e: any) { setError(e.message || 'Ha ocurrido un error.'); }
    finally { setBusy(false); }
  }, []);

  const value = useMemo<AppContextValue>(() => {
    const getGroup = (id?: string) => groups.find(g => g.id === (id || selectedGroupId)) || groups[0] || null;
    const activeGroup = () => getGroup(selectedGroupId || undefined);

    return {
      nav, user, profile, groups, loading, busy, error, info, hasSupabaseConfig,
      go: (name, params) => {
        if (params?.groupId) setSelectedGroupId(params.groupId);
        go(name, params);
      },
      reset: (name, params) => {
        if (params?.groupId) setSelectedGroupId(params.groupId);
        reset(name, params);
      },
      back,
      clearMessage,
      activeGroup,
      getGroup,
      refresh: async () => { if (user) await load(user); },
      signIn: async (email, password) => run(async () => {
        if (!supabase) throw new Error('Faltan las variables de Supabase.');
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        if (data.user) { setUser(data.user); await load(data.user); reset('groups'); }
      }),
      signUp: async (name, email, password) => run(async () => {
        if (!supabase) throw new Error('Faltan las variables de Supabase.');
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim() } } });
        if (error) throw error;
        if (data.user) await repo.ensureProfile(data.user, name.trim());
        if (data.session?.user) { setUser(data.session.user); await load(data.session.user); reset('groups'); }
        else setInfo('Cuenta creada. Revisa tu email para confirmar el acceso.');
      }),
      signOut: async () => run(async () => { if (supabase) await supabase.auth.signOut(); reset('welcome'); }),
      createGroup: async input => run(async () => {
        if (!user) throw new Error('Necesitas iniciar sesión.');
        const id = await repo.createGroup({ ...input, ownerId: user.id });
        await load(user);
        setSelectedGroupId(id);
        reset('groupHome', { groupId: id });
      }, 'Grupo creado.'),
      joinGroup: async code => run(async () => {
        await repo.joinGroup(code.trim().toUpperCase());
        if (user) await load(user);
      }, 'Te has unido al grupo.'),
      createEvent: async (groupId, selectedDate) => run(async () => {
        if (!user) throw new Error('Necesitas iniciar sesión.');
        const group = getGroup(groupId); if (!group) throw new Error('Grupo no encontrado.');
        await repo.createEvent({ groupId, userId: user.id, title: 'Nueva quedada', dateKey: selectedDate || dateKey(new Date()), time: group.usual_time || '20:00', location: group.location });
        await load(user);
      }, 'Quedada creada.'),
      setAttendance: async (groupId, eventId, status) => run(async () => {
        if (!user) throw new Error('Necesitas iniciar sesión.');
        await repo.setAttendance({ eventId, profileId: user.id, status });
        await load(user);
      }),
      createExpense: async input => run(async () => {
        if (!user) throw new Error('Necesitas iniciar sesión.');
        await repo.createExpense({ ...input, userId: user.id });
        await load(user);
        reset('finances', { groupId: input.groupId });
      }, 'Gasto guardado.'),
      createStarterTournament: async groupId => run(async () => {
        if (!user) throw new Error('Necesitas iniciar sesión.');
        const group = getGroup(groupId); if (!group) throw new Error('Grupo no encontrado.');
        await repo.createStarterTournament(group, user.id);
        await load(user);
      }, 'Torneo creado.'),
      saveMatch: async (matchId, scoreA, scoreB) => run(async () => {
        await repo.saveMatchScore({ matchId, scoreA, scoreB });
        if (user) await load(user);
        back();
      }, 'Resultado guardado.')
    };
  }, [nav, user, profile, groups, loading, busy, error, info, selectedGroupId, go, reset, back, load, run]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider');
  return ctx;
}
