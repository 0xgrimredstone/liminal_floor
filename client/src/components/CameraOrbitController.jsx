import React, { useEffect, useMemo } from "react";
import * as THREE from 'three'
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import CameraControls from 'camera-controls'

CameraControls.install({ THREE })

const CameraOrbitController = ({zoom, focus, pos = new THREE.Vector3(), look = new THREE.Vector3()}) => {
    const camera = useThree((state) => state.camera)
    const gl = useThree((state) => state.gl)
    const controls = useMemo(() => new CameraControls(camera, gl.domElement), [])
    return useFrame((state, delta) => {
        zoom ? pos.set(focus.x, focus.y, focus.z + 0.2) : pos.set(0, 0, 2)
        zoom ? look.set(focus.x, focus.y, focus.z - 0.2) : look.set(0, 0, 1)

        state.camera.position.lerp(pos, 0.5)
        state.camera.updateProjectionMatrix()

        controls.setLookAt(state.camera.position.x, state.camera.position.y, state.camera.position.z, look.x, look.y, look.z, true)
        return controls.update(delta)
    })
}
export default CameraOrbitController;