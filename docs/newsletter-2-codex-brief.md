# Brief pour Codex : édition 2 de la newsletter LinkedIn

> **Rôle de Codex.** Tu rédiges, mets en forme et publies l'édition 2 de la newsletter LinkedIn d'Imade Ben Toum, ainsi que le post qui l'accompagne. Ce fichier contient le contexte, les faits vérifiés, le plan, les règles et la liste de contrôle. Ne rien inventer : chaque chiffre et chaque fonctionnalité citée doit venir de ce fichier ou du dépôt.

## 1. Le but de l'édition

**Sujet.** Comment Imade accélère et garde la main sur des agents de code en leur donnant des objectifs, plutôt que des tâches. Il ne s'agit pas d'un prompt magique, mais d'un cadre :
- un arbre de raisonnement ;
- des preuves exigées avant de dire « fini » ;
- une relecture indépendante ;
- une reprise d'une session à l'autre ;
- une seule fenêtre pour ce qui attend sa décision.

**Format.** Un tutoriel concret. Le lecteur doit pouvoir refaire l'exemple dans Claude Code en 15 minutes avec Ambiflex, le plugin open source qu'Imade a construit pour appliquer cette méthode.

**Ce que l'édition doit déclencher**, par ordre de priorité :
1. **Un retour d'usage** : « dites-moi si vous l'utilisez, et sur quoi ». C'est l'indicateur du but : au moins 10 personnes ou équipes extérieures qui confirment un usage hebdomadaire entre le 13 et le 19 novembre.
2. **Une étoile** sur le dépôt.
3. **Un fork, un ticket ou une pull request.**

Écrire l'appel à l'action pour ces trois gestes, dans cet ordre.

**Date de publication.** Cette semaine, idéalement lundi 26 octobre 2026, entre 8 h et 10 h, heure de Paris.

**Langue.** Celle de l'édition 1 telle qu'elle a été publiée sur la newsletter d'Imade (la vérifier sur LinkedIn). Si elle est ambiguë, écrire en français. Le post d'accompagnement suit la même langue.

**Remarque sur le calendrier.** Le kit `docs/linkedin-kit.md` prévoyait pour le 26 octobre l'article 2, sur les estimations. Imade a choisi ce nouveau sujet pour cette édition. L'article 2 glisse d'une semaine : mettre à jour le « La semaine prochaine : … » de fin en conséquence.

## 2. La source d'inspiration

Imade a partagé des captures d'écran de la présentation d'un ingénieur d'Anthropic sur la manière de cadrer le comportement des agents. **Demande-les à Imade** avant d'écrire : elles ne sont pas dans le dépôt. Reprends-en la logique, cite l'auteur par son nom et son rôle exacts tels qu'ils apparaissent sur les captures, et ne lui prête aucune phrase qui n'y figure pas.

Deux sources publiques sont déjà intégrées à Ambiflex et peuvent être citées :

- **Felix Rieseberg (Anthropic), « How to be more ambitious: A tutorial for humans with models »** : https://felixrieseberg.com/how-to-be-more-ambitious-a-tutorial-for-humans-with-models/. Trois leviers :
  - **Altitude** : viser le résultat durable, pas la tâche.
  - **Profondeur** : travailler comme le meilleur expert, avec ses vrais outils, et un juge externe plutôt que l'auto-évaluation.
  - **Étendue** : mobiliser d'autres disciplines, en pensant en verbes plutôt qu'en noms.

  Résumé fidèle dans `.claude/skills/be-ambitious/SKILL.md`.
- **Le « harness » en 7 couches pour les tâches longues**, un article de @beamnxw sur X (6 octobre 2026). Son idée : une tâche longue doit laisser trois choses :
  - un résultat qu'on peut ouvrir ;
  - des preuves qu'on peut inspecter ;
  - assez de progression sauvegardée pour reprendre demain.

  Ambiflex 0.27 en a repris trois mécanismes (voir le §3).

## 3. Les faits vérifiés (ne citer que ceux-ci)

Dépôt public : https://github.com/ImadeBenToumAI/ambiflex. Licence MIT. Dernière version publiée : **0.28.1** (25 octobre 2026).

Installation dans Claude Code, telle que l'indique le README du dépôt :
```
/plugin install ambiflex --marketplace ImadeBenToumAI/ambiflex
```
**À revérifier** dans le README du dépôt le jour de la publication.

### Ce que fait Ambiflex

| Mécanisme | Ce qui se passe | Depuis |
|---|---|---|
| **Arbre de raisonnement** | Chaque demande devient un but et des pistes Altitude, Profondeur et Étendue, avec une estimation. Les étapes concrètes sont des nœuds. | 0.1 |
| **« Fini » exige une preuve** | Un nœud ne passe pas à `done` sans le test, la commande ou la métrique qui le prouve. Sans preuve, il reste « à revoir ». Seul l'humain valide. | 0.4 |
| **Relecteur à preuves** | Un sous-agent en lecture seule (`ambiflex-reviewer`) ouvre les fichiers et relance les vérifications. Il rend une ligne par affirmation : confirmée, fausse avec la correction, ou non tranchée avec la preuve manquante. En mode auto, un nœud n'est fini qu'avec ce tableau. | 0.27.0 |
| **Note de passation** | Chaque nœud garde où reprendre : fichiers, vérifications faites, questions ouvertes, prochaine action. Une nouvelle session repart de là au lieu de recommencer. | 0.27.0 |
| **Zone d'écriture** | Un nœud peut limiter ses écritures à des dossiers précis (`drafts/**`). Une écriture en dehors est refusée par le plugin, pas seulement interdite dans le prompt. | 0.27.0 |
| **Mode auto** | Le plugin enchaîne les nœuds tout seul, avec un budget de tours, et lance en parallèle ceux qui sont indépendants (un sous-agent par nœud, chacun sur sa branche Git). | 0.17 à 0.22 |
| **Page en direct** | Une page privée sur claude.ai montre l'arbre, ce que fait chaque agent, les tâches de fond et leur heure de fin, Git, l'usage et le coût. Un double-clic sur un nœud ouvre un chat avec Claude. | 0.4 à 0.24 |
| **Fenêtre « Waiting for you »** | Tout ce qui attend la décision de l'humain (plan, revue de stratégie, nœuds à revoir, nœuds bloqués) dans une seule fenêtre, avec un champ de réponse par élément. Elle s'ouvre d'elle-même et le bouton Inbox la rouvre. | 0.28.0 |
| **Hub** | Une page qui regroupe tous les projets et leurs alertes. | 0.23 |
| **Onglet Archi** | La carte de l'infrastructure (GCP, AWS, Azure), avec les icônes officielles des fournisseurs, les flux, les risques, et les IP masquées par défaut. | 0.26 à 0.27.2 |
| **Prendre de la hauteur** | Le modèle le plus fort relit tout le plan et propose des changements. L'humain les accepte ou les refuse. | 0.15 |
| **Vie privée** | Rien ne sort de la machine par défaut. Le comptage d'installations est à activer soi-même. | 0.25.0 |

### Chiffres réels (traçables, déjà publiés dans les articles du dépôt)

- **Calibration** : une tâche estimée à « 2 jours » a été finie par l'agent en environ 10 minutes, soit un facteur de 0,01 (`docs/articles/02-my-estimates-ran-100x-optimistic.md`).
- **Recherche en arbre** : trois agents en parallèle sur un même parseur. Scores annoncés 3,15 / 6,66 / 7,3, mesurés à nouveau par Imade 2,95 / 4,41 / 7,24. Même classement, et le gagnant passe de 334 ms à 44 ms (`docs/articles/03-three-agents-like-a-chess-engine.md`).
- **Relecteur** : dans un essai réel, sur l'affirmation « add(2,2) renvoie 5 », le relecteur a ouvert le code, l'a exécuté et a répondu « fausse, c'est 4 ». Exemple jouet, à présenter comme tel.
- **Rythme** : 63 versions publiées sur GitHub entre le 20 et le 25 octobre 2026 (0.5.0 à 0.28.1). Chacune est passée par la suite de tests automatisés avant publication (102 tests en 0.28.1).

### Ce qu'il ne faut PAS écrire

- **Aucun chiffre d'adoption** : ni nombre d'installations, ni de clones, ni d'utilisateurs. Le dépôt a 1 étoile, et les clones GitHub sont gonflés par les sessions d'Imade et par des robots.
- **Aucune promesse** du type « 10x plus productif » ou « zéro bug ».
- **Aucun partenariat ni soutien d'Anthropic.** Ambiflex est un projet personnel construit sur l'API de plugins de Claude Code.
- **Aucune anecdote inventée.** L'anecdote d'ouverture vient d'Imade (voir le §6).

## 4. Le plan proposé (à ajuster au ton d'Imade)

**Titre** (moins de 100 caractères), au choix :
- « Je ne donne plus de tâches à mes agents. Je leur donne des objectifs. »
- « Comment je garde la main sur des agents qui codent plus vite que moi »

**Sous-titre** : « Un tutoriel en 15 minutes, avec le plugin open source que j'utilise chaque jour. »

1. **Ouverture (3 à 4 phrases).** L'anecdote d'Imade (§6), puis le constat : un agent va plus vite que nous, le problème n'est plus la vitesse mais le contrôle. Il faut savoir ce qui est vraiment fini, ce qui attend notre décision, et où reprendre demain.
2. **L'idée (1 paragraphe).** Viser le résultat plutôt que la tâche, exiger une preuve, et faire relire par quelqu'un d'autre que l'agent qui a travaillé. Citer l'ingénieur d'Anthropic des captures et Felix Rieseberg.
3. **Le tutoriel, en 5 étapes**, chacune avec une capture :
   1. **Installer** (2 lignes de commande) et ouvrir la page : `/ambiflex page`.
   2. **Donner un objectif, pas une tâche.** Exemple : « Mon API de paiement répond en moins de 200 ms au 95e centile » au lieu de « optimise cette requête ». Claude construit l'arbre : une piste Altitude (surveiller la latence en continu), une piste Profondeur (profiler sur de vraies traces, avec un benchmark comme juge), une piste Étendue (relire avec les yeux d'un SRE). Capture : `assets/launch/02-tree.png`.
   3. **Lancer en auto** (« Run on auto ») et regarder les agents travailler en parallèle, chacun sur sa branche. Capture : `assets/launch/08-auto.png`.
   4. **La preuve avant le « fini ».** Un nœud sans preuve reste « à revoir ». En mode auto, le relecteur ouvre les fichiers et relance les tests. Montrer une ligne « fausse » et sa correction. Capture : `assets/launch/04-proof.png`, ou une capture de la fiche d'un nœud avec ses preuves (version 0.27.1 ou plus).
   5. **Ne rater aucune décision.** La fenêtre « Waiting for you » regroupe ce qui attend l'humain, et on y répond à Claude directement. Le lendemain, la note de passation permet de reprendre où on en était. Capture à faire sur la page d'un vrai projet (§6).
4. **Ce que ça a changé, en chiffres (court).** La calibration à 0,01, la recherche en arbre (334 ms à 44 ms), et une phrase sur le fait de réécouter, re-mesurer et revalider soi-même.
5. **Les limites, honnêtement (3 lignes).**
   - Le relecteur coûte un appel de sous-agent de plus par nœud.
   - Un objectif vague ne marche pas.
   - La zone d'écriture bloque les outils d'édition de fichiers, pas un script arbitraire.
6. **Appel à l'action** (§5).

**Longueur cible** : 900 à 1 300 mots.

**Contraintes de l'éditeur LinkedIn** : il accepte les titres, le gras, l'italique, les listes, les liens et les images. Il n'a ni tableau ni bloc de code. Les commandes s'écrivent en texte simple, et un tableau se convertit en liste.

## 5. L'appel à l'action (dernier bloc, à reprendre presque tel quel)

> Ambiflex est open source (MIT) : github.com/ImadeBenToumAI/ambiflex
> Installation dans Claude Code : /plugin install ambiflex --marketplace ImadeBenToumAI/ambiflex
>
> Trois choses m'aideraient vraiment :
> 1. Si vous l'essayez, dites-le-moi en commentaire ou dans un ticket GitHub, avec le projet sur lequel vous l'utilisez. C'est le seul chiffre que je suis.
> 2. Si l'idée vous parle, une étoile sur le dépôt aide d'autres personnes à le trouver.
> 3. Une idée ou un bug : ouvrez un ticket, ou forkez et proposez une pull request. Je relis tout.
>
> La semaine prochaine : pourquoi mes estimations étaient fausses d'un facteur 100, dans le mauvais sens.

## 6. Ce qu'il faut demander à Imade avant d'écrire

1. **Les captures** de la présentation de l'ingénieur d'Anthropic, avec son nom exact.
2. **L'anecdote d'ouverture** : 2 ou 3 phrases vécues. Par exemple, un agent qui a dit « fini » sur holisticx-pay alors que ce n'était pas le cas. Si Imade n'en donne pas, laisser `[Ton anecdote ici]` et ne rien inventer.
3. **Deux captures fraîches** de ses vraies pages (version 0.28.1) : la fenêtre « Waiting for you » et la fiche d'un nœud avec ses preuves. Sans elles, utiliser les images de `assets/launch/` et ne pas montrer de fonctionnalité sans capture.
4. **Sa signature** habituelle.

## 7. Le post d'accompagnement (le même matin)

En 6 à 8 lignes, dans le ton d'Imade :
- Accroche sur le passage de la tâche à l'objectif, avec un chiffre réel du §3.
- Une phrase sur la preuve avant le « fini ».
- « Tutoriel complet dans l'édition de cette semaine. Lien en premier commentaire. »

Mots-clés à la fin du post, pas dans la newsletter : #ClaudeCode #AIAgents #OpenSource #DeveloperTools

**Premier commentaire** : le lien de l'édition, puis la commande d'installation.

**Mentions** : Felix Rieseberg ne doit être identifié qu'une fois, et seulement si la citation est exacte. L'ingénieur d'Anthropic des captures ne doit l'être que si Imade est d'accord.

## 8. La liste de contrôle avant de publier

- [ ] Chaque chiffre vient du §3 ou d'un fichier du dépôt cité.
- [ ] Aucun chiffre d'adoption, aucune promesse de productivité, aucun soutien d'Anthropic sous-entendu.
- [ ] La commande d'installation est vérifiée dans le README du dépôt, le jour même.
- [ ] Les liens s'ouvrent (dépôt, article de Felix Rieseberg).
- [ ] L'anecdote et la signature viennent d'Imade.
- [ ] Les captures montrent des fonctionnalités réelles de la version publiée, sans donnée sensible (pas d'IP, de nom de client ou de clé). Sur l'onglet Archi, garder les valeurs masquées.
- [ ] Le « La semaine prochaine » annonce bien l'article 2.
- [ ] Imade a relu le texte final avant publication, sauf s'il t'a explicitement dit de publier sans relecture.

## 9. Après la publication

- Répondre aux commentaires dans les 24 h, dans le ton d'Imade.
- Chaque personne qui dit utiliser Ambiflex est notée dans `docs/adoption.md`, colonne « confirmations », avec la date et le lien du commentaire. C'est le compteur du but.
- Les retours substantiels deviennent des tickets GitHub, avec l'accord de leur auteur.
