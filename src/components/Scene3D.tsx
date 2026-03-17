// src/components/Scene3D.tsx
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Environment } from '@react-three/drei';

function AbstractObject() {
  const meshRef = useRef<Mesh>(null);

  // Premium, slow rotation for that cinematic feel
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.1;
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <mesh ref={meshRef}>
      {/* Complex 3D geometry instead of a basic shape */}
      <torusKnotGeometry args={[9, 3, 768, 3, 4, 3]} />
      <meshStandardMaterial 
        color="#0c0c0c" 
        roughness={0.1} 
        metalness={0.8} 
        wireframe={true} // Gives a luxury tech vibe
      />
    </mesh>
  );
}

export default function Scene3D() {
  return (
    <Canvas camera={{ position: [0, 0, 30], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#EBEBE6" />
      <AbstractObject />
      <Environment preset="city" />
    </Canvas>
  );
}