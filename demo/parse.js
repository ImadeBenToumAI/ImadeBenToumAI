// Deliberately naive CSV-to-objects parser: the demo problem for Ambiflex's tree search.
// Tracks compete on speedup measured by bench.js; the plugin keeps the best.
function parse(text) {
  const lines = text.split('\n').filter(l => l.length > 0)
  const header = lines[0].split(',')
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    let obj = {}
    const cells = lines[i].split(',')
    for (let j = 0; j < header.length; j++) {
      obj = { ...obj, [header[j].trim()]: cells[j] === undefined ? '' : cells[j].trim() }
    }
    rows.push(obj)
  }
  return rows
}
module.exports = { parse }
