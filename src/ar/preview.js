import * as THREE from 'three'
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
export function startPreview({canvas, status, metrics}) {
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true})
  renderer.setPixelRatio(Math.min(devicePixelRatio,2))
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#dce8de')
  const camera = new THREE.PerspectiveCamera(50,1,.01,30)
  camera.position.set(1.2,1.2,1.8)
  const controls = new OrbitControls(camera,canvas)
  controls.target.set(0,.15,0); controls.update()
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(6,6),new THREE.MeshBasicMaterial({color:'#b6ccb9',side:THREE.DoubleSide}))
  plane.rotation.x = -Math.PI/2
  const cube = new THREE.Mesh(new THREE.BoxGeometry(.2,.2,.2),new THREE.MeshNormalMaterial())
  cube.position.y=.1; cube.visible=false
  const grid = new THREE.GridHelper(6,24,'#759f87','#a2bda6')
  grid.position.y=.001
  scene.add(plane,cube,grid)
  const resize = () => {renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}
  const pointer = new THREE.Vector2(), ray = new THREE.Raycaster()
  let down
  const start = e => {down={x:e.clientX,y:e.clientY}}
  const place = e => {
    if (!down || Math.hypot(e.clientX-down.x,e.clientY-down.y)>8) return
    const rect=canvas.getBoundingClientRect()
    pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1)
    ray.setFromCamera(pointer,camera)
    const hit=ray.intersectObject(plane)[0]
    if(!hit) return
    cube.position.copy(hit.point);cube.position.y+=.1;cube.visible=true
    metrics.placed('SUELO VIRTUAL · simulación')
    status('Cubo en suelo virtual. Esta vista no valida cámara ni tracking.')
  }
  resize();addEventListener('resize',resize)
  canvas.addEventListener('pointerdown',start);canvas.addEventListener('pointerup',place)
  renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);metrics.tick()})
  status('Vista 3D sin cámara. Toca el suelo virtual para colocar el cubo; arrastra para observar.')
  return {
    reset(){cube.visible=false;metrics.placed('sin colocación');status('Toca el suelo virtual para repetir la prueba.')},
    stop(){renderer.setAnimationLoop(null);removeEventListener('resize',resize);canvas.removeEventListener('pointerdown',start);canvas.removeEventListener('pointerup',place);controls.dispose();for(const obj of [plane,cube,grid]){obj.geometry.dispose();obj.material.dispose()}renderer.dispose()},
  }
}
