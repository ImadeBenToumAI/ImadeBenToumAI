#!/usr/bin/env bash
# Installe la skill be-ambitious dans ~/.claude/skills (macOS / Linux / cloud).
set -euo pipefail
URL="https://raw.githubusercontent.com/ImadeBenToumAI/ImadeBenToumAI/main/.claude/skills/be-ambitious/SKILL.md"
DEST="$HOME/.claude/skills/be-ambitious"
mkdir -p "$DEST"
curl -fsSL "$URL" -o "$DEST/SKILL.md"
echo "Skill be-ambitious installée dans $DEST"
