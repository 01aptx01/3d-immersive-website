// World metadata is kept independent of scene code so additional worlds can plug in later.
export const worlds = [
  {
    id: 'mechanical-garden',
    title: 'Mechanical Garden',
    category: 'Object study · 01',
    description: 'A quiet close-up world built around a tactile mechanical keyboard. Find a key, lift the lid, and listen to the small details.',
    component: 'keyboard',
    status: 'available',
  },
  { id: 'aurora', title: 'Aurora Drift', category: 'Sky · 02', component: null, status: 'coming-soon' },
  { id: 'mosslight-grove', title: 'Mosslight Grove', category: 'Nature · 03', component: null, status: 'coming-soon' },
];

