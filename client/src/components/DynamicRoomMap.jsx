import React, { Suspense, useEffect, useState, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree, useGraph, useLoader } from "@react-three/fiber";
import {  OrbitControls, Preload, useGLTF, Cone } from "@react-three/drei";
import { Vector3 } from 'three';
import Loader from './Loader';
import { faLessThan } from "@fortawesome/free-solid-svg-icons";

const Model = ({obj, rot, pos}) => {
  return (
    <mesh>
      <hemisphereLight intensity={0.15} groundColor='black' />
      <pointLight intensity={0.1} />
      <primitive
          object={obj.scene}
          castShadow
          receiveShadow
          scale={5}
          rotation={rot}
          position={pos}
        />
    </mesh>
  )
}

const CustomCone = ({pos, rot, ok}) => {
  let col = ok? "lime" : "hotpink";
  return (
    <Cone position={pos} rotation={rot} material-color={col} args={[0.5,1.5]}/>
  );
}

const DynamicRoomMap = ({wholeMap, P1Position, commitedRot, rotChoice, directionAll}) => {
  // const ref = useRef();
  const roomModel=useGLTF("../room/untitled.gltf");
  const hotelModel = useGLTF("../hotel/scene.gltf");
  const roadModel = useGLTF("../road/untitled.gltf");
  const forestModel = useGLTF("../forest/untitled.gltf");
  const hallwayModel = useGLTF("../hallway/untitled.gltf");
  const elevatorModel = useGLTF("../elevator/untitled.gltf");
  const gustavModel = useGLTF("../gustav/scene.gltf");
  const stairsModel = useGLTF("../stairs/scene.gltf");
  const [currRoom, setCurrRoom] = useState(<Model obj={roomModel} rot={[0,0,0]}/>);
  const [otherModels, setOtherModels] = useState(<></>)
  const [dirToLook, setDirToLook] = useState([false, false, false, false]);

  const getRoomModel = (index, rotation, position) => {
    try{
      let result;
      switch (index) {
        case 1:
          result=(<Suspense fallback={<Loader/>}>
              <Model 
                obj={stairsModel}
                rot={rotation}
                pos={position}
              />
          </Suspense>
          )
          break;
        case 2:
          result=(<Suspense fallback={<Loader/>}>
              <Model 
                obj={gustavModel}
                rot={rotation}
                pos={position}
              />
          </Suspense>
          )
          break;
        case 3:
          result=(<Suspense fallback={<Loader/>}>
              <Model 
                obj={hotelModel}
                rot={rotation}
                pos={position}
              />
          </Suspense>
          )
          break;
        case 4:
          result=(<Suspense fallback={<Loader/>}>
              <Model 
                obj={roadModel}
                rot={rotation}
                pos={position}
              />
          </Suspense>
          )
          break;
        case 5:
          result=(<Suspense fallback={<Loader/>}>
              <Model 
                obj={forestModel}
                rot={rotation}
                pos={position}
              />
          </Suspense>
          )
          break;
        case 6:
          result=(<Suspense fallback={<Loader/>}>
              <Model 
                obj={roomModel}
                rot={rotation}
                pos={position}
              />
          </Suspense>
          )
          break;
        case 7:
          result=(<Suspense fallback={<Loader/>}>
              <Model 
                obj={hallwayModel} 
                rot={rotation}
                pos={position}
              />
          </Suspense>
          )
          break;
        case 8:
          result=(<Suspense fallback={<Loader/>}>
              <Model 
                obj={elevatorModel}
                rot={rotation}
                pos={position}
              />
          </Suspense>
          )
          break;
        default:
          result=<></>
          break;
      }
      return result;
    } catch (error){
      console.log(error);
    }
  }
  const getRotationValue = (index) => {
    let newRot;
    switch (index) {
      case 0:
        newRot = [0,0,0];
        break;
      case 1:
        newRot = [0,1.57,0];
        break;
      case 2:
        newRot = [0,3.14,0];
        break;
      case 3:
        newRot = [0,4.71,0];
        break;
      default:
        break;
    }
    return newRot;
  }

  // When P1 has moved, set new round for P2
  useEffect( ()=> {
    let temp = [];
    let counter = 0;
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        if (i == 0 && j == 0) continue;
        else if (P1Position[0]+i >= 5 || P1Position[0]+i < 0 || P1Position[1]+j >= 5 || P1Position[1]+j < 0) continue;
        else if (wholeMap[P1Position[0]+i][P1Position+j] == 0) continue;

        counter++;
        // console.log("dynamic room rot: "+getRotationValue(commitedRot[P1Position[0]+i][P1Position[1]+j]))
        temp.push(getRoomModel( 
          wholeMap[P1Position[0]+i][P1Position[1]+j], 
          getRotationValue(commitedRot[P1Position[0]+i][P1Position[1]+j]), 
          [i*8,0,j*8] 
        ));
      }
    }

    setOtherModels(<>
      {temp.map((obj, key) => {return obj})}
    </>)
    // console.log(directionAll);
  },[P1Position, commitedRot])

  useEffect(() => {
    console.log(directionAll);
    if (directionAll[4]){
      setDirToLook([
        directionAll[4][0] == 1 ? (directionAll[3][3] == 1 ? 2 : 1) : 0,
        directionAll[4][1] == 1 ? (directionAll[1][2] == 1 ? 2 : 1) : 0,
        directionAll[4][2] == 1 ? (directionAll[7][1] == 1 ? 2 : 1) : 0,
        directionAll[4][3] == 1 ? (directionAll[5][0] == 1 ? 2 : 1) : 0,
      ]);
    }
  },[directionAll])

  // Switch case when P2 wants to see different rotations
  useEffect(() => {

    setCurrRoom(
      getRoomModel( 
        wholeMap[P1Position[0]][P1Position[1]], 
        getRotationValue(rotChoice % 4 < 0 ? rotChoice % 4 + 4 : rotChoice % 4), 
        [0,0,0] 
      ) 
    );
  },[rotChoice])

  return (
    <Canvas
      frameloop='demand'
      shadows
      dpr={[1, 2]}
      camera={{ position: [-10, 15, 10] }}
    >
      <Suspense fallback={<Loader/>}>
        <OrbitControls target={[0, 1, 0]}/>
        {otherModels}
        {currRoom}
        {dirToLook[0] > 0 && <CustomCone pos={[0,1,-5]} rot={[-1.57,0,0]} ok={dirToLook[0] == 2 ? true : false}/>}
        {dirToLook[1] > 0 && <CustomCone pos={[-5,1,0]} rot={[-1.57,0,1.57]} ok={dirToLook[1] == 2 ? true : false}/>}
        {dirToLook[2] > 0 && <CustomCone pos={[5,1,0]} rot={[-1.57,0,-1.57]} ok={dirToLook[2] == 2 ? true : false}/>}
        {dirToLook[3] > 0 && <CustomCone pos={[0,1,5]} rot={[1.57,0,0]} ok={dirToLook[3] == 2 ? true : false}/>}
      </Suspense>
      <Preload all />
    </Canvas>
  );
  
};

export default DynamicRoomMap;