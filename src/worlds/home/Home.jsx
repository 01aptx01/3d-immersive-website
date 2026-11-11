import { useCallback, useEffect, useRef, useState } from 'react';
import { worlds } from '../catalog.js';
import './home.css';

const SHOWCASES = worlds.filter((world) => world.status === 'available').map((world) => ({
  ...world,
  name: world.title,
  src: world.id === 'kigumi' ? '/?world=kigumi&preview=1' : '/?world=mechanical-garden&preview=1',
  eyebrow: world.id === 'kigumi' ? 'WORLD 02 · TIMBER ASSEMBLY' : 'WORLD 01 · KEYBOARD STUDY',
  summary: world.id === 'kigumi'
    ? 'Watch the timber frame rise, lock together, and become a quiet garden pavilion.'
    : 'Explore a pastel mechanical keyboard, tune its details, and reveal every layer.',
  features: world.id === 'kigumi'
    ? ['Seven construction stages', 'Six replayable timber joints', 'Dawn to night atmosphere']
    : ['Six inspectable keyboard layers', 'Five keycap palettes', 'Continuous exploded view'],
  demoSeconds: world.id === 'kigumi' ? 52000 : 30000,
}));

function setRange(input, value) {
  if (!input) return;
  const win = input.ownerDocument.defaultView;
  const setter = Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, 'value').set;
  setter.call(input, String(value));
  input.dispatchEvent(new win.Event('input', { bubbles: true }));
  input.dispatchEvent(new win.Event('change', { bubbles: true }));
}

function driveKeyboardDemo(doc, tick) {
  const palettes = ['Milkshake', 'Matcha', 'Lavender Fog', 'Peach Soda', 'Blueberry Milk'];
  const palette = palettes[Math.floor(tick / 3) % palettes.length];
  if (tick === 0 && !doc.querySelector('.settings-drawer')) doc.querySelector('.customize-toggle')?.click();
  [...doc.querySelectorAll('.palette-option')].find((button) => button.textContent.includes(palette))?.click();
  const caseNames = ['Cloud', 'Lilac', 'Blush', 'Mint', 'Butter', 'Periwinkle', 'Plum'];
  doc.querySelector(`[aria-label="${caseNames[tick % caseNames.length]}"]`)?.click();
  const plateOptions = doc.querySelectorAll('.plate-options button');
  if (plateOptions.length) plateOptions[Math.floor(tick / 2) % plateOptions.length].click();
  setRange(doc.querySelector('.travel-slider'), [0.15, 0.55, 0.92][tick % 3]);
  setRange(doc.querySelector('.explode-slider'), [0, 35, 72, 98, 55, 12][tick % 6]);
  const layerButtons = doc.querySelectorAll('.layer-rail button');
  const layer = tick % 7;
  if (layerButtons[layer]) layerButtons[layer].click();
}

function drivePavilionDemo(doc, tick, phase) {
  if (tick === 0) {
    const buildButton = doc.querySelector('.kigumi-build-button');
    if (!buildButton || buildButton.disabled) return false;
    buildButton.click();
    return true;
  }
  const slider = doc.querySelector('.kigumi-time-panel input');
  if (slider && !slider.disabled) setRange(slider, [0, 42, 100, 67][tick % 4]);
  // After the pavilion is complete, briefly revisit and replay one joint.
  const stages = doc.querySelectorAll('.kigumi-stage-button');
  const progress = doc.querySelector('.kigumi-progress')?.getAttribute('aria-valuenow');
  if (phase.current === 0 && progress === '100' && stages[3] && !stages[3].disabled) {
    stages[3].click();
    phase.current = 1;
  } else if (phase.current === 1) {
    const marker = doc.querySelector('.kigumi-joint-marker');
    if (marker) { marker.click(); phase.current = 2; }
  } else if (phase.current === 2 && doc.querySelector('.kigumi-joint-card .kigumi-kicker')?.textContent.includes('LOCKED')) {
    if (stages[6] && !stages[6].disabled) { stages[6].click(); phase.current = 3; }
  }
  return true;
}

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [frameReady, setFrameReady] = useState(false);
  const [frameError, setFrameError] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => typeof document === 'undefined' || !document.hidden);
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const frameRef = useRef(null);
  const demoTickRef = useRef(0);
  const buildWasRunningRef = useRef(false);
  const pavilionDemoPhase = useRef(0);
  const active = SHOWCASES[activeIndex];

  useEffect(() => {
    const visibility = () => setPageVisible(!document.hidden);
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const motion = (event) => setReducedMotion(event.matches);
    document.addEventListener('visibilitychange', visibility);
    query.addEventListener?.('change', motion);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      query.removeEventListener?.('change', motion);
    };
  }, []);

  const move = useCallback((direction) => {
    setFrameReady(false);
    setFrameError(false);
    setProgress(0);
    setActiveIndex((index) => (index + direction + SHOWCASES.length) % SHOWCASES.length);
  }, []);

  useEffect(() => {
    if (!frameReady || paused || reducedMotion || !pageVisible) return undefined;
    const duration = active.demoSeconds;
    const startedAt = performance.now();
    let timer;
    const advance = () => {
      const elapsed = performance.now() - startedAt;
      setProgress(Math.min(100, (elapsed / duration) * 100));
      if (elapsed >= duration) {
        if (active.id !== 'kigumi' || isPavilionComplete() || (docHasFallback() || elapsed >= duration + 60000)) move(1);
        else {
          setProgress(99);
          timer = window.setTimeout(advance, 1000);
        }
      }
      else timer = window.setTimeout(advance, 120);
    };
    timer = window.setTimeout(advance, 120);
    return () => window.clearTimeout(timer);
  }, [active.demoSeconds, active.id, frameReady, move, pageVisible, paused, reducedMotion]);

  const isPavilionComplete = () => {
    const doc = frameRef.current?.contentDocument;
    const progress = doc?.querySelector('.kigumi-progress');
    return pavilionDemoPhase.current === 3 && progress?.getAttribute('aria-valuenow') === '100' && Boolean(doc.querySelector('.kigumi-stage-button.active')?.textContent.includes('07'));
  };

  const docHasFallback = () => frameError || Boolean(frameRef.current?.contentDocument?.querySelector('.kigumi-fallback'));

  useEffect(() => {
    if (!frameReady || frameError || paused || reducedMotion || !pageVisible) return undefined;
    const doc = frameRef.current?.contentDocument;
    if (!doc) return undefined;
    const drive = () => {
      if (!doc.querySelector('.world-shell, .kigumi-shell')) return;
      const tick = demoTickRef.current;
      const advanced = active.id === 'kigumi' ? drivePavilionDemo(doc, tick, pavilionDemoPhase) : (driveKeyboardDemo(doc, tick), true);
      if (advanced) demoTickRef.current += 1;
    };
    drive();
    const timer = window.setInterval(drive, active.id === 'kigumi' ? 2600 : 1800);
    return () => window.clearInterval(timer);
  }, [active.id, frameError, frameReady, pageVisible, paused, reducedMotion]);

  const onFrameLoad = () => {
    setFrameReady(false);
    setFrameError(false);
    const frame = frameRef.current;
    let attempts = 0;
    const findReady = () => {
      if (frameRef.current !== frame) return;
      const doc = frame?.contentDocument;
      if (!doc) return;
      const ready = doc.querySelector('.world-shell, .kigumi-shell, .kigumi-fallback');
      if (ready) {
        // Keep the demo controls available to the driver while presenting an
        // unobstructed scene beneath the carousel's own text and actions.
        if (!doc.getElementById('world-preview-chrome')) {
          const style = doc.createElement('style');
          style.id = 'world-preview-chrome';
          style.textContent = `.world-header, .settings-drawer, .layer-info-card, .layer-rail,
            .interaction-hint, .explode-panel, .micro-footer, .kigumi-build-status,
            .kigumi-stage-rail, .kigumi-info-card, .kigumi-controls, .kigumi-time-panel,
            .kigumi-build-help, .kigumi-joint-card, .kigumi-joint-marker {
              opacity: 0 !important; pointer-events: none !important;
            }`;
          doc.head.appendChild(style);
        }
        const sound = doc.querySelector('.sound-top, .kigumi-sound-toggle');
        if (sound && (sound.classList.contains('sound-on') || sound.getAttribute('aria-pressed') === 'true')) sound.click();
        setFrameReady(true);
        return;
      }
      if (attempts++ < 80) window.setTimeout(findReady, 200);
      else { setFrameError(true); setFrameReady(true); }
    };
    window.setTimeout(findReady, 80);
  };

  useEffect(() => {
    demoTickRef.current = 0;
    buildWasRunningRef.current = false;
    pavilionDemoPhase.current = 0;
  }, [active.id]);

  useEffect(() => {
    if (active.id !== 'kigumi' || !frameReady) return;
    const button = frameRef.current?.contentDocument?.querySelector('.kigumi-build-button');
    if (paused || reducedMotion || !pageVisible) {
      if (button?.getAttribute('aria-pressed') === 'true') {
        buildWasRunningRef.current = true;
        button.click();
      }
    } else if (buildWasRunningRef.current && button && !button.disabled && button.getAttribute('aria-pressed') !== 'true') {
      buildWasRunningRef.current = false;
      button.click();
    }
  }, [active.id, frameReady, pageVisible, paused, reducedMotion]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.target instanceof HTMLElement && event.target.closest('button,a,input,select,textarea,[contenteditable="true"]')) return;
      if (event.key === 'ArrowRight') move(1);
      if (event.key === 'ArrowLeft') move(-1);
      if (event.key === ' ') { event.preventDefault(); setPaused((value) => !value); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move]);

  return <main className="world-home" aria-label="Immersive-Craft worlds">
    <div className="home-ambient" aria-hidden="true" />
    <header className="home-header">
      <a className="home-brand" href="/">Immersive-Craft<span>✳</span></a>
      <span className="home-header-note">INTERACTIVE 3D STUDIES</span>
    <a className="home-all-worlds" href="/?world=mechanical-garden">Open first world</a>
    </header>
    <section className="home-hero" aria-roledescription="carousel" aria-label="Featured worlds">
      <div className={`home-copy ${frameReady ? 'is-visible' : ''}`} key={active.id}>
        <span className="home-eyebrow">{active.eyebrow}</span>
        <h1>{active.name}</h1>
        <p className="home-summary">{active.summary}</p>
        <ul className="home-features">{active.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
        <a className="home-enter" href={active.id === 'kigumi' ? '/?world=kigumi' : '/?world=mechanical-garden'}>Explore {active.name}</a>
        <button className="home-pause" onClick={() => setPaused((value) => !value)} aria-pressed={paused} aria-label={paused ? 'Resume world preview' : 'Pause world preview'}>{paused ? 'Resume preview' : 'Pause preview'}</button>
        <div className="home-indicators" role="group" aria-label="Choose featured world">
          {SHOWCASES.map((world, index) => <button key={world.id} className={index === activeIndex ? 'active' : ''} onClick={() => { if (index === activeIndex) return; setFrameReady(false); setFrameError(false); setProgress(0); setActiveIndex(index); }} aria-label={`Show ${world.name}`} aria-current={index === activeIndex ? 'true' : undefined}>
            <span className={index === activeIndex ? 'home-progress' : ''} style={index === activeIndex ? { transform: `scaleX(${progress / 100})` } : undefined} />
          </button>)}
        </div>
      </div>
      <div className={`home-preview home-preview--${active.id}`} aria-label={`${active.name} live preview`}>
        <iframe key={active.id} ref={frameRef} src={active.src} title={`${active.name} animated preview`} onLoad={onFrameLoad} tabIndex={-1} aria-hidden="true" />
        <div className={`home-preview-shade ${frameReady ? 'ready' : ''}`} aria-hidden="true" />
        {frameError && <div className="home-preview-error" role="status">Preview unavailable. You can still open this world.</div>}
        <div className="home-preview-label"><span className="home-live-dot" /> LIVE PREVIEW <span>{frameError ? 'UNAVAILABLE' : frameReady ? 'DEMO' : 'LOADING'}</span></div>
      </div>
      <button className="home-arrow previous" onClick={() => move(-1)} aria-label="Previous world">‹</button>
      <button className="home-arrow next" onClick={() => move(1)} aria-label="Next world">›</button>
    </section>
    <footer className="home-footer"><span>{String(activeIndex + 1).padStart(2, '0')} / {String(SHOWCASES.length).padStart(2, '0')}</span><span>Previews cycle automatically · use arrows to browse</span></footer>
  </main>;
}
