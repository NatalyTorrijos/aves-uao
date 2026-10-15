import test from 'node:test'
import assert from 'node:assert/strict'
import {createQuiz} from '../src/state/quiz.js'

const questions = Array.from({length: 5}, (_, index) => ({
  id: `question-${index}`,
  prompt: 'Elige la opción que coincide con lo observado.',
  options: [{id: 'correct', label: 'Coincide'}, {id: 'wrong', label: 'No coincide'}],
  correctId: 'correct',
  explanation: 'La elección corresponde a lo observado en la actividad.',
}))

test('el acierto inicial suma 20 una sola vez aunque se toque repetidamente', () => {
  const quiz = createQuiz(questions)
  assert.deepEqual(quiz.answer('correct'), {
    accepted: true, correct: true, explanation: questions[0].explanation, score: 20,
  })
  assert.equal(quiz.answer('correct').accepted, false)
  assert.equal(quiz.answer('wrong').accepted, false)
  assert.equal(quiz.get().score, 20)
  assert.equal(quiz.get().attempts, 1)
  assert.equal(quiz.get().index, 0)
})

test('tras fallar se puede corregir y avanzar pero sin recuperar los puntos', () => {
  const quiz = createQuiz(questions)
  assert.equal(quiz.answer('wrong').correct, false)
  assert.equal(quiz.get().answered, true)
  assert.equal(quiz.next().index, 0)
  assert.equal(quiz.answer('correct').correct, true)
  assert.equal(quiz.get().score, 0)
  assert.equal(quiz.get().attempts, 2)
  assert.equal(quiz.next().index, 1)
  assert.equal(quiz.get().answered, false)
  assert.equal(quiz.get().correct, null)
  assert.equal(quiz.answer('correct').score, 20)
})

test('no se saltan preguntas y una opción desconocida no consume el primer intento', () => {
  const quiz = createQuiz(questions)
  assert.equal(quiz.next().index, 0)
  assert.equal(quiz.answer('unknown').accepted, false)
  assert.equal(quiz.answer(null).accepted, false)
  assert.equal(quiz.get().attempts, 0)
  assert.equal(quiz.get().answered, false)
  assert.equal(quiz.answer('correct').score, 20)
})

test('cinco aciertos dan 100 y el resultado final es estable hasta reiniciar', () => {
  const quiz = createQuiz(questions)
  for (let index = 0; index < 5; index += 1) {
    assert.equal(quiz.get().index, index)
    assert.equal(quiz.answer('correct').score, (index + 1) * 20)
    quiz.next()
  }
  const completed = quiz.get()
  assert.equal(completed.done, true)
  assert.equal(completed.question, null)
  assert.equal(completed.score, 100)
  assert.equal(quiz.answer('correct').accepted, false)
  assert.deepEqual(quiz.next(), completed)
  const reset = quiz.reset()
  assert.equal(reset.done, false)
  assert.equal(reset.index, 0)
  assert.equal(reset.score, 0)
  assert.equal(reset.attempts, 0)
  assert.equal(quiz.answer('correct').score, 20)
})

test('un catálogo vacío termina y las preguntas mal configuradas se rechazan', () => {
  assert.equal(createQuiz([]).get().done, true)
  assert.throws(() => createQuiz(null), TypeError)
  assert.throws(() => createQuiz([{...questions[0], correctId: 'missing'}]), TypeError)
  assert.throws(() => createQuiz([{...questions[0], options: [{id: 'correct'}, {id: 'correct'}]}]), TypeError)
})

test('editar una copia de las opciones no puede cambiar la respuesta correcta', () => {
  const input = [{...questions[0], options: questions[0].options.map(option => ({...option}))}]
  const quiz = createQuiz(input)
  input[0].correctId = 'wrong'
  const snapshot = quiz.get()
  snapshot.question.correctId = 'wrong'
  snapshot.question.options[0].id = 'wrong'
  assert.equal(quiz.answer('correct').score, 20)
})
