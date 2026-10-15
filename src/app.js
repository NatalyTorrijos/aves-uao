import './ui/style.css'
import birds from './data/birds.json'
import questions from './data/quiz.json'
import {createProgress} from './state/progress.js'
import {createQuiz} from './state/quiz.js'
import {createAudio} from './audio.js'

const $=id=>document.getElementById(id)
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const icon=name=>`<span class="symbol" aria-hidden="true">${name}</span>`
const birdById=id=>birds.find(b=>b.id===id)
const qa=new URLSearchParams(location.search).get('qa')==='1'
const qaStorage=qa?{getItem:key=>localStorage.getItem('qa-'+key),setItem:(key,value)=>localStorage.setItem('qa-'+key,value)}:undefined
const progress=createProgress(qaStorage,birds.map(b=>b.id))
let session=null,controller=null,launchId=0,sceneView='campus',sceneMode='preview',currentBird=null,quiz=null,activity=null,collectionFilter='all',lastResult=null,toastTimer,lastTick=0,frames=0,sessionStart=0,sceneLoad=0,retryScene=null

const audio=createAudio(({playing,error})=>{
  $('scene-audio').setAttribute('aria-pressed',String(playing));$('scene-audio').setAttribute('aria-label',playing?'Pausar canto':'Escuchar canto')
  document.querySelectorAll('[data-audio]').forEach(b=>{b.setAttribute('aria-pressed',String(playing));b.setAttribute('aria-label',playing?'Pausar canto':'Escuchar canto');b.innerHTML=playing?'Ⅱ':'▶'})
  if(error)toast(error)
})

function toast(text){$('toast').textContent=text;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4500)}
function dialog(html){$('dialog-content').innerHTML=html;if(!$('dialog').open)$('dialog').showModal()}
function closeDialog(){$('dialog').close()}
$('dialog').addEventListener('click',e=>{if(e.target===$('dialog')||e.target.closest('[data-close]'))closeDialog()})
function navigate(hash){closeDialog();if(location.hash===hash)render();else location.hash=hash}
function count(){return progress.get().discovered.length}

function progressStrip(){return `<div class="progress-strip"><div class="progress-label"><strong>Tu cuaderno de descubrimientos</strong><small>${count()} de 5 aves exploradas</small></div><div class="progress-track" role="progressbar" aria-label="Aves descubiertas" aria-valuenow="${count()}" aria-valuemin="0" aria-valuemax="5"><span style="width:${count()*20}%"></span></div><a class="text-button" href="#mis-aves">Ver colección ↗</a></div>`}

function birdCard(b){const found=progress.isDiscovered(b.id);return `<a href="#ave/${esc(b.id)}" class="bird-card"><span class="photo"><img src="${esc(b.image)}" alt="Fotografía de ${esc(b.name)}" loading="lazy"><span class="pill">${found?'✓ Descubierta':'Por descubrir'}</span></span><div class="card-content"><h3>${esc(b.name)}</h3><div class="scientific">${esc(b.scientificName)}</div><div class="card-bottom"><span>Conoce su historia</span><span class="round-arrow" aria-hidden="true">↗</span></div></div></a>`}

function home(){return `<section class="hero"><div class="hero-copy"><span class="eyebrow">BIODIVERSIDAD · CAMPUS UAO</span><h1>La vida del campus,<br><em>más cerca de ti.</em></h1><p class="lead">Descubre cinco aves, explora sus hábitats y aprende a observarlas desde una nueva perspectiva.</p><div class="actions"><button class="button primary" data-action="explore">${icon('map')} Explorar el campus 3D</button></div></div><div class="hero-art"><img src="/assets/images/hero.jpg" alt="Modelo 3D de la Reinita Tropical" fetchpriority="high"></span><div class="art-note"><span class="number">01</span><div><strong>Reinita Tropical</strong><span>Una de tus próximas historias</span></div></div></div></section>${progressStrip()}<section><div class="section-heading"><div><span class="section-kicker">TU PRÓXIMA OBSERVACIÓN</span><h2>Cinco aves. Cinco historias.</h2><p>Conoce a quienes comparten nuestro campus.</p></div><a class="text-button" href="#mis-aves">Ver todas ↗</a></div><div class="bird-grid home-birds">${birds.map(birdCard).join('')}</div></section><section class="feature-row"><div class="campus-card"><div><span class="eyebrow">UN LUGAR PARA EXPLORAR</span><h3>Empieza por<br>el campus.</h3><p>Una maqueta, cinco pines y un mundo por observar.</p><button class="text-button" data-action="explore">Abrir recorrido ↗</button></div><img src="/assets/images/campus-hero.png" alt="Maqueta 3D del campus UAO" loading="lazy"></div><div class="quiz-card">${icon('quiz')}<h3>¿Cuánto has descubierto?</h3><p>Pon a prueba tu mirada y tu oído con cinco desafíos.</p><a class="button" href="#quiz">Conocer el quiz ↗</a></div></section>`}

function collection(){const shown=birds.filter(b=>collectionFilter==='all'||(collectionFilter==='found')===progress.isDiscovered(b.id));return `<div class="page-title"><span class="eyebrow">TU CUADERNO DE CAMPO</span><h1>Mis Aves</h1><p>Cada encuentro deja una pista. Escucha el canto de un ave para incorporarla a tu colección.</p></div><div class="collection-summary"><div><h3>${count()===5?'Tu colección está completa':count()===0?'Tu primera historia te espera':`${count()} historias descubiertas`}</h3><p>El progreso se guarda en este navegador.</p></div><button class="text-button" data-action="reset-progress">Reiniciar progreso</button></div><div class="filter-row" role="group" aria-label="Filtrar colección">${[['all','Todas · 5'],['found',`Descubiertas · ${count()}`],['pending',`Por descubrir · ${5-count()}`]].map(([id,label])=>`<button class="filter-button ${collectionFilter===id?'active':''}" data-filter="${id}" aria-pressed="${collectionFilter===id}">${label}</button>`).join('')}</div><div class="bird-grid">${shown.length?shown.map(birdCard).join(''):`<div class="empty">${icon('explore')}<h3>${collectionFilter==='found'?'Aquí aparecerán tus descubrimientos':'Ya conociste a todas las aves'}</h3><p>Explora el campus y escucha los cantos para descubrir cada historia.</p><button class="button primary" data-action="explore">Explorar el campus</button></div>`}</div>`}

function audioControl(b){return `<div class="audio-control"><button class="uao-icon-button" data-audio="${esc(b.id)}" aria-label="Escuchar canto" aria-pressed="false">▶</button><div><strong>Escucha su canto</strong><small>Grabación de referencia</small></div><div class="audio-bars" aria-hidden="true">${'<i></i>'.repeat(14)}</div></div>`}

function detail(b) {
  if (!b) {
    return `<div class="empty">
      <h1>Ave no encontrada</h1>
      <a class="button primary" href="#mis-aves">Volver a Mis Aves</a>
    </div>`;
  }

  const videoSection = b.videoUrl ? `
    <div class="video-container">
      <iframe src="${esc(b.videoUrl)}" title="Video de referencia de ${esc(b.name)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </div>
    <div class="video-credits" style="margin-top: 12px; font-size: 0.85em; color: #666; line-height: 1.4;">
      <strong>Autor:</strong> ${esc(b.videoCredit?.author || 'Desconocido')} ${b.videoCredit?.year ? `(${esc(b.videoCredit.year)})` : ''}<br>
      <strong>Fuente:</strong> ${esc(b.videoCredit?.source || 'No especificada')}
    </div>
  ` : '<p>El enlace de referencia está pendiente.</p>';

  const gallerySection = b.gallery && b.gallery.length > 0 ? `
    <aside class="reference-card" style="margin-top: 20px;">
      <span class="eyebrow">GALERÍA DE FOTOGRAFÍAS</span>
      <h2>Imágenes de referencia</h2>
      ${b.gallery.map(img => `
        <div style="margin-bottom: 15px;">
          <img src="${esc(img.url)}" alt="${esc(img.description)}" style="width: 100%; border-radius: 8px;">
          <p class="subtle" style="margin-top: 5px; font-size: 0.85em; line-height: 1.4;">
            <strong>${esc(img.description)}</strong><br>
            Autor: ${esc(img.author)}<br>
            Fuente: ${esc(img.source)}
          </p>
        </div>
      `).join('')}
    </aside>
  ` : '';

  return `
    <a class="back-link" href="#mis-aves">← Mis Aves</a>
    <section class="detail-hero">
      <img src="${esc(b.image)}" alt="Fotografía de referencia de ${esc(b.name)}">
      <div>
        <span class="pill">${progress.isDiscovered(b.id) ? '✓ En tu colección' : 'Una historia por descubrir'}</span>
        <h1>${esc(b.name)}</h1>
        
        <div class="taxonomy-info" style="margin: 15px 0;">
          <p style="margin: 4px 0;"><strong>Nombre científico:</strong> ${esc(b.scientificName)}</p>
          <p style="margin: 4px 0;"><strong>Nombre en inglés:</strong> ${esc(b.englishName)}</p>
          <p style="margin: 4px 0;"><strong>Familia a la que pertenece:</strong> ${esc(b.family)}</p>
        </div>
        
        <p class="description">${esc(b.description)}</p>
        <button class="button primary" data-observe="${esc(b.id)}">${icon('view_in_ar')} Observar esta ave</button>
        ${audioControl(b)}
        <div style="font-size: 0.85em; color: #666; margin-top: 10px;">
          <strong>Audio aportado por:</strong> ${esc(b.audioCredit?.author || 'Autor desconocido')}<br>
          <strong>Fuente:</strong> ${esc(b.audioCredit?.source || 'No especificada')}
        </div>
      </div>
    </section>
    
    <div class="detail-grid">
      <div>
        <section class="info-block">
          <h2>Una pista para reconocerla</h2>
          <p>${esc(b.trait)}</p>
        </section>
        
        <section class="info-block">
          <h2>Su lugar en el entorno</h2>
          <p>${esc(b.habitat)}</p>
          ${b.behaviorInfo ? `<h3 style="margin-top: 15px; font-size: 1.1em; color: #8A1C28;">Comportamiento</h3><p>${esc(b.behaviorInfo)}</p>` : ''}
          ${b.curiousFact ? `<h3 style="margin-top: 15px; font-size: 1.1em; color: #8A1C28;">Dato curioso</h3><p>${esc(b.curiousFact)}</p>` : ''}
        </section>
        
        ${b.diet ? `<section class="info-block"><h2>Alimentación</h2><p>${esc(b.diet)}</p></section>` : ''}
        
        <p class="source-line" style="margin-top: 30px;">
          Fuente principal: Guía de Aves UAO, edición 2023 · página PDF ${b.guidePage}.<br>
          Las zonas de la maqueta son orientativas. No representan avistamientos confirmados.<br>
          <a href="#creditos">Consultar fuentes y créditos ↗</a>
        </p>
      </div>
      
      <div>
        <aside class="reference-card">
          <div class="video-mark" aria-hidden="true">▶</div>
          <span class="eyebrow">OBSERVA EN SU ENTORNO</span>
          <h2>Video de referencia</h2>
          <p>Amplía tu observación con el video seleccionado en la propuesta del equipo.</p>
          ${videoSection}
        </aside>
        
        ${gallerySection}
      </div>
    </div>
  `;
}

function sustainable(){return `<div class="page-title"><span class="eyebrow">UAO SOSTENIBLE</span><h1>Aprender a mirar.<br>Empezar a cuidar.</h1><p>La biodiversidad también habita los lugares que recorremos todos los días. Esta experiencia nos invita a reconocerla.</p></div><div class="two-column"><img class="purpose-image" src="/assets/images/mosquerito-silbon.jpg" alt="Mosquerito Silbón entre vegetación"><div><h2>Un campus compartido</h2><p class="muted">Creamos este proyecto para acercar la guía de aves de la UAO a una experiencia de observación, escucha y aprendizaje interactivo.</p><ol class="numbered-list"><li><strong>Reconocer</strong>Relaciona los rasgos y cantos con cinco especies presentes en la guía.</li><li><strong>Comprender</strong>Explora la relación entre las aves y sus hábitats.</li><li><strong>Cuidar</strong>Observa con distancia, respeta la vegetación y evita perturbar a la fauna.</li></ol></div></div><section class="info-block" style="margin-top:42px"><span class="eyebrow">EL EQUIPO</span><h2>Hecho para aprender juntos</h2><p>Proyecto académico de Ingeniería Multimedia · Universidad Autónoma de Occidente, Cali.</p><div class="team">${['Juan David Romero Rada','Andres David Martinez Parra','Nataly Torrijos Perez','Jose Manuel Diaz Congolino'].map(n=>`<span>${n}</span>`).join('')}</div></section><a class="text-button" href="#creditos">Ver fuentes y créditos ↗</a>`}

function quizIntro(){const result=progress.get().lastQuiz;return `<section class="quiz-intro"><div class="page-title"><span class="eyebrow">PON A PRUEBA TU MIRADA</span><h1>¿Qué aprendiste<br>en el recorrido?</h1><p>Cinco desafíos para conectar cantos, rasgos y hábitats. Selecciona las respuestas en tu espacio y aprende con cada intento.</p><ol class="numbered-list"><li><strong>Observa y escucha</strong>Explora primero las fichas y las actividades de las aves.</li><li><strong>Elige en tu entorno</strong>Toca las opciones de la escena. También tendrás controles de apoyo.</li><li><strong>Aprende a tu ritmo</strong>20 puntos por acierto al primer intento. Puedes corregir sin sumar puntos extra.</li></ol><div class="actions" style="margin-top:25px"><button class="button primary" data-action="start-quiz">${icon('view_in_ar')} Comenzar quiz</button></div>${result?`<p class="subtle">Último resultado: ${result.score}/${result.total} ·${result.mode==='ar'?'Realidad aumentada':result.mode==='preview'?'Práctica 3D':'Modalidad no registrada'}</p>`:''}</div><div class="quiz-orbit"><strong>05</strong><span>desafíos · un campus por conocer</span></div></section>`}

function resultPage(){const r=lastResult||progress.get().lastQuiz;if(!r)return quizIntro();return `<section class="result"><span class="eyebrow">RECORRIDO DE APRENDIZAJE COMPLETADO</span><h1>Tu mirada<br>ya sabe más.</h1><div class="quiz-orbit"><strong>${r.score}</strong><span>de ${r.total} puntos</span></div><p>${r.score===100?'Reconociste todas las pistas al primer intento.':'Cada respuesta es una oportunidad para volver a observar.'}</p><p class="muted">${r.mode==='ar'?'Quiz en realidad aumentada':r.mode==='preview'?'Práctica en vista 3D · sin cámara':'Modalidad no registrada'}</p><div class="actions"><a class="button primary" href="#mis-aves">Volver a mis aves</a><button class="button secondary" data-action="start-quiz">Repetir quiz</button></div><p class="subtle">Tu colección: ${count()} de 5 aves descubiertas.</p></section>`}

function credits(){return `<div class="page-title"><span class="eyebrow">REFERENCIAS Y RECONOCIMIENTOS</span><h1>Fuentes y créditos</h1><p>La guía de aves de la UAO y los recursos aportados por el equipo hacen posible esta experiencia académica.</p></div><div class="credit-row"><h3>Información de las especies</h3><p>Guía de Aves UAO, edición 2023. Páginas PDF: Cernícalo 24, Reinita 29, Mosquerito 37, Carpintero 22 y Esmeralda 18. La propuesta del equipo aporta fotos y enlaces de referencia.</p></div>${birds.map(b=>`<div class="credit-row"><h3>${esc(b.name)}</h3>${(b.credits||[]).map(c=>typeof c==='string'?`<p>${esc(c)}</p>`:`<p>${esc(c.type||c.kind||'Recurso')}: ${esc(c.author||c.source||'Aportado por el equipo')} ${c.license?`· ${esc(c.license)}`:''} ${c.url?`· <a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">Fuente ↗</a>`:''}</p>`).join('')}<p>Fotografía y modelo aportados por el equipo. Atribuciones y permisos de distribución pendientes de completar antes de publicación.</p></div>`).join('')}<div class="credit-row"><h3>Identidad y tecnología</h3><p>Logo UAO proporcionado por el equipo. Roboto: SIL Open Font License. Material Symbols: Apache 2.0. three.js: MIT.</p><a href="/vendor/xr/LICENSE" target="_blank" rel="noopener">8th Wall XR Engine © 2026 Niantic Spatial, Inc. · Licencia y descargo de garantías ↗</a></div>`}

function render(){stopSession();const hash=location.hash.slice(1)||'inicio';const [route,id]=hash.split('/');const views={inicio:home,'mis-aves':collection,sostenible:sustainable,quiz:quizIntro,resultado:resultPage,creditos:credits,ave:()=>detail(birdById(id))};$('main').innerHTML=(views[route]||home)();document.querySelectorAll('.topbar nav a,.bottom-nav a').forEach(a=>{const current=a.hash===`#${route}`||(route==='ave'&&a.hash==='#mis-aves');if(current)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});window.scrollTo(0,0);$('main').focus({preventScroll:true})}

function chooseMode(target='campus',birdId=null){
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  return launch(isMobile ? 'ar' : 'preview', target, birdId);
}

function status(text){$('scene-status').textContent=text}

function controls({bird=false,loading=false}={}){
  $('scene-map').hidden=!bird||sceneView==='quiz';
  $('scene-audio').hidden=!bird;
  $('scene-info').hidden=!bird||sceneView==='quiz';
  $('scene-tools').querySelectorAll('button').forEach(b=>b.disabled=loading)
}


function stopSession(){clearTimeout(toastTimer);$('toast').hidden=true;launchId++;sceneLoad++;controller?.abort();controller=null;session?.stop();session=null;audio.stop();document.body.classList.remove('in-session');$('experience').hidden=true;currentBird=null;activity=null;quiz=null}

async function launch(mode,target,birdId){
  closeDialog();stopSession();const id=++launchId;controller=new AbortController();const signal=controller.signal;sceneMode=mode;sceneView=target;sessionStart=lastTick=performance.now();frames=0
  document.body.classList.add('in-session');$('experience').hidden=false;$('scene-host').innerHTML='<canvas aria-label="Escena interactiva de aves y campus"></canvas>';$('scene-mode').textContent=mode==='ar'?'REALIDAD AUMENTADA':target==='campus'?'CAMPUS 3D · SIN CÁMARA':'VISTA 3D · SIN CÁMARA';$('scene-place').textContent=mode==='ar'?'Recolocar':'Restablecer vista';$('scene-title').textContent='Preparando tu recorrido';$('scene-body').innerHTML='<h2>Un momento…</h2><p>Estamos preparando la experiencia. Puedes salir cuando quieras.</p>';$('scene-center').hidden=mode==='preview';controls({loading:true});status('Cargando…')
  try{
    const {createExperience}=await import('./ar/experience.js');if(signal.aborted)return
    const created=await createExperience({canvas:document.querySelector('#scene-host canvas'),mode,signal,birds,status,onError:e=>{if(signal.aborted)return;stopSession();dialog(`<h2>La cámara se interrumpió</h2><p>${esc(e.message)}</p><button class="button primary" data-launch="${mode}" data-target="${target}" ${birdId?`data-bird="${birdId}"`:''}>Volver a intentar</button>`)},onPin:openPin,onBirdTouch:touchBird,onChoice:chooseObject,onPlaced:placed=>{$('scene-center').hidden=placed},onFrame:({renderer,kind,clips})=>{frames++;const now=performance.now();if(now-lastTick>1000){$('scene-metrics').textContent=`${mode==='ar'?'RA · prueba física pendiente':'Vista 3D · no acredita tracking'}\n${Math.round(frames*1000/(now-lastTick))} FPS · ${Math.round((now-sessionStart)/1000)} s\n${renderer.info.render.triangles.toLocaleString()} triángulos · ${renderer.info.render.calls} llamadas de dibujo\n${renderer.info.memory.textures} texturas · ${clips} clips disponibles\nHeap JS: ${performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576)+' MB (no memoria total)':'no disponible'}`;lastTick=now;frames=0}}})
    if(signal.aborted||id!==launchId){created.stop();return}session=created
    if(target==='bird')await showBird(birdById(birdId));else if(target==='quiz'){quiz=createQuiz(questions);await showQuestion()}else await showCampus()
  }catch(e){if(e.name==='AbortError'||signal.aborted)return;stopSession();dialog(`<h2>No pudimos abrir la experiencia</h2><p>${esc(e.message)}</p><div class="actions"><button class="button primary" data-launch="${mode}" data-target="${target}" ${birdId?`data-bird="${birdId}"`:''}>Volver a intentar</button><button class="button secondary" data-launch="preview" data-target="${target}" ${birdId?`data-bird="${birdId}"`:''}>Usar vista 3D</button></div>`)}
}

function sceneError(e,retry){if(e.name==='AbortError')return;retryScene=retry;controls({bird:Boolean(currentBird)});status('Comprueba la conexión y vuelve a intentar.');$('scene-body').innerHTML=`<h2>No pudimos cargar esta parte</h2><p>${esc(e.message)}</p><button class="button primary" data-action="retry-scene">Volver a intentar</button>`}

async function showCampus(){const id=++sceneLoad;audio.stop();currentBird=null;activity=null;sceneView='campus';$('scene-title').textContent='Explora el campus UAO';controls({loading:true});$('scene-body').innerHTML='<span class="eyebrow">01 · EXPLORA</span><h2>Un campus por descubrir</h2><p>Gira el campus y toca un pin. Al elegir un ave podrás abrirla en realidad aumentada.</p>'
  try{const ok=await session.showCampus();if(!ok||id!==sceneLoad)return;controls();$('scene-body').innerHTML+=`<details><summary>Ver lista de aves</summary><div class="pin-list">${birds.map((b,i)=>`<button data-pin="${b.id}">${i+1}.${esc(b.name)}</button>`).join('')}</div></details>`}catch(e){if(id===sceneLoad)sceneError(e,showCampus)}
}

function openPin(id){if(sceneView!=='campus')return;const b=birdById(id);dialog(`<span class="eyebrow">${esc(b.zone?.label||'Zona sugerida')}</span><h2>${esc(b.name)}</h2><p>¿Quieres observar el ave de esta zona?</p><div class="actions"><button class="button primary" data-observe="${id}">Observar ave</button><button class="button secondary" data-close>Seguir viendo el campus</button></div><p class="subtle">La ubicación es orientativa; no acredita un avistamiento.</p>`)}

async function showBird(b){const id=++sceneLoad;audio.stop();currentBird=b;sceneView='bird';activity={observed:false,done:false,seen:new Set()};$('scene-title').textContent=b.name;controls({bird:true,loading:true});$('scene-body').innerHTML=`<span class="eyebrow">02 · OBSERVA Y ESCUCHA</span><h2>${esc(b.name)}</h2><p>Preparando su modelo…</p>`
  try{const ok=await session.showBird(b);if(!ok||id!==sceneLoad)return;controls({bird:true});renderActivity()}catch(e){if(id===sceneLoad)sceneError(e,()=>showBird(b))}
}

function renderActivity(){
  const b=currentBird;if(!b||sceneView!=='bird')return
  session.clearChoices()
  $('scene-body').innerHTML=`<span class="eyebrow">${activity.done?'✓ HISTORIA DESCUBIERTA':'OBSERVA Y ESCUCHA'}</span><h2>${esc(b.name)}</h2><p>${esc(activity.done?b.trait:'Escucha su canto para descubrir su historia.')}</p><div class="actions"><button class="button primary" data-action="touch-bird">${b.animated?'Reproducir animación y canto':'Escuchar canto'}</button><button class="button secondary" data-action="brief">Información</button></div>`
}

function canInteract(){const info=session?.modelInfo();if(!info?.ready)return false;if(!info.placed){status('Mueve despacio el teléfono para reconocer el entorno. El ave aparecerá frente a ti.');return false}return true}

async function touchBird(){
  if(!currentBird||!session?.modelInfo().ready)return
  const bird=currentBird,active=session
  active.playClip()
  const played=await audio.play(bird.audio,bird.name)
  if(played&&session===active&&currentBird===bird&&sceneView==='bird')completeActivity()
}

function completeActivity(){if(!activity||activity.done)return;activity.done=true;session.clearChoices();const fresh=progress.discover(currentBird.id);if(fresh)toast(`${currentBird.name}: historia descubierta`);renderActivity()}

function chooseObject(optionId){if(sceneView==='quiz')answerQuiz(optionId)}

function brief(){if(!currentBird)return;const b=currentBird;dialog(`<span class="eyebrow">UNA PISTA PARA RECONOCERLA</span><h2>${esc(b.name)}</h2><p class="scientific">${esc(b.scientificName)}</p><p>${esc(b.trait)}</p><div class="actions"><button class="button primary" data-fiche="${b.id}">Ver ficha completa</button><button class="button secondary" data-close>Seguir observando</button></div>`)}

async function showQuestion(){const id=++sceneLoad;const state=quiz?.get();if(!state)return;if(state.done){finishQuiz();return}audio.stop();session.clearChoices();sceneView='quiz';currentBird=birdById(state.question.birdId)||birds[1];$('scene-title').textContent=`Desafío ${state.index+1} de ${questions.length}`;controls({bird:true,loading:true});$('scene-body').innerHTML='<h2>Preparando el siguiente desafío…</h2>'
  try{const ok=await session.showBird(currentBird);if(!ok||id!==sceneLoad)return;controls({bird:true});renderQuestion();session.showChoices(state.question.options)}catch(e){if(id===sceneLoad)sceneError(e,showQuestion)}
}

function renderQuestion(feedback=null){const s=quiz.get(),q=s.question;$('scene-body').innerHTML=`<div class="scene-progress"><span style="width:${s.index/questions.length*100}%"></span></div><span class="eyebrow">DESAFÍO ${s.index+1} / ${questions.length} · ${s.score} PUNTOS</span><h2>${esc(q.prompt)}</h2>${['listen','audio','sound','canto'].includes(q.type)?'<button class="text-button" data-action="quiz-audio">▶ Escuchar pista</button>':''}${q.type==='trait'?'<button class="text-button" data-action="quiz-reference">Ver fotografía de referencia ↗</button>':''}<p>Toca una opción en la escena.</p>${feedback?`<p class="feedback ${feedback.correct?'':'retry'}">${feedback.correct?'✓ Correcto.':'Todavía no. Puedes corregir.'} ${esc(feedback.explanation)}</p>`:''}${s.correct?'<button class="button primary" data-action="quiz-next">Continuar →</button>':`<details><summary>Opciones de apoyo</summary><div class="quiz-options">${q.options.map(o=>`<button data-choice="${o.id}">${esc(o.label)}</button>`).join('')}</div></details>`}`}

function answerQuiz(id){if(!quiz||!canInteract())return;const result=quiz.answer(id);if(!result.accepted)return;session.markChoice(id,result.correct);renderQuestion(result)}

function finishQuiz(){const s=quiz.get();lastResult={score:s.score,total:questions.length*20,mode:sceneMode,completedAt:new Date().toISOString()};progress.saveQuiz(lastResult);navigate('#resultado')}

document.addEventListener('click',async e=>{
  const el=e.target.closest('button,a');if(!el)return
  if(el.classList.contains('skip-link')){e.preventDefault();$('main').focus();return}
  if(el.dataset.launch){await launch(el.dataset.launch,el.dataset.target,el.dataset.bird);return}
  if(el.dataset.observe){chooseMode('bird',el.dataset.observe);return}
  if(el.dataset.filter){collectionFilter=el.dataset.filter;$('main').innerHTML=collection();return}
  if(el.dataset.audio){const b=birdById(el.dataset.audio);const played=await audio.toggle(b.audio,b.name);if(played){progress.discover(b.id);const badge=document.querySelector('.detail-hero .pill');if(badge)badge.textContent='✓ En tu colección'}return}
  if(el.dataset.pin){openPin(el.dataset.pin);return}
  if(el.dataset.fiche){navigate(`#ave/${el.dataset.fiche}`);return}
  if(el.dataset.choice){chooseObject(el.dataset.choice);return}
  switch(el.dataset.action){
    case 'retry-scene':await retryScene?.();break
    case 'quiz-reference':if(currentBird)dialog(`<h2>Fotografía de referencia</h2><img class="dialog-reference" src="${esc(currentBird.image)}" alt="Fotografía de ${esc(currentBird.name)}"><p>Observa los rasgos y vuelve al desafío.</p><button class="button primary" data-close>Volver al desafío</button>`);break
    case 'explore':chooseMode();break
    case 'start-quiz':chooseMode('quiz');break
    case 'campus':await chooseMode('campus');break
    case 'touch-bird':touchBird();break
    case 'brief':brief();break
    case 'quiz-audio':if(currentBird)audio.toggle(currentBird.audio,currentBird.name);break
    case 'quiz-next':quiz.next();await showQuestion();break
    case 'scene-quiz':quiz=createQuiz(questions);await showQuestion();break
    case 'reset-progress':dialog('<h2>¿Empezar de nuevo?</h2><p>Se borrarán los descubrimientos y el último resultado guardados en este navegador.</p><div class="actions"><button class="button primary" data-action="confirm-reset">Reiniciar mi progreso</button><button class="button secondary" data-close>Conservarlo</button></div>');break
    case 'confirm-reset':progress.reset();lastResult=null;closeDialog();render();toast('Tu cuaderno está listo para un nuevo recorrido');break
  }
})

$('scene-exit').addEventListener('click',()=>{stopSession();render()});
$('scene-map').addEventListener('click',()=>chooseMode('campus'));
$('scene-info').addEventListener('click',brief);
$('scene-audio').addEventListener('click',()=>{if(!currentBird)return;if(audio.isPlaying())audio.toggle(currentBird.audio,currentBird.name);else touchBird()});
$('scene-place').addEventListener('click',()=>session?.reset());
$('scene-scale-down').addEventListener('click',()=>session?.scale(.85));
$('scene-scale-up').addEventListener('click',()=>session?.scale(1.15));
$('scene-help').addEventListener('click',()=>dialog(`<h2>Explora a tu ritmo</h2><p>${sceneMode==='ar'?'Mueve despacio el teléfono con buena luz. El ave aparece delante de ti cuando se reconoce el entorno. Recolocar la sitúa de nuevo frente a ti; no necesita detectar una mesa o el suelo.':'Arrastra para girar y acerca o aleja con dos dedos. Esta vista no usa cámara ni comprueba el tracking.'}</p><p>Toca los pines para elegir un ave y escucha su canto para descubrir su historia. El quiz conserva sus preguntas y opciones.</p><p>El botón de sonido pausa el canto. Al salir, la cámara y el audio se detienen.</p><a class="text-button" href="/diagnostico.html">Abrir prueba independiente de cámara</a>`));

document.addEventListener('visibilitychange',()=>{if(document.hidden){audio.stop();session?.stopAnimation()}})
addEventListener('pagehide',()=>stopSession())
addEventListener('hashchange',render)
render()