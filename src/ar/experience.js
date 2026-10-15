import * as THREE from 'three'
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js'
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
import {startWorld} from './runtime.js'
import {birdAnchor} from './bird-anchor.js'
import layout from '../data/scene-layout.json'
import clips from '../data/animation-clips.json'

// These locations only illustrate the five configurable exploration zones.
export function disposeTree(root) {
  if(!root)return
  const geometries=new Set(),materials=new Set(),textures=new Set(),skeletons=new Set()
  root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.skeleton)skeletons.add(o.skeleton);for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[])materials.add(m)})
  for(const m of materials){for(const v of Object.values(m))if(v?.isTexture)textures.add(v);m.dispose()}
  geometries.forEach(g=>g.dispose());textures.forEach(t=>{t.dispose();t.source?.data?.close?.()});skeletons.forEach(s=>s.dispose())
  root.removeFromParent()
}
function label(text,color='#8A1C28',width=640,height=104) {
  const c=document.createElement('canvas');c.width=width;c.height=height;const x=c.getContext('2d')
  x.fillStyle=color;x.beginPath();x.roundRect(5,5,width-10,height-10,32);x.fill();x.strokeStyle='#FFFFFF';x.lineWidth=6;x.stroke()
  x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';x.font=width>160?'500 30px Roboto, Arial':'600 60px Roboto, Arial'
  const words=text.split(' '),lines=[];let line=''
  for(const word of words){const next=`${line} ${word}`.trim();if(x.measureText(next).width>width-60&&line){lines.push(line);line=word}else line=next}lines.push(line)
  const first=height/2-(lines.length-1)*22
  lines.forEach((l,i)=>x.fillText(l,width/2,first+i*44))
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false,depthWrite:false}));sprite.scale.set(.8,.8*height/width,1);sprite.renderOrder=10;return sprite
}
function movingClip(clip){return clip.tracks.some(t=>{const n=t.getValueSize();for(let i=n;i<t.values.length;i++)if(Math.abs(t.values[i]-t.values[i%n])>1e-4)return true;return false})}
export async function createExperience({canvas,mode,signal,birds,status,onPin,onBirdTouch,onChoice,onPlaced,onFrame,onTracking,onError}) {
  let closed=false,world,controls,scene,camera,renderer,mixer,loaded=null,loadController=null,loadId=0,contentKind='campus',placed=mode==='preview',ready=false,currentBird=null
  let trackingReady=false,modelHeight=1.12
  let previewFit=1,last=performance.now(),activeAction=null,selection=[],clipIndex=null
  const root=new THREE.Group(),content=new THREE.Group(),choiceGroup=new THREE.Group(),environment=new THREE.Group(),ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),loader=new GLTFLoader()
  root.add(content,choiceGroup,environment);root.visible=placed
  const lights=new THREE.Group();lights.add(new THREE.HemisphereLight(0xfffaf0,0x807c70,2.6))
  const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(2,4,3);lights.add(key)
  const rim=new THREE.DirectionalLight(0xe1e7ff,1.8);rim.position.set(-2,2,-3);lights.add(rim)
  function frame(dt){if(closed||document.hidden||!renderer)return;if(mode==='ar'&&ready&&trackingReady&&!placed)placeAhead();mixer?.update(dt);controls?.update();onFrame?.({renderer,placed,kind:contentKind,clips:loaded?.animations?.length||0})}
  if(mode==='ar'){
    world=await startWorld({canvas,signal,status,onError,onFrame:frame,onTracking:tracking=>{trackingReady=tracking;if(!tracking&&placed){root.visible=false;placed=false;status('Recuperando el entorno. Mueve despacio el teléfono.');onPlaced?.(false)}onTracking?.(tracking)}})
    ;({scene,camera,renderer}=world)
  }else{
    renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping
    scene=new THREE.Scene();scene.background=new THREE.Color('#eee9df');camera=new THREE.PerspectiveCamera(42,1,.01,100);camera.position.set(2.8,2.3,3.5)
    controls=new OrbitControls(camera,canvas);controls.target.set(0,.4,0);controls.enableDamping=true;controls.minDistance=1.1;controls.maxDistance=8;controls.maxPolarAngle=Math.PI*.49;controls.update()
    const resize=()=>{const rect=canvas.getBoundingClientRect();renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;const nextFit=Math.max(1,.65/camera.aspect);camera.position.sub(controls.target).multiplyScalar(nextFit/previewFit).add(controls.target);previewFit=nextFit;camera.setViewOffset(rect.width,rect.height,rect.width>=1100?-rect.width*.14:0,rect.width<1100?rect.height*.2:0,rect.width,rect.height);camera.updateProjectionMatrix()};resize();addEventListener('resize',resize)
    renderer.setAnimationLoop(()=>{const now=performance.now();frame(Math.min((now-last)/1000,.05));last=now;renderer.render(scene,camera)})
    world={stop(){renderer.setAnimationLoop(null);removeEventListener('resize',resize);controls.dispose();renderer.dispose();renderer.forceContextLoss()}}
  }
  function placeAhead(){
    root.position.copy(birdAnchor(camera,modelHeight));root.scale.setScalar(1)
    root.visible=true;placed=true;onPlaced?.(true)
    status('Ave situada frente a ti. Acércate para observarla o usa Recolocar.')
  }
  scene.add(root,lights)
  let down
  const pointerDown=e=>{down={x:e.clientX,y:e.clientY,t:performance.now()}}
  const pointerUp=e=>{
    if(closed||!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>9||performance.now()-down.t>700)return
    down=null
    const rect=canvas.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width,y=(e.clientY-rect.top)/rect.height
    if(!placed){let hit;try{hit=world.hit?.(x,y)}catch{status('No se pudo localizar un punto. Explora despacio y reintenta.');return}if(!hit){status('Explora despacio una zona iluminada con textura y vuelve a tocar.');return}root.position.copy(hit.position);root.visible=true;placed=true;status(hit.label);onPlaced?.(true);return}
    pointer.set(x*2-1,-y*2+1);ray.setFromCamera(pointer,camera)
    const targets=[...choiceGroup.children,...content.children]
    const hits=ray.intersectObjects(targets,true)
    const actionable=hits.find(h=>{let o=h.object;while(o&&o!==root){if(o.userData.action)return true;o=o.parent}return false})
    if(!actionable)return
    let o=actionable.object;while(o&&!o.userData.action)o=o.parent
    const a=o?.userData.action
    if(a?.type==='pin')onPin?.(a.id)
    if(a?.type==='bird')onBirdTouch?.(a.id)
    if(a?.type==='choice')onChoice?.(a.id)
  }
  canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointerup',pointerUp)
  function clearChoices(){selection=[];for(const obj of [...choiceGroup.children])disposeTree(obj)}
  function unload(){activeAction=null;if(mixer){mixer.stopAllAction();mixer.uncacheRoot(loaded.scene);mixer=null}loaded=null;for(const child of [...content.children,...environment.children])disposeTree(child);clearChoices();ready=false}
  async function load(url,kind,bird=null){
    const id=++loadId;loadController?.abort();loadController=new AbortController();unload();contentKind=kind;currentBird=bird
    status(kind==='campus'?'Cargando el campus…':`Cargando ${bird.name}…`)
    const response=await fetch(url,{signal:loadController.signal});if(!response.ok)throw new Error('No se pudo cargar el modelo. Vuelve a intentarlo.')
    const bytes=await response.arrayBuffer();if(closed||id!==loadId)return false
    const gltf=await loader.parseAsync(bytes,'/assets/models/');if(closed||id!==loadId){disposeTree(gltf.scene);return false}
    loaded=gltf

    
// --- CORRECCIÓN DE ROTACIÓN ---
    if (kind === 'bird' && (bird.id === 'falco-sparverius' || bird.id === 'camptostoma-obsoletum' || bird.id === 'chlorostilbon-melanorhynchus')) {
      
      // rotation.set( Eje X, Eje Y, Eje Z )
      // -Math.PI / 2 (X) lo endereza 90 grados exactos.
      // -Math.PI / 4 (Y) lo gira un poco de perfil para que no te dé la espalda ni te mire de frente.
      gltf.scene.rotation.set(-Math.PI / 2, -Math.PI / 4, 0);
      
    }
    // --- CORRECCIÓN DE ROTACIÓN ---
    if (kind === 'bird' && (bird.id === 'falco-sparverius' || bird.id === 'camptostoma-obsoletum' || bird.id === 'chlorostilbon-melanorhynchus')) {
      
      // rotation.set( Eje X, Eje Y, Eje Z )
      // -Math.PI / 2 (X) lo endereza 90 grados exactos.
      // -Math.PI / 4 (Y) lo gira un poco de perfil para que no te dé la espalda ni te mire de frente.
      gltf.scene.rotation.set(-Math.PI / 2, -Math.PI / 4, 0);
      
    }
    // --- CORRECCIÓN DE ROTACIÓN ---
    if (kind === 'bird' && (bird.id === 'falco-sparverius' || bird.id === 'camptostoma-obsoletum' || bird.id === 'chlorostilbon-melanorhynchus')) {
      
      // rotation.set( Eje X, Eje Y, Eje Z )
      // -Math.PI / 2 (X) lo endereza 90 grados exactos.
      // -Math.PI / 4 (Y) lo gira un poco de perfil para que no te dé la espalda ni te mire de frente.
      gltf.scene.rotation.set(-Math.PI / 2, -Math.PI / 4, 0);
      
    }
    // --- CORRECCIÓN DE ROTACIÓN ---
    if (kind === 'bird' && (bird.id === 'falco-sparverius' || bird.id === 'camptostoma-obsoletum' || bird.id === 'chlorostilbon-melanorhynchus')) {
      
      // rotation.set( Eje X, Eje Y, Eje Z )
      // -Math.PI / 2 (X) lo endereza 90 grados exactos.
      // -Math.PI / 4 (Y) lo gira un poco de perfil para que no te dé la espalda ni te mire de frente.
      gltf.scene.rotation.set(-Math.PI / 2, -Math.PI / 4, 0);
      
    }
    // --- CORRECCIÓN DE ROTACIÓN ---
    if (kind === 'bird' && (bird.id === 'falco-sparverius' || bird.id === 'camptostoma-obsoletum' || bird.id === 'chlorostilbon-melanorhynchus')) {
      
      // rotation.set( Eje X, Eje Y, Eje Z )
      // -Math.PI / 2 (X) lo endereza 90 grados exactos.
      // -Math.PI / 4 (Y) lo gira un poco de perfil para que no te dé la espalda ni te mire de frente.
      gltf.scene.rotation.set(-Math.PI / 2, -Math.PI / 4, 0);
      
    }
   //--CORRECION ROTACION
if (kind === 'bird' && (bird.id === 'falco-sparverius' || bird.id === 'camptostoma-obsoletum' || bird.id === 'chlorostilbon-melanorhynchus')) {
      
      // rotation.set( Eje X, Eje Y, Eje Z )
      // -Math.PI / 2 (X) lo endereza 90 grados exactos.
      // -Math.PI / 4 (Y) lo gira un poco de perfil para que no te dé la espalda ni te mire de frente.
      gltf.scene.rotation.set(-Math.PI / 2, -Math.PI / 2, 0);
      
    }

    gltf.scene.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(gltf.scene,true),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3())
    const wrapper=new THREE.Group(),offset=new THREE.Group(),span=Math.max(size.x,size.y,size.z)||1,scale=(kind==='campus'?2.25:1.12)/span
    offset.position.set(-center.x,-box.min.y,-center.z);offset.add(gltf.scene);wrapper.add(offset);wrapper.scale.setScalar(scale);content.add(wrapper)
    if(kind==='bird'){
      wrapper.userData.action={type:'bird',id:bird.id};mixer=new THREE.AnimationMixer(gltf.scene)
      const selected=clips[bird.id]
      clipIndex=selected?.index??-1
      if(clipIndex>=0&&(!gltf.animations[clipIndex]||gltf.animations[clipIndex].name!==selected.name||!movingClip(gltf.animations[clipIndex])))clipIndex=-1
    }else{
      for(let i=0;i<birds.length;i++){const p=layout.pins.find(p=>p.birdId===birds[i].id)?.position;if(!p)continue;const pin=label(`${i+1}`,'#8A1C28',160,160);pin.scale.set(.2,.2,1);pin.position.set(...p);pin.userData.action={type:'pin',id:birds[i].id};content.add(pin)}
    }
    modelHeight=size.y*scale
    ready=true
    if(mode==='preview'){
      controls.target.set(0,kind==='campus'?.25:.45,0);camera.position.set(kind==='campus'?2.4:1.7,kind==='campus'?2.8:1.2,kind==='campus'?3.1:2.3);previewFit=Math.max(1,.65/camera.aspect);camera.position.sub(controls.target).multiplyScalar(previewFit).add(controls.target);controls.update();controls.saveState()
    }
    status(placed?(kind==='campus'?'Toca un pin para conocer un ave. Zonas sugeridas.':'Toca el ave para escucharla y explorar.'):'Mueve despacio el teléfono: el ave aparecerá al reconocer el entorno.');return true
  }
  function showChoices(options,{kind='cards'}={}){
    clearChoices();selection=options
    // Freeze the layout in the scene at selection time, aligned with the viewer.
    // Stacked choices remain distinct in portrait and share a depth plane.
    const right=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion)
    const up=new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion)
    const front=new THREE.Vector3(0,0,1).applyQuaternion(camera.quaternion)
    const inverse=root.getWorldQuaternion(new THREE.Quaternion()).invert()
    right.applyQuaternion(inverse);up.applyQuaternion(inverse);front.applyQuaternion(inverse)
    options.forEach((option,i)=>{
      const group=new THREE.Group()
      group.position.copy(front).multiplyScalar(.3).addScaledVector(up,.08-i*.2)
      const tag=label(option.label);tag.scale.set(1.05,.17,1);tag.userData.action={type:'choice',id:option.id};group.add(tag);group.userData.action=tag.userData.action
      choiceGroup.add(group)
    })
  }
  const api={
    showCampus:()=>load(layout.campus.model,'campus'),showBird:bird=>load(bird.model,'bird',bird),showChoices,clearChoices,
    illustrate(kind){
      for(const child of [...environment.children])disposeTree(child)
      const mesh=(geometry,color,x,y,z)=>{const obj=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color,roughness:1}));obj.position.set(x,y,z);environment.add(obj);return obj}
      if(kind==='perch'){
        mesh(new THREE.CylinderGeometry(.045,.06,.32,10),'#765438',0,.16,0)
        const branch=mesh(new THREE.CylinderGeometry(.035,.035,.65,10),'#765438',0,.32,0);branch.rotation.z=Math.PI/2
        content.children[0].position.y=.34
      }
      if(kind==='habitat'||kind==='flower'){
        mesh(new THREE.CylinderGeometry(.62,.62,.025,40),'#b8c39a',0,-.025,0)
        for(let i=0;i<5;i++){
          const angle=i/5*Math.PI*2,x=Math.cos(angle)*.52,z=Math.sin(angle)*.52
          if(kind==='habitat')mesh(new THREE.SphereGeometry(.13,12,8),'#779063',x,.07,z)
          else{mesh(new THREE.CylinderGeometry(.012,.012,.18,7),'#779063',x,.08,z);for(let j=0;j<5;j++){const a=j/5*Math.PI*2;mesh(new THREE.SphereGeometry(.04,8,6),'#d9b04e',x+Math.cos(a)*.045,.19,z+Math.sin(a)*.045)}}
        }
      }
    },
    focusTrait(id){if(mode!=='preview')return;const distance=camera.position.distanceTo(controls.target);const direction=id==='head'?new THREE.Vector3(-1,.45,-1):new THREE.Vector3(1,.35,1);camera.position.copy(controls.target).add(direction.normalize().multiplyScalar(distance));controls.update()},
    playClip(index=clipIndex){if(!ready||!currentBird?.animated||index<0||!loaded.animations[index])return false;activeAction?.stop();activeAction=mixer.clipAction(loaded.animations[index]);activeAction.reset().setLoop(THREE.LoopOnce,1);activeAction.clampWhenFinished=false;activeAction.play();return true},
    stopAnimation(){mixer?.stopAllAction();activeAction=null},
    setClip(index){clipIndex=index},
    clipInfo(){return (loaded?.animations||[]).map((c,i)=>({index:i,name:c.name,duration:c.duration,moving:movingClip(c)}))},
    modelInfo(){return {kind:contentKind,ready,placed,clipIndex,selectedOptions:selection.map(o=>o.id),triangles:renderer.info.render.triangles,drawCalls:renderer.info.render.calls,textures:renderer.info.memory.textures}},
    markChoice(id,correct){choiceGroup.children.forEach(g=>{if(g.userData.action?.id===id)g.scale.setScalar(correct?1.1:.9)})},
    reset(){if(mode==='preview'){root.position.set(0,0,0);root.scale.setScalar(1);controls.reset();status('Vista 3D centrada.')}else{placed=false;root.visible=false;onPlaced?.(false);if(ready&&trackingReady)placeAhead();else status('Mueve despacio el teléfono para recuperar el entorno.')}},
    scale(factor){const next=THREE.MathUtils.clamp(root.scale.x*factor,.35,2.5);root.scale.setScalar(next)},
    stop(){if(closed)return;closed=true;loadId++;loadController?.abort();canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointerup',pointerUp);unload();root.removeFromParent();lights.removeFromParent();world.stop()}
  }
  signal.addEventListener('abort',()=>api.stop(),{once:true})
  return api
}