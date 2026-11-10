import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import KeyboardScene from './KeyboardScene.jsx';
import { useKeyboardStore, KEYBOARD_PALETTES, CASE_FINISHES, ASSEMBLY_LAYERS } from './store.js';
import { worlds } from '../catalog.js';
import { KEYBOARD_KEYS } from './KeyboardScene.jsx';

export default function App() {
  const shell = useRef(null);
  const inputAudio = useRef(null);
  const [showWorlds, setShowWorlds] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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
  const soundType = useKeyboardStore((s) => s.soundType);
  const setSoundType = useKeyboardStore((s) => s.setSoundType);
  const explodeStage = useKeyboardStore((s) => s.explodeStage);
  const setExplodeStage = useKeyboardStore((s) => s.setExplodeStage);
  const isolatedLayer = useKeyboardStore((s) => s.isolatedLayer);
  const setIsolatedLayer = useKeyboardStore((s) => s.setIsolatedLayer);
  const selected = hoveredKey ?? activeKey;

  useEffect(() => {
    const aliases = { ' ': 'SPACE', Enter: 'ENTER', Shift: 'SHIFT', Backspace: '⌫', Tab: 'TAB', CapsLock: 'CAPS', Escape: 'ESC', Control: 'CTRL', Alt: 'ALT', Meta: '⌘', ArrowLeft: '◀', ArrowDown: '▼', ArrowRight: '▶' };
    function keyLabel(event) {
      if (event.code === 'Space') return 'SPACE';
      return aliases[event.key] || event.key.toUpperCase();
    }
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
    function onKeyDown(event) {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      const label = keyLabel(event);
      const index = KEYBOARD_KEYS.findIndex((key) => key.label === label);
      if (index < 0) return;
      if (label === 'SPACE') event.preventDefault();
      useKeyboardStore.getState().setActiveKey(index);
      playPhysicalClick();
    }
    function onKeyUp(event) {
      const index = KEYBOARD_KEYS.findIndex((key) => key.label === keyLabel(event));
      if (index >= 0 && useKeyboardStore.getState().activeKey === index) useKeyboardStore.getState().setActiveKey(null);
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    gsap.fromTo('.hero-copy > *', { y: 14, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.09, duration: 0.8, ease: 'power3.out' });
    gsap.fromTo('.control-card', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.15, ease: 'power2.out' });
  }, []);

  return <main className="world-shell" ref={shell}>
    <div className="grain" aria-hidden="true" />
    <header className="topbar">
      <a className="brand" href="/" aria-label="Elsewhere home"><span className="brand-mark">e</span><span>elsewhere<span className="brand-dot">.</span></span></a>
      <nav className="main-nav" aria-label="Main navigation">
        <button className="nav-link active" onClick={() => setShowWorlds(false)}>World 01</button>
        <button className="nav-link" onClick={() => setShowWorlds((v) => !v)}>Explore worlds <span className="nav-count">03</span></button>
      </nav>
      <div className="top-actions">
        <a className="text-link wireframe-link" href="/wireframes/index.html">Wireframe archive <span aria-hidden="true">↗</span></a>
        <button className="icon-btn sound-top" onClick={() => setSoundEnabled(!soundEnabled)} aria-label={soundEnabled ? 'Mute keyboard sound' : 'Enable keyboard sound'} title="Keyboard sound">{soundEnabled ? <SoundIcon /> : <MutedIcon />}</button>
        <button className="avatar" onClick={() => setShowSettings(true)} aria-label="Open world settings">D</button>
      </div>
    </header>

    <section className="scene-stage" aria-label="Interactive Mechanical Garden 3D world">
      <div className="scene-aura" />
      <div className="scene-label"><span className="live-dot" /> INTERACTIVE OBJECT STUDY <span className="label-separator">/</span> WORLD 01</div>
      <div className="canvas-wrap"><KeyboardScene /></div>
      <div className="scene-orbit-copy"><span>FIG. 01</span><span className="orbit-line"/><span>MECH / 75%</span></div>
      <div className="scene-index">0<span>1</span><i> — </i>0<span>3</span></div>
      <div className="gesture-hint"><span className="mouse-icon" /><span>DRAG TO ROTATE<br /><small>SCROLL TO EXPLORE</small></span></div>

      <div className="hero-copy">
        <p className="eyebrow"><span className="eyebrow-line" />{worlds[0].category}</p>
        <h1>Mechanical<br /><em>Garden</em></h1>
        <p className="hero-description">{worlds[0].description}</p>
        <div className="hero-actions">
          <button className="primary-btn" onClick={() => setShowSettings((v) => !v)}><span className="sparkle">✳</span> Customize this world <span className="btn-arrow">↗</span></button>
          <button className="quiet-btn" onClick={() => setSoundEnabled(!soundEnabled)}><span className="sound-bars" aria-hidden="true"><i/><i/><i/><i/></span>{soundEnabled ? 'Sound on' : 'Sound off'}</button>
        </div>
      </div>

      <div className="control-card">
        <div className="card-heading"><div><span className="eyebrow">LIVE INTERACTION</span><h2>{selected === null ? 'Find your key' : `Key ${selected + 1} · lifted`}</h2></div><span className="keyboard-glyph">⌘<b>K</b></span></div>
        <p className="card-description">{selected === null ? 'Hover or press a physical key to reveal the switch.' : 'The cap lifts above its spring and switch housings.'}</p>
        <div className="interaction-rule" />
        <div className="card-footer"><span className="status-dot" /> <span>{selected === null ? 'WORLD IS LISTENING' : 'SWITCH EXPOSED'}</span><span className="card-footer-right">{selected === null ? '01 / 03' : 'ACTIVE'}</span></div>
      </div>

      <div className="bottom-bar">
        <div className="world-name"><span className="world-number">01</span><span className="world-sep"/><span><b>Mechanical Garden</b><small>OBJECT STUDY · 4 MIN</small></span></div>
        <div className="progress-area explode-control"><div className="progress-label"><span>EXPLODED VIEW</span><span>{explodeStage}<i> / 100</i></span></div><input className="explode-slider" type="range" min="0" max="100" step="1" value={explodeStage} style={{ background: `linear-gradient(90deg,#d0b591 0%,#d0b591 ${explodeStage}%,#464a54 ${explodeStage}%,#464a54 100%)` }} onChange={(e) => setExplodeStage(Number(e.target.value))} aria-label="Continuous exploded view, 0 to 100" /><div className="slider-caption"><span>ASSEMBLED</span><span>DISASSEMBLED</span></div></div>
        <button className="next-world" onClick={() => setShowWorlds(true)} aria-label="Browse other worlds">NEXT WORLD <span>→</span></button>
      </div>
    </section>

    {showSettings && <aside className="settings-drawer" aria-label="World customization">
      <div className="drawer-head"><div><p className="eyebrow">MAKE IT YOURS</p><h2>World settings</h2></div><button className="close-btn" onClick={() => setShowSettings(false)} aria-label="Close settings">×</button></div>
      <label className="field-label" htmlFor="palette-select">Keycap palette</label>
      <div className="palette-options" id="palette-select">{Object.entries(KEYBOARD_PALETTES).map(([name, colors]) => <button key={name} className={`palette-option ${palette === name ? 'selected' : ''}`} onClick={() => setPalette(name)} aria-pressed={palette === name}>
        <span className="swatches"><i style={{ background: colors.key }} /><i style={{ background: colors.accent }} /><i style={{ background: colors.board }} /></span><span>{name}</span>{palette === name && <span className="check">✓</span>}
      </button>)}</div>
      <label className="field-label case-label">Case finish</label>
      <div className="case-swatches" role="group" aria-label="Case finish">{CASE_FINISHES.map((finish) => <button key={finish.name} className={`case-swatch ${caseColor === finish.color ? 'selected' : ''}`} style={{ '--swatch': finish.color }} onClick={() => setCaseColor(finish.color)} aria-label={finish.name} aria-pressed={caseColor === finish.color}><span>{finish.name}</span></button>)}</div>
      <label className="field-label isolate-label">Isolate a layer</label>
      <div className="layer-options">{ASSEMBLY_LAYERS.map((layer) => <button key={layer} className={isolatedLayer === layer ? 'selected' : ''} onClick={() => setIsolatedLayer(layer)} aria-pressed={isolatedLayer === layer}>{layer}</button>)}</div>
      <p className="field-help">Click a part in the scene to isolate it. Double-click a keycap so a single click can still press it. Other layers stay visible as a 15% ghost.</p>
      <div className="field-row"><label className="field-label" htmlFor="travel">Switch travel</label><span className="field-value">{Math.round(travel * 4.2)} mm</span></div>
      <input id="travel" className="travel-slider" type="range" min="0" max="1" step="0.01" value={travel} onChange={(e) => setTravel(Number(e.target.value))} />
      <p className="field-help">Adjust the keyboard angle and feel of the interaction.</p>
      <div className="field-row sound-heading"><label className="field-label">Key sound</label><span className="field-value">{soundType.toUpperCase()}</span></div>
      <div className="sound-options">{['Thock', 'Clack'].map((type) => <button key={type} className={soundType === type ? 'selected' : ''} onClick={() => setSoundType(type)} aria-pressed={soundType === type}>{type}<small>{type === 'Thock' ? 'LOW + MUTED' : 'BRIGHT + CRISP'}</small></button>)}</div>
      <div className="drawer-note"><span>✳</span><p>Hover each key to see how the switch works beneath it.</p></div>
    </aside>}

    {showWorlds && <div className="worlds-backdrop" onClick={() => setShowWorlds(false)}>
      <section className="worlds-panel" onClick={(e) => e.stopPropagation()} aria-label="World collection">
        <div className="drawer-head"><div><p className="eyebrow">THE COLLECTION</p><h2>Worlds to wander</h2></div><button className="close-btn" onClick={() => setShowWorlds(false)} aria-label="Close worlds">×</button></div>
        <p className="panel-intro">Three small worlds, each with its own atmosphere and pace.</p>
        <div className="world-list">{worlds.map((world, i) => <button className={`world-list-item ${world.status !== 'available' ? 'coming' : ''}`} key={world.id} onClick={() => { if (world.status === 'available') setShowWorlds(false); }}>
          <span className={`world-thumb thumb-${i + 1}`}><span>{String(i + 1).padStart(2, '0')}</span></span><span className="world-list-copy"><small>{world.category}</small><b>{world.title}</b></span><span className="world-list-status">{world.status === 'available' ? 'ENTER ↗' : 'COMING SOON'}</span>
        </button>)}</div>
        <a className="archive-link" href="/wireframes/explore.html">Open the full wireframe directory <span>↗</span></a>
      </section>
    </div>}
    <footer className="micro-footer"><span>© ELSEWHERE 2026</span><span>MADE TO BE EXPLORED</span><button onClick={() => setShowSettings(true)}>PREFERENCES</button></footer>
  </main>;
}

function SoundIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 3V7l-4 3H4Z"/><path d="M15 9.5a4 4 0 0 1 0 5M17.5 7a7.5 7.5 0 0 1 0 10"/></svg>; }
function MutedIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l4 3V7l-4 3H4ZM16 9l5 6M21 9l-5 6"/></svg>; }

