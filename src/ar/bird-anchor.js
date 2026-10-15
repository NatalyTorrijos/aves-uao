import {Vector3} from 'three'

// A world-space observation point, not a detected physical surface.
// Use XR's projection matrix rather than the default three.js camera FOV.
export function birdAnchor(camera,height=1.12) {
  const projection=camera.projectionMatrix.elements
  const distance=Math.max(1.6,Math.abs(projection[0])*.9,Math.abs(projection[5])*.9)
  const center=new Vector3(0,.22*distance/Math.abs(projection[5]),-distance)
    .applyQuaternion(camera.getWorldQuaternion(camera.quaternion.clone()))
    .add(camera.getWorldPosition(new Vector3()))
  center.y-=height/2
  return center
}
