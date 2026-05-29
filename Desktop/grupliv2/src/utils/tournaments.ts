import { Tournament } from '../domain/types';

export function standings(tournament?: Tournament) {
  if (!tournament) return [];
  const rows = tournament.teams.map(team => ({
    team,
    pts: 0,
    pj: 0,
    g: 0,
    e: 0,
    p: 0,
    dif: 0
  }));
  const byId = Object.fromEntries(rows.map(r => [r.team.id, r]));
  tournament.matches.filter(m => m.status === 'finished').forEach(match => {
    const a = byId[match.team_a_id];
    const b = byId[match.team_b_id];
    if (!a || !b) return;
    const scoreA = (match.score_a || []).reduce((s, v) => s + Number(v || 0), 0);
    const scoreB = (match.score_b || []).reduce((s, v) => s + Number(v || 0), 0);
    a.pj++; b.pj++;
    a.dif += scoreA - scoreB;
    b.dif += scoreB - scoreA;
    if (scoreA > scoreB) { a.g++; b.p++; a.pts += tournament.points_win; }
    else if (scoreB > scoreA) { b.g++; a.p++; b.pts += tournament.points_win; }
    else { a.e++; b.e++; a.pts += tournament.points_draw; b.pts += tournament.points_draw; }
  });
  return rows.sort((a, b) => b.pts - a.pts || b.dif - a.dif || a.team.name.localeCompare(b.team.name));
}
