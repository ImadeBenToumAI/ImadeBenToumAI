import { expect, test } from 'claude-code/testing'

import { calibration, current, depths, emptyTree, eta, merge, minutes, nextOpen, nodeRef, outline, progress, renderSvg, upsert } from '../hooks/tree'

const T0 = '2026-10-18T00:00:00.000Z'

function sample() {
  let t = { ...emptyTree(), goal: 'Keep the apps crash-free' }
  t = upsert(t, { title: 'Goal', lens: 'goal', status: 'done', verification: 'n/a' }, T0).tree
  t = upsert(t, { title: 'Altitude', lens: 'altitude', parents: ['n1'], estimate: '2h' }, T0).tree
  t = upsert(t, { title: 'Depth', lens: 'depth', parents: ['n1'], status: 'exploring', estimate: '3h' }, T0).tree
  t = upsert(t, { title: 'Synthesis', lens: 'step', parents: ['n2', 'n3'], estimate: '1h' }, T0).tree
  return t
}

test('creates nodes with stable ids and drops unknown parents', () => {
  const t = upsert(sample(), { title: 'X', parents: ['n1', 'zzz'] }, T0).tree
  expect(t.nodes.map(n => n.id)).toEqual(['n1', 'n2', 'n3', 'n4', 'n5'])
  expect(t.nodes[4]!.parents).toEqual(['n1'])
})

test('updates a node without losing its fields', () => {
  const t = upsert(sample(), { id: 'n2', status: 'exploring' }, '2026-10-19T00:00:00.000Z').tree
  const n2 = t.nodes.find(n => n.id === 'n2')!
  expect(n2.status).toBe('exploring')
  expect(n2.estimate).toBe('2h')
  expect(n2.createdAt).toBe(T0)
  expect(n2.startedAt).toBe('2026-10-19T00:00:00.000Z')
})

test('done without verification is kept at review', () => {
  const t = upsert(sample(), { id: 'n3', status: 'done' }, T0).tree
  expect(t.nodes.find(n => n.id === 'n3')!.status).toBe('review')
  const ok = upsert(t, { id: 'n3', status: 'done', verification: 'npm test green' }, T0).tree
  expect(ok.nodes.find(n => n.id === 'n3')!.status).toBe('done')
})

test('computes depth on a converging graph', () => {
  const d = depths(sample())
  expect(d.get('n1')).toBe(0)
  expect(d.get('n4')).toBe(2)
})

test('merges branches into a target node', () => {
  let t = upsert(sample(), { title: 'Range', lens: 'range', parents: ['n1'] }, T0).tree
  t = merge(t, ['n5'], 'n4', T0)
  expect(t.nodes.find(n => n.id === 'n5')!.status).toBe('merged')
  expect(t.nodes.find(n => n.id === 'n4')!.parents).toEqual(['n2', 'n3', 'n5'])
})

test('reports progress and the current node', () => {
  const t = sample()
  expect(progress(t)).toEqual({ total: 4, finished: 1, exploring: 1, review: 0, pct: 25 })
  expect(current(t)!.id).toBe('n3')
})

test('parses estimates and finds the critical path', () => {
  expect(minutes('30min')).toBe(30)
  expect(minutes('2 h')).toBe(120)
  expect(minutes('1.5d')).toBe(720)
  expect(minutes('1w')).toBe(2400)
  const e = eta(sample())
  expect(e.critical).toBe(240) // n3 (3h) → n4 (1h)
  expect(e.path).toEqual(['n3', 'n4'])
  expect(e.remaining).toBe(360)
})

test('picks the next open node whose parents are settled', () => {
  expect(nextOpen(sample())!.id).toBe('n2')
  const t = upsert(upsert(sample(), { id: 'n2', status: 'done', verification: 'x' }, T0).tree, { id: 'n3', status: 'done', verification: 'x' }, T0).tree
  expect(nextOpen(t)!.id).toBe('n4')
})

test('calibrates estimates against actual time', () => {
  let t = sample()
  t = upsert(t, { id: 'n2', status: 'exploring' }, '2026-10-19T10:00:00.000Z').tree
  t = upsert(t, { id: 'n2', status: 'done', verification: 'x' }, '2026-10-19T14:00:00.000Z').tree // 4h for a 2h estimate
  expect(calibration(t)).toEqual({ factor: 2, samples: 1 })
})

test('attaches an agent to the node cited by #id', () => {
  expect(nodeRef('Explore the perf track #n3', sample())).toBe('n3')
  expect(nodeRef('Nothing #n99', sample())).toBe(undefined)
})

test('draws a valid SVG, escapes text, and clips long fields in the outline', () => {
  const t = upsert(sample(), { title: '<script>', summary: 'x'.repeat(500) }, T0).tree
  const { source } = renderSvg(t, 'n2')
  expect(source.startsWith('<svg')).toBe(true)
  expect(source.includes('<script>')).toBe(false)
  expect(source.length < 131072).toBe(true)
  expect(outline(t).includes('x'.repeat(201))).toBe(false)
})
