import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useKeyboardStore, KEYBOARD_PALETTES, PLATE_FINISHES } from './store';

const ROWS = [
  { keys: ['ESC', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '⌫'], offset: 0.0 },
  { keys: ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'], offset: 0.15 },
  { keys: ['CAPS', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'ENTER'], offset: 0.25 },
  { keys: ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'SHIFT', '▲'], offset: 0.38 },
  { keys: ['CTRL', '⌘', 'ALT', 'SPACE', 'ALT', 'FN', '◀', '▼', '▶'], offset: 0.53 },
];
const KEY_CODES = [
  ['Escape', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', 'Backspace'],
  ['Tab', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash'],
  ['CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Enter'],
  ['ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', 'ShiftRight', 'ArrowUp'],
  ['ControlLeft', 'MetaLeft', 'AltLeft', 'Space', 'AltRight', 'Fn', 'ArrowLeft', 'ArrowDown', 'ArrowRight'],
];
const SHIFTED_CHARACTERS = {
  '1': '!', '2': '@', '3': '#', '4': '$', '5': '%', '6': '^', '7': '&', '8': '*', '9': '(', '0': ')',
  '-': '_', '=': '+', '[': '{', ']': '}', '\\': '|', ';': ':', "'": '"', ',': '<', '.': '>', '/': '?',
};
const KEY_W = 0.43;
const KEY_D = 0.42;
const GAP = 0.065;
function keyWidthUnits(label, rowIndex, col) {
  if (label === 'SPACE') return 6.25;
  if (label === 'SHIFT') return col === ROWS[rowIndex].keys.length - 2 ? 1.75 : 2.25;
  if (label === 'ENTER') return 2.25;
  if (label === 'CAPS') return 1.75;
  if (label === 'TAB' || label === '⌫' || label === '\\') return 1.5;
  if (['CTRL', 'ALT', 'FN', '⌘'].includes(label)) return 1.25;
  return 1;
}
export const KEYBOARD_KEYS = ROWS.flatMap((row, rowIndex) => {
  const keys = row.keys.map((label, col) => {
    const units = keyWidthUnits(label, rowIndex, col);
    return { label, code: KEY_CODES[rowIndex][col], row: rowIndex, col, width: KEY_W * units, units, shifted: SHIFTED_CHARACTERS[label] ?? null, z: (rowIndex - 2) * (KEY_D + GAP) };
  });
  const rowWidth = keys.reduce((width, key) => width + key.width, GAP * (keys.length - 1));
  let cursor = -rowWidth / 2;
  return keys.map((key) => {
    const x = cursor + key.width / 2 + row.offset;
    cursor += key.width + GAP;
    return { ...key, x };
  });
}).flat();

const PRINTABLE_KEY_INDEX = new Map();
KEYBOARD_KEYS.forEach((key, index) => {
  if (key.label.length === 1) {
    PRINTABLE_KEY_INDEX.set(key.label.toLocaleLowerCase(), index);
    const shifted = SHIFTED_CHARACTERS[key.label];
    if (shifted) PRINTABLE_KEY_INDEX.set(shifted, index);
  }
});
PRINTABLE_KEY_INDEX.set(' ', KEYBOARD_KEYS.findIndex((key) => key.label === 'SPACE'));
const NON_PRINTING_SINGLE_GLYPHS = new Set(['⌘', '◀', '▼', '▶', '▲']);

// Printable keys follow the browser's active layout (event.key). Physical codes are
// reserved for non-printing keys so AZERTY and other layouts resolve the character
// the user actually typed instead of the key's US-position label.
export function getKeyIndexForEvent(event) {
  if (typeof event.key === 'string' && event.key.length === 1) {
    return PRINTABLE_KEY_INDEX.get(event.key.toLocaleLowerCase()) ?? -1;
  }
  const codeIndex = KEYBOARD_KEYS.findIndex((key) => key.code === event.code);
  if (codeIndex >= 0 && KEYBOARD_KEYS[codeIndex].label.length === 1 && !NON_PRINTING_SINGLE_GLYPHS.has(KEYBOARD_KEYS[codeIndex].label)) return -1;
  return codeIndex;
}

function SpringCoil({ keyInfo, y, opacity = 1 }) {
  const geometry = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 28; i++) {
      const t = i / 28;
      const angle = t * Math.PI * 8;
      points.push(new THREE.Vector3(keyInfo.x + Math.cos(angle) * 0.048, y + t * 0.15, keyInfo.z + Math.sin(angle) * 0.048));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 56, 0.009, 6, false);
  }, [keyInfo, y]);
  return <mesh geometry={geometry} castShadow><meshStandardMaterial color="#e6b57c" metalness={0.72} roughness={0.24} transparent={opacity < 1} opacity={opacity} depthWrite={opacity === 1} /></mesh>;
}

function KeyboardAssembly({ color }) {
  const caps = useRef();
  const lowerHousings = useRef();
  const upperHousings = useRef();
  const stems = useRef();
  const hovered = useKeyboardStore((s) => s.hoveredKey);
  const travel = useKeyboardStore((s) => s.travel);
  const explode = useKeyboardStore((s) => s.explodeStage);
  const isolatedLayer = useKeyboardStore((s) => s.isolatedLayer);
  const caseColor = useKeyboardStore((s) => s.caseColor);
  const plateFinish = useKeyboardStore((s) => s.plateFinish);
  const soundType = useKeyboardStore((s) => s.soundType);
  const setHoveredKey = useKeyboardStore((s) => s.setHoveredKey);
  const pressedKeys = useKeyboardStore((s) => s.pressedKeys);
  const pressKey = useKeyboardStore((s) => s.pressKey);
  const releaseKey = useKeyboardStore((s) => s.releaseKey);
  const soundEnabled = useKeyboardStore((s) => s.soundEnabled);
  const sound = useRef(null);
  const geometries = useMemo(() => ({
    cap: new THREE.BoxGeometry(1, 1, 1),
    housing: new THREE.BoxGeometry(1, 1, 1),
    stem: new THREE.BoxGeometry(1, 1, 1),
  }), []);
  const amount = Math.min(100, Math.max(0, explode)) / 100;
  const layerOpacity = (layer) => isolatedLayer === 'All layers' || isolatedLayer === layer ? 1 : 0.15;
  const matProps = (layer) => ({ transparent: layerOpacity(layer) < 1, opacity: layerOpacity(layer), depthWrite: layerOpacity(layer) === 1 });
  const offsets = {
    foam: amount * 0.2,
    pcb: amount * 0.43,
    plate: amount * 0.7,
    switches: amount * 0.96,
    caps: amount * 1.38,
  };
  const isolateLayer = (layer, event) => {
    event?.stopPropagation();
    setIsolatedLayer(isolatedLayer === layer ? 'All layers' : layer);
  };

  useFrame(() => {
    if (!caps.current) return;
    KEYBOARD_KEYS.forEach((key, i) => {
      const isHovered = hovered === i;
      const isPressed = pressedKeys.has(i);
      const press = isPressed ? 0.025 + travel * 0.12 : 0;
      const capY = 0.39 + offsets.caps + (isHovered ? 0.4 : 0) - press;
      const capMatrix = new THREE.Matrix4().compose(new THREE.Vector3(key.x, capY, key.z), new THREE.Quaternion(), new THREE.Vector3(key.width, 0.2, KEY_D));
      caps.current.setMatrixAt(i, capMatrix);
      caps.current.setColorAt(i, new THREE.Color(isHovered ? color.accent : color.key));

      const lowerY = 0.245 + offsets.switches;
      const lower = new THREE.Matrix4().compose(new THREE.Vector3(key.x, lowerY, key.z), new THREE.Quaternion(), new THREE.Vector3(0.27, 0.09, 0.27));
      lowerHousings.current.setMatrixAt(i, lower);
      const upperY = 0.355 + offsets.switches + (isHovered ? 0.12 : 0);
      const upper = new THREE.Matrix4().compose(new THREE.Vector3(key.x, upperY, key.z), new THREE.Quaternion(), new THREE.Vector3(0.245, 0.055, 0.245));
      upperHousings.current.setMatrixAt(i, upper);
      const stemY = 0.39 + offsets.switches + (isHovered ? 0.2 : 0) - press;
      const stem = new THREE.Matrix4().compose(new THREE.Vector3(key.x, stemY, key.z), new THREE.Quaternion(), new THREE.Vector3(0.065, 0.2, 0.065));
      stems.current.setMatrixAt(i, stem);
    });
    for (const ref of [caps, lowerHousings, upperHousings, stems]) {
      if (!ref.current) continue;
      ref.current.instanceMatrix.needsUpdate = true;
      if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
    }
  });

  function playClick() {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      sound.current ||= new AudioContext();
      const ctx = sound.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const duration = soundType === 'Thock' ? 0.09 : 0.045;
      osc.type = soundType === 'Thock' ? 'triangle' : 'square';
      osc.frequency.setValueAtTime(soundType === 'Thock' ? 440 : 800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(soundType === 'Thock' ? 95 : 250, ctx.currentTime + duration * 0.7);
      gain.gain.setValueAtTime(soundType === 'Thock' ? 0.075 : 0.045, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch { /* audio is an optional enhancement */ }
  }

  const activeKey = useKeyboardStore((s) => s.activeKey);
  const selectedIndex = hovered ?? activeKey;
  const selectedKey = selectedIndex === null ? null : KEYBOARD_KEYS[selectedIndex];
  const switchOpacity = layerOpacity('Switches');
  const capOpacity = layerOpacity('Keycaps');
  const plateMaterial = PLATE_FINISHES[plateFinish];

  return <group>
    {layerOpacity('Case') > 0 && <mesh position={[0, -0.055, 0]} receiveShadow castShadow onClick={(e) => isolateLayer('Case', e)}>
      <boxGeometry args={[8.4, 0.44, 3.45]} />
      <meshStandardMaterial color={caseColor} metalness={0.28} roughness={0.4} {...matProps('Case')} />
    </mesh>}
    {layerOpacity('Foam') > 0 && <mesh position={[0, 0.18 + offsets.foam, 0]} receiveShadow castShadow onClick={(e) => isolateLayer('Foam', e)}>
      <boxGeometry args={[8.16, 0.09, 3.22]} />
      <meshStandardMaterial color="#d6a98b" roughness={0.83} {...matProps('Foam')} />
    </mesh>}
    {layerOpacity('PCB') > 0 && <mesh position={[0, 0.25 + offsets.pcb, 0]} castShadow receiveShadow onClick={(e) => isolateLayer('PCB', e)}>
      <boxGeometry args={[8.14, 0.055, 3.2]} />
      <meshStandardMaterial color="#526b68" metalness={0.22} roughness={0.5} {...matProps('PCB')} />
    </mesh>}
    {layerOpacity('Plate') > 0 && <mesh position={[0, 0.31 + offsets.plate, 0]} castShadow receiveShadow onClick={(e) => isolateLayer('Plate', e)}>
      <boxGeometry args={[8.12, 0.08, 3.18]} />
      <meshStandardMaterial {...plateMaterial} {...matProps('Plate')} />
    </mesh>}
    <instancedMesh ref={lowerHousings} args={[geometries.housing, undefined, KEYBOARD_KEYS.length]} castShadow receiveShadow onClick={(e) => isolateLayer('Switches', e)}>
      <meshStandardMaterial color="#b57565" roughness={0.4} transparent={switchOpacity < 1} opacity={switchOpacity} depthWrite={switchOpacity === 1} />
    </instancedMesh>
    <instancedMesh ref={upperHousings} args={[geometries.housing, undefined, KEYBOARD_KEYS.length]} castShadow receiveShadow onClick={(e) => isolateLayer('Switches', e)}>
      <meshStandardMaterial color="#e2a187" roughness={0.32} transparent={switchOpacity < 1} opacity={switchOpacity} depthWrite={switchOpacity === 1} />
    </instancedMesh>
    <instancedMesh ref={stems} args={[geometries.stem, undefined, KEYBOARD_KEYS.length]} castShadow receiveShadow onClick={(e) => isolateLayer('Switches', e)}>
      <meshStandardMaterial color="#624e63" roughness={0.34} transparent={switchOpacity < 1} opacity={switchOpacity} depthWrite={switchOpacity === 1} />
    </instancedMesh>
    <instancedMesh ref={caps} args={[geometries.cap, undefined, KEYBOARD_KEYS.length]} castShadow receiveShadow onPointerMove={(e) => { e.stopPropagation(); setHoveredKey(e.instanceId ?? null); }} onPointerOut={() => setHoveredKey(null)} onClick={(e) => {
      e.stopPropagation(); const id = e.instanceId ?? null; if (id !== null) { pressKey(id); playClick(); window.setTimeout(() => releaseKey(id), 110); }
    }} onDoubleClick={(e) => isolateLayer('Keycaps', e)}>
      <meshStandardMaterial roughness={0.31} metalness={0.02} transparent={capOpacity < 1} opacity={capOpacity} depthWrite={capOpacity === 1} />
    </instancedMesh>
    {KEYBOARD_KEYS.map((key, i) => <group key={`${key.row}-${key.col}`}>
      <Text position={[key.x, 0.51 + offsets.caps + (hovered === i ? 0.4 : 0), key.z]} rotation={[-Math.PI / 2, 0, 0]} fontSize={key.width > 0.75 ? 0.09 : 0.115} maxWidth={key.width - 0.05} anchorX="center" anchorY="middle" color={color.legend} fillOpacity={capOpacity} onClick={(e) => {
      e.stopPropagation(); pressKey(i); playClick(); window.setTimeout(() => releaseKey(i), 110);
      }} onDoubleClick={(e) => isolateLayer('Keycaps', e)}>{key.label}</Text>
      {key.shifted && <Text position={[key.x, 0.51 + offsets.caps + (hovered === i ? 0.4 : 0), key.z - 0.115]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.052} maxWidth={key.width - 0.04} anchorX="center" anchorY="middle" color={color.legend} fillOpacity={capOpacity} raycast={() => null}>{key.shifted}</Text>}
    </group>)}
    {selectedKey && <group onClick={(e) => isolateLayer('Switches', e)}><SpringCoil key={selectedKey.label + selectedKey.row + selectedKey.col} keyInfo={selectedKey} y={0.35 + offsets.switches} opacity={switchOpacity} /></group>}
    <mesh position={[0, -0.22, 0]}>
      <boxGeometry args={[7.8, 0.035, 2.8]} />
      <meshStandardMaterial color={color.accent} metalness={0.52} roughness={0.3} {...matProps('Case')} />
    </mesh>
  </group>;
}

function FloatingDust() {
  const ref = useRef();
  useFrame((state) => { if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.025; });
  const points = useMemo(() => Array.from({ length: 42 }, (_, i) => [Math.sin(i * 71.1) * 8, (i % 9) * 0.57 - 2.2, Math.cos(i * 11.7) * 7]), []);
  return <group ref={ref}>{points.map((p, i) => <mesh key={i} position={p}>
    <sphereGeometry args={[0.012 + (i % 4) * 0.004, 6, 6]} />
    <meshBasicMaterial color={i % 3 === 0 ? '#edc9a6' : '#7e8aa7'} transparent opacity={0.3} />
  </mesh>)}</group>;
}

export default function KeyboardScene() {
  const paletteName = useKeyboardStore((s) => s.palette);
  const palette = KEYBOARD_PALETTES[paletteName];
  return <Canvas shadows dpr={[1, 1.65]} camera={{ position: [0, 5.8, 8.6], fov: 37 }} gl={{ antialias: true, alpha: true }}>
    <fog attach="fog" args={['#f2ddeb', 12, 24]} />
    <ambientLight intensity={1.25} />
    <spotLight position={[-5, 8, 4]} intensity={92} color="#fff4f4" angle={0.4} penumbra={0.7} castShadow shadow-mapSize={[1024, 1024]} />
    <pointLight position={[5, 3, -4]} intensity={28} color="#e4c8f4" />
    <Environment preset="studio" />
    <mesh position={[0, -0.34, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#f1dce8" roughness={0.82} metalness={0.01} />
    </mesh>
    <group rotation={[-0.12, -0.13, 0]}>
      <KeyboardAssembly color={palette} />
    </group>
    <ContactShadows position={[0, -0.32, 0]} opacity={0.52} scale={12} blur={2.6} far={4} />
    <FloatingDust />
    <OrbitControls enablePan={false} minDistance={6.8} maxDistance={13.5} minPolarAngle={0.58} maxPolarAngle={1.48} rotateSpeed={0.42} />
  </Canvas>;
}
