export type Lens = 'goal' | 'altitude' | 'depth' | 'range' | 'step'
export type Status = 'proposed' | 'exploring' | 'review' | 'done' | 'validated' | 'merged' | 'abandoned'

export type TreeNode = {
  id: string
  title: string
  lens: Lens
  status: Status
  parents: string[]
  summary?: string
  detail?: string
  /** Estimated effort, e.g. "30min", "2h", "3d", "1w". */
  estimate?: string
  /** External judge that confirmed the result (test, command, metric). Required for `done`. */
  verification?: string
  agent?: string
  branch?: string
  startedAt?: string
  finishedAt?: string
  createdAt: string
  updatedAt: string
}

export type Auto = {
  on: boolean
  startedAt?: string
  turns: number
  maxTurns: number
}

export type Tree = { version: 1; goal: string; nodes: TreeNode[]; auto: Auto }

export type Tab = 'tree' | 'git'

declare module 'claude-code' {
  interface PluginState {
    ambiflex: {
      tree: Tree
      selected: string
      expanded: boolean
      tab: Tab
      git: string
      agents: string[]
    }
  }
}
