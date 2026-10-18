# Installe la skill be-ambitious dans ~/.claude/skills (Windows).
$Url = "https://raw.githubusercontent.com/ImadeBenToumAI/ImadeBenToumAI/main/.claude/skills/be-ambitious/SKILL.md"
$Dest = Join-Path $HOME ".claude\skills\be-ambitious"
New-Item -ItemType Directory -Force -Path $Dest | Out-Null
Invoke-WebRequest -Uri $Url -OutFile (Join-Path $Dest "SKILL.md")
Write-Host "Skill be-ambitious installée dans $Dest"
