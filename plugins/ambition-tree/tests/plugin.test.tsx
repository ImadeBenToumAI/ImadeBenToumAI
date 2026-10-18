import { expect, mock, test } from 'claude-code/testing'

for (const surface of ['mobile', 'desktop'] as const) {
  test(`outils + panneau sur ${surface}`, async ($, on) => {
    mock.clock(on)
    const files = new Map<string, string>()
    on('fs.write', async (_$, e) => { files.set(e.path, e.text); return { value: undefined } as never })
    await $.tool.call({ tool: 'mcp__ambition-tree__tree_set_goal', goal: 'Lancer le plugin' } as never)
    await $.tool.call({ tool: 'mcp__ambition-tree__tree_upsert', title: 'Altitude', lens: 'altitude', estimate: '1 j' } as never)
    const got = await $.tool.call({ tool: 'mcp__ambition-tree__tree_get' } as never)
    expect(String((got as { result?: unknown }).result)).toContain('n1 [Altitude')

    const ui = await $.ui.mount({ plugin: 'ambition-tree', surface, component: 'Pane', props: {}, requestId: 'ambition-tree', viewport: { columns: 100, rows: 40 } } as never)
    expect(await ui.find({ text: /Lancer le plugin/ })).toBeTruthy()
    await ui.press({ key: 'node-n1' } as never)
    expect(await ui.find({ key: 'act-validate' })).toBeTruthy()
    expect([...files].find(([p]) => p.endsWith('.ambition/tree.json'))?.[1]).toContain('Altitude')
  })
}

test('/arbre dessine l\'arbre dans le fil sur mobile', async ($, on) => {
  mock.clock(on)
  on('fs.write', async () => ({ value: undefined }) as never)
  await $.tool.call({ tool: 'mcp__ambition-tree__tree_set_goal', goal: 'Mobile' } as never)
  await $.tool.call({ tool: 'mcp__ambition-tree__tree_upsert', title: 'Piste', lens: 'depth' } as never)
  const ui = await $.ui.mount({
    plugin: 'ambition-tree', surface: 'mobile', component: 'CommandOutput',
    props: { command: 'arbre', args: '', text: '', isErrored: false }, viewport: { columns: 40, rows: 60 },
  } as never)
  expect(await ui.find({ type: 'Svg' })).toBeTruthy()
  expect(await ui.find({ key: 'node-n1' })).toBeTruthy()
})
