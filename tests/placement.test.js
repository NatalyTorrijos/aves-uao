import test from 'node:test'
import assert from 'node:assert/strict'
import {chooseHit} from '../src/ar/placement.js'
const hit=(type,distance=1)=>({type,distance,position:{x:0,y:0,z:-distance}})
test('no convierte un punto visual en una superficie',()=>{
  assert.equal(chooseHit([hit('FEATURE_POINT')],true),null)
  assert.equal(chooseHit([hit('FEATURE_POINT')]).type,'FEATURE_POINT')
})
test('prefiere superficie detectada sobre estimada y punto',()=>{
  assert.equal(chooseHit([hit('FEATURE_POINT'),hit('ESTIMATED_SURFACE'),hit('DETECTED_SURFACE')]).type,'DETECTED_SURFACE')
})
test('rechaza resultados corruptos, desconocidos y demasiado lejanos',()=>{
  assert.equal(chooseHit([hit('UNSPECIFIED'),hit('FEATURE_POINT',11),hit('FEATURE_POINT',0),{...hit('FEATURE_POINT'),position:{x:NaN,y:0,z:0}}]),null)
  assert.equal(chooseHit([]),null)
})
