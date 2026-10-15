import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import {startWorld} from '../src/ar/runtime.js'

function fixture(t,{runError=null}={}) {
  let modules=[],stops=0,resizes=0
  const world={scene:new THREE.Scene(),camera:new THREE.PerspectiveCamera(),renderer:{setPixelRatio(){resizes++}}}
  const pipeline=()=>({pipelineModule:()=>({name:'test'})})
  const XR8={
    XrDevice:{isDeviceBrowserCompatible:()=>true},XrConfig:{device:()=>({MOBILE:'mobile'})},
    XrController:{...pipeline(),configure(){},updateCameraProjectionMatrix(){},hitTest:()=>[]},
    GlTextureRenderer:pipeline(),Threejs:{...pipeline(),xrScene:()=>world},loadChunk:async()=>{},
    addCameraPipelineModules(value){modules=value},clearCameraPipelineModules(){},stop(){stops++},pause(){},resume(){},
    async run(){if(runError)throw runError;modules.at(-1).onCameraStatusChange({status:'hasVideo'});modules.at(-1).onStart()},
  }
  const globals={window:{XR8,XRExtras:{FullWindowCanvas:pipeline()}},document:Object.assign(new EventTarget(),{hidden:false}),navigator:{mediaDevices:{getUserMedia(){}}},isSecureContext:true,devicePixelRatio:3}
  for(const [key,value] of Object.entries(globals)){const old=Object.getOwnPropertyDescriptor(globalThis,key);Object.defineProperty(globalThis,key,{configurable:true,value});t.after(()=>{if(old)Object.defineProperty(globalThis,key,old);else delete globalThis[key]})}
  return {world,module:()=>modules.at(-1),resizes:()=>resizes,stops:()=>stops}
}
test('RA conserva el tamaño del canvas administrado por XR8 incluso con DPR 3',async t=>{
  const f=fixture(t),messages=[],controller=new AbortController()
  let removed=0
  const session=await startWorld({canvas:{remove(){removed++}},signal:controller.signal,status:s=>messages.push(s)})
  assert.equal(session.renderer,f.world.renderer);assert.equal(f.resizes(),0)
  assert.equal(session.scene.background,null);assert.ok(messages.some(s=>s.includes('Imagen de cámara recibida')))
  session.stop();session.stop();assert.equal(f.stops(),1);assert.equal(removed,1)
})
test('un error al abrir cámara limpia el motor y llega al llamador',async t=>{
  const f=fixture(t,{runError:new Error('cámara ocupada')})
  await assert.rejects(startWorld({canvas:{},signal:new AbortController().signal,status(){}}),/cámara ocupada/)
  assert.equal(f.stops(),1)
})
test('fallo posterior al inicio notifica y libera la sesión una sola vez',async t=>{
  const f=fixture(t),errors=[]
  const session=await startWorld({canvas:{},signal:new AbortController().signal,status(){},onError:e=>errors.push(e)})
  f.module().onCameraStatusChange({status:'failed'})
  assert.equal(errors.length,1);assert.equal(f.stops(),1);session.stop();assert.equal(f.stops(),1)
})
