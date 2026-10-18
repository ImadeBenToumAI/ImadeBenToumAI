import type { Lens, Status, Tree, TreeNode } from '../types'

export const LENSES: Lens[] = ['goal', 'altitude', 'depth', 'range', 'step']
export const STATUSES: Status[] = ['proposed', 'exploring', 'done', 'validated', 'merged', 'abandoned']

export const LENS_LABEL: Record<Lens, string> = {
  goal: 'Objectif',
  altitude: 'Altitude',
  depth: 'Profondeur',
  range: 'Étendue',
  step: 'Étape',
}

export const STATUS_LABEL: Record<Status, string> = {
  proposed: 'proposé',
  exploring: 'en exploration',
  done: 'terminé',
  validated: 'validé',
  merged: 'fusionné',
  abandoned: 'abandonné',
}

const LENS_COLOR: Record<Lens, string> = {
  goal: '#7c5cff',
  altitude: '#0ea5e9',
  depth: '#16a34a',
  range: '#f59e0b',
  step: '#64748b',
}

export const emptyTree = (): Tree => ({ version: 1, goal: '', nodes: [] })

export function parseTree(text: string | undefined): Tree {
  if (!text) return emptyTree()
  try {
    const raw = JSON.parse(text) as Partial<Tree>
    return { version: 1, goal: raw.goal ?? '', nodes: Array.isArray(raw.nodes) ? raw.nodes : [] }
  } catch {
    return emptyTree()
  }
}

export type NodeInput = Partial<Omit<TreeNode, 'createdAt' | 'updatedAt'>> & { id?: string }

export function nextId(tree: Tree): string {
  let n = tree.nodes.length + 1
  while (tree.nodes.some(node => node.id === `n${n}`)) n++
  return `n${n}`
}

export function upsert(tree: Tree, input: NodeInput, now: string): { tree: Tree; node: TreeNode } {
  const existing = input.id ? tree.nodes.find(node => node.id === input.id) : undefined
  const known = new Set(tree.nodes.map(node => node.id))
  const parents = (input.parents ?? existing?.parents ?? []).filter(id => known.has(id) && id !== input.id)
  const lens = input.lens && LENSES.includes(input.lens) ? input.lens : existing?.lens ?? 'step'
  const status = input.status && STATUSES.includes(input.status) ? input.status : existing?.status ?? 'proposed'
  const node: TreeNode = {
    ...existing,
    ...stripUndefined(input),
    id: existing?.id ?? input.id ?? nextId(tree),
    title: input.title ?? existing?.title ?? 'Sans titre',
    lens,
    status,
    parents,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  const nodes = existing
    ? tree.nodes.map(one => (one.id === node.id ? node : one))
    : [...tree.nodes, node]
  return { tree: { ...tree, nodes }, node }
}

/** Fusionne des branches : les sources deviennent `merged` et parents du nœud cible. */
export function merge(tree: Tree, sources: string[], into: string, now: string): Tree {
  const target = tree.nodes.find(node => node.id === into)
  if (!target) return tree
  const valid = sources.filter(id => id !== into && tree.nodes.some(node => node.id === id))
  return {
    ...tree,
    nodes: tree.nodes.map(node => {
      if (node.id === into) {
        return { ...node, parents: [...new Set([...node.parents, ...valid])], updatedAt: now }
      }
      if (valid.includes(node.id)) return { ...node, status: 'merged', updatedAt: now }
      return node
    }),
  }
}

function stripUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as Partial<T>
}

/** Profondeur = plus long chemin depuis une racine. */
export function depths(tree: Tree): Map<string, number> {
  const byId = new Map(tree.nodes.map(node => [node.id, node]))
  const memo = new Map<string, number>()
  const visit = (id: string, seen: Set<string>): number => {
    const hit = memo.get(id)
    if (hit !== undefined) return hit
    const node = byId.get(id)
    if (!node || seen.has(id)) return 0
    seen.add(id)
    const parents = node.parents.filter(p => byId.has(p))
    const d = parents.length === 0 ? 0 : 1 + Math.max(...parents.map(p => visit(p, seen)))
    memo.set(id, d)
    return d
  }
  for (const node of tree.nodes) visit(node.id, new Set())
  return memo
}

export function progress(tree: Tree): { total: number; finished: number; exploring: number; pct: number } {
  const live = tree.nodes.filter(node => node.status !== 'abandoned')
  const finished = live.filter(node => ['done', 'validated', 'merged'].includes(node.status)).length
  const exploring = live.filter(node => node.status === 'exploring').length
  return { total: live.length, finished, exploring, pct: live.length ? Math.round((finished / live.length) * 100) : 0 }
}

/** Nœud courant : le dernier en exploration, sinon le dernier mis à jour non terminé. */
export function current(tree: Tree): TreeNode | undefined {
  const byTime = [...tree.nodes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  return byTime.find(n => n.status === 'exploring') ?? byTime.find(n => n.status === 'proposed')
}

const esc = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const cut = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text)

/** Dessine le graphe (DAG) en SVG : colonnes = profondeur, couleur = lentille, style = statut. */
export function renderSvg(tree: Tree, selected: string | undefined): { source: string; width: number; height: number } {
  const W = 168, H = 54, GX = 40, GY = 16, PAD = 16
  const d = depths(tree)
  const columns = new Map<number, TreeNode[]>()
  for (const node of tree.nodes) {
    const col = d.get(node.id) ?? 0
    columns.set(col, [...(columns.get(col) ?? []), node])
  }
  const pos = new Map<string, { x: number; y: number }>()
  let maxRows = 1
  for (const [col, nodes] of columns) {
    maxRows = Math.max(maxRows, nodes.length)
    nodes.forEach((node, row) => pos.set(node.id, { x: PAD + col * (W + GX), y: PAD + 22 + row * (H + GY) }))
  }
  const cols = Math.max(1, columns.size)
  const width = PAD * 2 + cols * W + (cols - 1) * GX
  const height = PAD * 2 + 22 + maxRows * H + (maxRows - 1) * GY + 22
  const cur = current(tree)?.id

  const edges = tree.nodes.flatMap(node =>
    node.parents.map(parent => {
      const a = pos.get(parent), b = pos.get(node.id)
      if (!a || !b) return ''
      const x1 = a.x + W, y1 = a.y + H / 2, x2 = b.x, y2 = b.y + H / 2, mx = (x1 + x2) / 2
      const dashed = node.status === 'proposed' ? ' stroke-dasharray="5 4"' : ''
      return `<path d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}" fill="none" stroke="#94a3b8" stroke-width="1.6"${dashed}/>`
    }),
  )

  const boxes = tree.nodes.map(node => {
    const p = pos.get(node.id)!
    const color = LENS_COLOR[node.lens]
    const faded = node.status === 'abandoned' ? ' opacity="0.35"' : node.status === 'merged' ? ' opacity="0.6"' : ''
    const dash = node.status === 'proposed' ? ' stroke-dasharray="5 4"' : ''
    const strokeW = node.id === selected ? 3.5 : node.id === cur ? 2.5 : 1.5
    const fill = ['done', 'validated', 'merged'].includes(node.status) ? `${color}22` : '#ffffff'
    const badge = node.status === 'validated' ? '✓ ' : node.status === 'merged' ? '⤵ ' : node.status === 'exploring' ? '● ' : ''
    const meta = [node.id, STATUS_LABEL[node.status], node.estimate].filter(Boolean).join(' · ')
    return `<g${faded}><title>${esc(`${node.title}\n${node.summary ?? ''}`)}</title>`
      + `<rect x="${p.x}" y="${p.y}" width="${W}" height="${H}" rx="9" fill="${fill}" stroke="${color}" stroke-width="${strokeW}"${dash}/>`
      + `<rect x="${p.x}" y="${p.y}" width="6" height="${H}" rx="3" fill="${color}"/>`
      + `<text x="${p.x + 14}" y="${p.y + 22}" font-size="12.5" font-weight="600" fill="#0f172a" font-family="system-ui,sans-serif">${esc(badge + cut(node.title, 22))}</text>`
      + `<text x="${p.x + 14}" y="${p.y + 40}" font-size="10.5" fill="#475569" font-family="system-ui,sans-serif">${esc(cut(meta, 30))}</text>`
      + (node.agent ? `<circle cx="${p.x + W - 10}" cy="${p.y + 10}" r="4" fill="#ef4444"><animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite"/></circle>` : '')
      + '</g>'
  })

  const legend = LENSES.map((lens, i) =>
    `<rect x="${PAD + i * 92}" y="${height - 18}" width="10" height="10" rx="2" fill="${LENS_COLOR[lens]}"/>`
    + `<text x="${PAD + i * 92 + 14}" y="${height - 9}" font-size="10" fill="#475569" font-family="system-ui,sans-serif">${LENS_LABEL[lens]}</text>`,
  ).join('')

  const title = `<text x="${PAD}" y="${PAD + 8}" font-size="13" font-weight="700" fill="#0f172a" font-family="system-ui,sans-serif">${esc(cut(tree.goal || 'Objectif non défini', 70))}</text>`
  const w = Math.max(width, PAD * 2 + LENSES.length * 92)
  const source = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${height}" viewBox="0 0 ${w} ${height}">`
    + `<rect width="100%" height="100%" fill="#f8fafc" rx="10"/>${title}${edges.join('')}${boxes.join('')}${legend}</svg>`
  return { source, width: w, height }
}

/** Résumé texte de l'arbre, injecté dans le prompt système. */
export function outline(tree: Tree): string {
  if (tree.nodes.length === 0) return '(arbre vide)'
  const p = progress(tree)
  const lines = tree.nodes.map(n =>
    `- ${n.id} [${LENS_LABEL[n.lens]} · ${STATUS_LABEL[n.status]}${n.estimate ? ` · ${n.estimate}` : ''}] ${n.title}`
    + (n.parents.length ? ` ← ${n.parents.join(', ')}` : '')
    + (n.agent ? ` (agent: ${n.agent})` : ''),
  )
  return `Objectif : ${tree.goal || '(non défini)'}\nAvancement : ${p.finished}/${p.total} (${p.pct} %), ${p.exploring} en exploration\n${lines.join('\n')}`
}

/** Extrait `#n12` d'une description d'agent pour rattacher l'agent à un nœud. */
export function nodeRef(text: string, tree: Tree): string | undefined {
  const ids = [...text.matchAll(/#([A-Za-z0-9_-]+)/g)].map(m => m[1])
  return ids.find(id => tree.nodes.some(node => node.id === id))
}
