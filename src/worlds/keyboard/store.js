import { create } from 'zustand';

export const useKeyboardStore = create((set) => ({
  hoveredKey: null,
  activeKey: null,
  soundEnabled: true,
  travel: 0.58,
  palette: 'Porcelain',
  caseColor: '#272b38',
  soundType: 'Thock',
  explodeStage: 0,
  isolatedLayer: 'All layers',
  setHoveredKey: (hoveredKey) => set({ hoveredKey }),
  setActiveKey: (activeKey) => set({ activeKey }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setTravel: (travel) => set({ travel }),
  setPalette: (palette) => set({ palette }),
  setCaseColor: (caseColor) => set({ caseColor }),
  setSoundType: (soundType) => set({ soundType }),
  setExplodeStage: (explodeStage) => set({ explodeStage }),
  setIsolatedLayer: (isolatedLayer) => set({ isolatedLayer }),
}));

export const CASE_FINISHES = [
  { name: 'Midnight', color: '#272b38' },
  { name: 'Chalk', color: '#aaa69c' },
  { name: 'Sage', color: '#526c62' },
  { name: 'Merlot', color: '#633d4c' },
  { name: 'Brass', color: '#8b704b' },
];

export const ASSEMBLY_LAYERS = ['All layers', 'Keycaps', 'Switches', 'Plate', 'PCB', 'Foam', 'Case'];

export const KEYBOARD_PALETTES = {
  Porcelain: { key: '#e9e4da', accent: '#d9aa85', board: '#272b38', legend: '#353744' },
  Lavender: { key: '#c9c2e2', accent: '#dca9c3', board: '#28273c', legend: '#38354b' },
  Seafoam: { key: '#c7ded4', accent: '#dfba8d', board: '#263a3d', legend: '#33484a' },
  Graphite: { key: '#bfc3cc', accent: '#99b2d0', board: '#222733', legend: '#343b49' },
};

