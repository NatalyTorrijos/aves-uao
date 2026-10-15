import test from 'node:test'
import assert from 'node:assert/strict'
import {keepCanvasInHost} from '../src/ar/canvas-host.js'

function parent(){return {appendChild(node){node.parentNode=this}}}
test('el canvas vuelve al contenedor después de que XRExtras lo mueve al body',()=>{
  const host=parent(),body=parent(),canvas={parentNode:host,width:300,height:150}
  let resizeCalls=0
  const original={name:'fullwindowcanvas',onAttach({canvas}){body.appendChild(canvas);canvas.width=1080;canvas.height=1920},onCanvasSizeChange(){resizeCalls++}}
  const wrapped=keepCanvasInHost(original,canvas)
  wrapped.onAttach({canvas});wrapped.onCanvasSizeChange()
  assert.equal(canvas.parentNode,host);assert.equal(canvas.width,1080);assert.equal(canvas.height,1920)
  assert.equal(resizeCalls,1);assert.equal(wrapped.name,original.name)
  wrapped.onAttach({canvas});assert.equal(canvas.parentNode,host)
})
test('incluso un fallo de onAttach no deja una vista huérfana en el body',()=>{
  const host=parent(),body=parent(),canvas={parentNode:host}
  const wrapped=keepCanvasInHost({onAttach(){body.appendChild(canvas);throw new Error('inicio fallido')}},canvas)
  assert.throws(()=>wrapped.onAttach({canvas}),/inicio fallido/);assert.equal(canvas.parentNode,host)
})
