import test from 'node:test'
import assert from 'node:assert/strict'
import {createProgress, PROGRESS_KEY} from '../src/state/progress.js'

const ids = ['reinita-tropical', 'carpintero-cariblanco']
const result = {score: 80, total: 100, completedAt: '2026-10-14T17:00:00.000Z', mode: 'preview'}

function memoryStorage(entries = {}) {
  const values = new Map(Object.entries(entries))
  const writes = []
  return {
    getItem: key => values.get(key) ?? null,
    setItem(key, value) { writes.push(key); values.set(key, value) },
    writes,
  }
}

test('descubrimientos válidos persisten sin duplicados y separados del quiz', () => {
  const storage = memoryStorage()
  const progress = createProgress(storage, ids)
  assert.equal(progress.discover(ids[0]), true)
  assert.equal(progress.discover(ids[0]), false)
  assert.equal(progress.discover('bichofue'), false)
  assert.deepEqual(progress.get(), {discovered: [ids[0]], lastQuiz: null})
  assert.equal(progress.saveQuiz(result), true)
  assert.deepEqual(createProgress(storage, ids).get(), {discovered: [ids[0]], lastQuiz: result})
  assert.equal(progress.isDiscovered(ids[1]), false)
  assert.equal(progress.isDiscovered(ids[0]), true)
})

test('JSON corrupto y datos malformados no impiden comenzar un recorrido limpio', () => {
  for (const saved of ['{malformed', 'null', '[]', '5', '{"version":2,"discovered":"not-array","lastQuiz":{}}']) {
    assert.deepEqual(createProgress(memoryStorage({[PROGRESS_KEY]: saved}), ids).get(),
      {discovered: [], lastQuiz: null})
  }
})

test('descarta IDs antiguos o desconocidos y no lee ni escribe el progreso v1', () => {
  const storage = memoryStorage({
    'uao-birds-progress-v1': JSON.stringify({discovered: ['bichofue']}),
    [PROGRESS_KEY]: JSON.stringify({version: 2, discovered: ['bichofue', ids[1], ids[1], {}, null], lastQuiz: result}),
  })
  const progress = createProgress(storage, ids)
  assert.deepEqual(progress.get(), {discovered: [ids[1]], lastQuiz: result})
  progress.discover(ids[0])
  assert.deepEqual(storage.writes, [PROGRESS_KEY])
  assert.deepEqual(createProgress(memoryStorage({'uao-birds-progress-v1': '{"discovered":["bichofue"]}'}), ids).get(),
    {discovered: [], lastQuiz: null})
})

test('almacenamiento bloqueado o sin cuota conserva el progreso durante la visita', () => {
  const storage = {
    getItem() { throw new Error('SecurityError') },
    setItem() { throw new Error('QuotaExceededError') },
  }
  const progress = createProgress(storage, ids)
  assert.equal(progress.discover(ids[0]), true)
  assert.equal(progress.saveQuiz(result), true)
  assert.deepEqual(progress.get(), {discovered: [ids[0]], lastQuiz: result})
  assert.deepEqual(progress.reset(), {discovered: [], lastQuiz: null})
})

test('resultados imposibles se rechazan y las copias devueltas no alteran el estado', () => {
  const storage = memoryStorage()
  const progress = createProgress(storage, ids)
  progress.discover(ids[0])
  progress.saveQuiz(result)
  for (const bad of [null, {...result, score: 120}, {...result, score: -20}, {...result, total: 0}, {...result, score: NaN}, {...result, completedAt: 'ayer'}]) {
    assert.equal(progress.saveQuiz(bad), false)
  }
  const copy = progress.get()
  copy.discovered.push('bichofue')
  copy.lastQuiz.score = 0
  assert.deepEqual(progress.get(), {discovered: [ids[0]], lastQuiz: result})
  progress.reset()
  assert.deepEqual(createProgress(storage, ids).get(), {discovered: [], lastQuiz: null})
})

test('conserva el modo RA o práctica y los resultados sin modo quedan como desconocidos', () => {
  for (const [mode, expected] of [['ar', 'ar'], ['preview', 'preview'], [undefined, 'unknown'], ['unknown', 'unknown'], ['invalid', 'unknown'], [null, 'unknown']]) {
    const storage = memoryStorage({
      [PROGRESS_KEY]: JSON.stringify({version: 2, discovered: [], lastQuiz: {...result, mode}}),
    })
    const restored = createProgress(storage, ids)
    assert.deepEqual(restored.get().lastQuiz, {...result, mode: expected})
    assert.equal(restored.saveQuiz({...result, mode}), true)
    assert.deepEqual(createProgress(storage, ids).get().lastQuiz, {...result, mode: expected})
  }
})
