-- Grupli v1 final - Reset + esquema completo + RLS + funciones
-- Ejecutar en Supabase SQL Editor.

create extension if not exists "pgcrypto";

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists trg_groups_owner_member on public.groups;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.handle_new_group_owner() cascade;
drop function if exists public.join_group_with_code(text) cascade;
drop function if exists public.is_group_member(uuid) cascade;
drop function if exists public.is_group_admin(uuid) cascade;

drop table if exists public.matches cascade;
drop table if exists public.tournament_team_members cascade;
drop table if exists public.tournament_teams cascade;
drop table if exists public.tournaments cascade;
drop table if exists public.settlements cascade;
drop table if exists public.expense_participants cascade;
drop table if exists public.expenses cascade;
drop table if exists public.event_attendance cascade;
drop table if exists public.events cascade;
drop table if exists public.group_members cascade;
drop table if exists public.groups cascade;
drop table if exists public.profiles cascade;

drop type if exists public.match_status cascade;
drop type if exists public.tournament_format cascade;
drop type if exists public.settlement_status cascade;
drop type if exists public.expense_category cascade;
drop type if exists public.event_type cascade;
drop type if exists public.attendance_status cascade;
drop type if exists public.member_role cascade;
drop type if exists public.group_privacy cascade;
drop type if exists public.group_kind cascade;

create type public.group_kind as enum ('sport', 'cards', 'other');
create type public.group_privacy as enum ('private', 'public');
create type public.member_role as enum ('owner', 'admin', 'member');
create type public.attendance_status as enum ('going', 'maybe', 'no', 'pending');
create type public.event_type as enum ('meetup', 'match');
create type public.expense_category as enum ('venue', 'food', 'gear', 'other');
create type public.tournament_format as enum ('league', 'knockout', 'americano');
create type public.match_status as enum ('scheduled', 'finished');
create type public.settlement_status as enum ('pending', 'paid', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  kind public.group_kind not null default 'other',
  activity text not null default '',
  description text,
  location text,
  color text default '#005D5B',
  accent text default '#E5F4EE',
  privacy public.group_privacy not null default 'private',
  invite_code text unique not null default upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8)),
  usual_days int[] not null default '{}',
  usual_time text not null default '20:00',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.member_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (group_id, profile_id)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  notes text[] not null default '{}',
  event_type public.event_type not null default 'meetup',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.event_attendance (
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status public.attendance_status not null default 'pending',
  updated_at timestamptz not null default now(),
  primary key (event_id, profile_id)
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null,
  amount numeric(12,2) not null check (amount >= 0),
  paid_by uuid not null references public.profiles(id),
  paid_at timestamptz not null default now(),
  category public.expense_category not null default 'other',
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.expense_participants (
  expense_id uuid not null references public.expenses(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  share_amount numeric(12,2),
  primary key (expense_id, profile_id)
);

create table public.settlements (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  from_profile_id uuid not null references public.profiles(id),
  to_profile_id uuid not null references public.profiles(id),
  amount numeric(12,2) not null check (amount > 0),
  status public.settlement_status not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.tournaments (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  name text not null,
  format public.tournament_format not null default 'league',
  points_win int not null default 3,
  points_draw int not null default 1,
  tiebreaker text not null default 'difference',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.tournament_teams (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  name text not null,
  color text default '#005D5B'
);

create table public.tournament_team_members (
  team_id uuid not null references public.tournament_teams(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  primary key (team_id, profile_id)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  team_a_id uuid not null references public.tournament_teams(id) on delete cascade,
  team_b_id uuid not null references public.tournament_teams(id) on delete cascade,
  starts_at timestamptz not null,
  location text,
  status public.match_status not null default 'scheduled',
  score_a int[] not null default '{}',
  score_b int[] not null default '{}',
  notes text,
  updated_at timestamptz not null default now()
);

create index idx_group_members_profile on public.group_members(profile_id);
create index idx_events_group_starts on public.events(group_id, starts_at);
create index idx_expenses_group_paid_at on public.expenses(group_id, paid_at desc);
create index idx_tournaments_group on public.tournaments(group_id);
create index idx_matches_tournament on public.matches(tournament_id, starts_at);

create or replace function public.is_group_member(target_group_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.group_members gm where gm.group_id = target_group_id and gm.profile_id = auth.uid());
$$;

create or replace function public.is_group_admin(target_group_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.group_members gm where gm.group_id = target_group_id and gm.profile_id = auth.uid() and gm.role in ('owner', 'admin'));
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, username, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), split_part(new.email, '@', 1), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.handle_new_group_owner()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.group_members (group_id, profile_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (group_id, profile_id) do nothing;
  return new;
end;
$$;

create trigger trg_groups_owner_member after insert on public.groups for each row execute procedure public.handle_new_group_owner();

create or replace function public.join_group_with_code(code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare target_group_id uuid;
begin
  select id into target_group_id from public.groups where invite_code = upper(code) limit 1;
  if target_group_id is null then
    raise exception 'Código de grupo no válido';
  end if;
  insert into public.group_members (group_id, profile_id, role)
  values (target_group_id, auth.uid(), 'member')
  on conflict (group_id, profile_id) do nothing;
  return target_group_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.events enable row level security;
alter table public.event_attendance enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_participants enable row level security;
alter table public.settlements enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_teams enable row level security;
alter table public.tournament_team_members enable row level security;
alter table public.matches enable row level security;

create policy profiles_select on public.profiles for select using (true);
create policy profiles_insert_own on public.profiles for insert with check (id = auth.uid());
create policy profiles_update_own on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy groups_select_member_or_public on public.groups for select using (privacy = 'public' or public.is_group_member(id));
create policy groups_insert_owner on public.groups for insert with check (owner_id = auth.uid());
create policy groups_update_admin on public.groups for update using (public.is_group_admin(id)) with check (public.is_group_admin(id));
create policy groups_delete_owner on public.groups for delete using (owner_id = auth.uid());

create policy group_members_select on public.group_members for select using (public.is_group_member(group_id));
create policy group_members_insert_self_or_admin on public.group_members for insert with check (profile_id = auth.uid() or public.is_group_admin(group_id));
create policy group_members_update_admin on public.group_members for update using (public.is_group_admin(group_id)) with check (public.is_group_admin(group_id));
create policy group_members_delete_admin_or_self on public.group_members for delete using (public.is_group_admin(group_id) or profile_id = auth.uid());

create policy events_select on public.events for select using (public.is_group_member(group_id));
create policy events_insert_member on public.events for insert with check (public.is_group_member(group_id) and created_by = auth.uid());
create policy events_update_admin_or_creator on public.events for update using (public.is_group_admin(group_id) or created_by = auth.uid()) with check (public.is_group_admin(group_id) or created_by = auth.uid());
create policy events_delete_admin_or_creator on public.events for delete using (public.is_group_admin(group_id) or created_by = auth.uid());

create policy attendance_select on public.event_attendance for select using (exists (select 1 from public.events e where e.id = event_id and public.is_group_member(e.group_id)));
create policy attendance_self_all on public.event_attendance for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy expenses_select on public.expenses for select using (public.is_group_member(group_id));
create policy expenses_insert on public.expenses for insert with check (public.is_group_member(group_id) and created_by = auth.uid());
create policy expenses_update on public.expenses for update using (public.is_group_admin(group_id) or created_by = auth.uid()) with check (public.is_group_admin(group_id) or created_by = auth.uid());
create policy expenses_delete on public.expenses for delete using (public.is_group_admin(group_id) or created_by = auth.uid());

create policy expense_participants_select on public.expense_participants for select using (exists (select 1 from public.expenses e where e.id = expense_id and public.is_group_member(e.group_id)));
create policy expense_participants_write on public.expense_participants for all using (exists (select 1 from public.expenses e where e.id = expense_id and public.is_group_member(e.group_id))) with check (exists (select 1 from public.expenses e where e.id = expense_id and public.is_group_member(e.group_id)));

create policy settlements_select on public.settlements for select using (public.is_group_member(group_id));
create policy settlements_insert on public.settlements for insert with check (public.is_group_member(group_id));
create policy settlements_update on public.settlements for update using (public.is_group_admin(group_id) or from_profile_id = auth.uid() or to_profile_id = auth.uid()) with check (public.is_group_admin(group_id) or from_profile_id = auth.uid() or to_profile_id = auth.uid());

create policy tournaments_select on public.tournaments for select using (public.is_group_member(group_id));
create policy tournaments_write on public.tournaments for all using (public.is_group_admin(group_id) or created_by = auth.uid()) with check (public.is_group_member(group_id) and (created_by = auth.uid() or public.is_group_admin(group_id)));

create policy tournament_teams_select on public.tournament_teams for select using (exists (select 1 from public.tournaments t where t.id = tournament_id and public.is_group_member(t.group_id)));
create policy tournament_teams_write on public.tournament_teams for all using (exists (select 1 from public.tournaments t where t.id = tournament_id and public.is_group_member(t.group_id))) with check (exists (select 1 from public.tournaments t where t.id = tournament_id and public.is_group_member(t.group_id)));

create policy tournament_team_members_select on public.tournament_team_members for select using (exists (select 1 from public.tournament_teams tt join public.tournaments t on t.id = tt.tournament_id where tt.id = team_id and public.is_group_member(t.group_id)));
create policy tournament_team_members_write on public.tournament_team_members for all using (exists (select 1 from public.tournament_teams tt join public.tournaments t on t.id = tt.tournament_id where tt.id = team_id and public.is_group_member(t.group_id))) with check (exists (select 1 from public.tournament_teams tt join public.tournaments t on t.id = tt.tournament_id where tt.id = team_id and public.is_group_member(t.group_id)));

create policy matches_select on public.matches for select using (exists (select 1 from public.tournaments t where t.id = tournament_id and public.is_group_member(t.group_id)));
create policy matches_write on public.matches for all using (exists (select 1 from public.tournaments t where t.id = tournament_id and public.is_group_member(t.group_id))) with check (exists (select 1 from public.tournaments t where t.id = tournament_id and public.is_group_member(t.group_id)));
