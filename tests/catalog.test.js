import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,existsSync} from 'node:fs'
const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'))
const birds=read('../src/data/birds.json'),questions=read('../src/data/quiz.json'),clips=read('../src/data/animation-clips.json'),layout=read('../src/data/scene-layout.json')
const asset=path=>new URL('../public'+path,import.meta.url)

test('catálogo vigente: cinco especies únicas con medios locales y referencias',()=>{
  assert.equal(birds.length,5);assert.equal(new Set(birds.map(b=>b.id)).size,5)
  for(const b of birds){for(const key of ['model','image','audio'])assert.ok(existsSync(asset(b[key])),`${b.id}: ${key}`);assert.ok(b.guidePage>0);assert.ok(b.videoUrl.startsWith('https://'));assert.ok(b.credits.length)}
  assert.deepEqual(new Set(layout.pins.map(p=>p.birdId)),new Set(birds.map(b=>b.id)))
  assert.equal(layout.campus.verifiedLocations,false);assert.ok(existsSync(asset(layout.campus.model)))
})
test('quiz: todas las respuestas y especies apuntan al catálogo real',()=>{
  assert.equal(questions.length,5)
  for(const q of questions){assert.ok(birds.some(b=>b.id===q.birdId));assert.equal(q.options.filter(o=>o.id===q.correctId).length,1);assert.equal(new Set(q.options.map(o=>o.id)).size,q.options.length);assert.ok(q.explanation);assert.ok(q.source)}
})
test('clips seleccionados existen en el GLB distribuido; Carpintero permanece estático',()=>{
  for(const b of birds){const data=readFileSync(asset(b.model));assert.equal(data.toString('ascii',0,4),'glTF');assert.equal(data.readUInt32LE(4),2);assert.equal(data.readUInt32LE(8),data.length)
    const doc=JSON.parse(data.toString('utf8',20,20+data.readUInt32LE(12)));const selected=clips[b.id]
    if(b.animated){assert.ok(doc.animations[selected.index]);assert.equal(doc.animations[selected.index].name,selected.name)}
    else{assert.equal(b.id,'colaptes-rubiginosus');assert.equal(selected.index,null);assert.equal(doc.animations?.length||0,0)}
  }
})
