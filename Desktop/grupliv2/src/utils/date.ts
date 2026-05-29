import { weekLabels } from '../theme/tokens';

export function monthName(date: Date) {
  return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^./, c => c.toUpperCase());
}

export function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).replace('.', '');
}

export function timeFromIso(iso: string) {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

export function dateKey(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isoForLocalDateAndTime(key: string, time: string) {
  const [h, m] = time.split(':').map(Number);
  const [y, mo, d] = key.split('-').map(Number);
  const date = new Date(y, mo - 1, d, h || 20, m || 0, 0, 0);
  return date.toISOString();
}

export function buildMonthGrid(month: Date) {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const startWeekday = (start.getDay() + 6) % 7;
  const cells: { date: Date; inMonth: boolean; label: string }[] = [];
  for (let i = startWeekday; i > 0; i--) {
    const d = new Date(start);
    d.setDate(start.getDate() - i);
    cells.push({ date: d, inMonth: false, label: `${d.getDate()}` });
  }
  for (let day = 1; day <= end.getDate(); day++) {
    const d = new Date(month.getFullYear(), month.getMonth(), day);
    cells.push({ date: d, inMonth: true, label: `${day}` });
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const d = new Date(cells[cells.length - 1].date);
    d.setDate(d.getDate() + 1);
    cells.push({ date: d, inMonth: false, label: `${d.getDate()}` });
  }
  return cells;
}

export function weekdayLabel(iso: string) {
  const d = new Date(iso);
  return weekLabels[(d.getDay() + 6) % 7];
}
