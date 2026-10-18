import { expect, test } from 'claude-code/testing'

import { current, depths, emptyTree, merge, nodeRef, progress, renderSvg, upsert } from '../hooks/tree'

const T0 = '2026-10-18T00:00:00.000Z'

function sample() {
  let t = { ...emptyTree(), goal: 'Garder les apps sans crash' }
  t = upsert(t, { title: 'But', lens: 'goal', status: 'done' }, T0).tree
  t = upsert(t, { title: 'Altitude', lens: 'altitude', parents: ['n1'], estimate: '2 h' }, T0).tree
  t = upsert(t, { title: 'Profondeur', lens: 'depth', parents: ['n1'], status: 'exploring' }, T0).tree
  t = upsert(t, { title: 'Synthèse', lens: 'step', parents: ['n2', 'n3'] }, T0).tree
  return t
}

test('crée des nœuds avec des id stables et ignore les parents inconnus', () => {
  const t = upsert(sample(), { title: 'X', parents: ['n1', 'zzz'] }, T0).tree
  expect(t.nodes.map(n => n.id)).toEqual(['n1', 'n2', 'n3', 'n4', 'n5'])
  expect(t.nodes[4]!.parents).toEqual(['n1'])
})

test('met à jour un nœud existant sans perdre ses champs', () => {
  const t = upsert(sample(), { id: 'n2', status: 'done' }, '2026-10-19T00:00:00.000Z').tree
  const n2 = t.nodes.find(n => n.id === 'n2')!
  expect(n2.status).toBe('done')
  expect(n2.estimate).toBe('2 h')
  expect(n2.createdAt).toBe(T0)
})

test('calcule la profondeur sur un graphe qui converge', () => {
  const d = depths(sample())
  expect(d.get('n1')).toBe(0)
  expect(d.get('n4')).toBe(2)
})

test('fusionne des branches dans un nœud cible', () => {
  let t = upsert(sample(), { title: 'Étendue', lens: 'range', parents: ['n1'] }, T0).tree
  t = merge(t, ['n5'], 'n4', T0)
  expect(t.nodes.find(n => n.id === 'n5')!.status).toBe('merged')
  expect(t.nodes.find(n => n.id === 'n4')!.parents).toEqual(['n2', 'n3', 'n5'])
})

test("donne l'avancement et le nœud courant", () => {
  const t = sample()
  expect(progress(t)).toEqual({ total: 4, finished: 1, exploring: 1, pct: 25 })
  expect(current(t)!.id).toBe('n3')
})

test('rattache un agent au nœud cité par #id', () => {
  expect(nodeRef('Explorer la piste perf #n3', sample())).toBe('n3')
  expect(nodeRef('Rien #n99', sample())).toBe(undefined)
})

test('dessine un SVG valide et échappe le texte', () => {
  const t = upsert(sample(), { title: '<script>' }, T0).tree
  const { source } = renderSvg(t, 'n2')
  expect(source.startsWith('<svg')).toBe(true)
  expect(source.includes('<script>')).toBe(false)
  expect(source.length < 131072).toBe(true)
})
