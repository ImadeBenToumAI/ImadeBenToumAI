#!/usr/bin/env python3
"""Writes the Ambiflex page of a release: python3 scripts/ambiflex-page.py <out.html>.
Reads plugins/ambiflex/hooks/page.ts (PAGE_HTML) and the version in plugin.json; prints the version."""
import json, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent / 'plugins' / 'ambiflex'
src = (root / 'hooks' / 'page.ts').read_text()
html = json.loads(src[src.index('export const PAGE_HTML = ') + len('export const PAGE_HTML = '):].strip())
version = json.loads((root / '.claude-plugin' / 'plugin.json').read_text())['version']
pathlib.Path(sys.argv[1]).write_text(html.replace('__AMBIFLEX_VERSION__', version))
print(version)
