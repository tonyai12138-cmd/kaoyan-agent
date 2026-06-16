import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BackSide, DoubleSide, MathUtils } from "three";

function directionRotationY(direction) {
  if (direction === "moving-left") return 0.9;
  if (direction === "moving-right") return -0.9;
  if (direction === "moving-up-left") return Math.PI - 0.5;
  if (direction === "moving-up-right") return -Math.PI + 0.5;
  if (direction === "moving-up") return Math.PI;
  return 0;
}

function moodScale(direction, mood) {
  if (direction === "moving-down") return 1.08;
  if (mood === "happy") return 1.06;
  if (mood === "tired") return 0.97;
  return 1;
}

function SoftSphere({ args = [1, 40, 32], material, outlineMaterial, ...props }) {
  return (
    <>
      <mesh {...props} scale={props.scale?.map((value) => value * 1.045)}>
        <sphereGeometry args={args} />
        <meshStandardMaterial {...outlineMaterial} side={BackSide} />
      </mesh>
      <mesh castShadow {...props}>
        <sphereGeometry args={args} />
        <meshStandardMaterial {...material} />
      </mesh>
    </>
  );
}

function SoftCapsule({ args = [1, 1, 10, 18], material, outlineMaterial, ...props }) {
  return (
    <>
      <mesh {...props} scale={props.scale?.map((value) => value * 1.05)}>
        <capsuleGeometry args={args} />
        <meshStandardMaterial {...outlineMaterial} side={BackSide} />
      </mesh>
      <mesh castShadow {...props}>
        <capsuleGeometry args={args} />
        <meshStandardMaterial {...material} />
      </mesh>
    </>
  );
}

export default function PetModel({ direction, dragging, mood }) {
  const groupRef = useRef(null);
  const bodyRef = useRef(null);
  const headRef = useRef(null);
  const hatRef = useRef(null);

  const materials = useMemo(
    () => ({
      fur: { color: "#fffdf7", roughness: 0.78, metalness: 0.01 },
      outline: { color: "#111827", roughness: 0.6, metalness: 0 },
      face: { color: "#0f172a", roughness: 0.42, metalness: 0.02 },
      cheek: { color: "#fb7185", roughness: 0.82, metalness: 0 },
      hat: { color: "#020617", roughness: 0.48, metalness: 0.03 },
      red: { color: "#ef4444", roughness: 0.66, metalness: 0.01 },
      redDark: { color: "#b91c1c", roughness: 0.72, metalness: 0.01 },
      gold: { color: "#f59e0b", roughness: 0.55, metalness: 0.04 },
      book: { color: "#10b981", roughness: 0.76, metalness: 0.01 },
      paper: { color: "#f8fafc", roughness: 0.82, metalness: 0 },
      pole: { color: "#475569", roughness: 0.6, metalness: 0.02 },
    }),
    [],
  );

  useFrame(({ clock }, delta) => {
    const time = clock.getElapsedTime();
    const group = groupRef.current;
    const body = bodyRef.current;
    const head = headRef.current;
    const hat = hatRef.current;
    if (!group || !body || !head || !hat) return;

    const targetY = directionRotationY(direction);
    group.rotation.y = MathUtils.damp(group.rotation.y, targetY, 8.5, delta);

    const targetScale = moodScale(direction, mood);
    const happyPulse = mood === "happy" ? Math.sin(time * 13) * 0.035 : 0;
    const nextScale = targetScale + happyPulse;
    group.scale.setScalar(MathUtils.damp(group.scale.x, nextScale, 7, delta));

    const idleFloat =
      Math.sin(time * (dragging ? 8 : 2.6)) * (dragging ? 0.035 : 0.06);
    const happyHop =
      mood === "happy" ? Math.max(0, Math.sin(time * 12)) * 0.16 : 0;
    const tiredDrop = mood === "tired" ? -0.11 : 0;
    group.position.y = MathUtils.damp(
      group.position.y,
      idleFloat + happyHop + tiredDrop,
      7,
      delta,
    );

    const thinkingSwing =
      mood === "thinking" ? Math.sin(time * 7.2) * 0.15 : 0;
    const tiredNod = mood === "tired" ? 0.24 : 0;
    body.rotation.z = MathUtils.damp(body.rotation.z, thinkingSwing, 9, delta);
    head.rotation.x = MathUtils.damp(head.rotation.x, tiredNod, 8, delta);
    head.rotation.z = MathUtils.damp(
      head.rotation.z,
      mood === "thinking" ? Math.sin(time * 5.8) * 0.08 : 0,
      8,
      delta,
    );
    hat.rotation.z = MathUtils.damp(
      hat.rotation.z,
      0.12 + (mood === "happy" ? Math.sin(time * 12) * 0.05 : 0),
      8,
      delta,
    );
  });

  return (
    <group ref={groupRef} position={[0, -0.16, 0]}>
      <group ref={bodyRef}>
        <SoftSphere
          material={materials.fur}
          outlineMaterial={materials.outline}
          position={[0, -0.43, 0]}
          scale={[0.86, 1.08, 0.62]}
        />

        <group ref={headRef}>
          <SoftSphere
            material={materials.fur}
            outlineMaterial={materials.outline}
            position={[0, 0.58, 0]}
            scale={[0.96, 0.88, 0.66]}
          />

          <SoftSphere
            material={materials.fur}
            outlineMaterial={materials.outline}
            position={[-0.58, 1.16, 0.02]}
            scale={[0.28, 0.31, 0.2]}
          />
          <SoftSphere
            material={materials.fur}
            outlineMaterial={materials.outline}
            position={[0.58, 1.16, 0.02]}
            scale={[0.28, 0.31, 0.2]}
          />
          <SoftSphere
            material={{ ...materials.fur, color: "#fff7ed" }}
            outlineMaterial={materials.outline}
            position={[-0.58, 1.15, 0.08]}
            scale={[0.16, 0.18, 0.08]}
          />
          <SoftSphere
            material={{ ...materials.fur, color: "#fff7ed" }}
            outlineMaterial={materials.outline}
            position={[0.58, 1.15, 0.08]}
            scale={[0.16, 0.18, 0.08]}
          />

          <mesh position={[-0.29, 0.68, 0.63]} scale={[0.075, 0.09, 0.035]}>
            <sphereGeometry args={[1, 20, 14]} />
            <meshStandardMaterial {...materials.face} />
          </mesh>
          <mesh position={[0.29, 0.68, 0.63]} scale={[0.075, 0.09, 0.035]}>
            <sphereGeometry args={[1, 20, 14]} />
            <meshStandardMaterial {...materials.face} />
          </mesh>
          <mesh position={[0, 0.49, 0.66]} scale={[0.1, 0.075, 0.045]}>
            <sphereGeometry args={[1, 20, 14]} />
            <meshStandardMaterial {...materials.face} />
          </mesh>
          <mesh
            position={[0, 0.31, 0.67]}
            rotation={[0, 0, Math.PI]}
            scale={[0.72, 0.42, 1]}
          >
            <torusGeometry args={[0.23, 0.018, 8, 34, Math.PI]} />
            <meshStandardMaterial {...materials.face} />
          </mesh>
          <mesh position={[-0.43, 0.39, 0.63]} scale={[0.09, 0.04, 0.02]}>
            <sphereGeometry args={[1, 18, 10]} />
            <meshStandardMaterial {...materials.cheek} />
          </mesh>
          <mesh position={[0.43, 0.39, 0.63]} scale={[0.09, 0.04, 0.02]}>
            <sphereGeometry args={[1, 18, 10]} />
            <meshStandardMaterial {...materials.cheek} />
          </mesh>

          <group ref={hatRef}>
            <mesh castShadow position={[0, 1.25, 0.01]} rotation={[0, 0, 0.12]}>
              <boxGeometry args={[1.42, 0.095, 0.8]} />
              <meshStandardMaterial {...materials.hat} />
            </mesh>
            <mesh castShadow position={[0, 1.11, 0.01]} scale={[0.38, 0.13, 0.35]}>
              <cylinderGeometry args={[1, 1, 1, 32]} />
              <meshStandardMaterial {...materials.hat} />
            </mesh>
            <mesh position={[0.55, 1.02, 0.36]} rotation={[0, 0, -0.14]}>
              <cylinderGeometry args={[0.014, 0.014, 0.54, 8]} />
              <meshStandardMaterial {...materials.gold} />
            </mesh>
            <mesh position={[0.62, 0.75, 0.37]} scale={[0.055, 0.055, 0.055]}>
              <sphereGeometry args={[1, 12, 8]} />
              <meshStandardMaterial {...materials.red} />
            </mesh>
          </group>
        </group>

        <SoftCapsule
          material={materials.fur}
          outlineMaterial={materials.outline}
          position={[-0.72, -0.24, 0.08]}
          rotation={[0, 0, -0.18]}
          scale={[0.16, 0.42, 0.16]}
        />
        <SoftCapsule
          material={materials.fur}
          outlineMaterial={materials.outline}
          position={[0.72, -0.24, 0.08]}
          rotation={[0, 0, 0.18]}
          scale={[0.16, 0.42, 0.16]}
        />
        <SoftSphere
          material={materials.fur}
          outlineMaterial={materials.outline}
          position={[-0.35, -1.27, 0.12]}
          scale={[0.21, 0.23, 0.18]}
        />
        <SoftSphere
          material={materials.fur}
          outlineMaterial={materials.outline}
          position={[0.35, -1.27, 0.12]}
          scale={[0.21, 0.23, 0.18]}
        />
        <SoftSphere
          material={materials.fur}
          outlineMaterial={materials.outline}
          position={[0, -0.22, -0.6]}
          scale={[0.16, 0.16, 0.12]}
        />

        <group position={[0, 0.05, 0.68]}>
          <mesh position={[-0.14, -0.03, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.16, 0.28, 3]} />
            <meshStandardMaterial {...materials.red} />
          </mesh>
          <mesh position={[0.14, -0.03, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.16, 0.28, 3]} />
            <meshStandardMaterial {...materials.red} />
          </mesh>
          <mesh position={[0, -0.03, 0]} scale={[0.07, 0.07, 0.035]}>
            <sphereGeometry args={[1, 18, 12]} />
            <meshStandardMaterial {...materials.redDark} />
          </mesh>
        </group>

        <group position={[-0.42, -0.62, 0.64]} rotation={[0.22, 0.05, -0.08]}>
          <mesh castShadow position={[0, 0, 0]}>
            <boxGeometry args={[0.5, 0.34, 0.08]} />
            <meshStandardMaterial {...materials.book} />
          </mesh>
          <mesh position={[0.02, 0.02, 0.055]}>
            <boxGeometry args={[0.4, 0.25, 0.025]} />
            <meshStandardMaterial {...materials.paper} />
          </mesh>
          <mesh position={[0, 0.02, 0.08]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.25, 0.018, 0.025]} />
            <meshStandardMaterial {...materials.book} />
          </mesh>
        </group>

        <group position={[0.72, -0.58, 0.46]} rotation={[0, 0, -0.08]}>
          <mesh position={[0, 0.38, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.78, 10]} />
            <meshStandardMaterial {...materials.pole} />
          </mesh>
          <mesh position={[0.18, 0.62, 0]} rotation={[0, 0, 0]}>
            <planeGeometry args={[0.35, 0.22]} />
            <meshStandardMaterial {...materials.red} side={DoubleSide} />
          </mesh>
          <mesh position={[0.03, 0.62, 0.004]}>
            <sphereGeometry args={[0.026, 10, 8]} />
            <meshStandardMaterial {...materials.gold} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
