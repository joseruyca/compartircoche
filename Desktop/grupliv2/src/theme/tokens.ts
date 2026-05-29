import { Platform } from 'react-native';

export const colors = {
  bg: '#FBF8F1',
  bgSoft: '#EFEAE1',
  bgWarm: '#F7F1E7',
  card: '#FFFDF8',
  cardAlt: '#F6F0E7',
  glass: 'rgba(255,253,248,0.86)',
  ink: '#0B1230',
  navy: '#07123C',
  navySoft: '#101A4F',
  muted: '#687181',
  faint: '#9BA3AF',
  line: 'rgba(11,18,48,0.095)',
  lineStrong: 'rgba(11,18,48,0.18)',
  teal: '#005D5B',
  tealDark: '#004746',
  tealSoft: '#DFF1EA',
  mint: '#E8F5EF',
  gold: '#C7933B',
  amber: '#B6812B',
  sand: '#F3E5C8',
  coral: '#D95E4F',
  rose: '#F8E6E1',
  indigo: '#43438D',
  lavender: '#EAEAF8',
  green: '#247C62',
  red: '#C65347',
  white: '#FFFFFF',
  black: '#000000'
};

export const fonts = {
  display: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, Times New Roman, serif' }) as string,
  body: Platform.select({ ios: 'System', android: 'sans-serif', web: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }) as string
};

export const radius = { xs: 10, sm: 14, md: 18, lg: 24, xl: 32, xxl: 42, pill: 999 };
export const space = { xs: 6, sm: 10, md: 14, lg: 18, xl: 24, xxl: 32 };

export const shadow = {
  soft: {
    shadowColor: '#101828',
    shadowOpacity: 0.07,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 5
  },
  card: {
    shadowColor: '#101828',
    shadowOpacity: 0.055,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3
  },
  lift: {
    shadowColor: '#07123C',
    shadowOpacity: 0.12,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 16 },
    elevation: 7
  }
};

export const weekLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
