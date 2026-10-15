import './ui/diagnostic.css'
import {createMetrics} from './ui/metrics.js'

const $=id=>document.getElementById(id)
let active=null,launching=false
const status=text=>{$('status').textContent=text}
function home(message='') {
  active?.stop();active=null
  document.body.classList.remove('in-session')
  $('welcome').hidden=false;$('session').hidden=true
  $('welcome-status').textContent=message
  $('start').disabled=false;$('preview').disabled=false
}
async function launch(mode) {
  if(active || launching)return
  launching=true;$('start').disabled=true;$('preview').disabled=true
  $('welcome-status').textContent=''
  $('welcome').hidden=true;$('session').hidden=false
  document.body.classList.add('in-session')
  $('mode').textContent=mode==='ar'?'8th Wall · prueba RA':'Vista 3D · sin cámara'
  $('surface-option').hidden=mode!=='ar'
  $('metrics').textContent='Esperando fotogramas…'
  const metrics=createMetrics($('metrics'),mode==='ar'?'RA · dispositivo pendiente de validar':'SIMULACIÓN 3D')
  status('Preparando…')
  const options={canvas:$('camerafeed'),status,metrics,surfaceOnly:()=>$('surface-only').checked,onError:error=>{status(error.message)}}
  try {
    if(mode==='ar'){const {startAR}=await import('./ar/session.js');active=await startAR(options)}
    else {const {startPreview}=await import('./ar/preview.js');active=startPreview(options)}
  } catch(error){home(error.message)} finally {launching=false}
}
$('start').addEventListener('click',()=>launch('ar'))
$('preview').addEventListener('click',()=>launch('preview'))
$('reset').addEventListener('click',()=>active?.reset())
$('exit').addEventListener('click',()=>{if(launching){status('La carga está en curso. Espera a que termine para salir.');return}home()})
$('help').addEventListener('click',()=>{const open=$('help-text').hidden;$('help-text').hidden=!open;$('help').setAttribute('aria-expanded',String(open))})

