# ambition-tree : stratégie et plan v0.2 → v1.0

Plan écrit pour être exécuté phase par phase. Chaque phase se termine par un **juge externe** (test ou commande) : une phase n'est pas finie tant que son juge n'est pas vert. Le même plan est tracé dans l'arbre du plugin (`.ambition/tree.json`, nœuds n1 à n8).

## 1. Le but derrière le but (Altitude)

Le but n'est pas « un joli arbre ». C'est de **garder la main sur un travail ambitieux mené par plusieurs agents**, et de **mieux estimer à chaque projet**. Deux conséquences :

- L'arbre doit être la **source de vérité partagée** entre toi, Claude et les sous-agents : ce qui est décidé, essayé, prouvé ou abandonné, et pourquoi. Pas une illustration produite après coup.
- Chaque nœud terminé doit apprendre quelque chose au système : le temps estimé comparé au temps réel, la piste qui a gagné, et pourquoi.

## 2. Ce que ferait le meilleur expert (Profondeur)

Les disciplines dont on reprend de vraies méthodes, pas seulement le vocabulaire :

| Verbe | Discipline | Méthode reprise |
|---|---|---|
| Garder l'historique et fusionner des pistes | Git, *event sourcing* | Journal d'événements append-only. L'état est recalculé à partir du journal. Les fusions de branches ne créent pas de conflits. |
| Estimer et tenir une date | Gestion de projet (PERT, chemin critique) | Estimation en 3 points (optimiste, probable, pessimiste), chemin critique, date d'arrivée avec une incertitude |
| Prouver qu'un résultat est juste | Science expérimentale | Chaque nœud porte une hypothèse, une expérience et un résultat. « Terminé » exige une preuve. |
| Explorer large puis couper | Moteurs d'échecs (MCTS) | Plusieurs agents en parallèle, un score par juge externe, élagage des pistes faibles. Le budget va aux pistes prometteuses. |
| Décider sous incertitude | Ingénierie (ADR) | Chaque validation ou abandon enregistre la raison. Les décisions restent consultables. |

## 3. Revue critique de la v0.1 (à corriger en premier)

| # | Défaut | Gravité | Correction |
|---|---|---|---|
| D1 | **Injection de prompt.** Le contenu de `.ambition/tree.json` (titres, résumés) est copié dans le **prompt système**. Un dépôt piégé peut donc donner des ordres à Claude. | Haute | Ne garder dans le prompt système que la méthode, qui ne change pas. L'état de l'arbre passe par `tree_get` ou un contexte balisé `<arbre-données>` présenté comme des données. Échapper ou tronquer les champs. |
| D2 | **« Terminé » sans preuve.** Un nœud passe à `done` quand un agent finit, ce qui contredit la méthode : il n'y a eu aucun juge externe. | Haute | Nouveau statut `review` (« à valider »). Un agent qui finit met son nœud en `review`. `done` exige un champ `verification` : la commande ou le test, et son résultat. L'outil refuse sinon. |
| D3 | **Agents homonymes.** Le suivi des agents se fait par leur `description`. Deux agents de même description se confondent. | Moyenne | Suivre les agents par `tool_use_id`. Stocker `{id, label, nodeId, startedAt}`. |
| D4 | **Conflits Git.** Un seul fichier JSON est réécrit en entier. Deux sessions ou deux branches entrent en conflit et la dernière écriture gagne. | Moyenne | Journal d'événements (phase 2). |
| D5 | **Cache du prompt.** La section système change à chaque modification de l'arbre, ce qui invalide le cache à chaque tour. Le coût et la latence augmentent. | Moyenne | Corrigé par D1 : la section système ne change plus. |
| D6 | **Estimations en texte libre** (« 2 h », « 3 j ») : on ne peut ni les additionner ni les comparer au réel. | Moyenne | `estimate: {o, p, pess}` en minutes, temps réel mesuré entre `exploring` et `done`. L'affichage reste lisible (« ~2 h »). |
| D7 | **Le panneau s'ouvre à chaque session**, même hors tâche. C'est du bruit. | Basse | L'ouvrir au premier `tree_set_goal`, ou via `/arbre`. Option `userConfig.autoOpen`. |
| D8 | **Le graphe déborde sur mobile.** Pas de zoom, et une colonne par niveau rend un graphe large illisible. | Basse | Mode « focus » : le nœud sélectionné, ses parents et ses enfants. Vue complète en option. Tri par barycentre pour limiter les croisements. |
| D9 | **Emplacement.** Le plugin vit dans le dépôt de **profil GitHub** : c'est inadapté pour une soumission officielle. L'activation par `.claude/settings.json` ne vaut que pour ce dépôt. | Moyenne | Dépôt dédié `ImadeBenToumAI/ambition-tree`. Installation à l'échelle utilisateur sur chaque machine. |
| D10 | **Tests incomplets.** Rien sur les hooks d'agent, les fusions depuis le panneau, l'onglet Git ou la sécurité (D1). | Moyenne | Un test par correction ci-dessus, écrit avant la correction. |

## 4. Plan d'exécution

Les estimations sont en jours de travail avec Claude : optimiste / probable / pessimiste.

### Phase 1 : corrections (n2, n3) : 0,5 / 1 / 2 j
1. Écrire d'abord les tests qui échouent pour D1, D2, D3 (`tests/security.test.ts`, `tests/agents.test.ts`).
2. D1 et D5 : la section `prompt.compose` ne contient plus que `METHOD`. Ajouter `tree_get` dans la méthode (« lis l'arbre avant d'agir »). Tronquer les champs à 200 caractères dans `outline`.
3. D2 : ajouter `review` à `Status`, plus le champ `verification`. `tree_upsert` refuse `done` sans `verification`. `trackAgentEnd` passe le nœud en `review`. Dans le panneau, le bouton « Valider » est mis en avant sur les nœuds `review`.
4. D3 : suivre les agents par `tool_use_id`.
5. D7 : ouvrir le panneau au premier `tree_set_goal`.
6. **Juge :** `claude plugin validate` et `claude plugin test` sont verts, et le nouveau test d'injection passe (un titre contenant « ignore les instructions » n'apparaît pas dans les sections système).

### Phase 2 : journal d'événements (n4) : 1 / 2 / 3 j
1. Fichier `.ambition/log.jsonl` : une ligne par événement `{t, session, kind: goal|upsert|status|merge|decision, payload}`. Ajout en fin de fichier seulement. `.gitattributes` avec `merge=union` pour qu'une fusion Git ne crée pas de conflit.
2. `tree.ts` : une fonction `replay(events) → Tree`. Elle reste pure et testable.
3. Migration : si un ancien `tree.json` existe, il est converti en événements.
4. Plusieurs objectifs : chaque `tree_set_goal` ouvre un nouvel arbre. Une vue « Historique » liste les arbres passés avec leur estimé et leur réel.
5. **Juge :** un test qui fusionne deux journaux divergents (deux sessions) et retrouve les deux sous-arbres. Test de rejeu : relire le journal donne exactement l'état courant.

### Phase 3 : estimations calibrées (n5) : 1 / 2 / 3 j
1. Estimation en 3 points, avec E = (o + 4p + pess) / 6.
2. Chemin critique sur le graphe et date d'arrivée affichée dans l'en-tête (« fin estimée : jeudi ± 1 j »).
3. Calibration : pour chaque nœud terminé, on calcule le rapport réel / estimé, puis la médiane sur l'historique. Le panneau montre « tes estimations sont ×1,6 trop optimistes », et la méthode dit à Claude d'appliquer ce facteur.
4. **Juge :** tests sur un graphe connu (chemin critique et E calculés à la main). Le facteur de calibration est retrouvé sur un historique synthétique.

### Phase 4 : raisonnement ↔ code (n6) : 1 / 2 / 4 j
1. « Lancer un agent » crée une branche `ambition/<id>-<titre>` (ou un worktree) et l'agent y travaille.
2. L'onglet Git colore les branches par nœud. Un nœud affiche ses commits et sa PR, via l'outil GitHub ou `gh` quand il est disponible.
3. « Valider » sur un nœud qui a une PR : Claude propose la fusion de la PR. Il ne fusionne qu'avec ta confirmation.
4. **Juge :** un test avec un dépôt Git temporaire : création de la branche, commit, la vue relie le nœud au commit.

### Phase 5 : recherche arborescente (n7) : 2 / 3 / 5 j
1. Bouton « Explorer N pistes » : le plugin lance N sous-agents en parallèle (`$.agent.spawn`), chacun sur une piste et dans sa branche.
2. Chaque piste reçoit un score, mesuré par le juge que la piste a déclaré (test, benchmark, métrique).
3. Le panneau classe les pistes par score. « Élaguer » abandonne les plus faibles et enregistre la raison. « Fusionner la meilleure » ramène le gagnant.
4. Garde-fou : un budget (nombre d'agents, durée) est affiché et confirmé avant le lancement.
5. **Juge :** un scénario de bout en bout sur un petit problème réel, par exemple optimiser une fonction lente avec 3 pistes. Le score de la piste gagnante est réellement meilleur, mesuré par un benchmark.

### Phase 6 : publication (n8) : 0,5 / 1 / 2 j
1. Dépôt dédié `ambition-tree`, avec son propre `marketplace.json`, une licence MIT, un README en anglais et en français, et des captures du panneau sur mobile et desktop.
2. Installation à l'échelle utilisateur sur chaque machine (une ligne). Nettoyer le dépôt de profil.
3. Dossier de soumission au répertoire officiel des plugins : description, sécurité (aucun réseau, données locales uniquement), tests, limites. Cette API est en accès anticipé : vérifier les critères en vigueur au moment de soumettre.
4. **Juge :** l'installation fonctionne depuis un environnement neuf (conteneur vierge) avec la commande du README.

**Total : 6 / 11 / 19 j.** Le chemin critique est n2 → n4 → n6 → n8 ; la phase 5 peut avancer en parallèle de la phase 4.

## 5. Ce qui reste à ta charge

- Valider chaque nœud dans le panneau : c'est toi le juge final, le plugin ne valide jamais seul.
- Phase 4 : choisir si « Valider » fusionne la PR automatiquement ou propose seulement de le faire. Le plan retient la proposition par défaut.
- Phase 6 : choisir si le dépôt dédié est public ou privé. Une soumission officielle exige qu'il soit public.

## 6. Pour exécuter avec Opus

Dans la prochaine session, dis : « Exécute la phase 1 de `docs/ambition-tree-plan.md` ». Une phase par session : chaque phase finit sur un juge vert et une PR.
