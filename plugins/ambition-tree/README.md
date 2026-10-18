# ambition-tree : arbre de raisonnement ambitieux et visuel

Plugin Claude Code qui applique la méthode **be-ambitious** de Felix Rieseberg (Anthropic) à chaque tâche et la rend **visible et pilotable** :

- **Arbre (graphe) de raisonnement** : un objectif racine (le but derrière le but), des pistes **Altitude / Profondeur / Étendue**, des étapes. Les branches peuvent converger (fusion) comme dans Git.
- **Panneau visuel** « Arbre de raisonnement » : graphe SVG (couleur = piste, pointillés = proposé, ✓ = validé, ⤵ = fusionné, point rouge = sous-agent en cours), avancement en %, « tu es ici », estimations de temps.
- **Pilotage graphique** : touche un nœud pour voir son résumé, « Voir le détail » pour tout, puis **Valider**, **Approfondir**, **Élargir**, **Altitude**, **Lancer un agent**, **Abandonner**, **Fusionner dans…**. Chaque action est envoyée à Claude comme une consigne `[arbre] …`.
- **Sous-agents** : un agent lancé avec `#n4` dans sa description est rattaché au nœud n4 et s'affiche en direct.
- **Onglet Branches Git** : branches, commits et fusions (`git log --graph --all`), actualisé après chaque commande git.
- **Historique** : l'arbre est enregistré dans `.ambition/tree.json` du projet, donc versionné avec le code (passé et futur visibles).

Claude remplit l'arbre via les outils `tree_set_goal`, `tree_upsert`, `tree_merge`, `tree_get`. Commande : `/arbre`.

## Installation

Dans un terminal Claude Code :

```
/plugin install ambition-tree --marketplace ImadeBenToumAI/ImadeBenToumAI
```

Depuis un shell :

```
claude plugin install ambition-tree --marketplace ImadeBenToumAI/ImadeBenToumAI
```

Dans l'app desktop : **+** à côté de la zone de saisie → **Plugins** → **Add marketplace** `ImadeBenToumAI/ImadeBenToumAI` → **Add plugin** `ambition-tree`.

Dans ce dépôt, `.claude/settings.json` active le plugin automatiquement pour toute session (cloud ou locale) ouverte sur le dépôt.

> Statut : API de plugins « function hooks » en accès anticipé de Claude Code ; elle peut changer d'une version à l'autre.

## Développement

```
claude plugin validate plugins/ambition-tree
cd plugins/ambition-tree && claude plugin test .
```
