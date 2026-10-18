import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, ResolveInput } from 'claude-code'

import type { Lens, Status, Tab, Tree } from '../types'
import {
  LENS_LABEL, LENSES, STATUS_LABEL, STATUSES, current, emptyTree, merge, nodeRef, outline,
  parseTree, progress, renderSvg, upsert,
} from './tree'

const PLUGIN = 'ambition-tree'
const PANE = 'ambition-tree'
const FILE = '.ambition/tree.json'

const tree = atom({ plugin: 'ambition-tree', key: 'tree' } as const, emptyTree())
const selected = atom({ plugin: 'ambition-tree', key: 'selected' } as const, '')
const expanded = atom({ plugin: 'ambition-tree', key: 'expanded' } as const, false)
const tab = atom({ plugin: 'ambition-tree', key: 'tab' } as const, 'tree' as Tab)
const git = atom({ plugin: 'ambition-tree', key: 'git' } as const, '')
const agents = atom({ plugin: 'ambition-tree', key: 'agents' } as const, [] as string[])

const METHOD = `# Arbre de raisonnement ambitieux (plugin ambition-tree)
Pour chaque tâche, applique la méthode be-ambitious de Felix Rieseberg et trace ton raisonnement dans l'arbre visuel de l'utilisateur, avec les outils mcp__ambition-tree__* :
1. Au début d'une tâche nouvelle : tree_set_goal (le but derrière le but), puis tree_upsert un nœud par piste : au moins une Altitude (résultat durable visé), une Profondeur (ce que ferait le meilleur expert, avec quels outils et quel juge externe), une Étendue (quelles autres disciplines, verbes plutôt que noms). Donne à chacune une estimation de temps (estimate) et un résumé.
2. Les étapes concrètes sont des nœuds lens=step dont parents = la piste qu'elles servent. Plusieurs pistes peuvent converger : un nœud peut avoir plusieurs parents (fusion).
3. Mets à jour le statut au fil de l'eau : exploring quand tu commences, done quand c'est fait et vérifié par un juge externe (tests, données non vues, métrique). Ne marque jamais validated toi-même : c'est l'utilisateur qui valide.
4. Quand tu lances un sous-agent pour un nœud, mets #<id> dans la description de l'agent (ex. "Explorer la piste perf #n4") : le nœud s'affiche alors comme exploré par cet agent.
5. Quand l'utilisateur agit dans le panneau (messages commençant par [arbre]), exécute la demande et mets l'arbre à jour en conséquence.
6. Si une branche Git sert un nœud, renseigne branch.
7. Page mobile : si le fichier .ambition/artifact.json existe, il contient l'URL d'une page « Arbre d'ambition » (artifact claude.ai). Après chaque modification de l'arbre, synchronise-la : ArtifactData set, collection "tree", doc "current", file_path ".ambition/tree.json" (lis d'abord le doc pour obtenir sa version et passe-la en if_version). Les actions que l'utilisateur fait sur cette page t'arrivent comme des commentaires d'artifact commençant par [arbre] : exécute-les, mets l'arbre à jour, puis réponds au fil (ArtifactComments reply) et résous-le.
Garde l'arbre lisible : titres courts (moins de 24 caractères), détails dans detail.`

const NODE_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string', description: "Identifiant d'un nœud existant à modifier ; omis, un nouveau nœud est créé." },
    title: { type: 'string', description: 'Titre court (moins de 24 caractères).' },
    lens: { type: 'string', enum: LENSES, description: 'goal, altitude, depth, range ou step.' },
    status: { type: 'string', enum: STATUSES.filter(s => s !== 'validated') },
    parents: { type: 'array', items: { type: 'string' }, description: 'Nœuds parents ; plusieurs = convergence.' },
    summary: { type: 'string', description: 'Une ou deux phrases.' },
    detail: { type: 'string', description: 'Détail complet en markdown : méthode, résultats, vérification.' },
    estimate: { type: 'string', description: 'Estimation du temps restant, ex. "2 h", "3 j".' },
    branch: { type: 'string', description: 'Branche Git associée.' },
  },
} as const

type $ = EngineInterface

// Charge et sauvegarde l'arbre dans le dépôt : il est versionné avec le code.
async function load($: $) {
  const exists = await $.fs.exists(FILE).catch(() => false)
  const text = exists ? await $.fs.read(FILE).catch(() => undefined) : undefined
  const parsed = parseTree(typeof text === 'string' ? text : undefined)
  await update($, tree, () => parsed)
}

async function save($: $, next: Tree) {
  await update($, tree, () => next)
  await $.fs.write(FILE, `${JSON.stringify(next, null, 2)}\n`)
}

async function refreshGit($: $) {
  const graph = await $.process
    .run(['git', 'log', '--graph', '--oneline', '--decorate', '--all', '-n', '40'])
    .catch(() => undefined)
  const branches = await $.process
    .run(['git', 'branch', '-a', '-vv', '--sort=-committerdate'])
    .catch(() => undefined)
  const text = graph && graph.exitCode === 0
    ? `${branches?.stdout ?? ''}\n${graph.stdout}`
    : 'Pas de dépôt Git dans ce dossier.'
  await update($, git, () => text)
}

async function trackAgentEnd($: $, label: string, id: string | undefined) {
  await update($, agents, list => {
    const i = list.indexOf(label)
    return i < 0 ? list : [...list.slice(0, i), ...list.slice(i + 1)]
  })
  if (!id) return
  const after = await read($, tree)
  const node = after.nodes.find(n => n.id === id)
  const status: Status = node?.status === 'exploring' ? 'done' : node?.status ?? 'done'
  await save($, upsert(after, { id, status, agent: '' }, await nowIso($)).tree)
}

async function drawTree($: $, e: ResolveInput) {
  const ui = $.ui.resolve(e) as any
  const { Box, Text, Button, Markdown, Code } = ui
  const t = await read($, tree)
  const sel = await read($, selected)
  const isExpanded = await read($, expanded)
  const activeTab = await read($, tab)
  const running = await read($, agents)
  const p = progress(t)
  const cur = current(t)
  const node = t.nodes.find(n => n.id === sel)

  const steer = async (text: string) => {
    await $.prompt.submit({ text: `[arbre] ${text}` })
  }
  const setStatus = async (id: string, status: Status) =>
    save($, upsert(await read($, tree), { id, status }, await nowIso($)).tree)

  const tabs = (
    <Box flexDirection="row" gap={1}>
      <Button key="tab-tree" variant={activeTab === 'tree' ? 'primary' : undefined} onPress={() => update($, tab, () => 'tree' as Tab)}>
        Raisonnement
      </Button>
      <Button key="tab-git" variant={activeTab === 'git' ? 'primary' : undefined} onPress={async () => { await refreshGit($); await update($, tab, () => 'git' as Tab) }}>
        Branches Git
      </Button>
    </Box>
  )

  if (activeTab === 'git') {
    const text = await read($, git)
    return (
      <Box flexDirection="column" gap={1}>
        {tabs}
        <Text bold>Branches, commits et fusions</Text>
        <Code source={text || 'Chargement…'} language="text" />
        <Button key="git-refresh" onPress={() => refreshGit($)}>Actualiser</Button>
      </Box>
    )
  }

  const header = (
    <Box flexDirection="column">
      <Text bold>{t.goal || "Pas encore d'objectif : décris ta tâche dans le chat."}</Text>
      <Text dimColor>
        {`Avancement ${p.finished}/${p.total} (${p.pct} %) · ${p.exploring} en exploration`}
        {cur ? ` · tu es ici : ${cur.id} ${cur.title}` : ''}
      </Text>
      {running.length > 0 && <Text color="red">{`Sous-agents actifs : ${running.join(' · ')}`}</Text>}
    </Box>
  )

  const svg = renderSvg(t, sel)
  const graph = ui.Svg && t.nodes.length > 0
    ? <ui.Svg source={svg.source} alt={outline(t)} isInteractive />
    : null

  const list = (
    <Box flexDirection="column">
      {t.nodes.map(n => (
        <Button
          key={`node-${n.id}`}
          plain
          onPress={() => update($, selected, s => (s === n.id ? '' : n.id))}
        >
          {`${n.id === sel ? '▶ ' : ''}${n.id} ${n.title} `}
          <Text dimColor>{`${LENS_LABEL[n.lens]} · ${STATUS_LABEL[n.status]}${n.estimate ? ` · ${n.estimate}` : ''}`}</Text>
        </Button>
      ))}
    </Box>
  )

  const others = t.nodes.filter(n => node && n.id !== node.id && n.status !== 'abandoned')
  const detail = node && (
    <Box flexDirection="column" gap={1} borderStyle="round" padding={1}>
      <Text bold>{`${node.id} · ${node.title}`}</Text>
      <Text dimColor>
        {`${LENS_LABEL[node.lens]} · ${STATUS_LABEL[node.status]}`}
        {node.estimate ? ` · estimation ${node.estimate}` : ''}
        {node.branch ? ` · branche ${node.branch}` : ''}
        {node.parents.length ? ` · issu de ${node.parents.join(', ')}` : ''}
      </Text>
      {node.summary && <Text>{node.summary}</Text>}
      {isExpanded && node.detail && <Markdown text={node.detail} />}
      <Box flexDirection="row" flexWrap="wrap" gap={1}>
        <Button key="act-detail" onPress={() => update($, expanded, x => !x)}>
          {isExpanded ? 'Masquer le détail' : 'Voir le détail'}
        </Button>
        <Button key="act-validate" variant="primary" onPress={async () => {
          await setStatus(node.id, 'validated')
          await steer(`J'ai validé ${node.id} « ${node.title} ». Intègre ses résultats dans la branche principale de l'arbre (et du code si c'est pertinent), puis passe à la suite.`)
        }}>Valider</Button>
        <Button key="act-deeper" onPress={() => steer(`Approfondis ${node.id} « ${node.title} » (Profondeur) : méthodes et outils d'expert, données brutes, juge externe. Crée les sous-nœuds.`)}>
          Approfondir
        </Button>
        <Button key="act-wider" onPress={() => steer(`Élargis ${node.id} « ${node.title} » (Étendue) : quelles autres disciplines ? Crée une piste par discipline utile.`)}>
          Élargir
        </Button>
        <Button key="act-higher" onPress={() => steer(`Monte en altitude sur ${node.id} « ${node.title} » : quel est le but derrière ce but ? Propose la version durable.`)}>
          Altitude
        </Button>
        <Button key="act-agent" onPress={() => steer(`Lance un sous-agent pour explorer ${node.id} « ${node.title} » (mets #${node.id} dans sa description).`)}>
          Lancer un agent
        </Button>
        <Button key="act-abandon" onPress={async () => {
          await setStatus(node.id, 'abandoned')
          await steer(`J'abandonne la piste ${node.id} « ${node.title} ». Ne la poursuis pas.`)
        }}>Abandonner</Button>
      </Box>
      {others.length > 0 && (
        <Box flexDirection="column">
          <Text dimColor>Fusionner dans :</Text>
          <Box flexDirection="row" flexWrap="wrap" gap={1}>
            {others.slice(0, 8).map(o => (
              <Button key={`merge-${o.id}`} onPress={async () => {
                await save($, merge(await read($, tree), [node.id], o.id, await nowIso($)))
                await steer(`J'ai fusionné ${node.id} dans ${o.id} « ${o.title} ». Combine leurs résultats.`)
              }}>{o.id}</Button>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  )

  return (
    <Box flexDirection="column" gap={1}>
      {tabs}
      {header}
      {graph}
      {t.nodes.length === 0 && <Text dimColor>L'arbre se remplira dès que tu me confies une tâche.</Text>}
      {detail}
      {list}
    </Box>
  )
}

async function openPane($: $) {
  return $.ui.open({ id: PANE, title: 'Arbre de raisonnement' })
}

async function nowIso($: $) {
  return new Date(await $.clock.now()).toISOString()
}


export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await load($)
    await refreshGit($)
    for (const [name, description, schema] of [
      ['tree_get', "Lit l'arbre de raisonnement (objectif, nœuds, statuts, avancement).", { type: 'object' }],
      ['tree_set_goal', "Définit l'objectif racine (le but derrière le but).", {
        type: 'object', properties: { goal: { type: 'string' } }, required: ['goal'],
      }],
      ['tree_upsert', "Crée ou met à jour un nœud de l'arbre (piste Altitude/Profondeur/Étendue ou étape).", NODE_SCHEMA],
      ['tree_merge', 'Fusionne des branches : les sources deviennent "fusionnées" et parents du nœud cible.', {
        type: 'object',
        properties: { sources: { type: 'array', items: { type: 'string' } }, into: { type: 'string' } },
        required: ['sources', 'into'],
      }],
    ] as const) {
      await $.tool.register({ name, description, inputSchema: schema as Record<string, unknown> })
    }
    await $.command.register({ name: 'arbre', description: "Ouvre l'arbre de raisonnement et la vue Git" })
    void openPane($)
    return next(e)
  })

  on('command.run', { command: 'arbre' }, async $ => {
    await load($)
    await refreshGit($)
    await openPane($)
    return { text: 'Arbre de raisonnement : agis sur les nœuds ci-dessus, ou guide-moi ici.' }
  })

  on('prompt.compose', async ($, e, next) => {
    const composed = await next(e)
    const t = await read($, tree)
    return {
      sections: [
        ...composed.sections,
        { id: `${PLUGIN}:method`, text: `${METHOD}\n\nÉtat actuel de l'arbre :\n${outline(t)}`, scope: 'session' as const },
      ],
    }
  })

  // Outils appelés par Claude.
  on('tool.call', { tool: 'mcp__ambition-tree__tree_get' }, async $ => ({ result: outline(await read($, tree)) }))

  on('tool.call', { tool: 'mcp__ambition-tree__tree_set_goal' }, async ($, e) => {
    const goal = String((e as unknown as { goal?: unknown }).goal ?? '').trim()
    await save($, { ...(await read($, tree)), goal })
    return { result: `Objectif défini : ${goal}` }
  })

  on('tool.call', { tool: 'mcp__ambition-tree__tree_upsert' }, async ($, e) => {
    const raw = e as unknown as Record<string, unknown>
    const input = Object.fromEntries(Object.keys(NODE_SCHEMA.properties).filter(k => raw[k] !== undefined).map(k => [k, raw[k]]))
    if (input.status === 'validated') delete input.status
    const { tree: nextTree, node } = upsert(await read($, tree), input as never, await nowIso($))
    await save($, nextTree)
    return { result: `Nœud ${node.id} enregistré (${LENS_LABEL[node.lens]}, ${STATUS_LABEL[node.status]}).` }
  })

  on('tool.call', { tool: 'mcp__ambition-tree__tree_merge' }, async ($, e) => {
    const { sources = [], into = '' } = e as unknown as { sources?: string[]; into?: string }
    await save($, merge(await read($, tree), sources, into, await nowIso($)))
    return { result: `Fusion de ${sources.join(', ')} dans ${into}.` }
  })

  // Sous-agents : rattache l'agent au nœud cité par #id et suit son exploration.
  on('tool.call', { tool: 'Agent' }, async ($, e, next) => {
    const input = { description: e.description, prompt: e.prompt }
    const label = input.description ?? 'sous-agent'
    let id: string | undefined
    try {
      const t = await read($, tree)
      id = nodeRef(`${input.description ?? ''} ${input.prompt ?? ''}`, t)
      await update($, agents, list => [...list, label])
      if (id) await save($, upsert(t, { id, status: 'exploring', agent: label }, await nowIso($)).tree)
    } catch {
      // Le suivi visuel ne doit jamais bloquer l'agent.
    }
    try {
      return await next(e)
    } finally {
      await trackAgentEnd($, label, id).catch(() => undefined)
    }
  })

  // Actualise la vue Git après une commande git.
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const ran = await next(e)
    if (/\bgit\b/.test(e.command)) {
      await refreshGit($).catch(() => undefined)
    }
    return ran
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, ($, e) => drawTree($, e))

  // L'app mobile ne place pas de panneau : /arbre dessine l'arbre dans le fil.
  on('ui.render', { component: 'CommandOutput', props: { command: 'arbre' } }, ($, e) => drawTree($, e))
}
