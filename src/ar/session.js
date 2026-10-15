import * as THREE from 'three'
import {chooseHit,hitLabels} from './placement.js'
import {keepCanvasInHost} from './canvas-host.js'

const loads = new Map()
function loadScript(src, globalName, attributes = {}) {
  if (window[globalName]) return Promise.resolve(window[globalName])
  if (loads.has(src)) return loads.get(src)
  const promise = new Promise((resolve,reject)=>{
    const script=document.createElement('script')
    script.src=src;Object.entries(attributes).forEach(([k,v])=>script.setAttribute(k,v))
    const finish=()=>{if(!window[globalName])return;clearTimeout(timer);window.removeEventListener('xrloaded',finish);resolve(window[globalName])}
    const fail=message=>{clearTimeout(timer);window.removeEventListener('xrloaded',finish);loads.delete(src);script.remove();reject(new Error(message))}
    const timer=setTimeout(()=>fail(`Tiempo agotado al cargar ${globalName}. Recarga para reintentar.`),45000)
    // xr.js initializes asynchronously: its official readiness signal is xrloaded.
    if(globalName==='XR8')window.addEventListener('xrloaded',finish)
    script.onload=()=>{if(window[globalName])finish();else if(globalName!=='XR8')fail(`No se inicializó ${globalName}. Recarga para reintentar.`)}
    script.onerror=()=>fail(`No se pudo cargar ${globalName}. Comprueba el runtime local.`)
    document.head.append(script)
  })
  loads.set(src,promise)
  return promise
}

export async function startAR({canvas,status,metrics,surfaceOnly,onError}) {
  if(!isSecureContext) throw new Error('Abre esta prueba mediante HTTPS para acceder a la cámara.')
  if(!navigator.mediaDevices?.getUserMedia) throw new Error('Este navegador no permite acceso a cámara. Prueba Safari en iPhone o Chrome en Android.')
  window.THREE=THREE
  status('Cargando el motor de 8th Wall…')
  const XR8=await loadScript('/vendor/xr/xr.js','XR8',{'data-preload-chunks':'slam'})
  if(!XR8.XrDevice.isDeviceBrowserCompatible({allowedDevices:XR8.XrConfig.device().MOBILE})) {
    throw new Error('La prueba RA requiere un móvil compatible. Abre la URL HTTPS en Safari de iPhone o Chrome de Android. En este equipo puedes usar la vista 3D sin cámara.')
  }
  const XRExtras=await loadScript('/vendor/xrextras/xrextras.js','XRExtras')
  const LandingPage=await loadScript('/vendor/landing-page/landing-page.js','LandingPage')
  await XR8.loadChunk('slam')
  let cube,scene,ready=false,closed=false
  const geom=new THREE.BoxGeometry(.2,.2,.2), mat=new THREE.MeshNormalMaterial()
  const place=e=>{
    if(!ready || closed) return
    const rect=canvas.getBoundingClientRect()
    const x=(e.clientX-rect.left)/rect.width,y=(e.clientY-rect.top)/rect.height
    let results=[]
    try {
      results=XR8.XrController.hitTest(x,y) || []
      if(!chooseHit(results,surfaceOnly())) results=[...results,...(XR8.XrController.hitTest(x,y,['FEATURE_POINT']) || [])]
    } catch(error) {status(`No se pudo consultar el entorno: ${error.message}`);return}
    const hit=chooseHit(results,surfaceOnly())
    if(!hit){status(surfaceOnly()?'Sin superficie disponible. Explora otra zona o desactiva «Solo superficies» para probar puntos.':'Sin punto válido. Mueve lentamente el teléfono y toca una zona con textura.');return}
    cube.position.set(hit.position.x,hit.position.y+.1,hit.position.z)
    cube.visible=true
    metrics.placed(hit.type)
    status(`Cubo colocado. ${hitLabels[hit.type]}. Cambia de punto de vista para comprobar estabilidad.`)
  }
  const noScroll=e=>e.preventDefault()
  const visibility=()=>{if(closed)return;if(document.hidden){XR8.pause();ready=false}else{XR8.resume();status('Recuperando tracking…')}}
  const cleanup=()=>{canvas.removeEventListener('pointerup',place);canvas.removeEventListener('touchmove',noScroll);document.removeEventListener('visibilitychange',visibility);scene?.remove(cube);geom.dispose();mat.dispose()}
  const custom={
    name:'uao-placement',
    onStart:()=>{
      if(closed)return
      const xrScene=XR8.Threejs.xrScene();scene=xrScene.scene
      cube=new THREE.Mesh(geom,mat);cube.visible=false;scene.add(cube)
      xrScene.camera.position.set(0,1.5,0)
      XR8.XrController.updateCameraProjectionMatrix({origin:xrScene.camera.position,facing:xrScene.camera.quaternion})
      canvas.addEventListener('pointerup',place);canvas.addEventListener('touchmove',noScroll,{passive:false});document.addEventListener('visibilitychange',visibility)
      status('Cámara iniciada. Explora despacio y toca un punto del entorno.')
    },
    onUpdate:({processCpuResult})=>{if(closed)return;const wasReady=ready;ready=Boolean(processCpuResult?.reality?.position);if(wasReady&&!ready)status('Tracking no disponible. Explora despacio antes de volver a colocar.');metrics.tick()},
    onCameraStatusChange:({status:cameraStatus})=>{if(cameraStatus==='failed')onError(new Error('No se pudo abrir la cámara. Revisa permisos y disponibilidad del dispositivo.'))},
    onException:error=>{if(!closed)onError(new Error(error?.message || 'El motor RA informó un error.'))},
  }
  XR8.XrController.configure({disableWorldTracking:false,scale:'responsive'})
  XR8.addCameraPipelineModules([
    XR8.GlTextureRenderer.pipelineModule(),XR8.Threejs.pipelineModule(),XR8.XrController.pipelineModule(),
    LandingPage.pipelineModule(),keepCanvasInHost(XRExtras.FullWindowCanvas.pipelineModule(),canvas),XRExtras.RuntimeError.pipelineModule(),custom,
  ])
  try {await XR8.run({canvas})} catch(error){closed=true;XR8.stop();XR8.clearCameraPipelineModules();cleanup();throw error}
  return {
    reset(){if(cube)cube.visible=false;metrics.placed('sin colocación');status('Toca otra zona del entorno para colocar el cubo.')},
    stop(){if(closed)return;closed=true;XR8.stop();XR8.clearCameraPipelineModules();cleanup()},
  }
}
