import * as THREE from 'three'
import {chooseHit,hitLabels} from './placement.js'
import {keepCanvasInHost} from './canvas-host.js'
const loads = new Map()
function loadScript(src,name,attributes={}) {
  if(window[name])return Promise.resolve(window[name])
  if(loads.has(src))return loads.get(src)
  const promise=new Promise((resolve,reject)=>{
    const s=document.createElement('script');s.src=src
    for(const [k,v] of Object.entries(attributes))s.setAttribute(k,v)
    const done=()=>{if(!window[name])return;clearTimeout(timer);window.removeEventListener('xrloaded',done);resolve(window[name])}
    const fail=()=>{clearTimeout(timer);window.removeEventListener('xrloaded',done);loads.delete(src);s.remove();reject(new Error('No se pudo cargar el motor RA. Comprueba la conexión y vuelve a intentarlo.'))}
    const timer=setTimeout(fail,45000)
    if(name==='XR8')window.addEventListener('xrloaded',done)
    s.onload=()=>{if(window[name])done();else if(name!=='XR8')fail()};s.onerror=fail
    document.head.append(s)
  });loads.set(src,promise);return promise
}
export async function startWorld({canvas,signal,status,onFrame,onTracking,onError}) {
  if(!isSecureContext)throw new Error('La cámara necesita una dirección HTTPS. Puedes usar la vista 3D en este equipo.')
  if(!navigator.mediaDevices?.getUserMedia)throw new Error('Abre el enlace en Safari de iPhone o Chrome de Android para usar la cámara.')
  window.THREE=THREE
  status('Preparando la cámara…')
  const XR8=await loadScript('/vendor/xr/xr.js','XR8',{'data-preload-chunks':'slam'})
  signal.throwIfAborted()
  if(!XR8.XrDevice.isDeviceBrowserCompatible({allowedDevices:XR8.XrConfig.device().MOBILE}))throw new Error('La realidad aumentada necesita un móvil compatible. En este equipo puedes explorar la vista 3D.')
  const XRExtras=await loadScript('/vendor/xrextras/xrextras.js','XRExtras')
  await XR8.loadChunk('slam');signal.throwIfAborted()
  let world,closed=false,tracked=false,running=false,startResolve,startReject,last=performance.now()
  const started=new Promise((resolve,reject)=>{startResolve=resolve;startReject=reject})
  const stop=()=>{if(closed)return;closed=true;signal.removeEventListener('abort',abort);document.removeEventListener('visibilitychange',visibility);try{XR8.stop();XR8.clearCameraPipelineModules()}finally{world?.renderer?.dispose?.();canvas.remove?.()}}
  const abort=()=>{stop();startReject(new DOMException('Cancelado','AbortError'))}
  const fail=e=>{if(closed)return;startReject(e);status(e.message);if(running){stop();onError?.(e)}}
  const visibility=()=>{if(closed)return;if(document.hidden){tracked=false;XR8.pause();onTracking?.(false)}else{XR8.resume();last=performance.now();status('Recuperando el entorno…')}}
  const module={name:'uao-experience',onStart(){if(closed)return;world=XR8.Threejs.xrScene();world.camera.position.set(0,1.5,0);XR8.XrController.updateCameraProjectionMatrix({origin:world.camera.position,facing:world.camera.quaternion});status('Cámara iniciada. Detectando el entorno…');startResolve()},onUpdate({processCpuResult}){if(closed)return;const next=Boolean(processCpuResult?.reality?.position);if(next!==tracked){tracked=next;onTracking?.(tracked)}const now=performance.now();onFrame?.(Math.min((now-last)/1000,.05));last=now},onCameraStatusChange({status:cameraStatus}){const messages={requesting:'Esperando permiso de cámara…',hasStream:'Permiso concedido. Esperando imagen de la cámara…',hasVideo:'Imagen de cámara recibida. Preparando realidad aumentada…'};if(messages[cameraStatus])status(messages[cameraStatus]);if(cameraStatus==='failed')fail(new Error('No se pudo abrir la cámara. Revisa el permiso en tu navegador.'))},onException(error){fail(new Error(error?.message||'La cámara se interrumpió. Sal y vuelve a intentarlo.'))}}
  // XR8 owns the shared canvas dimensions. Changing the three.js pixel ratio
  // makes its resize callback enlarge the canvas again, outside XR8's viewport.
  XR8.XrController.configure({disableWorldTracking:false,scale:'responsive'})
  XR8.addCameraPipelineModules([XR8.GlTextureRenderer.pipelineModule(),XR8.Threejs.pipelineModule(),XR8.XrController.pipelineModule(),keepCanvasInHost(XRExtras.FullWindowCanvas.pipelineModule(),canvas),module])
  signal.addEventListener('abort',abort,{once:true});document.addEventListener('visibilitychange',visibility)
  let timer
  try{await Promise.race([Promise.all([started,Promise.resolve().then(()=>XR8.run({canvas,allowedDevices:XR8.XrConfig.device().MOBILE}))]),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('La cámara tardó demasiado. Revisa permisos y reintenta.')),40000)})]);signal.throwIfAborted();running=true}catch(e){stop();throw e}finally{clearTimeout(timer)}
  return {...world,stop,hit(x,y){if(!tracked)return null;const hits=XR8.XrController.hitTest(x,y)||[];let hit=chooseHit(hits);if(!hit)hit=chooseHit(XR8.XrController.hitTest(x,y,['FEATURE_POINT'])||[]);return hit?{...hit,label:hitLabels[hit.type]}:null}}
}
