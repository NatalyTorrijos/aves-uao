import test from 'node:test'
import assert from 'node:assert/strict'
import {PerspectiveCamera,Vector3} from 'three'
import {birdAnchor} from '../src/ar/bird-anchor.js'

test('el ave cabe frente a la cámara en retrato y paisaje, incluso al girar el móvil',()=>{
  for(const aspect of [393/852,852/393])for(const yaw of [0,1.3]){
    const camera=new PerspectiveCamera(55,aspect,.01,100)
    camera.position.set(2,1.5,-3);camera.rotation.set(-.15,yaw,0);camera.updateMatrixWorld(true)
    const anchor=birdAnchor(camera,1.12)
    const center=anchor.clone().add(new Vector3(0,.56,0)).project(camera)
    assert.ok(Math.abs(center.x)<.001)
    assert.ok(Math.abs(center.y-.22)<.001)
    assert.ok(center.z>-1&&center.z<1)
    const distance=anchor.distanceTo(camera.position)
    assert.ok(distance>1&&distance<5)
  }
})

test('el punto queda en el mundo y recolocar calcula otro según la nueva posición',()=>{
  const camera=new PerspectiveCamera(55,.5,.01,100);camera.updateMatrixWorld(true)
  const first=birdAnchor(camera),saved=first.clone()
  camera.position.x=2;camera.updateMatrixWorld(true)
  assert.deepEqual(first,saved)
  assert.ok(Math.abs(birdAnchor(camera).x-first.x-2)<1e-6)
})
