# Ambiflex launch film: narration script (English, 75 s)

Desktop, dark mode, 1920×1080. One calm voice, no music under the voice (a low bed is fine under shots 1 and 9). Each shot lists what is on screen, the narration, and the timecode the subtitle file follows. Read at a natural pace: about 150 words a minute.

| # | Time | On screen | Narration |
|---|---|---|---|
| 1 | 0:00–0:07 | Dark panel. The whole tree, top-down, 19 nodes. Slow push-in. | "This is a plan Claude Code executed on its own. Nineteen nodes. One evening." |
| 2 | 0:07–0:15 | Zoom to the top: goal node and the three tracks under it, colour-coded. | "It follows Felix Rieseberg's method: altitude, depth, range. The goal behind the goal, what the best expert would do, which other disciplines would help." |
| 3 | 0:15–0:24 | Node n7 opens. The verification line is highlighted. | "A node is not done because the model says so. It needs a proof: the test, the command, the metric. Without one, it waits for review. Only I can validate." |
| 4 | 0:24–0:34 | Node n16 opens: three tracks, three scores. | "Here it ran a tree search: three agents, three ways to speed up a parser, each in its own branch, scored by the same benchmark." |
| 5 | 0:34–0:42 | Terminal: the benchmark on the merged code. SCORE 7.38 lands. | "The agents reported their scores. Then I ran the benchmark myself. Three hundred and thirty-four milliseconds down to forty-four." |
| 6 | 0:42–0:50 | Header: cost line, ETA, expected end, calibration. | "Cost and time are on screen before and during, not after. Estimates are calibrated against real timings: this model finishes a two-day node in about ten minutes." |
| 7 | 0:50–0:58 | Terminal: the plugin's hand-over line, then the next node starts. | "In auto mode, after each turn, the plugin hands Claude the next open node. No approval needed, until it hits a budget, a turn limit, or a decision that is mine." |
| 8 | 0:58–1:06 | Node n11 opens; the Validate button is pressed; toast "Sent to Claude". | "And I steer from anywhere. Validate, go deeper, go wider, prune. Each tap is an instruction Claude acts on." |
| 9 | 1:06–1:15 | Install line, repository, title card "Ambiflex". | "Ambiflex. Open source, one line to install. Built in one evening, for fifty-seven dollars, by the plan it was running." |

Word count: about 190. At 150 wpm that is 76 seconds; the cut has room.

## Subtitles

`assets/launch/ambiflex-desktop.srt` carries the same text, cue by cue, at the timecodes above. Burn them in only for the muted version; keep them as a separate file when the voice is on.

## Voice

Generate the narration from the right-hand column, one audio file, with a neutral, unhurried English voice (ElevenLabs, OpenAI TTS, or any studio voice). Drop the file at `assets/launch/narration.mp3` and run:

```
node tools/launch-video/mux.js
```

The cut itself is already rendered (`assets/launch/ambiflex-desktop.mp4`). `mux.js` lays the narration over it, pads or trims to the cue times, and writes `assets/launch/ambiflex-desktop-voiced.mp4`.
