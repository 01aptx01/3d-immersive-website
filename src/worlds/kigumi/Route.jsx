import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';
import { useKigumiStore, ASSEMBLY_STAGES, JOINT_DETAILS } from './store.js';
import KigumiScene from './KigumiScene.jsx';
import './styles.css';
import windLoop from './assets/wind-loop.ogg?url';

function preflightWebGL2() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl || gl.getParameter(gl.MAX_TEXTURE_SIZE) < 1) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

class RendererErrorBoundary extends React.Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFailure?.();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function PavilionFallback({ reason }) {
  const explanation = reason === 'context-lost'
    ? 'The browser lost the graphics context while drawing the pavilion.'
    : reason === 'renderer-error'
      ? 'The browser could not start the pavilion renderer.'
      : 'This browser or device does not currently provide WebGL 2, which the 3D pavilion needs.';
  return <div className="kigumi-fallback" role="alert" aria-live="assertive">
    <svg className="kigumi-fallback-art" viewBox="0 0 900 570" role="img" aria-labelledby="fallback-art-title">
      <title id="fallback-art-title">A quiet illustrated pavilion in a bamboo garden</title>
      <defs><linearGradient id="fallback-sky" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ddd2bf"/><stop offset="1" stopColor="#b8b09f"/></linearGradient></defs>
      <rect width="900" height="570" fill="url(#fallback-sky)"/>
      <circle cx="680" cy="120" r="48" fill="#d9a879" opacity=".75"/>
      <path d="M0 390 Q220 345 450 390 T900 380 V570 H0Z" fill="#999080"/>
      <g stroke="#68684e" strokeWidth="7" opacity=".55">{Array.from({ length: 18 }, (_, i) => <path key={i} d={`M${20 + i * 50} 390 Q${16 + i * 50} ${190 + (i % 4) * 22} ${25 + i * 50} ${25 + (i % 5) * 28}`} fill="none" />)}</g>
      <path d="M205 250 L450 92 L695 250 L660 263 L450 125 L240 263Z" fill="#4a413a" stroke="#6d5445" strokeWidth="8"/>
      <path d="M238 264 H662 V288 H238Z" fill="#815d43"/>
      <g fill="#8e6041" stroke="#674a37" strokeWidth="5"><path d="M270 286 H296 V445 H270Z"/><path d="M437 286 H463 V445 H437Z"/><path d="M604 286 H630 V445 H604Z"/><path d="M282 290 H618 V305 H282Z"/><path d="M282 430 H618 V445 H282Z"/></g>
      <g stroke="#a27c5b" strokeWidth="3" opacity=".75">{Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${315 + i * 38} 305 V430`} />)}</g>
      <path d="M155 468 H745" stroke="#e3d8c7" strokeWidth="24" opacity=".55"/><path d="M155 468 H745" stroke="#766f64" strokeWidth="2" strokeDasharray="5 8"/>
    </svg>
    <section className="kigumi-fallback-card">
      <span className="kigumi-kicker">3D VIEW UNAVAILABLE</span>
      <h2>The pavilion scene could not open</h2>
      <p>{explanation} The seven-stage sequence remains visible at the left. Try a browser or device with WebGL 2 for the interactive build.</p>
      <div className="kigumi-fallback-links"><a href="/?world=mechanical-garden">Open World 01 · Mechanical Garden ↗</a><a href="/wireframes/explore.html">Browse the world directory ↗</a></div>
    </section>
  </div>;
}

export default function KigumiRoute() {
  const stage = useKigumiStore((state) => state.stage);
  const furthestStage = useKigumiStore((state) => state.furthestStage);
  const jointCount = useKigumiStore((state) => state.jointCount);
  const selectedJoint = useKigumiStore((state) => state.selectedJoint);
  const jointPhase = useKigumiStore((state) => state.jointPhase);
  const jointAnimating = useKigumiStore((state) => state.jointAnimating);
  const jointInfoOpen = useKigumiStore((state) => state.jointInfoOpen);
  const soundEnabled = useKigumiStore((state) => state.soundEnabled);
  const jointRunId = useKigumiStore((state) => state.jointRunId);
  const jointMode = useKigumiStore((state) => state.jointMode);
  const setStage = useKigumiStore((state) => state.setStage);
  const advanceAssembly = useKigumiStore((state) => state.advanceAssembly);
  const beginJointReplay = useKigumiStore((state) => state.beginJointReplay);
  const setJointPhase = useKigumiStore((state) => state.setJointPhase);
  const finishJoint = useKigumiStore((state) => state.finishJoint);
  const closeJointInfo = useKigumiStore((state) => state.closeJointInfo);
  const setSoundEnabled = useKigumiStore((state) => state.setSoundEnabled);
  const onRendererFailure = useCallback(() => setWebglStatus('renderer-error'), []);
  const onRendererCanvas = useCallback((canvas) => setRendererCanvas(canvas), []);
  const sceneRef = useRef(null);
  const holdFrame = useRef(0);
  const holdStarted = useRef(0);
  const holdActive = useRef(false);
  const holdPointerId = useRef(null);
  const gestureStart = useRef(null);
  const lastGesture = useRef(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [timeOfDay, setTimeOfDay] = useState(0);
  const [assemblySwipe, setAssemblySwipe] = useState(false);
  const [webglStatus, setWebglStatus] = useState(() => preflightWebGL2() ? 'ready' : 'unsupported');
  const [rendererCanvas, setRendererCanvas] = useState(null);
  const windAudio = useRef(null);
  const currentStage = stage < 0 ? {
    kicker: 'READY TO BUILD',
    title: 'The garden floor',
    description: 'A quiet site before assembly. Begin with the foundation stones, then build upward through the timber frame and roof.',
  } : ASSEMBLY_STAGES[stage];
  const progress = Math.round(((stage === 3 ? 3 + jointCount / 6 : Math.max(0, stage + 1)) / ASSEMBLY_STAGES.length) * 100);

  const stopHold = useCallback(() => {
    if (holdFrame.current) cancelAnimationFrame(holdFrame.current);
    holdFrame.current = 0;
    holdActive.current = false;
    holdPointerId.current = null;
    setHoldProgress(0);
  }, []);
  const startHold = useCallback((event) => {
    if (event?.button !== undefined && event.button !== 0) return;
    if (holdActive.current) return;
    event?.preventDefault?.();
    stopHold();
    holdActive.current = true;
    holdPointerId.current = Number.isInteger(event?.pointerId) ? event.pointerId : null;
    holdStarted.current = performance.now();
    const tick = (now) => {
      const value = Math.min(1, (now - holdStarted.current) / 850);
      setHoldProgress(value);
      if (value >= 1) {
        holdFrame.current = 0;
        holdActive.current = false;
        setHoldProgress(0);
        useKigumiStore.getState().advanceAssembly();
      } else holdFrame.current = requestAnimationFrame(tick);
    };
    holdFrame.current = requestAnimationFrame(tick);
  }, [stopHold]);

  useEffect(() => {
    const endPointerHold = (event) => {
      if (holdActive.current && holdPointerId.current !== null && event.pointerId === holdPointerId.current) stopHold();
    };
    window.addEventListener('pointerup', endPointerHold);
    window.addEventListener('pointercancel', endPointerHold);
    return () => {
      window.removeEventListener('pointerup', endPointerHold);
      window.removeEventListener('pointercancel', endPointerHold);
      if (holdFrame.current) cancelAnimationFrame(holdFrame.current);
      holdActive.current = false;
      holdPointerId.current = null;
    };
  }, [stopHold]);

  useEffect(() => {
    if (!rendererCanvas) return undefined;
    const onContextLost = (event) => {
      event.preventDefault();
      setWebglStatus('context-lost');
    };
    rendererCanvas.addEventListener('webglcontextlost', onContextLost);
    return () => rendererCanvas.removeEventListener('webglcontextlost', onContextLost);
  }, [rendererCanvas]);

  useEffect(() => {
    const node = sceneRef.current;
    if (!node) return undefined;
    const onWheel = (event) => {
      if (Math.abs(event.deltaY) < 9) return;
      const now = performance.now();
      if (now - lastGesture.current < 480) return;
      lastGesture.current = now;
      event.preventDefault();
      event.stopPropagation();
      if (event.deltaY > 0) useKigumiStore.getState().advanceAssembly();
      else {
        const state = useKigumiStore.getState();
        if (state.stage > 0) state.setStage(state.stage - 1);
      }
    };
    const onTouchStart = (event) => {
      if (event.touches?.length !== 1) {
        gestureStart.current = null;
        setAssemblySwipe(false);
        return;
      }
      const touch = event.touches?.[0];
      if (touch) gestureStart.current = { x: touch.clientX, y: touch.clientY, capturesAssembly: false };
    };
    const onTouchMove = (event) => {
      const start = gestureStart.current;
      const touch = event.touches?.[0];
      if (!start || !touch || event.touches.length !== 1) return;
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      if (Math.abs(dy) > 16 && Math.abs(dy) > Math.abs(dx) * 1.2) {
        if (!start.capturesAssembly) setAssemblySwipe(true);
        start.capturesAssembly = true;
        event.preventDefault();
        event.stopPropagation();
      }
    };
    const onTouchEnd = (event) => {
      const start = gestureStart.current;
      const touch = event.changedTouches?.[0];
      gestureStart.current = null;
      setAssemblySwipe(false);
      if (!start || !touch) return;
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      if (!start.capturesAssembly || Math.abs(dy) < 48 || Math.abs(dy) < Math.abs(dx) * 1.15) return;
      const now = performance.now();
      if (now - lastGesture.current < 480) return;
      lastGesture.current = now;
      if (dy < 0) useKigumiStore.getState().advanceAssembly();
      else {
        const state = useKigumiStore.getState();
        if (state.stage > 0) state.setStage(state.stage - 1);
      }
    };
    const onTouchCancel = () => {
      gestureStart.current = null;
      setAssemblySwipe(false);
    };
    node.addEventListener('wheel', onWheel, { capture: true, passive: false });
    node.addEventListener('touchstart', onTouchStart, { capture: true, passive: true });
    node.addEventListener('touchmove', onTouchMove, { capture: true, passive: false });
    node.addEventListener('touchend', onTouchEnd, { capture: true, passive: true });
    node.addEventListener('touchcancel', onTouchCancel, { capture: true, passive: true });
    return () => {
      node.removeEventListener('wheel', onWheel, true);
      node.removeEventListener('touchstart', onTouchStart, true);
      node.removeEventListener('touchmove', onTouchMove, true);
      node.removeEventListener('touchend', onTouchEnd, true);
      node.removeEventListener('touchcancel', onTouchCancel, true);
    };
  }, []);

  const buildLabel = stage < 0 ? 'Hold to place the foundation' : stage === 3 && jointCount < 6 ? `Hold to fit joint ${jointCount + 1} of 6` : stage === 6 ? 'Pavilion complete' : 'Hold to continue assembly';
  const timeLabel = timeOfDay < 25 ? 'Dawn' : timeOfDay < 75 ? 'Sunset' : 'Night';
  const clockLabel = timeOfDay < 25 ? '06:18' : timeOfDay < 75 ? '17:42' : '21:00';

  useEffect(() => {
    const howl = new Howl({ src: [windLoop], format: ['ogg'], loop: true, volume: 0.22, preload: true, mute: true });
    windAudio.current = howl;
    return () => {
      howl.stop();
      howl.unload();
      windAudio.current = null;
    };
  }, []);

  useEffect(() => {
    const howl = windAudio.current;
    if (!howl) return undefined;
    let pauseTimer;
    const windVolume = 0.12 + (progress / 100) * 0.1 + (timeOfDay / 100) * 0.03;
    if (soundEnabled) {
      howl.mute(false);
      if (!howl.playing()) {
        howl.volume(0);
        howl.play();
      }
      howl.fade(howl.volume(), windVolume, 500);
    } else if (howl.playing()) {
      howl.fade(howl.volume(), 0, 320);
      pauseTimer = window.setTimeout(() => {
        howl.pause();
        howl.mute(true);
      }, 340);
    }
    return () => window.clearTimeout(pauseTimer);
  }, [soundEnabled, progress, timeOfDay]);

  return <main className="kigumi-shell" aria-label="Kigumi Pavilion assembly world">
    <div className="kigumi-scene" ref={sceneRef}>
      {webglStatus === 'ready' ? <RendererErrorBoundary onFailure={onRendererFailure}><KigumiScene stage={stage} jointCount={jointCount} selectedJoint={selectedJoint} jointRunId={jointRunId} jointMode={jointMode} jointAnimating={jointAnimating} timeOfDay={timeOfDay} progress={progress} assemblySwipe={assemblySwipe} onReplay={beginJointReplay} onPhase={setJointPhase} onFinish={finishJoint} onRendererCanvas={onRendererCanvas} /></RendererErrorBoundary> : <PavilionFallback reason={webglStatus} />}
    </div>
    <div className="kigumi-grain" aria-hidden="true" />

    <header className="kigumi-topbar">
      <div className="kigumi-brand">
        <a href="/" aria-label="Return to Mechanical Garden">elsewhere<span>.</span></a>
        <div><b>02 / 04</b><small>KIGUMI PAVILION</small></div>
      </div>
      <div className="kigumi-top-copy"><p>木組 · TIMBER ASSEMBLY</p><span>A pavilion assembled one connection at a time</span></div>
      <div className="kigumi-top-tools">
        <button className={`kigumi-sound-toggle ${soundEnabled ? 'sound-on' : ''}`} onClick={() => setSoundEnabled(!soundEnabled)} aria-pressed={soundEnabled} aria-label={soundEnabled ? 'Mute garden wind' : 'Enable garden wind'} title={soundEnabled ? 'Mute garden wind' : 'Enable garden wind'}>{soundEnabled ? '♫' : '♩'}<span>{soundEnabled ? 'WIND ON' : 'SOUND OFF'}</span></button>
        <a className="kigumi-worlds-link" href="/?world=mechanical-garden">WORLD 01 <span>↗</span></a>
      </div>
    </header>

    <nav className="kigumi-stage-rail" aria-label="Pavilion assembly stages">
      <p className="kigumi-rail-title">ASSEMBLY SEQUENCE</p>
      {ASSEMBLY_STAGES.map((item, index) => <button key={item.id} className={`kigumi-stage-button ${index === stage ? 'active' : ''} ${index < furthestStage || (index === 3 && jointCount === 6) ? 'complete' : ''}`} onClick={() => setStage(index)} disabled={jointAnimating || index > furthestStage} aria-current={index === stage ? 'step' : undefined} aria-label={`${item.title}, ${index < furthestStage || (index === 3 && jointCount === 6) ? 'complete' : index === stage ? 'current stage' : 'locked until earlier stages are assembled'}`}>
        <span className="kigumi-stage-number">{String(index + 1).padStart(2, '0')}</span>
        <span><b>{item.title}</b><small>{item.subtitle}</small></span>
        <i aria-hidden="true">{index < stage ? '✓' : '·'}</i>
      </button>)}
      <div className="kigumi-rail-note">Joinery details are presented as an illustrative study; forms vary by region and period.</div>
    </nav>

    <aside className="kigumi-info-card" aria-live="polite">
      <span className="kigumi-kicker">{stage < 0 ? '—' : String(stage + 1).padStart(2, '0')} · {currentStage.kicker}</span>
      <h1>{currentStage.title}</h1>
      <p>{currentStage.description}</p>
      <div className="kigumi-progress" role="progressbar" aria-label="Pavilion assembly progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress} aria-valuetext={`${progress}% assembled${stage === 3 ? `; ${jointCount} of 6 joints seated` : ''}`}><span style={{ width: `${progress}%` }} /></div>
      <div className="kigumi-progress-label"><span>{stage === 3 ? `JOINTS ${jointCount} / 6` : 'ASSEMBLY'}</span><b>{progress}%</b></div>
    </aside>

    <div className="kigumi-controls" aria-label="Assembly navigation">
      <button className="kigumi-previous-button" onClick={() => setStage(Math.max(-1, stage - 1))} disabled={stage < 0 || jointAnimating} aria-label="Previous assembly stage">←</button>
      <div aria-live="polite" aria-atomic="true"><small>{stage < 0 ? 'READY TO BUILD' : `STAGE ${String(stage + 1).padStart(2, '0')} / 07`}</small><b>{stage < 0 ? 'Foundation stones' : currentStage.title}</b></div>
      <button className={`kigumi-build-button ${holdProgress > 0 ? 'holding' : ''}`} onPointerDown={(event) => { try { event.currentTarget.setPointerCapture?.(event.pointerId); } catch { /* Global pointer listeners cover capture failures. */ } startHold(event); }} onPointerCancel={stopHold} onLostPointerCapture={stopHold} onKeyDown={(event) => { if (!event.repeat && (event.key === ' ' || event.key === 'Enter')) startHold(event); }} onKeyUp={(event) => { if (event.key === ' ' || event.key === 'Enter') stopHold(); }} onBlur={stopHold} disabled={jointAnimating || stage === 6 || webglStatus !== 'ready'} aria-label={buildLabel} aria-describedby="build-help" aria-keyshortcuts="Space Enter">
        <span className="kigumi-hold-progress" style={{ transform: `scaleX(${holdProgress})` }} />
        <span>{stage === 6 ? '✓' : holdProgress > 0 ? 'HOLD' : 'BUILD'}</span>
      </button>
    </div>

    <section className="kigumi-time-panel" aria-label="Time of day">
      <div className="kigumi-time-heading"><span>TIME OF DAY</span><b aria-live="polite" aria-atomic="true">{timeLabel} <small>{clockLabel}</small></b></div>
      <input aria-label="Change time from dawn through sunset to night" aria-valuetext={`${timeLabel}, ${clockLabel}`} type="range" min="0" max="100" step="1" value={timeOfDay} disabled={webglStatus !== 'ready'} style={{ '--time-progress': `${timeOfDay}%` }} onChange={(event) => setTimeOfDay(Number(event.target.value))} />
      <div className="kigumi-time-stops"><span>Dawn</span><span>Sunset</span><span>Night</span></div>
    </section>
    <p id="build-help" className="kigumi-build-help">Hold to assemble · scroll over the scene to step</p>

    {jointInfoOpen && selectedJoint >= 0 && <aside className="kigumi-joint-card" aria-live="polite">
      <button className="kigumi-joint-close" onClick={closeJointInfo} aria-label="Close joinery information">×</button>
      <span className="kigumi-kicker">CONNECTION STUDY · {jointPhase.toUpperCase()}</span>
      <h2>{JOINT_DETAILS[selectedJoint].name}</h2>
      <span className="kigumi-history-label">HISTORICAL CONTEXT</span>
      <p>{JOINT_DETAILS[selectedJoint].history}</p>
      <a className="kigumi-history-source" href="https://www.kiyomizudera.or.jp/en/learn/" target="_blank" rel="noreferrer">Kiyomizu-dera · official architecture history ↗</a>
    </aside>}
  </main>;
}
