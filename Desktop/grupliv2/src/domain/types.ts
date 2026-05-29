export type ID = string;

export type ScreenName =
  | 'welcome' | 'login' | 'register' | 'groups' | 'createGroup' | 'groupHome'
  | 'calendar' | 'event' | 'finances' | 'newExpense' | 'tournaments'
  | 'match' | 'members' | 'profile';

export type GroupKind = 'sport' | 'cards' | 'other';
export type GroupPrivacy = 'private' | 'public';
export type MemberRole = 'owner' | 'admin' | 'member';
export type AttendanceStatus = 'going' | 'maybe' | 'no' | 'pending';
export type TournamentFormat = 'league' | 'knockout' | 'americano';
export type MatchStatus = 'scheduled' | 'finished';
export type SettlementStatus = 'pending' | 'paid' | 'cancelled';

export type Profile = {
  id: ID;
  full_name: string;
  username?: string | null;
  avatar_url?: string | null;
};

export type GroupMember = {
  group_id: ID;
  profile_id: ID;
  role: MemberRole;
  profile: Profile;
};

export type EventItem = {
  id: ID;
  group_id: ID;
  title: string;
  starts_at: string;
  ends_at?: string | null;
  location?: string | null;
  notes: string[];
  event_type: 'meetup' | 'match';
  attendance: Record<ID, AttendanceStatus>;
};

export type Expense = {
  id: ID;
  group_id: ID;
  title: string;
  amount: number;
  paid_by: ID;
  paid_at: string;
  category: 'venue' | 'food' | 'gear' | 'other';
  notes?: string | null;
  participant_ids: ID[];
};

export type Settlement = {
  id: ID;
  group_id: ID;
  from_profile_id: ID;
  to_profile_id: ID;
  amount: number;
  status: SettlementStatus;
};

export type Team = {
  id: ID;
  tournament_id: ID;
  name: string;
  color?: string | null;
  member_ids: ID[];
};

export type Match = {
  id: ID;
  tournament_id: ID;
  team_a_id: ID;
  team_b_id: ID;
  starts_at: string;
  location?: string | null;
  status: MatchStatus;
  score_a: number[];
  score_b: number[];
};

export type Tournament = {
  id: ID;
  group_id: ID;
  name: string;
  format: TournamentFormat;
  points_win: number;
  points_draw: number;
  teams: Team[];
  matches: Match[];
};

export type AppGroup = {
  id: ID;
  owner_id: ID;
  name: string;
  kind: GroupKind;
  activity: string;
  description?: string | null;
  location?: string | null;
  color: string;
  accent: string;
  privacy: GroupPrivacy;
  invite_code: string;
  usual_days: number[];
  usual_time: string;
  members: GroupMember[];
  events: EventItem[];
  expenses: Expense[];
  settlements: Settlement[];
  tournaments: Tournament[];
};

export type Nav = { name: ScreenName; params?: any };
