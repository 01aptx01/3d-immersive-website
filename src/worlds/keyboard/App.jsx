import WorldHeader from '../../shared/WorldHeader.jsx';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import KeyboardScene from './KeyboardScene.jsx';
import { useKeyboardStore, KEYBOARD_PALETTES, CASE_FINISHES, PLATE_FINISHES } from './store.js';
import { worlds } from '../catalog.js';
import { getKeyIndexForEvent, KEYBOARD_KEYS } from './KeyboardScene.jsx';
import './styles.css';

const LAYER_DETAILS = [
  { name: 'Keycaps', detail: 'XDA profile · dye-sublimated legends' },
  { name: 'Switches', detail: 'Linear housings · stem + spring' },
  { name: 'Plate', detail: 'Aluminum · switch mounting plate' },
  { name: 'Foam', detail: 'Poron · sound dampening layer' },
  { name: 'PCB', detail: 'FR-4 · hot-swap circuit board' },
  { name: 'Case', detail: 'Tray mount · lower shell' },
];

export default function App() {
  const shell = useRef(null);
  const inputAudio = useRef(null);
  const [showWorlds, setShowWorlds] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const hoveredKey = useKeyboardStore((s) => s.hoveredKey);
  const activeKey = useKeyboardStore((s) => s.activeKey);
  const soundEnabled = useKeyboardStore((s) => s.soundEnabled);
  const setSoundEnabled = useKeyboardStore((s) => s.setSoundEnabled);
  const travel = useKeyboardStore((s) => s.travel);
  const setTravel = useKeyboardStore((s) => s.setTravel);
  const palette = useKeyboardStore((s) => s.palette);
  const setPalette = useKeyboardStore((s) => s.setPalette);
  const caseColor = useKeyboardStore((s) => s.caseColor);
  const setCaseColor = useKeyboardStore((s) => s.setCaseColor);
  const plateFinish = useKeyboardStore((s) => s.plateFinish);
  const setPlateFinish = useKeyboardStore((s) => s.setPlateFinish);
  const soundType = useKeyboardStore((s) => s.soundType);
  const setSoundType = useKeyboardStore((s) => s.setSoundType);
  const explodeStage = useKeyboardStore((s) => s.explodeStage);
  const setExplodeStage = useKeyboardStore((s) => s.setExplodeStage);
  const isolatedLayer = useKeyboardStore((s) => s.isolatedLayer);
  const setIsolatedLayer = useKeyboardStore((s) => s.setIsolatedLayer);
  const selected = hoveredKey ?? activeKey;

  useEffect(() => {
    const heldByCode = new Map();
    let composing = false;
    function playPhysicalClick() {
      if (!useKeyboardStore.getState().soundEnabled) return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        inputAudio.current ||= new AudioContext();
        const ctx = inputAudio.current;
        if (ctx.state === 'suspended') ctx.resume();
        const type = useKeyboardStore.getState().soundType;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const duration = type === 'Thock' ? 0.09 : 0.045;
        osc.type = type === 'Thock' ? 'triangle' : 'square';
        osc.frequency.setValueAtTime(type === 'Thock' ? 440 : 800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(type === 'Thock' ? 95 : 250, ctx.currentTime + duration * 0.7);
        gain.gain.setValueAtTime(type === 'Thock' ? 0.075 : 0.045, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch { /* audio is optional */ }
    }
    function isEditableTarget(target) {
      if (!(target instanceof Element)) return false;
      return Boolean(target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]'));
    }
    function onKeyDown(event) {
      if (event.repeat || event.isComposing || composing || event.keyCode === 229 || isEditableTarget(event.target)) return;
      const index = getKeyIndexForEvent(event);
      if (index < 0) return;
      const isModifier = ['ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight'].includes(event.code);
      const isAltGraph = event.getModifierState?.('AltGraph');
      if (!isModifier && !isAltGraph && (event.metaKey || event.ctrlKey || event.altKey)) return;
      if (event.code === 'Space') event.preventDefault();
      if (heldByCode.has(event.code)) return;
      heldByCode.set(event.code, index);
      useKeyboardStore.getState().pressKey(index);
      playPhysicalClick();
    }
    function onKeyUp(event) {
      const index = heldByCode.get(event.code);
      if (index !== undefined) {
        heldByCode.delete(event.code);
        useKeyboardStore.getState().releaseKey(index);
      }
    }
    function releaseAll() {
      heldByCode.clear();
      useKeyboardStore.getState().clearPressedKeys();
    }
    function onVisibilityChange() { if (document.visibilityState === 'hidden') releaseAll(); }
    function onCompositionStart() { composing = true; releaseAll(); }
    function onCompositionEnd() { composing = false; }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', releaseAll);
    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('compositionstart', onCompositionStart);
    document.addEventListener('compositionend', onCompositionEnd);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', releaseAll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('compositionstart', onCompositionStart);
      document.removeEventListener('compositionend', onCompositionEnd);
    };
  }, []);

  const currentLayer = LAYER_DETAILS.find((layer) => layer.name === isolatedLayer) ?? LAYER_DETAILS[0];
  const currentLayerIndex = LAYER_DETAILS.findIndex((layer) => layer.name === currentLayer.name);
  const currentCase = CASE_FINISHES.find((finish) => finish.color === caseColor)?.name ?? 'Custom';

  useEffect(() => {
    gsap.fromTo('.layer-info-card, .customize-panel, .explode-panel', { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, stagger: 0.08, ease: 'power2.out' });
  }, []);

  return <main className="world-shell" ref={shell}>
    <div className="grain" aria-hidden="true" />
    <WorldHeader className="topbar">
      <div className="brand-lockup">
        <a className="brand" href="/" aria-label="Immersive-Craft home">Immersive-Craft<span className="brand-dot">.</span></a>
        <span className="board-badge">65%</span>
        <p>Mechanical Garden <span>·</span> Pull it apart, one layer at a time</p>
      </div>
      <div className="top-actions">
        <button className={`icon-btn sound-top ${soundEnabled ? 'sound-on' : ''}`} onClick={() => setSoundEnabled(!soundEnabled)} aria-label={soundEnabled ? 'Mute keyboard sound' : 'Enable keyboard sound'} title="Keyboard sound">{soundEnabled ? <SoundIcon /> : <MutedIcon />}</button>
        <div className="sound-toggle" role="group" aria-label="Key sound type">{['Thock', 'Clack'].map((type) => <button key={type} className={soundType === type ? 'selected' : ''} onClick={() => setSoundType(type)} aria-pressed={soundType === type}>{type}</button>)}</div>
        <button className="worlds-toggle" onClick={() => setShowWorlds(true)}>Worlds <span>{String(worlds.length).padStart(2, '0')}</span></button>
        <button className={`customize-toggle ${showSettings ? 'active' : ''}`} onClick={() => setShowSettings((v) => !v)}><span>☷</span> Customize</button>
      </div>
    </WorldHeader>

    <section className="scene-stage" aria-label="Interactive Mechanical Garden 3D world">
      <div className="scene-aura" />
      <div className="canvas-wrap"><KeyboardScene /></div>
      <aside className="layer-info-card">
        <div className="layer-card-kicker"><span>Layer {currentLayerIndex + 1} of 6</span><span className="layer-card-arrows">⌃ <b>⌄</b></span></div>
        <h1>{currentLayer.name}</h1>
        <div className="layer-facts"><span>Key count</span><b>{KEYBOARD_KEYS.length} keys</b><span>Profile</span><b>{currentLayer.name === 'Keycaps' ? 'XDA · one height' : '65% · compact'}</b><span>Legends</span><b>{currentLayer.name === 'Keycaps' ? 'Dye-sublimated' : currentLayer.detail.split(' · ')[0]}</b></div>
        <p>{currentLayer.detail}. Each layer stays aligned as the board comes apart.</p>
        <button className="show-layers" onClick={() => setIsolatedLayer('All layers')}>Show all layers</button>
      </aside>
      <nav className="layer-rail" aria-label="Keyboard assembly layers">{LAYER_DETAILS.map((layer, index) => <button key={layer.name} className={isolatedLayer === layer.name ? 'selected' : ''} onClick={() => setIsolatedLayer(isolatedLayer === layer.name ? 'All layers' : layer.name)} aria-pressed={isolatedLayer === layer.name}><span className="layer-rail-number">{index + 1}</span><span>{layer.name}</span></button>)}</nav>
      <div className="interaction-hint">{selected === null ? 'Type on your keyboard · drag to turn' : `${KEYBOARD_KEYS[selected]?.label ?? ''} key · switch exposed`}</div>
      <div className="explode-panel">
        <div className="explode-heading"><strong>Explode</strong><span>Sliding the case out</span><b>{explodeStage}%</b></div>
        <input className="explode-slider" type="range" min="0" max="100" step="1" value={explodeStage} style={{ background: `linear-gradient(90deg,#8b73dd 0%,#8b73dd ${explodeStage}%,#ded8ed ${explodeStage}%,#ded8ed 100%)` }} onChange={(e) => setExplodeStage(Number(e.target.value))} aria-label="Continuous exploded view, 0 to 100" />
        <div className="slider-caption"><span>Built</span><span>Caps</span><span>Switches</span><span>Plate</span><span>Foam</span><span>PCB</span><span>Case</span></div>
      </div>
    </section>

    {showSettings && <aside className="settings-drawer customize-panel" aria-label="Customize keyboard">
      <div className="drawer-head"><div><p className="eyebrow">CUSTOMIZE</p><h2>Customize</h2></div><button className="close-btn" onClick={() => setShowSettings(false)} aria-label="Close customization">×</button></div>
      <label className="field-label" htmlFor="palette-select">Keycaps <span>{palette}</span></label>
      <div className="palette-options" id="palette-select" role="group" aria-label="Keycap palette">{Object.entries(KEYBOARD_PALETTES).map(([name, colors]) => <button key={name} className={`palette-option ${palette === name ? 'selected' : ''}`} onClick={() => setPalette(name)} aria-pressed={palette === name}>
        <span className="swatches"><i style={{ background: colors.key }} /><i style={{ background: colors.accent }} /><i style={{ background: colors.board }} /></span><span>{name}</span>
      </button>)}</div>
      <div className="customize-section case-section"><label className="field-label">Case <span>{currentCase}</span></label>
        <div className="case-swatches" role="group" aria-label="Case color">{CASE_FINISHES.map((finish) => <button key={finish.name} className={`case-swatch ${caseColor === finish.color ? 'selected' : ''}`} style={{ '--swatch': finish.color }} onClick={() => setCaseColor(finish.color)} aria-label={finish.name} aria-pressed={caseColor === finish.color} title={finish.name} />)}</div>
      </div>
      <div className="customize-section plate-section"><label className="field-label">Plate <span>{plateFinish}</span></label>
        <div className="plate-options" role="group" aria-label="Plate material">{Object.keys(PLATE_FINISHES).map((finish) => <button key={finish} className={plateFinish === finish ? 'selected' : ''} onClick={() => setPlateFinish(finish)} aria-pressed={plateFinish === finish}>{finish}</button>)}</div>
      </div>
      <div className="customize-section travel-section"><div className="field-row"><label className="field-label" htmlFor="travel">Switch travel</label><span className="field-value">{(travel * 4.2).toFixed(1)} mm</span></div>
        <input id="travel" className="travel-slider" type="range" min="0" max="1" step="0.01" value={travel} onChange={(e) => setTravel(Number(e.target.value))} />
      </div>
      <p className="field-help">Pick a layer on the left to isolate it. The others stay visible as 15% ghosts.</p>
    </aside>}

    {showWorlds && <div className="worlds-backdrop" onClick={() => setShowWorlds(false)}>
      <section className="worlds-panel" onClick={(e) => e.stopPropagation()} aria-label="World collection">
        <div className="drawer-head"><div><p className="eyebrow">THE COLLECTION</p><h2>Worlds to wander</h2></div><button className="close-btn" onClick={() => setShowWorlds(false)} aria-label="Close worlds">×</button></div>
        <p className="panel-intro">Browse a collection of small worlds, each with its own atmosphere and pace.</p>
        <div className="world-list">{worlds.map((world, i) => <a className={`world-list-item ${world.status !== 'available' ? 'coming' : ''}`} key={world.id} href={world.status === 'available' ? world.href : undefined} aria-disabled={world.status !== 'available'} onClick={(event) => { if (world.status !== 'available') event.preventDefault(); else setShowWorlds(false); }}>
          <span className={`world-thumb thumb-${i + 1}`}><span>{String(i + 1).padStart(2, '0')}</span></span><span className="world-list-copy"><small>{world.category}</small><b>{world.title}</b></span><span className="world-list-status">{world.status === 'available' ? 'ENTER ↗' : 'COMING SOON'}</span>
        </a>)}</div>
        <a className="archive-link" href="/wireframes/explore.html">Open the full wireframe directory <span>↗</span></a>
      </section>
    </div>}
    <footer className="micro-footer"><span>© IMMERSIVE-CRAFT 2026</span><span>MADE TO BE EXPLORED</span><button onClick={() => setShowSettings(true)}>PREFERENCES</button></footer>
  </main>;
}

function SoundIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 3V7l-4 3H4Z"/><path d="M15 9.5a4 4 0 0 1 0 5M17.5 7a7.5 7.5 0 0 1 0 10"/></svg>; }
function MutedIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 3V7l-4 3H4ZM16 9l5 6M21 9l-5 6"/></svg>; }

