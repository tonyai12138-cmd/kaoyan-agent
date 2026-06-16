import { Canvas } from "@react-three/fiber";
import { Component, useEffect, useState } from "react";
import PetModel from "./PetModel";

function canUseWebGL() {
  if (typeof document === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onUnavailable?.();
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

export default function AIPet3D({
  direction,
  dragging,
  mood,
  onUnavailable,
}) {
  const [webglReady, setWebglReady] = useState(() => canUseWebGL());

  useEffect(() => {
    if (!webglReady) {
      onUnavailable?.();
    }
  }, [onUnavailable, webglReady]);

  if (!webglReady) return null;

  return (
    <WebGLErrorBoundary
      onUnavailable={() => {
        setWebglReady(false);
        onUnavailable?.();
      }}
    >
      <Canvas
        className="ai-pet-canvas"
        dpr={[1, 1.75]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "low-power",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        orthographic
        camera={{ position: [0, 0.03, 6], zoom: 49, near: 0.1, far: 40 }}
        shadows
      >
        <ambientLight intensity={1.9} />
        <directionalLight
          castShadow
          intensity={1.8}
          position={[2.8, 4.2, 5]}
          shadow-mapSize-height={512}
          shadow-mapSize-width={512}
        />
        <pointLight intensity={0.8} position={[-2.5, 1.8, 3]} />
        <PetModel direction={direction} dragging={dragging} mood={mood} />
      </Canvas>
    </WebGLErrorBoundary>
  );
}
