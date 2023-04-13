import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {  Preload, useGLTF } from "@react-three/drei";
import CanvasLoader from "../Loader";
import CameraOrbitController from "../CameraOrbitController";

const Forest = ({ isMobile }) => {
  const forestModel = useGLTF("../forest/untitled.gltf");
  return (
    <mesh>
      <hemisphereLight intensity={0.15} groundColor='black' />
      <pointLight intensity={0.1} />
      <primitive
        object={forestModel.scene}
        scale={isMobile ? 0.4 : 0.6}
        position={isMobile ? [0, -3, -2.2] : [0, -0.25, 0.25]}
        rotation={[0,1.55,0]}
      />
    </mesh>
  );
};

const ForestCanvas = ({ready, choice}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [focus, setFocus] = useState({});
  // const [rotation, setRotation] = useState({});

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

  useEffect(() => {
    if(ready){
      setZoom(true);
      setFocus({x:0, y:0, z:0.5});
      // setRotation({x:0, y:0, z:0});
    }
    else setZoom(false);
  }, [ready]);

  useEffect(() => {
    if (choice > 0) {
      setZoom(true);
      setFocus({x:0, y:0, z:0});
      setTimeout(() => { 
        setZoom(false);
        setFocus({x:0, y:0, z:0.5});
      },2000);
      // setRotation({x:0, y:0, z:0});
    }
    else if (ready){
      setZoom(true);
      setFocus({x:0, y:0, z:0.5});
    }
  }, [choice]);

  return (
    <Canvas>
      <Suspense fallback={<CanvasLoader />}>
        <CameraOrbitController zoom={zoom} focus={focus}/>
        <Forest isMobile={isMobile}/>
      </Suspense>

      <Preload all />
    </Canvas>
  );
  
};

export default ForestCanvas;
