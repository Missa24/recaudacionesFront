import { createTheme } from '@mui/material/styles';

export type ThemeMode = 'light' | 'dark';
export type PaletteName = 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'yellow';

export const defaultPalette: PaletteName = 'blue';

export const paletteOptions: Array<{ name: PaletteName; label: string; main: string; dark: string; soft: string }> = [
  { name: 'blue', label: 'Azul institucional', main: '#155674', dark: '#103f58', soft: '#e8f1f4' },
  { name: 'green', label: 'Verde institucional', main: '#28743d', dark: '#1d572e', soft: '#e8f3ea' },
  { name: 'red', label: 'Rojo institucional', main: '#c93420', dark: '#972719', soft: '#fcedea' },
  { name: 'purple', label: 'Morado', main: '#76509b', dark: '#573a76', soft: '#f0ebf5' },
  { name: 'orange', label: 'Naranja', main: '#bc6208', dark: '#8d4906', soft: '#fbf0e5' },
  { name: 'yellow', label: 'Amarillo maravilla', main: '#e1b600', dark: '#a88700', soft: '#fff8d9' },
];

export function buildTheme(paletteName: PaletteName, mode: ThemeMode) {
  const selected = paletteOptions.find((option) => option.name === paletteName) ?? paletteOptions[0];
  return createTheme({
    palette: {
      mode,
      primary: { main: selected.main, dark: selected.dark },
      secondary: { main: selected.dark },
      background: { default: mode === 'dark' ? '#12212b' : '#f3f6f8', paper: mode === 'dark' ? '#1a303d' : '#ffffff' },
    },
    typography: { fontFamily: "'Avenir Next', 'Trebuchet MS', sans-serif" },
  });
}