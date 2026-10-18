# ambition-tree : stratégie d'adoption

Tracée dans l'arbre du plugin (nœuds n9 à n15). Horizon : 90 jours.

## Le but derrière le buzz (Altitude)

Un plugin « le plus utilisé » n'est pas le vrai but. Le vrai but : **être la personne qui a montré, avec des données, comment un humain garde la main sur des agents**. Le plugin est la preuve de cette idée. Les gens qu'Anthropic remarque ne sont pas ceux qui ont le plus d'étoiles, mais ceux qui ont rendu publique une idée dont l'équipe se dit « on aurait dû la faire ».

Conséquence : chaque action ci-dessous sert d'abord **l'idée** (garder la main sur des agents, estimer mieux à chaque projet), et ensuite seulement l'outil.

## Honnêteté sur l'objectif « Anthropic m'appelle »

Personne ne peut le garantir, et viser directement l'embauche rend le contenu moins bon. Ce qui est contrôlable : produire un travail public, mesuré et utile, dans le sujet exact que l'équipe Claude Code explore (Felix Rieseberg a publié son tutoriel le 13 octobre ; l'API de plugins est en accès anticipé, donc l'équipe cherche des retours). Être le meilleur retour terrain sur ces deux sujets est à portée.

## Ce que ferait un expert du lancement (Profondeur)

| Ce que font les amateurs | Ce que font les gens remarqués |
|---|---|
| Annoncent l'outil le jour où il compile | Annoncent quand ils ont une **preuve mesurée** |
| « Regardez mon plugin » | « Voici ce que j'ai appris en pilotant 3 agents en parallèle, données à l'appui » |
| Un post, puis silence | Une **série** : chaque semaine un apprentissage, le plugin en arrière-plan |
| Comptent les étoiles | Comptent les **issues ouvertes par d'autres** et les PR externes |

## Les cinq chantiers

### n10 : la preuve avant la promo (2 semaines)
Avant tout lancement, mener **un vrai projet** avec le plugin : 3 pistes explorées en parallèle par des agents, un juge externe par piste, estimé vs réel affiché. Résultat : une vidéo de 60 secondes, écran du panneau mobile, sans voix off marketing. C'est la pièce centrale de tout le reste. Dépend des phases 1 à 3 du plan technique (`ambition-tree-plan.md`) : sans historique et sans calibration, il n'y a rien à montrer de nouveau.

### n11 : le contenu vaut plus que le plugin (4 semaines, en parallèle)
Une série de 4 articles courts, un par semaine, publiés sur ton site et relayés sur X / LinkedIn :
1. « Pourquoi "terminé" ne veut rien dire quand un agent le dit » (le statut `review` et le juge externe).
2. « Mes estimations étaient ×1,6 trop optimistes : ce que 20 nœuds m'ont appris » (données réelles de la calibration).
3. « Piloter 3 agents comme un moteur d'échecs » (exploration parallèle, élagage).
4. « Ce que j'ai appris sur l'API de plugins de Claude Code » (retour terrain utile à l'équipe : bugs, manques, ce qui marche). **C'est l'article qui a le plus de chances d'être lu chez Anthropic.**

Chaque article contient un chiffre vérifiable et une capture du panneau.

### n12 : distribution (2 semaines, autour du lancement)
Par ordre d'impact attendu :
1. **Répondre directement au tutoriel de Felix** sur X, avec la vidéo : « j'ai pris ta méthode au mot et j'en ai fait un panneau dans Claude Code ». C'est la cible la plus précise : la personne qui a écrit la méthode, et qui dirige l'ingénierie du desktop où le panneau s'affiche.
2. Soumission au répertoire officiel des plugins Claude Code (dossier préparé en phase 6).
3. Les listes `awesome-claude-code` et équivalentes (une PR chacune).
4. Show HN, un mardi ou mercredi matin heure US, titre factuel : « Show HN: A reasoning-tree pane for Claude Code that keeps humans in control of agents ».
5. Discord / forums Claude Code, Reddit r/ClaudeAI : un post, pas du spam.
6. Un retour d'expérience en français (communautés francophones IA) : moins de concurrence, et un angle différent.

### n13 : la boucle de rétention (3 semaines, c'est le plan technique)
Le buzz amène des installs ; l'**usage** vient de ce que le plugin devient plus utile à chaque projet : l'historique (phase 2) et la calibration des estimations (phase 3). Sans ça, le plugin est un joli graphe qu'on désinstalle au bout d'une semaine. Priorité absolue avant le lancement.

### n14 : mesurer (juge externe, en continu)
Objectifs à 90 jours, mesurables :
- 500 étoiles sur le dépôt dédié.
- 10 contributeurs externes (au moins une PR fusionnée chacun).
- 20 issues ouvertes par d'autres que toi (signe d'usage réel).
- 1 mention par quelqu'un d'Anthropic (retweet, réponse, issue).
Si à 45 jours aucun indicateur n'est à la moitié, on change d'angle (pas de nouvelle fonctionnalité : nouveau contenu).

### n15 : le jour J (1 jour)
Tout est prêt avant. Le même matin : vidéo, article 1, dépôt public avec README en anglais, post en réponse à Felix, Show HN. Puis répondre à chaque commentaire dans les 24 h, et noter chaque retour dans l'arbre comme un nœud.

## Calendrier

| Semaine | Technique | Contenu / distribution |
|---|---|---|
| 1-2 | Phases 1-2 du plan (corrections, historique) | Rédaction de l'article 4 au fil des découvertes |
| 3-4 | Phase 3 (calibration) + projet de démo | Articles 1-2 rédigés, vidéo tournée |
| 5 | Phase 6 (dépôt dédié, soumission) | **Jour J** |
| 6-8 | Phases 4-5 en public, guidées par les issues | Articles 3-4 publiés, réponses, PR externes |
| 9-13 | Itérations | Bilan à 90 j avec les chiffres |

## Ce qui te revient

- Le projet de démo : choisir un vrai problème que tu veux résoudre (pas un exemple jouet). Idéalement lié à toum.ai.
- Les articles : je rédige les brouillons, tu les signes et les portes. Ta voix, pas la mienne.
- Le dépôt dédié doit être public pour tout ce qui précède.
