import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {  Preload, useGLTF } from "@react-three/drei";
import CameraOrbitController from "./CameraOrbitController";

const Hotel = ({ isMobile }) => {
  const hotelModel = useGLTF("../hotel/scene.gltf");
  return (
    <mesh>
      <hemisphereLight intensity={0.15} groundColor='black' />
      <pointLight intensity={0.1} />
      <primitive
        object={hotelModel.scene}
        scale={isMobile ? 0.4 : 0.6}
        position={isMobile ? [0, -3, -2.2] : [0, -0.25, 0.25]}
        rotation={[0,91.1,0]}
      />
    </mesh>
  );
};

const Road = ({ isMobile }) => {
  const roadModel = useGLTF("../road/untitled.gltf");
  return (
    <mesh>
      <hemisphereLight intensity={0.15} groundColor='black' />
      <pointLight intensity={0.1} />
      <primitive
        object={roadModel.scene}
        scale={isMobile ? 0.4 : 0.6}
        position={isMobile ? [0, -3, -2.2] : [0, -0.25, 0.25]}
        rotation={[0,3.15,0]}
      />
    </mesh>
  );
};

const Hallway = ({ isMobile }) => {
  const hallwayModel = useGLTF("../hallway/untitled.gltf");
  return (
    <mesh>
      <hemisphereLight intensity={0.15} groundColor='black' />
      <pointLight intensity={0.1} />
      <primitive
        object={hallwayModel.scene}
        scale={isMobile ? 0.4 : 0.6}
        position={isMobile ? [0, -3, -2.2] : [0, -0.28, 0.18]}
        rotation={[0,0,0]}
      />
    </mesh>
  );
};

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

const Elevator = ({ isMobile }) => {
  const elevatorModel = useGLTF("../elevator/untitled.gltf");
  return (
    <mesh>
      <hemisphereLight intensity={0.15} groundColor='black' />
      <pointLight intensity={0.1} />
      <primitive
        object={elevatorModel.scene}
        scale={isMobile ? 0.4 : 0.6}
        position={isMobile ? [0, -3, -2.2] : [0, -0.25, 0.28]}
        rotation={[0,4.7,0]}
      />
    </mesh>
  );
};

const Bedroom = ({ isMobile }) => {
  const roomModel = useGLTF("../room/untitled.gltf");
  return (
    <mesh>
      <hemisphereLight intensity={0.15} groundColor='black' />
      <pointLight intensity={0.1} />
      <primitive
        object={roomModel.scene}
        scale={isMobile ? 0.4 : 0.6}
        position={isMobile ? [0, -3, -2.2] : [0, -0.25, 0.25]}
        rotation={[0,4.7,0]}
      />
    </mesh>
  );
};

const DynamicRoomCanvas = ({index, ready, choice}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [focus, setFocus] = useState({});
  const [currentRoom, setCurrentRoom] = useState(<Bedroom isMobile={isMobile}/>);
  useEffect(()=> {
    switch (index) {
      case 3:
        setCurrentRoom(<Hotel isMobile={isMobile}/>)
        break;
      case 4:
        setCurrentRoom(<Road isMobile={isMobile}/>)
        break;
      case 5:
        setCurrentRoom(<Forest isMobile={isMobile}/>)
        break;
      case 6:
        setCurrentRoom(<Bedroom isMobile={isMobile}/>)
        break;
      case 7:
        setCurrentRoom(<Hallway isMobile={isMobile}/>)
        break;
      case 8:
        setCurrentRoom(<Elevator isMobile={isMobile}/>)
        break;
      default:
        break;
    }
  },[index])
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
      <Suspense fallback={<></>}>
        <CameraOrbitController zoom={zoom} focus={focus}/>
        {currentRoom}
      </Suspense>

      <Preload all />
    </Canvas>
  );
  
};

export default DynamicRoomCanvas;