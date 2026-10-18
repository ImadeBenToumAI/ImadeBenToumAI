export type Lens = 'goal' | 'altitude' | 'depth' | 'range' | 'step'
export type Status = 'proposed' | 'exploring' | 'done' | 'validated' | 'merged' | 'abandoned'

export type TreeNode = {
  id: string
  title: string
  lens: Lens
  status: Status
  parents: string[]
  summary?: string
  detail?: string
  estimate?: string
  agent?: string
  branch?: string
  createdAt: string
  updatedAt: string
}

export type Tree = { version: 1; goal: string; nodes: TreeNode[] }

export type Tab = 'tree' | 'git'

declare module 'claude-code' {
  interface PluginState {
    'ambition-tree': {
      tree: Tree
      selected: string
      expanded: boolean
      tab: Tab
      git: string
      agents: string[]
    }
  }
}
