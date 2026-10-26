---
name: design-screens
description: Use when designing, building, or changing a product screen, flow, or component in Figma — new screens, states, lo-fi or hi-fi prototypes, redesigns, or edits to already-approved work. Load it alongside figma-generate-design or figma-use, never instead of them: those cover the API, this covers the process. Also use, for its UX rules and checks, when a product screen is built directly in code with no Figma step. Use when a design result was rejected, when a screen must match an existing product, or when starting design on a product with no visual direction yet. Not for auditing or documenting an existing design system without changing screens — that is audit-design-system.
---

# Figma Design Screens

## Overview

The process is universal. Everything product-specific is discovered in the project, never assumed.

First action, every time: read `<project>/.claude/design.md`. No file → follow `references/setup.md`.
If its first line is `# Design — index`, the repository holds several products: match the task to one row
of the index — by the Figma file key in the request first, then by the row's task markers. Exactly one
match → the product file it names (`design/<slug>.md`) is `design.md` for the rest of this run. Zero or
more than one → ask which product in a single line and wait. Format of the index: `references/state.md`.

Second action, before any read or write in Figma: make sure you have a link to the frame or page the
task is about. No link in the request and none recorded in `design.md` → ask for one in a single
line and wait. Guessing which file and page the user means is the most expensive mistake available
here: everything after it is built in the wrong place.

A from-scratch product has no file yet, and that is not an exemption from the rule — it is the case
where the answer is "a new file". Say where it will be created (which plan, drafts or a named
project) in the same message as the first phase, before any typography or palette is proposed; the
user should never have to ask "where are you going to draw this?" after the direction is agreed.

| Project state | Where style comes from | Skipped |
|---|---|---|
| Design system exists | the design system is law | direction, typography, palette phases |
| No design system, screens exist | existing screens in Figma | same |
| Neither | external references, curated by the user | nothing |

**No Figma: the screen is built straight in code.** The Figma steps do not run. No frame link, no screens drawn first in another medium, unless the user asks for mockups in words. What still runs: `design.md` is read first and decisions are written back to it. Before a screen's code is written, read the `references/ux-rules.md` rows that match its content, plus `ux/principles.md` when the screen is new or was rejected. Before the user sees the screen, the four checks from `references/checks.md` run on the running build, against the DOM and a screenshot at each width, by a reader that did not write the code.

## Improving a product that already ships

When the task is to fix a live product rather than add screens to it, the current interface is captured and audited **before** anything is redrawn — `references/audit-existing.md`. That audit is what every later claim of "this is better" gets measured against, so a wrong note there becomes a wrong screen two phases on: on a 64-note audit one note in four was wrong on the first pass, and the errors were in the retelling, not in the observation.

Skipping the audit doesn't remove the phase, it relocates it — without a recorded defect you end up arguing whether the old screen was broken at all, with no evidence on either side.

## Default: one screen

Default deliverable: **one screen, done right.** Variants are produced only when (1) the user asked in words, (2) the product has no chosen direction yet and this is discovery, or (3) you see a genuine fork — then you ask in one line and do not decide for the user.

When there is one screen, uncertainty cannot be absorbed by quantity. If the brief contains a fork you would have to resolve on the user's behalf, name it to the user in one line **before** building.

## Talking to the user

A message with more than one request gets a numbered list back before any build: each item says in plain words what will change, on which screen, and how you read it. Clear items go ahead; only an item with two possible readings waits for an answer.

A proposal is described the way the user will see it, not in build terms: the screen, the element, what it looks like and does now, and what it will look like and do after, a sentence each. Node ids, component names and internal labels appear only if the user used them first. When the proposal changes behaviour, write the difference as "now: … → after: …". A proposal the user misread costs a full round: the misreading surfaces only once the build is on the screen. Short is fine; the before → after is what has to be there.

## Session length

Every step re-reads the whole session, and a compacted session loses detail: decisions, the user's hand edits, what was agreed. Keep sessions to one block of work and make restarting cheap.

- **Work that won't fit one session is planned per session.** With `superpowers` installed, its `writing-plans` makes the plan file: tasks sized so each session closes its own, checked off as they land. Without it, the same task list lives under "In progress" in `design.md`. Tell the user the split in one line: "this is three sessions: 1) …, 2) …, 3) …".
- **A compaction is the signal to restart.** When the session shows the host's note that it continues from a previous conversation that ran out of context (Claude Code: "This session is being continued from a previous conversation…"), say in one line that the context was compacted and details may be lost, and offer a new session with the start line below.
- **The start line** names the task and three sources: `design.md`, the plan file if there is one, and the digest of this session — the user's messages verbatim and the agent's last reply to each, from the host's session log. Get this session's id with `python3 <this skill's folder>/scripts/session-digest.py --current-id`, then write: "Continue <task>. Read `<project>/.claude/design.md`, <plan path>, and `python3 <this skill's folder>/scripts/session-digest.py <id>`."

The digest reads Claude Code's logs in `~/.claude/projects`. In another host it finds nothing; there the new session starts from `design.md` and the plan alone.

## Minimum skill stack

Every designer agent loads `figma-use` (mandatory before any `use_figma` call — the Figma plugin
skill in Claude Code, or the MCP resource `skill://figma/figma-use/SKILL.md` in other agents) and
`figma-plugin-api-rules`. On top of those: exactly **one** visual skill, matched to the task type —
never the whole shelf, because more lenses on one task dilute focus rather than adding rigour.
A screen with any copy also loads `writing-texts` from this pack before its first text is written,
and every brief to a designer agent names it. It is not a visual skill and does not count against
the one-lens limit.

**Look before you load.** Read the list of skills available in this session, then match by task
type. Names worth looking for, by role:

| Task type | Skill names to look for |
|---|---|
| Mobile screens | `mobile-app-ui-design` |
| Web, landing pages, dashboards | `frontend-design`, `impeccable` |
| Motion, transitions | `design-motion-principles`, `emil-design-eng` |
| Charts, stats, data-heavy screens | `dataviz` |

These belong to other authors and are not part of this pack. The table is a hint for the search,
not a contract: a name that is not on this session's shelf does not exist for you. Load the one you
actually found, and only it — never a plausible-sounding substitute you haven't seen listed, and
never install anything to get one.

The shelf is the skill list this session shows, not a skills folder on disk. A folder can hold a
skill that the settings disable. If the chosen name fails to load, load the next name in the same
row before the first screen is built. The lens shapes the build. It is not a pass added after the
user has seen the screen.

**Nothing found — carry on without it.** Say so in one line, then work from what this skill already
gives you: the design system, the existing screens, the references recorded in `design.md`, the copy
and control rules routed by `references/ux-rules.md`, and the four checks in `references/checks.md`. A
missing visual skill costs an extra lens on composition, not the process.

## Working a screen

| Step | What happens |
|---|---|
| 1 | Gather the style source: `design.md`, the design system, existing screens, or references |
| 2 | Write the brief, check it against `references/briefs.md`; carry into it the rules in force for this screen — `references/ux-rules.md` routes to them by what the screen contains |
| 3 | Agent builds: intent in words, then Figma, then self-critique and a revision pass |
| 4 | Four checks from `references/checks.md`, before the user sees it — the Accuracy pass re-reads the same rules as criteria |
| 5 | Show the user |
| 6 | User hand-finishes it; the resulting screenshot becomes the saved one |

Step 6 is the norm, not an exception — expect the user to finish the screen by hand.

Lay the page out per `references/canvas.md` from the first screen. The working page holds only what is in play, in sections: the current product, the proposal, its states. Section names are the headers; no floating text labels. A variant the person rejected leaves the working page in the turn the choice is made. Read before the link goes out: no top-level node on the page other than a section, and no overlaps inside a section.

The steps hold when the main agent builds the screen itself, with no designer agent. The brief is still written: it is the list Completeness counts against, and it carries the rules in force. Step 4 is still a separate read-only critic. The message that shows a screen carries the critic's verdict line (mode row, SHOW); a message without it is a progress note and says "not checked yet" in its first line.

A brief must point to a source to clone, not describe anatomy: a cloned node guarantees identical spacing, styles, and bindings; a text description invites the agent to author from scratch, and that drifts.

A block that appears on more than one frame becomes a component before the second copy is placed, and every later change to it goes to the master. Frame-by-frame edits to copies drift apart in text style, spacing and order within a few rounds, and the user is the one who finds the drift.

## Agent lifetime

Every step an agent takes re-reads its whole context, so its cost grows with its age, not with its work. On one capture-and-redesign project, 72 agents ran up to 236 steps and 520k tokens of context. Restarting each at 150k would have halved the 808M tokens they read, for the same work.

| Rule | What it looks like |
|---|---|
| One dispatch, one task | One screen, one block, or one mechanic batch. |
| A fix round is a new dispatch | The user's feedback goes to a fresh agent with a handback. It is not sent as a message to the agent that built the previous round. |
| Handback, not history | What was built, node ids, what to change, the user's words verbatim. No screenshots, no build log. |
| The brief carries only this task | The template blocks and the rules for this screen. Base briefs are not attached "to read whole". |
| References are read once | One agent looks at the reference images and writes into `design.md` what to take from them. Builders get that text, not the images. |

## Editing an approved screen

Edit **one element at a time** — never a batch of fixes applied together.

Before writing to a screen the user has already seen, read the nodes you are about to change and compare them with your last read. A difference you didn't make is the user's hand edit: it is the approved state now. Leave it and ask about it in one line; never write over it.

A visual difference from grid, alignment, or component convention can look exactly like "an identifiable defect against an existing standard" and still be the product's own signature trait, not a lag behind one. Without the signature-traits list and the saved screenshot in `design.md` (format: `references/state.md`) in front of you, you cannot tell which — and it isn't your call to make from the visual alone.

If `design.md` is missing, has no signature-traits section, or has no saved screenshot of this screen, that absence **blocks** changing the screen's visual properties — it does not clear you to change them. An empty or missing list means the constraints are unknown, not that there are none. Ask the user about the specific property in one line, or fill the list first.

You already refuse to silently rewrite approved copy under cover of a UI fix. Extend that same caution to geometry, radii, and control shape: treat them as product decisions until the signature-traits list says otherwise.

A property the user didn't name is not part of the request. "Make active elements distinguishable" is not a mandate to touch radius, control shape, spacing, or alignment — solve it with a change that leaves unnamed properties alone. If you believe an unnamed property genuinely has to change to solve the task, that belief is the trigger to ask in one line before touching it, not a reason to treat it as already in scope.

"Confirming element by element burns the window" undercounts the other side: a batch that turns out wrong can't be partly kept — it all reverts to the saved screenshot, costing the window plus the rework. Check each change against the screenshot and the signature-traits list before applying it, one element at a time.

## Models

| Task type | Model tier |
|---|---|
| Composition, critique, synthesis | the strongest reasoning model available to the host |
| Mechanics: variables, text styles, clones, renames, moves | a cheaper, faster model — no design judgment is involved |

Model names differ per host (Claude Code, Codex, others); pick by tier, not by name.

If the model you need is unavailable — limit, outage, missing access — stop and ask before switching, not after. Disclosing a swap once it's done isn't the same as asking first: by the time there's something to disclose, the hour is already spent on the wrong tool.

The output of a mismatched model is not a reversible draft. It isn't low-stakes because it "can be regenerated or touched up later" — regenerating is redoing the work, and a touch-up can't fix a composition built against the wrong design system.

"The user said to keep going" authorised the work, not the downgrade. Someone stepping away for an hour approved continued progress on the task, not on a weaker tool — the moment the model becomes unavailable is exactly when to interrupt, not push through.

The same rule covers any other condition swapped mid-task — a hung Figma bridge, an agent cut off by a limit, a missing tool: say so immediately, before the result comes back rejected.

## Common Mistakes

| Situation | What happened | Why it failed |
|---|---|---|
| Editing an approved screen | Six textbook-correct fixes classified as "defects against an existing standard," applied in one pass | One was a signature trait, not a defect; the batch was rejected and reverted from the saved screenshot |
| Model unavailable | Switched to a weaker model silently, calling it "low-stakes and reversible... touched up later" | Nothing was touched up; every result of that phase was rejected outright |
| Redesigning an audited flow | Three frames documented defects of a modal date picker; the fix replaced the picker entirely, and the frames were about to be filled with the calendar anyway | The defect's object no longer existed — the frames had to be reassigned to the new states, not populated with a control nobody would build |
| Writing a value list | Country list written from memory into the mockup | Two of the countries had no flag in the design system and one was named differently — invisible in the mockup, a missing asset at build time |
| A decision was reversed | The screen was changed, the note under it was not | A mockup whose own caption praises the state it no longer has is worse than an uncaptioned one — search the notes for the decision's keywords whenever it flips |
| Showing a screen | The builder glanced at its own screenshot and posted the link; no critic, no checks | The screenshot was a stale render: the user's first-round rejection named two defects — clipped shadows and a busy background — that the Accuracy and Product style checks exist to catch, and a later "fix" was made against the stale frame and broke a title that had been correct |
| Saving the reference frame | The screenshot disagreed with the readback (34px in the file, small on the frame) and was saved to `design-shots/` anyway | Every later comparison ran against the cache, not the file; the saved frame has to agree with a Read of one changed property before it becomes the reference |

## Red Flags — stop

- "These are identifiable defects against an existing standard" — you don't have the signature-traits list open, so you can't actually judge that.
- "Confirming element by element burns the window" — a reverted batch costs more than asking would have.
- "It's low-stakes and reversible, can be regenerated or touched up later" — that's the sentence that precedes a full rejected day.
- "The user already said to proceed" — proceeding was authorised, the downgrade wasn't.
- "There's no signature-traits list, so nothing's off-limits" or "this property is basically part of what they asked for" — empty means unknown, not unrestricted, and unnamed means not requested.
- "The note says so" — a quarter of the audit notes were wrong on the first pass, and they were written by you. Re-read the note against the screen before designing to it.
- "Nothing found on the re-read" — on a set over ~20 notes, an empty result is a claim about your re-read, not about the notes.
- "The defect is recorded, so this frame needs that control drawn" — check whether your fix removed the object the defect lived on. If it did, the frame is reassigned, not filled.
- "I looked at the screenshot myself, that's the check" — the builder looking at its own work is step 3's revision pass, not step 4. The four checks run as a separate read-only pass, against node properties, before the link goes out.
- "The link is ready, I'll show it and check while they look" — the verdict comes first. A screen shown before SHOW gets rejected for what the checks would have listed, and the rejection costs the round.
- "I'll say in the message that it isn't checked" — a disclaimer does not replace step 4. The user's review is not the critic. A same-day deadline shortens the brief, not the checks: the critic runs before the link goes out.
- "This agent already knows the screen, I'll send the fix to it." On every step it also re-reads every round before this one. Send the handback to a fresh agent.
- "The screenshot shows it, so the file is like that" — when the readback disagrees, the file wins and the render is old. Re-shoot; don't edit the file to match a cache.
