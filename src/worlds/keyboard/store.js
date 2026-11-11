import { create } from 'zustand';

export const useKeyboardStore = create((set) => ({
  hoveredKey: null,
  activeKey: null,
  pressedKeys: new Set(),
  soundEnabled: true,
  travel: 0.58,
  palette: 'Milkshake',
  caseColor: '#baa9db',
  plateFinish: 'Aluminum',
  soundType: 'Thock',
  explodeStage: 0,
  isolatedLayer: 'All layers',
  setHoveredKey: (hoveredKey) => set({ hoveredKey }),
  setActiveKey: (activeKey) => set({ activeKey }),
  pressKey: (keyIndex) => set((state) => {
    const pressedKeys = new Set(state.pressedKeys);
    pressedKeys.add(keyIndex);
    return { pressedKeys, activeKey: keyIndex };
  }),
  releaseKey: (keyIndex) => set((state) => {
    const pressedKeys = new Set(state.pressedKeys);
    pressedKeys.delete(keyIndex);
    return { pressedKeys, activeKey: state.activeKey === keyIndex ? [...pressedKeys].at(-1) ?? null : state.activeKey };
  }),
  clearPressedKeys: () => set({ pressedKeys: new Set(), activeKey: null }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setTravel: (travel) => set({ travel }),
  setPalette: (palette) => set({ palette }),
  setCaseColor: (caseColor) => set({ caseColor }),
  setPlateFinish: (plateFinish) => set({ plateFinish }),
  setSoundType: (soundType) => set({ soundType }),
  setExplodeStage: (explodeStage) => set({ explodeStage }),
  setIsolatedLayer: (isolatedLayer) => set({ isolatedLayer }),
}));

export const CASE_FINISHES = [
  { name: 'Cloud', color: '#f4f0fa' },
  { name: 'Lilac', color: '#baa9db' },
  { name: 'Blush', color: '#e8a8bd' },
  { name: 'Mint', color: '#a3d3c6' },
  { name: 'Butter', color: '#f1d88f' },
  { name: 'Periwinkle', color: '#9fb9df' },
  { name: 'Plum', color: '#817196' },
];

export const PLATE_FINISHES = {
  Aluminum: { color: '#e2dfe9', metalness: 0.52, roughness: 0.28 },
  Brass: { color: '#d8b873', metalness: 0.72, roughness: 0.25 },
  Polycarbonate: { color: '#f3c5d8', metalness: 0.05, roughness: 0.36 },
};

export const ASSEMBLY_LAYERS = ['All layers', 'Keycaps', 'Switches', 'Plate', 'PCB', 'Foam', 'Case'];

export const KEYBOARD_PALETTES = {
  Milkshake: { key: '#fff8fa', accent: '#ed9dbb', board: '#b9addf', legend: '#635778' },
  Matcha: { key: '#f6f5dc', accent: '#ef9f8e', board: '#9bcbb0', legend: '#536d5e' },
  'Lavender Fog': { key: '#f5efff', accent: '#f2c0d7', board: '#c0aedf', legend: '#65577a' },
  'Peach Soda': { key: '#fff2e9', accent: '#f39b89', board: '#f1c39d', legend: '#71584e' },
  'Blueberry Milk': { key: '#f3f4ff', accent: '#91bce8', board: '#9291bd', legend: '#555478' },
};

