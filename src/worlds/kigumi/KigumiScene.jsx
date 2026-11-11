import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Html, OrbitControls } from '@react-three/drei';
import { gsap } from 'gsap';
import { JOINT_DETAILS } from './store.js';
import * as THREE from 'three';

const WOOD = '#754631';
const WOOD_LIGHT = '#9a6040';
const STONE = '#655d53';
const TILE = '#29282b';

function forestAngle(index) {
  const angle = index * 2.399963;
  const cameraSector = Math.atan2(Math.sin(angle - 0.846), Math.cos(angle - 0.846));
  return Math.abs(cameraSector) < 0.92 ? angle + Math.PI : angle;
}

function Site({ windStrength, nightFactor }) {
  const bamboo = useMemo(() => Array.from({ length: 132 }, (_, i) => {
    const a = forestAngle(i);
    const r = 9.2 + (i % 6) * 0.76;
    return { x: Math.cos(a) * r, z: Math.sin(a) * r, h: 5.2 + (i % 9) * 0.42, lean: Math.sin(i * 1.7) * 0.045 };
  }), []);
  const leafInstances = useMemo(() => Array.from({ length: 264 }, (_, i) => {
    const a = forestAngle(i);
    const r = 8.9 + (i % 9) * 0.7;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const h = 4.1 + (i % 9) * 0.48;
    return { x, y: h, z, rotation: [Math.sin(i) * 0.35, a, Math.cos(i * 2) * 0.5], color: i % 5 === 0 ? '#8d8065' : '#68715d' };
  }), []);
  const trunksRef = useRef();
  const leavesRef = useRef();
  const leafMatrix = useRef(new THREE.Matrix4());
  const leafQuaternion = useRef(new THREE.Quaternion());
  const leafPosition = useRef(new THREE.Vector3());
  const leafEuler = useRef(new THREE.Euler());
  const leafScale = useRef(new THREE.Vector3(0.025, 0.29, 0.055));
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  useLayoutEffect(() => {
    if (trunksRef.current) {
      const matrix = new THREE.Matrix4();
      const quaternion = new THREE.Quaternion();
      const position = new THREE.Vector3();
      const scale = new THREE.Vector3(1, 1, 1);
      bamboo.forEach((b, i) => {
        position.set(b.x, b.h / 2, b.z);
        quaternion.setFromEuler(new THREE.Euler(0, 0, b.lean));
        scale.set(1, b.h, 1);
        matrix.compose(position, quaternion, scale);
        trunksRef.current.setMatrixAt(i, matrix);
      });
      trunksRef.current.instanceMatrix.needsUpdate = true;
    }
    if (leavesRef.current) {
      const matrix = new THREE.Matrix4();
      const quaternion = new THREE.Quaternion();
      const position = new THREE.Vector3();
      const scale = new THREE.Vector3(0.025, 0.29, 0.055);
      leafInstances.forEach((leaf, i) => {
        position.set(leaf.x, leaf.y, leaf.z);
        quaternion.setFromEuler(new THREE.Euler(...leaf.rotation));
        matrix.compose(position, quaternion, scale);
        leavesRef.current.setMatrixAt(i, matrix);
        leavesRef.current.setColorAt(i, new THREE.Color(leaf.color));
      });
      leavesRef.current.instanceMatrix.needsUpdate = true;
      if (leavesRef.current.instanceColor) leavesRef.current.instanceColor.needsUpdate = true;
    }
  }, [bamboo, leafInstances]);
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!media) return undefined;
    const onChange = (event) => setReducedMotion(event.matches);
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, []);
  useFrame(({ clock }) => {
    if (reducedMotion || !leavesRef.current) return;
    const t = clock.elapsedTime;
    leafInstances.forEach((leaf, i) => {
      const sway = windStrength * 0.12;
      leafPosition.current.set(leaf.x + Math.sin(t * 0.7 + i * 0.31) * sway, leaf.y, leaf.z + Math.cos(t * 0.55 + i * 0.2) * sway * 0.7);
      leafEuler.current.set(leaf.rotation[0] + Math.sin(t * 0.8 + i) * sway, leaf.rotation[1], leaf.rotation[2] + Math.cos(t * 0.6 + i * 0.4) * sway);
      leafQuaternion.current.setFromEuler(leafEuler.current);
      leafMatrix.current.compose(leafPosition.current, leafQuaternion.current, leafScale.current);
      leavesRef.current.setMatrixAt(i, leafMatrix.current);
    });
    leavesRef.current.instanceMatrix.needsUpdate = true;
  });
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.23, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} /><meshStandardMaterial color="#898274" roughness={1} />
    </mesh>
    <mesh position={[0, -0.12, 0]} receiveShadow>
      <cylinderGeometry args={[7.7, 7.9, 0.18, 96]} /><meshStandardMaterial color="#a49b8d" roughness={1} />
    </mesh>
    <mesh position={[0, -0.015, 0]} receiveShadow>
      <cylinderGeometry args={[6.95, 7.05, 0.04, 96]} /><meshStandardMaterial color="#756d62" roughness={1} />
    </mesh>
    {Array.from({ length: 19 }, (_, i) => <mesh key={`rake-${i}`} position={[(i - 9) * 0.32, -0.08, 3.8]} rotation={[-Math.PI / 2, 0, Math.sin(i) * 0.025]} receiveShadow>
      <boxGeometry args={[0.035, 6.8, 0.018]} /><meshStandardMaterial color={i % 2 ? '#948b7c' : '#a09788'} roughness={1} />
    </mesh>)}
    <instancedMesh ref={trunksRef} args={[null, null, bamboo.length]} castShadow receiveShadow>
      <cylinderGeometry args={[0.025, 0.045, 1, 7]} /><meshStandardMaterial color="#656b4d" roughness={0.85} />
    </instancedMesh>
    <instancedMesh ref={leavesRef} args={[null, null, leafInstances.length]}>
      <sphereGeometry args={[1, 5, 4]} /><meshStandardMaterial color="#78836b" roughness={0.95} />
    </instancedMesh>
    <MapleTree />
    <FallingLeaves windStrength={windStrength} />
    <Lantern position={[-5.25, 0, 1.3]} nightFactor={nightFactor} />
    <Lantern position={[5.1, 0, -0.75]} nightFactor={nightFactor} />
    <mesh position={[0, -0.04, 0]}>
      <sphereGeometry args={[0.16, 8, 6]} /><meshStandardMaterial color="#a04735" roughness={0.8} />
    </mesh>
  </group>;
}

function FallingLeaves({ windStrength }) {
  const meshRef = useRef();
  const items = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    seed: i * 1.73,
    x: Math.sin(i * 11.31) * 5.4,
    z: Math.cos(i * 7.17) * 4.9,
    speed: 0.18 + (i % 7) * 0.025,
    color: i % 3 === 0 ? '#a03e2d' : i % 3 === 1 ? '#bf6843' : '#9b5037',
  })), []);
  const matrix = useRef(new THREE.Matrix4());
  const position = useRef(new THREE.Vector3());
  const quaternion = useRef(new THREE.Quaternion());
  const euler = useRef(new THREE.Euler());
  const scale = useRef(new THREE.Vector3(0.16, 0.035, 0.075));
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  useLayoutEffect(() => {
    if (!meshRef.current) return;
    items.forEach((item, i) => meshRef.current.setColorAt(i, new THREE.Color(item.color)));
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [items]);
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!media) return undefined;
    const onChange = (event) => setReducedMotion(event.matches);
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, []);
  useFrame(({ clock }) => {
    if (reducedMotion || !meshRef.current) return;
    const t = clock.elapsedTime;
    items.forEach((item, i) => {
      const fall = (t * item.speed * (0.65 + windStrength * 0.55) + item.seed) % 8;
      position.current.set(item.x + Math.sin(t * 0.7 + item.seed) * windStrength * 0.7, 7.2 - fall, item.z + Math.cos(t * 0.54 + item.seed) * windStrength * 0.5);
      euler.current.set(0.3 + Math.sin(t * 1.7 + item.seed) * 0.8, t * 0.35 + item.seed, Math.cos(t * 1.3 + item.seed) * 0.7);
      quaternion.current.setFromEuler(euler.current);
      matrix.current.compose(position.current, quaternion.current, scale.current);
      meshRef.current.setMatrixAt(i, matrix.current);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={meshRef} args={[null, null, items.length]}>
    <sphereGeometry args={[1, 7, 5]} /><meshStandardMaterial color="#ac4e39" roughness={0.95} />
  </instancedMesh>;
}

function MapleTree() {
  return <group position={[-5.0, 0, -0.3]}>
    <mesh position={[0, 1.6, 0]} rotation={[0, 0, -0.12]} castShadow>
      <cylinderGeometry args={[0.16, 0.29, 3.3, 9]} /><meshStandardMaterial color="#594536" roughness={1} />
    </mesh>
    {Array.from({ length: 28 }, (_, i) => {
      const x = Math.sin(i * 12.9898) * 1.15;
      const y = 2.45 + ((i * 7) % 19) * 0.078;
      const z = Math.cos(i * 78.233) * 0.66;
      return <mesh key={i} position={[x, y, z]} castShadow>
        <icosahedronGeometry args={[0.2 + (i % 3) * 0.035, 1]} /><meshStandardMaterial color={i % 4 === 0 ? '#8a3e31' : i % 2 ? '#a14e37' : '#934332'} roughness={0.95} />
      </mesh>;
    })}
  </group>;
}

function Lantern({ position, nightFactor }) {
  return <group position={position}>
    <mesh position={[0, 0.17, 0]} castShadow><cylinderGeometry args={[0.32, 0.4, 0.24, 8]} /><meshStandardMaterial color="#716454" roughness={1} /></mesh>
    <mesh position={[0, 0.95, 0]} castShadow><cylinderGeometry args={[0.12, 0.15, 1.35, 8]} /><meshStandardMaterial color="#594d3d" roughness={0.95} /></mesh>
    <mesh position={[0, 1.72, 0]} castShadow><boxGeometry args={[0.56, 0.44, 0.56]} /><meshStandardMaterial color="#756250" roughness={0.9} /></mesh>
    <mesh position={[0, 1.74, 0]}><boxGeometry args={[0.4, 0.34, 0.4]} /><meshStandardMaterial color="#d3a36a" emissive="#e29b53" emissiveIntensity={0.12 + nightFactor * 2.3} transparent opacity={0.78} /></mesh>
    <pointLight position={[0, 1.74, 0]} color="#ffc27a" intensity={nightFactor * 1.2} distance={4} decay={2} />
    <mesh position={[0, 2.0, 0]} castShadow><coneGeometry args={[0.52, 0.28, 8]} /><meshStandardMaterial color="#594d3d" roughness={0.9} /></mesh>
    <mesh position={[0, 2.22, 0]}><sphereGeometry args={[0.08, 8, 8]} /><meshStandardMaterial color="#594d3d" /></mesh>
  </group>;
}

function Foundation() {
  const posts = [-2, 0, 2].flatMap((x) => [[x, -1.65], [x, 1.65]]);
  return <group>
    <mesh position={[0, 0.03, 0]} castShadow receiveShadow><boxGeometry args={[5.45, 0.24, 5.45]} /><meshStandardMaterial color="#393638" roughness={0.95} /></mesh>
    {posts.map(([x, z], i) => <group key={i} position={[x, 0.2, z]}>
      <mesh castShadow receiveShadow><boxGeometry args={[0.88, 0.32, 0.88]} /><meshStandardMaterial color={i % 2 ? '#8a8275' : STONE} roughness={0.97} /></mesh>
      <mesh position={[0, 0.18, 0]}><boxGeometry args={[0.72, 0.055, 0.72]} /><meshStandardMaterial color="#b2a999" roughness={0.95} /></mesh>
    </group>)}
  </group>;
}

function Pillars() {
  const posts = [-2, 0, 2].flatMap((x) => [[x, -1.65], [x, 1.65]]);
  return <group>
    {posts.map(([x, z], i) => <group key={i} position={[x, 0, z]}>
      <mesh position={[0, 1.68, 0]} castShadow><boxGeometry args={[0.32, 3.12, 0.32]} /><meshStandardMaterial color={i % 2 ? WOOD : WOOD_LIGHT} roughness={0.76} /></mesh>
      <mesh position={[0, 3.23, 0]} castShadow><boxGeometry args={[0.42, 0.22, 0.42]} /><meshStandardMaterial color="#9e704d" roughness={0.76} /></mesh>
      <mesh position={[0, 3.43, 0]} castShadow><boxGeometry args={[0.15, 0.3, 0.15]} /><meshStandardMaterial color="#bb8a5c" roughness={0.72} /></mesh>
    </group>)}
  </group>;
}

function Beam({ position, size, color = WOOD }) {
  return <mesh position={position} castShadow receiveShadow><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={0.78} /></mesh>;
}

function Frame() {
  const longBeamSegments = [
    [-2.3425, 0.465], [-1, 1.78], [1, 1.78], [2.3425, 0.465],
  ];
  return <group>
    {[-1.65, 1.65].flatMap((z, row) => longBeamSegments.map(([x, length], i) => <Beam key={`${row}-${i}`} position={[x, 3.34, z]} size={[length, 0.34, 0.38]} color={row ? '#8b5d3e' : WOOD} />))}
    <Beam position={[-2, 3.34, 0]} size={[0.38, 0.34, 3.45]} color={WOOD_LIGHT} />
    <Beam position={[2, 3.34, 0]} size={[0.38, 0.34, 3.45]} color={WOOD_LIGHT} />
  </group>;
}

const JOINT_POSITIONS = [-2, 0, 2].flatMap((x) => [-1.65, 1.65].map((z) => [x, z]));

function JointPieces({ index, jointCount, jointRefs, onReplay, showMarkers }) {
  const tenon = useRef();
  const wedge = useRef();
  const [x, z] = JOINT_POSITIONS[index];
  useLayoutEffect(() => {
    if (!tenon.current || !wedge.current) return;
    const completed = index < jointCount;
    tenon.current.position.set(completed ? 0 : 0.24, completed ? 0.17 : 0.7, 0);
    tenon.current.rotation.set(0, completed ? 0 : 0.45, 0);
    wedge.current.position.set(completed ? 0 : 0.46, completed ? 0.31 : 0.54, completed ? 0.13 : 0.27);
    wedge.current.rotation.set(0, 0, completed ? -0.14 : 0.56);
    jointRefs.current[index] = { tenon: tenon.current, wedge: wedge.current, point: [x, 3.53, z] };
  }, [index, jointCount, jointRefs, x, z]);
  return <group position={[x, 3.53, z]}>
    <mesh ref={tenon} castShadow><boxGeometry args={[0.12, 0.38, 0.12]} /><meshStandardMaterial color="#d2a16a" roughness={0.72} /></mesh>
    <mesh ref={wedge} castShadow><boxGeometry args={[0.26, 0.065, 0.09]} /><meshStandardMaterial color="#e0b77d" roughness={0.72} /></mesh>
    <mesh position={[0.39, -0.07, 0]} castShadow><boxGeometry args={[0.46, 0.14, 0.38]} /><meshStandardMaterial color="#b17c51" roughness={0.78} /></mesh>
    <mesh position={[-0.39, -0.07, 0]} castShadow><boxGeometry args={[0.46, 0.14, 0.38]} /><meshStandardMaterial color="#b17c51" roughness={0.78} /></mesh>
    {showMarkers && index < jointCount && <Html position={[0, 0.56, 0]} center distanceFactor={11}>
      <button className="kigumi-joint-marker" onClick={(event) => { event.stopPropagation(); onReplay(index); }} aria-label={`Replay ${JOINT_DETAILS[index].name}`} title={`Replay ${JOINT_DETAILS[index].name}`}>{String(index + 1).padStart(2, '0')}</button>
    </Html>}
  </group>;
}

function Joinery({ jointCount, jointRefs, onReplay, showMarkers }) {
  return <group>
    {JOINT_POSITIONS.map((_, i) => <JointPieces key={i} index={i} jointCount={jointCount} jointRefs={jointRefs} onReplay={onReplay} showMarkers={showMarkers} />)}
    <Beam position={[0, 3.18, 1.94]} size={[4.98, 0.13, 0.18]} color="#bb8757" />
  </group>;
}

function AssemblyStage({ complete, offset, children }) {
  const ref = useRef();
  const timeline = useRef();
  useLayoutEffect(() => {
    const group = ref.current;
    if (!group) return undefined;
    timeline.current?.kill();
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReducedMotion ? 0.01 : 0.72;
    if (complete) group.visible = true;
    else if (group.position.y === 0) group.visible = true;
    const tl = gsap.timeline({ onComplete: () => { if (!complete) group.visible = false; } });
    tl.to(group.position, { y: complete ? 0 : offset, duration, ease: complete ? 'power3.out' : 'power2.in' });
    timeline.current = tl;
    return () => tl.kill();
  }, [complete, offset]);
  useLayoutEffect(() => {
    if (!complete && ref.current && ref.current.position.y === 0) {
      ref.current.position.y = offset;
      ref.current.visible = false;
    }
  }, []);
  return <group ref={ref}>{children}</group>;
}

function JointCinematic({ runId, selectedJoint, jointMode, jointRefs, controlsRef, onPhase, onFinish }) {
  const { camera } = useThree();
  useEffect(() => {
    if (!runId || selectedJoint < 0) return undefined;
    const connection = jointRefs.current[selectedJoint];
    const controls = controlsRef.current;
    if (!connection || !controls) return undefined;
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReducedMotion ? 0.06 : 0.48;
    const homePosition = camera.position.clone();
    const homeTarget = controls.target.clone();
    const [x, y, z] = connection.point;
    controls.enabled = false;
    if (jointMode === 'replay') {
      connection.tenon.position.set(0.24, 0.7, 0);
      connection.tenon.rotation.set(0, 0.45, 0);
      connection.wedge.position.set(0.46, 0.54, 0.27);
      connection.wedge.rotation.set(0, 0, 0.56);
    }
    const tl = gsap.timeline({ onComplete: () => {
      controls.enabled = true;
      onFinish();
    } });
    tl.to(camera.position, { x: x + 2.65, y: 5.45, z: z + 3.25, duration: duration * 1.6, ease: 'power2.inOut' }, 0)
      .to(controls.target, { x, y: 3.58, z, duration: duration * 1.6, ease: 'power2.inOut' }, 0)
      .call(() => onPhase('Rotate'), null, duration * 1.6)
      .to(connection.tenon.rotation, { y: 1.05, duration: duration * 0.7, ease: 'power2.inOut' })
      .to(connection.wedge.rotation, { z: 0.84, duration: duration * 0.7, ease: 'power2.inOut' }, '<')
      .call(() => onPhase('Slide'))
      .to(connection.tenon.position, { x: 0, y: 0.17, z: 0, duration: duration * 1.25, ease: 'power3.inOut' })
      .to(connection.tenon.rotation, { y: 0, duration: duration * 1.25, ease: 'power3.inOut' }, '<')
      .call(() => onPhase('Lock'))
      .to(connection.wedge.position, { x: 0, y: 0.31, z: 0.13, duration: duration * 1.0, ease: 'power3.inOut' })
      .to(connection.wedge.rotation, { z: -0.14, duration: duration * 1.0, ease: 'power3.inOut' }, '<')
      .to(camera.position, { x: homePosition.x, y: homePosition.y, z: homePosition.z, duration: duration * 1.35, ease: 'power2.inOut' }, `+=${duration * 0.55}`)
      .to(controls.target, { x: homeTarget.x, y: homeTarget.y, z: homeTarget.z, duration: duration * 1.35, ease: 'power2.inOut' }, '<');
    return () => {
      tl.kill();
      controls.enabled = true;
    };
  }, [runId, selectedJoint, jointMode, jointRefs, controlsRef, camera, onPhase, onFinish]);
  return null;
}

function Rafters() {
  const rafterCount = 15;
  const rafters = Array.from({ length: rafterCount }, (_, i) => {
    const x = -2.55 + i * (5.1 / (rafterCount - 1));
    return <React.Fragment key={i}>
      <mesh position={[x, 3.51, 1.25]} rotation={[0.52, 0, 0]} castShadow><boxGeometry args={[0.16, 0.18, 2.95]} /><meshStandardMaterial color={i % 2 ? '#956847' : '#a47651'} roughness={0.8} /></mesh>
      <mesh position={[x, 3.51, -1.25]} rotation={[-0.52, 0, 0]} castShadow><boxGeometry args={[0.16, 0.18, 2.95]} /><meshStandardMaterial color={i % 2 ? '#956847' : '#a47651'} roughness={0.8} /></mesh>
    </React.Fragment>;
  });
  return <group>
    {rafters}
    <Beam position={[0, 4.29, 0]} size={[2.7, 0.18, 0.18]} color="#885d40" />
  </group>;
}

function RoofShell() {
  const geometry = useMemo(() => {
    const vertices = [
      -1.3, 4.42, 0, 1.3, 4.42, 0, 3.05, 2.99, 2.5, -3.05, 2.99, 2.5,
      -1.3, 4.42, 0, 1.3, 4.42, 0, 3.05, 2.99, -2.5, -3.05, 2.99, -2.5,
      -1.3, 4.42, 0, -3.05, 2.99, 2.5, -3.05, 2.99, -2.5,
      1.3, 4.42, 0, 3.05, 2.99, 2.5, 3.05, 2.99, -2.5,
    ];
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    g.setIndex([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 11, 12, 13]);
    g.computeVertexNormals();
    return g;
  }, []);
  const tiles = useMemo(() => {
    const result = [];
    for (let row = 0; row < 7; row += 1) {
      const t = (row + 0.55) / 7;
      const z = 2.5 * t;
      const y = 4.42 - 1.43 * t;
      const halfWidth = 1.3 + (3.05 - 1.3) * t;
      const count = Math.max(4, Math.floor((halfWidth * 2) / 0.44));
      for (let i = 0; i < count; i += 1) {
        const x = -halfWidth + (i + 0.5) * ((halfWidth * 2) / count);
        const offset = (i % 2) * 0.06;
        result.push([x, y + offset, z, 0]);
        result.push([x, y + offset, -z, 0]);
      }
      const endHalfWidth = 2.5 * t;
      const endCount = Math.max(3, Math.floor((endHalfWidth * 2) / 0.4));
      for (let i = 0; i < endCount; i += 1) {
        const z = -endHalfWidth + (i + 0.5) * ((endHalfWidth * 2) / endCount);
        const x = 1.3 + 1.75 * t;
        result.push([x, y, z, 1]);
        result.push([-x, y, z, -1]);
      }
    }
    return result;
  }, []);
  const tileMesh = useRef();
  useLayoutEffect(() => {
    if (!tileMesh.current) return;
    const dummy = new THREE.Object3D();
    tiles.forEach(([x, y, z, end], i) => {
      dummy.position.set(x, y, z);
      if (end) dummy.rotation.set(0, 0, end * 0.5);
      else dummy.rotation.set(z > 0 ? 0.52 : -0.52, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      tileMesh.current.setMatrixAt(i, dummy.matrix);
      tileMesh.current.setColorAt(i, new THREE.Color(i % 5 === 0 ? '#454143' : TILE));
    });
    tileMesh.current.instanceMatrix.needsUpdate = true;
    if (tileMesh.current.instanceColor) tileMesh.current.instanceColor.needsUpdate = true;
  }, [tiles]);
  return <group>
    <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial color="#302d2e" side={THREE.DoubleSide} roughness={0.92} /></mesh>
    <instancedMesh ref={tileMesh} args={[null, null, tiles.length]} castShadow receiveShadow>
      <boxGeometry args={[0.42, 0.09, 0.34]} /><meshStandardMaterial color="#ffffff" roughness={0.86} />
    </instancedMesh>
    <mesh position={[0, 4.43, 0]}><sphereGeometry args={[0.14, 12, 8]} /><meshStandardMaterial color="#393133" roughness={0.7} /></mesh>
  </group>;
}

function Shoji() {
  const panel = (position, rotation = [0, 0, 0]) => <group position={position} rotation={rotation}>
    <mesh position={[0, 1.52, 0]}><boxGeometry args={[1.18, 2.72, 0.035]} /><meshStandardMaterial color="#efe6d5" roughness={0.98} transparent opacity={0.78} /></mesh>
    {[-0.62, 0.62].map((x) => <mesh key={`v-${x}`} position={[x, 1.52, 0.05]} castShadow><boxGeometry args={[0.075, 2.95, 0.11]} /><meshStandardMaterial color="#78543b" roughness={0.82} /></mesh>)}
    {Array.from({ length: 6 }, (_, i) => <mesh key={`h-${i}`} position={[0, 0.28 + i * 0.49, 0.04]}><boxGeometry args={[1.2, 0.035, 0.08]} /><meshStandardMaterial color="#99704e" roughness={0.82} /></mesh>)}
    {Array.from({ length: 3 }, (_, i) => <mesh key={`m-${i}`} position={[-0.31 + i * 0.31, 1.5, 0.045]}><boxGeometry args={[0.028, 2.7, 0.07]} /><meshStandardMaterial color="#99704e" roughness={0.82} /></mesh>)}
  </group>;
  return <group>
    {[-1, 1].map((x) => <React.Fragment key={x}>
      {panel([x, 0, -1.63])}{panel([x, 0, 1.63])}
    </React.Fragment>)}
    {[-0.63, 0.63].map((z) => <React.Fragment key={z}>
      {panel([-1.98, 0, z], [0, Math.PI / 2, 0])}{panel([1.98, 0, z], [0, Math.PI / 2, 0])}
    </React.Fragment>)}
  </group>;
}

function Pavilion({ stage, jointCount, jointRefs, onReplay }) {
  return <group>
    <AssemblyStage complete={stage >= 0} offset={-0.55}><Foundation /></AssemblyStage>
    <AssemblyStage complete={stage >= 1} offset={2}><Pillars /></AssemblyStage>
    <AssemblyStage complete={stage >= 2} offset={2}><Frame /></AssemblyStage>
    <AssemblyStage complete={stage === 3} offset={1.2}><Joinery jointCount={jointCount} jointRefs={jointRefs} onReplay={onReplay} showMarkers={stage === 3} /></AssemblyStage>
    <AssemblyStage complete={stage === 4} offset={2}><Rafters /></AssemblyStage>
    <AssemblyStage complete={stage >= 5} offset={2.3}><RoofShell /></AssemblyStage>
    <AssemblyStage complete={stage >= 6} offset={2}><Shoji /></AssemblyStage>
  </group>;
}

function SceneContents({ stage, jointCount, selectedJoint, jointRunId, jointMode, jointAnimating, jointRefs, controlsRef, timeOfDay, progress, assemblySwipe, onReplay, onPhase, onFinish }) {
  const nightFactor = Math.max(0, Math.min(1, (timeOfDay - 55) / 45));
  const skyColor = new THREE.Color('#d2ccbf').lerp(new THREE.Color('#d29b77'), Math.min(1, timeOfDay / 50));
  if (timeOfDay > 50) skyColor.lerp(new THREE.Color('#1d2737'), (timeOfDay - 50) / 50);
  const sunColor = new THREE.Color('#ffd6a2').lerp(new THREE.Color('#f0a06b'), Math.min(1, timeOfDay / 50));
  if (timeOfDay > 50) sunColor.lerp(new THREE.Color('#9caecb'), (timeOfDay - 50) / 50);
  const windStrength = 0.14 + (progress / 100) * 0.67 + (timeOfDay / 100) * 0.13;
  const lightPosition = [-7 + timeOfDay * 0.15, 11 - timeOfDay * 0.035, 5 - timeOfDay * 0.12];
  return <>
    <color attach="background" args={[skyColor]} />
    <fog attach="fog" args={[skyColor, 8, 28]} />
    <ambientLight intensity={0.62 - nightFactor * 0.38} color={sunColor} />
    <hemisphereLight intensity={0.92 - nightFactor * 0.38} color={sunColor} groundColor={nightFactor > 0.5 ? '#272b32' : '#55534a'} />
    <directionalLight castShadow position={lightPosition} intensity={2.2 - nightFactor * 1.65} color={sunColor} shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} shadow-bias={-0.0002} />
    <Site windStrength={windStrength} nightFactor={nightFactor} />
    <Pavilion stage={stage} jointCount={jointCount} jointRefs={jointRefs} onReplay={onReplay} />
    <ContactShadows key={`${stage}-${jointCount}-${jointRunId}`} position={[0, -0.09, 0]} opacity={0.35} scale={17} resolution={128} blur={1.8} far={5} frames={48} smooth={false} />
    <OrbitControls ref={controlsRef} makeDefault enabled={!assemblySwipe && !jointAnimating} target={[0, 1.6, 0]} minDistance={5} maxDistance={19} maxPolarAngle={Math.PI * 0.49} enableDamping dampingFactor={0.06} />
    <JointCinematic runId={jointRunId} selectedJoint={selectedJoint} jointMode={jointMode} jointRefs={jointRefs} controlsRef={controlsRef} onPhase={onPhase} onFinish={onFinish} />
  </>;
}

export default function KigumiScene({ stage, jointCount, selectedJoint, jointRunId, jointMode, jointAnimating, timeOfDay, progress, assemblySwipe, onReplay, onPhase, onFinish, onRendererCanvas }) {
  const jointRefs = useRef([]);
  const controlsRef = useRef();
  return <Canvas shadows dpr={[1, 1.5]} camera={{ position: [9.3, 7.1, 10.5], fov: 37, near: 0.1, far: 120 }} gl={{ antialias: true, powerPreference: 'high-performance' }} onCreated={({ gl }) => onRendererCanvas?.(gl.domElement)}>
    <SceneContents stage={stage} jointCount={jointCount} selectedJoint={selectedJoint} jointRunId={jointRunId} jointMode={jointMode} jointAnimating={jointAnimating} jointRefs={jointRefs} controlsRef={controlsRef} timeOfDay={timeOfDay} progress={progress} assemblySwipe={assemblySwipe} onReplay={onReplay} onPhase={onPhase} onFinish={onFinish} />
  </Canvas>;
}
