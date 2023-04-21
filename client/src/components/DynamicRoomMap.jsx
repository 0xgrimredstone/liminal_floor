import React, { Suspense, useEffect, useState, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree, useGraph, useLoader } from "@react-three/fiber";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {  Preload, useGLTF, Box } from "@react-three/drei";
import * as THREE from "three";
import CameraOrbitController from "./CameraOrbitController";
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

const UpSpotlight = () => {
  const [u] = useState(() => new THREE.Object3D());
  return (
    <mesh>
      <primitive object={u} position={[0,0.2,0]} />
      <spotLight target={u} position={[0,-1,2]} angle={0.1} color="white" intensity={0.5} penumbra={0.1}/>
    </mesh>
  );
};

const DownSpotlight = () => {
  const [u] = useState(() => new THREE.Object3D());
  return (
    <mesh>
      <primitive object={u} position={[0,-0.2,0]} />
      <spotLight target={u} position={[0,1,2]} angle={0.1} color="white" intensity={0.5} penumbra={0.1}/>
    </mesh>
  );
};

const LeftSpotlight = () => {
  const [u] = useState(() => new THREE.Object3D());
  return (
    <mesh>
      <primitive object={u} position={[-0.2,0,0]} />
      <spotLight target={u} position={[1,0,2]} angle={0.1} color="white" intensity={0.5} penumbra={0.1}/>
    </mesh>
  );
};

const RightSpotlight = () => {
  const [u] = useState(() => new THREE.Object3D());
  return (
    <mesh>
      <primitive object={u} position={[0.2,0,0]} />
      <spotLight target={u} position={[-1,0,2]} angle={0.1} color="white" intensity={0.5} penumbra={0.1}/>
    </mesh>
  );
};

const RightLeftSpotlight = () => {
  const [u] = useState(() => new THREE.Object3D());
  return (
    <mesh>
      <primitive object={u} position={[1,0,0]} />
      <spotLight target={u} position={[-1,0,2]} angle={0.1} color="white" intensity={0.5} penumbra={0.1}/>
    </mesh>
  );
};

const RightDownSpotlight = () => {
  const [u] = useState(() => new THREE.Object3D());
  return (
    <mesh>
      <primitive object={u} position={[1.1,-0.5,0]} />
      <spotLight target={u} position={[1.1,1,2]} angle={0.1} color="white" intensity={0.5} penumbra={0.1}/>
    </mesh>
  );
};

const RightUpSpotlight = () => {
  const [u] = useState(() => new THREE.Object3D());
  return (
    <mesh>
      <primitive object={u} position={[1.1,0.5,0]} />
      <spotLight target={u} position={[1.1,-1,2]} angle={0.1} color="white" intensity={0.5} penumbra={0.1}/>
    </mesh>
  );
};

const LeftDownSpotlight = () => {
  const [u] = useState(() => new THREE.Object3D());
  return (
    <mesh>
      <primitive object={u} position={[-1.1,-0.5,0]} />
      <spotLight target={u} position={[-1.1,1,2]} angle={0.1} color="white" intensity={0.5} penumbra={0.1}/>
    </mesh>
  );
};

const LeftUpSpotlight = () => {
  const [u] = useState(() => new THREE.Object3D());
  return (
    <mesh>
      <primitive object={u} position={[-1.1,0.5,0]} />
      <spotLight target={u} position={[-1.1,-1,2]} angle={0.1} color="white" intensity={0.5} penumbra={0.1}/>
    </mesh>
  );
};

const UpDownSpotlight = () => {
  const [u] = useState(() => new THREE.Object3D());
  return (
    <mesh>
      <primitive object={u} position={[0,1,0]} />
      <spotLight target={u} position={[0,-1,2]} angle={0.1} color="white" intensity={0.5} penumbra={0.1}/>
    </mesh>
  );
};

const UpLeftSpotlight = () => {
  const [u] = useState(() => new THREE.Object3D());
  return (
    <mesh>
      <primitive object={u} position={[-0.5,1,0]} />
      <spotLight target={u} position={[-2,1,1]} angle={0.1} color="white" intensity={0.5} penumbra={0.1}/>
    </mesh>
  );
};

const UpRightSpotlight = () => {
  const [u] = useState(() => new THREE.Object3D());
  return (
    <mesh>
      <primitive object={u} position={[0.5,1,0]} />
      <spotLight target={u} position={[2,1,1]} angle={0.1} color="white" intensity={0.5} penumbra={0.1}/>
    </mesh>
  );
};

const Plane = () => {
  return(
    <mesh>
      <planeGeometry args={[2, 2]} />
      <meshStandardMaterial color="#a56879" />
    </mesh>
  );
}

const ArrowUpDown = ( ) => {
  const arrowModel = useGLTF("../arrow/scene.gltf");
  
  return (
    <mesh>
      <primitive
        object={arrowModel.scene}
        scale={0.013}
        position={[0.035, -0.4, 0]}
        rotation={[1,3.14,0]}
      />
    </mesh>
  );
};

const Road = ({ isMobile, position }) => {
  const roadModel = useGLTF("../road/untitled.gltf");
  
  return (
    <mesh>
      <hemisphereLight intensity={0.15} groundColor='black' />
      <pointLight intensity={0.1} />
      <primitive
        object={roadModel.scene}
        scale={isMobile ? 0.4 : 0.6}
        position={isMobile ? [0, -3, -2.2] : [0, -0.1, 0]}
        rotation={position}
      />
    </mesh>
  );
};

const Hotel = ({ isMobile, position }) => {
  const hotelModel = useGLTF("../hotel/scene.gltf");
  return (
    <mesh>
      <hemisphereLight intensity={0.15} groundColor='black' />
      <pointLight intensity={0.1} />
      <primitive
        object={hotelModel.scene}
        scale={isMobile ? 0.4 : 0.6}
        position={isMobile ? [0, -3, -2.2] : [0,-0.1,0]}
        rotation={position}
      />
    </mesh>
  );
};

const Hallway = ({ isMobile, position }) => {
  const hallwayModel = useGLTF("../hallway/untitled.gltf");
  return (
    <mesh>
      <hemisphereLight intensity={0.15} groundColor='black' />
      <pointLight intensity={0.1} />
      <primitive
        object={hallwayModel.scene}
        scale={isMobile ? 0.4 : 0.6}
        position={isMobile ? [0, -3, -2.2] : [0,-0.1,0]}
        rotation={position}
      />
    </mesh>
  );
};

const Forest = ({ isMobile, position }) => {
  const forestModel = useGLTF("../forest/untitled.gltf");
  return (
    <mesh>
      <hemisphereLight intensity={0.15} groundColor='black' />
      <pointLight intensity={0.1} />
      <primitive
        object={forestModel.scene}
        scale={isMobile ? 0.4 : 0.6}
        position={isMobile ? [0, -3, -2.2] : [0,-0.1,0]}
        rotation={position}
      />
    </mesh>
  );
};

const Elevator = ({ isMobile, position }) => {
  const elevatorModel = useGLTF("../elevator/untitled.gltf");
  return (
    <mesh>
      <hemisphereLight intensity={0.15} groundColor='black' />
      <pointLight intensity={0.1} />
      <primitive
        object={elevatorModel.scene}
        scale={isMobile ? 0.4 : 0.6}
        position={isMobile ? [0, -3, -2.2] : [0,-0.1,0]}
        rotation={position}
      />
    </mesh>
  );
};

const Bedroom = ({ isMobile, position }) => {
  const roomModel = useGLTF("../room/untitled.gltf");
  return (
    <mesh>
      <hemisphereLight intensity={0.15} groundColor='black' />
      <pointLight intensity={0.1} />
      <primitive
        object={roomModel.scene}
        scale={isMobile ? 0.4 : 0.6}
        position={isMobile ? [0, -3, -2.2] : [0,-0.1,0]}
        rotation={position}
      />
    </mesh>
  );
};

function Arrow({ position, rotation, gltf }) {
  
  const arrowRef = useRef();

  useEffect(() => {
    const arrow = gltf.scene;
    const arrowClone = SkeletonUtils.clone(arrow);

    arrowClone.position.copy(position);
    arrowClone.rotation.copy(rotation);

    arrowClone.updateMatrixWorld();

    arrow.parent.add(arrowClone);

    return () => {
      arrow.parent.remove(arrowClone);
    };
  }, [position, rotation, gltf.scene]);

  return (
    <primitive ref={arrowRef} object={gltf.scene} scale={0.013} position={position} rotation={rotation}/>
  );
}


const DynamicRoomMap = ({index, directionAll, ready, choice, direction}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [focus, setFocus] = useState({x:0, y:0, z:0.5});
  const [lastChoice, setLastChoice] = useState(0);
  const [position, setPosition] = useState([1.2,0,0]);
  const [currentRoom, setCurrentRoom] = useState(<Bedroom isMobile={isMobile} position={position}/>);
  
  useEffect(()=> {
    let pos = position;
    if(choice > lastChoice) {
      setPosition([1.5,(position[1]+1.57)%6.28,0]);
      pos = [1.5,(position[1]+1.57)%6.28,0];
      setLastChoice(choice);
    }
    else if (choice < lastChoice){
      setPosition([1.5,(position[1]-1.57)%6.28,0]);
      pos = [1.5,(position[1]-1.57)%6.28,0]
      setLastChoice(choice);
    }

    switch (index) {
      case 3:
        setCurrentRoom(<Hotel isMobile={isMobile} position={pos}/>)
        break;
      case 4:
        setCurrentRoom(<Road isMobile={isMobile} position={pos}/>)
        break;
      case 5:
        setCurrentRoom(<Forest isMobile={isMobile} position={pos}/>)
        break;
      case 6:
        setCurrentRoom(<Bedroom isMobile={isMobile} position={pos}/>)
        break;
      case 7:
        setCurrentRoom(<Hallway isMobile={isMobile} position={pos}/>)
        break;
      case 8:
        setCurrentRoom(<Elevator isMobile={isMobile} position={pos}/>)
        break;
      default:
        break;
    }
  },[index,choice])

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

  // const Arrow = ({position, rotation}) => {
  //   const {scene, materials, animations} = useGLTF("../arrow/scene.gltf");
  //   const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  //   const { nodes } = useGraph(clone);
  //   return (
  //   <mesh>
  //     <primitive
  //       object={nodes}
  //       position={position}
  //       scale={0.013}
  //       rotation={rotation}
  //     />
  //   </mesh>
  //   );
  // };
  

  

  const gltf = useLoader(GLTFLoader, '../arrow/scene.gltf');
  return (
    <Canvas>
      <Suspense fallback={null}>
        <CameraOrbitController zoom={false} focus={focus}/>
        {currentRoom}
        <Plane/>
        
        
        {direction[0] && <Box scale={0.05} position={[-0.026, 0.25, 0]} rotation={[1.5,0.8,0]} />}
        {direction[1] && <Box scale={0.05} position={[-0.4, 0, 0]} rotation={[1.57,1.57,0]} />}
        {direction[2] && <Box scale={0.013} position={[0.4, 0, 0]} rotation={[1.7,-1.57,0]} />}
        {direction[3] && <Box scale={0.05} position={[0.035, -0.4, 0]} rotation={[1,3.14,0]} />}
        {directionAll[0][0] && <LeftUpSpotlight/>}
        {directionAll[0][2] && <Box scale={0.05} position={[-0.7,0,0]} rotation={[1.5,0.8,0]} />}
        {directionAll[0][3] && <LeftDownSpotlight/>}
        {directionAll[1][0] && <RightUpSpotlight/>}
        {directionAll[1][1] && <Box scale={0.05} position={[0.7,0,0]} rotation={[1.5,0.8,0]} />}
        {directionAll[1][3] && <RightDownSpotlight/>}
        {directionAll[2][1] && <UpLeftSpotlight/>}
        {directionAll[2][2] && <UpRightSpotlight/>}
        {/* {directionAll[2][3] && <ArrowUp position={[0.1,0.1,0.1]}/>} */}
      </Suspense>
      <Preload all />
    </Canvas>
  );
  
};

export default DynamicRoomMap;