import React, { Suspense, useEffect, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
import CanvasLoader from "../Loader";
import gsap from "gsap";
import { Mesh } from "three";

const Gustav = ({ isMobile }) => {
  const ref = useRef();
  const gustavModel = useGLTF("../gustav/scene.gltf");
  return (
    <mesh>
      <hemisphereLight intensity={0.15} groundColor='black' />
      <pointLight intensity={1} />
      <spotLight
        position={[-20, 20, 40]}
        angle={0.12}
        penumbra={1}
        intensity={0.5}
        castShadow
        shadow-mapSize={1024}
        color = "#5a9ed6"
      />
      <primitive
        object={gustavModel.scene}
        scale={isMobile ? 0.4 : 3}
        position={isMobile ? [0, -3, -2.2] : [0, -1.5, 0]}
        rotation={[0,2.5,0]}
      />
    </mesh>
  );
};
const GameOverCanvas = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Add a listener for changes to the screen size
    const mediaQuery = window.matchMedia("(max-width: 500px)");

    // Set the initial value of the `isMobile` state variable
    setIsMobile(mediaQuery.matches);

    // Define a callback function to handle changes to the media query
    const handleMediaQueryChange = (event) => {
      setIsMobile(event.matches);
    };

    // Add the callback function as a listener for changes to the media query
    mediaQuery.addEventListener("change", handleMediaQueryChange);

    // Remove the listener when the component is unmounted
    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  return (
    <Canvas
    camera={{
        fov: 45,
        near: 0.1,
        far: 200,
        position: [-4, 0, 6],
      }}>
      <Suspense fallback={<CanvasLoader />}>
        <OrbitControls
          enablePan={true}
          enableRotate={true}
          enableZoom={true}
          autoRotate={true}
        ></OrbitControls>
        <Gustav isMobile={isMobile} />
      </Suspense>

      <Preload all />
    </Canvas>
  );
  
};

export default GameOverCanvas;
