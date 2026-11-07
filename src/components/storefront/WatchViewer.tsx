"use client";

/**
 * Optional 3D presentation. Loaded only on demand (next/dynamic, ssr: false).
 *  - With `modelUrl`: loads the owner's GLB/GLTF.
 *  - Without: renders a procedural, clearly-labelled ILLUSTRATIVE watch —
 *    never presented as the real product.
 * Lighting is built from local Lightformers (no HDR download).
 */
import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, ContactShadows, Environment, Html, Lightformer, OrbitControls, useGLTF, useProgress } from "@react-three/drei";
import * as THREE from "three";

type Props = {
  modelUrl?: string;
  dialColor?: string;
  onFail: () => void;
  reducedMotion: boolean;
};

class ViewerBoundary extends Component<{ onFail: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="label whitespace-nowrap text-mist" role="status">
        Loading 3D · {Math.round(progress)}%
      </div>
    </Html>
  );
}

function GLBModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const box = useMemo(() => new THREE.Box3().setFromObject(cloned), [cloned]);
  const size = box.getSize(new THREE.Vector3()).length() || 1;
  return (
    <Center>
      <primitive object={cloned} scale={3.2 / size} />
    </Center>
  );
}

function ProceduralWatch({ dialColor = "#efe7d8", animate }: { dialColor?: string; animate: boolean }) {
  const hour = useRef<THREE.Group>(null);
  const minute = useRef<THREE.Group>(null);
  const second = useRef<THREE.Group>(null);

  const steel = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#dcd9d2", metalness: 1, roughness: 0.22, clearcoat: 0.4 }),
    [],
  );
  const brushed = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#c9c6bf", metalness: 1, roughness: 0.42 }), []);
  const dark = new THREE.Color(dialColor).getHSL({ h: 0, s: 0, l: 0 }).l < 0.45;
  const dial = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: dialColor, metalness: 0.35, roughness: 0.38, sheen: 0.6 }),
    [dialColor],
  );
  const ink = useMemo(
    () => new THREE.MeshStandardMaterial({ color: dark ? "#efe9dc" : "#221e19", metalness: 0.6, roughness: 0.3 }),
    [dark],
  );
  const accent = useMemo(() => new THREE.MeshStandardMaterial({ color: "#b8955c", metalness: 0.9, roughness: 0.25 }), []);
  const glass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        metalness: 0,
        roughness: 0.02,
        transmission: 1,
        thickness: 0.05,
        transparent: true,
        opacity: 0.25,
      }),
    [],
  );

  useEffect(
    () => () => [steel, brushed, dial, ink, accent, glass].forEach((m) => m.dispose()),
    [steel, brushed, dial, ink, accent, glass],
  );

  useFrame(() => {
    const d = new Date();
    const s = d.getSeconds() + d.getMilliseconds() / 1000;
    const m = d.getMinutes() + s / 60;
    const h = (d.getHours() % 12) + m / 60;
    if (hour.current) hour.current.rotation.z = -(h / 12) * Math.PI * 2;
    if (minute.current) minute.current.rotation.z = -(m / 60) * Math.PI * 2;
    if (second.current) second.current.rotation.z = -((animate ? s : Math.floor(s)) / 60) * Math.PI * 2;
  });

  const indices = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const r = 0.86;
    return (
      <mesh
        key={i}
        position={[Math.sin(a) * r, Math.cos(a) * r, 0.025]}
        rotation={[0, 0, -a]}
        material={i === 0 ? accent : ink}
      >
        <boxGeometry args={[i === 0 ? 0.07 : 0.035, 0.17, 0.02]} />
      </mesh>
    );
  });

  return (
    <group rotation={[-0.25, 0.35, 0]}>
      {/* lugs + strap */}
      {[1, -1].map((dir) => (
        <group key={dir}>
          <mesh position={[0, dir * 1.38, -0.05]} material={brushed}>
            <boxGeometry args={[1.0, 0.5, 0.22]} />
          </mesh>
          {Array.from({ length: 4 }, (_, i) => (
            <mesh key={i} position={[0, dir * (1.75 + i * 0.36), -0.08 - i * 0.04]} material={i % 2 ? steel : brushed}>
              <boxGeometry args={[0.92, 0.33, 0.16]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* case */}
      <mesh rotation={[Math.PI / 2, 0, 0]} material={steel}>
        <cylinderGeometry args={[1.22, 1.2, 0.34, 96]} />
      </mesh>
      <mesh position={[0, 0, 0.17]} material={brushed}>
        <torusGeometry args={[1.12, 0.07, 24, 96]} />
      </mesh>
      {/* crown */}
      <mesh position={[1.3, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={steel}>
        <cylinderGeometry args={[0.11, 0.11, 0.18, 32]} />
      </mesh>
      {/* dial */}
      <mesh position={[0, 0, 0.175]} material={dial}>
        <circleGeometry args={[1.04, 96]} />
      </mesh>
      <group position={[0, 0, 0.18]}>
        {indices}
        <group ref={hour}>
          <mesh position={[0, 0.23, 0]} material={ink}>
            <boxGeometry args={[0.07, 0.62, 0.02]} />
          </mesh>
        </group>
        <group ref={minute} position={[0, 0, 0.015]}>
          <mesh position={[0, 0.38, 0]} material={ink}>
            <boxGeometry args={[0.05, 0.92, 0.02]} />
          </mesh>
        </group>
        <group ref={second} position={[0, 0, 0.03]}>
          <mesh position={[0, 0.34, 0]} material={accent}>
            <boxGeometry args={[0.014, 1.0, 0.01]} />
          </mesh>
        </group>
        <mesh position={[0, 0, 0.04]} material={accent}>
          <cylinderGeometry args={[0.045, 0.045, 0.02, 24]} />
        </mesh>
      </group>
      {/* crystal */}
      <mesh position={[0, 0, 0.24]} material={glass}>
        <circleGeometry args={[1.06, 96]} />
      </mesh>
    </group>
  );
}

export default function WatchViewer({ modelUrl, dialColor, onFail, reducedMotion }: Props) {
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      if (!gl) onFail();
    } catch {
      onFail();
    }
  }, [onFail]);

  return (
    <div className="absolute inset-0">
      <ViewerBoundary onFail={onFail}>
        <Canvas
          dpr={[1, 1.75]}
          camera={{ position: [0, 0, 11], fov: 30 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.domElement.addEventListener("webglcontextlost", (e) => {
              e.preventDefault();
              onFail();
            });
          }}
          aria-label={modelUrl ? "Interactive 3D model of the watch" : "Illustrative 3D watch preview"}
        >
          <ambientLight intensity={0.35} />
          <directionalLight position={[3, 4, 5]} intensity={1.4} />
          <Suspense fallback={<Loader />}>
            <SceneContents modelUrl={modelUrl} dialColor={dialColor} reducedMotion={reducedMotion} />
            <Environment resolution={256}>
              <Lightformer form="rect" intensity={3} position={[0, 4, 3]} scale={[8, 2, 1]} />
              <Lightformer form="rect" intensity={1.6} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
              <Lightformer form="rect" intensity={1.2} position={[5, -1, 2]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} />
              <Lightformer form="ring" color="#f3e3c4" intensity={1.4} position={[0, 0, -6]} scale={4} />
            </Environment>
          </Suspense>
          <ContactShadows position={[0, -3.1, 0]} opacity={0.32} scale={8} blur={2.6} far={4} />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate={!reducedMotion}
            autoRotateSpeed={0.6}
            minPolarAngle={Math.PI * 0.28}
            maxPolarAngle={Math.PI * 0.72}
            enableDamping
          />
        </Canvas>
      </ViewerBoundary>
    </div>
  );
}

function SceneContents({ modelUrl, dialColor, reducedMotion }: { modelUrl?: string; dialColor?: string; reducedMotion: boolean }) {
  if (modelUrl) return <GLBModel url={modelUrl} />;
  return (
    <group scale={0.95}>
      <ProceduralWatch dialColor={dialColor} animate={!reducedMotion} />
    </group>
  );
}
