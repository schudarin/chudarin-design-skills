# Checks

Four checks run before the user sees a screen. The order is fixed: the first two are cheap and
mechanical — judging style on a screen that's missing a state, or that has a 28px tap target,
spends the taste-sensitive check on something that gets redone anyway. Run them in order; jumping
to Product style first doesn't save time, it just means redoing that check after Completeness or
Accuracy forces a change. Composition runs last, on the final render.

## 1. Completeness

All elements and tasks from the brief are present. The error, empty and loading states this feature
introduces are drawn, not just the happy path. A state an existing component already draws (its
skeleton, its send error) is named in the notes next to that component, not redrawn. A state no
source names — brief, spec, meeting notes — is a question to the user, not a frame. Behaviour the
user never sees, such as a server-side queue or delay, is not a screen state. Checked item-by-item against the brief's own list — this requires no taste,
only a count.

**Result:** PASS, or a list of what's missing.

## 2. Accuracy

Technical execution, not beauty and not intent. Two sources: the criteria below, and the copy,
control, form and accessibility rules the brief carried — `references/ux-rules.md` routes to them
by what the screen contains, and each rule states whether it is verified by **Read** (node
properties and numbers) or by **Look** (the render). A Look rule reported without saying what was
looked at didn't run.

- **Tap zones meet the product's recorded minimum** (`ux/accessibility.md`); inline text links are
  exempt (`ux/controls.md`). A 28px-tall field reads as a caption rule rather than a field: it
  passes a visual glance and fails the moment someone tries to tap it.
- **Integer coordinates.** A frame sitting at `x=132.5` split every edge across two pixels and
  blurred the composition — a half-pixel offset is invisible in the layers panel and obvious on
  export.
- **Colors bound to variables** where the product has them (`ux-rules.md`, the tokens note), never
  typed in by hand. A hand-typed hex is a color that silently stops following the palette the next
  time the palette changes.
- **Text on text styles, effects on effect styles**, where the product has them — and every style
  created for this screen has at least one user. A type ramp in the styles panel with `textStyleId`
  empty on every node is the same defect as a hand-typed hex: it looks identical today and stops
  following the ramp tomorrow. Read.
- **A part that repeats across screens is one component, used without style overrides.** List the
  instances on this round's screens with overridden fills, effects, radii or text styles, and every
  repeated frame that is not an instance at all; each is a finding with its node id. Read.
- **Shadows and outside strokes not cut by a clipping ancestor.** The cut lands on the card, but the
  cause is a wrapper two levels up with the default `clipsContent`; checked by computing each shadow's
  reach against its clipping ancestors, not by glancing at the card. Read.
- **Nothing sticks out of its parent.** After a resize, or a move into a narrower or padded container,
  a FIXED-width child keeps its old width and runs past the edge; with `clipsContent = false` nothing
  cuts it, and a few pixels do not show at screenshot scale. Read: each visible node's right and
  bottom edges against its parent's inner box (size minus padding); every overrun is a finding with
  node id and pixels.
- **The frame being looked at agrees with the file.** A Look rule runs only on a screenshot that
  matches the Read of at least one property changed in this round; a render can lag the file by
  minutes, and a finding filed against a stale render is a finding against the cache.
- **Spacing follows the project's grid**, not an eyeballed value that happens to look close. When
  the file has a spacing collection, every gap, padding and corner radius is bound to it, never
  typed as a number: a typed `16` next to a `16` variable is the same defect as a hand-typed hex.
  The one exception is a gap that reads Auto (`SPACE_BETWEEN`); it stays unbound and at
  `itemSpacing = 0`. A bulk binding pass skips `SPACE_BETWEEN` frames; a leftover number there is the
  minimum gap and makes the content jump when the group's size changes. Read: every `SPACE_BETWEEN`
  frame has `itemSpacing === 0` and no `boundVariables.itemSpacing`. A value the scale
  does not have goes to the user as a question, add it to the scale or move to the nearest step,
  and is never left as a number. Read.
- **No spacer frames.** Space between elements comes from auto-layout — gap, padding,
  `SPACE_BETWEEN` with grouped children, FILL on the content — never from an empty frame or
  rectangle whose only job is to push a neighbour. Checked by Read: no childless FRAME or RECTANGLE
  without fills or strokes inside an auto-layout parent.
- **No artifacts that read as a bug.** Stray single pixels left over from a resize read as a bug
  rather than a deliberate choice — an artifact doesn't announce itself, it has to be looked for.

**Result:** PASS, or a list of findings, each tied to a node id and a number (position, size, or
color value) — not a description of the impression it gives.

## 3. Product style

Whether the screen stayed inside how this product looks — checked against the signature-traits
list and the saved screenshot of approved work in `design.md` (format: `references/state.md`),
**never against general good-UI conventions**. Six fixes that are correct by any UI textbook —
grid alignment, baseline alignment, rounded corners — can pass the critic and still be rejected
outright, when the product's own signature is a sharp corner and a tighter baseline than the
textbook calls for. Textbook-correct and product-correct are different questions; this check asks
only the second one.

Separately: was the task solved **inside the product's own vocabulary** — an existing component,
pattern, or variable — or with an imported technique that solves the immediate problem but doesn't
belong to this product. A solution can pass every general UI heuristic and still fail this check on
vocabulary alone. Read: every button, alert, progress indicator, avatar and header on this round's
screens is an instance of a design-system component of that role. Each plain frame, hand-drawn shape,
or instance of a component with another role is a finding with its node id.

Separately: tells of a screen built on defaults. A tell is a reason to check a decision, not an
error. One that `design.md` or the user chose stays. A tell the agent added with no reason in the
content or the style is a finding:
- an accent word in a heading set in a contrasting serif or italic;
- all-caps letter-spaced labels above headings;
- section numbers (01, 02…) above sections;
- frosted-glass blur on bars and overlays;
- three equal cards for a list of steps;
- a card around a single value, and cards nested in cards;
- numbers that count up on load;
- big number tiles where the product's real screen could be shown;
- mono type outside data (prices, codes, file names).

Look: list each tell found, with its element and whether `design.md` or the user chose it.

**Result:** SHOW-compatible, or a list of trait/screenshot mismatches, each naming the specific
trait or screenshot region it contradicts.

## 4. Composition

What the user sees in the first seconds, checked by Look on a `scale: 1` screenshot of the whole
frame. A screen can pass every number in Accuracy and still show a hole in the middle: the user
finds that at a glance, and the critic has to look the same way.

- **Dead zones.** An empty area larger than the blocks next to it, or a column that ends far above
  its neighbour, with no reason in the content.
- **Edges line up.** Blocks stacked on the screen share their left and right edges. A block set a
  few pixels in, or a dropdown that moved off its row, is a finding.
- **The same element sits in the same place across the flow.** Search, filters, the primary action
  and the step header keep one position on every sibling screen. The critic gets the sibling frames
  and compares them side by side: a screen that puts search on the other side is a finding even
  when it looks fine alone.
- **Controls look like what they do.** A working control that reads as disabled, or an action that
  reads as plain text, is a finding.

**After fixes,** compare each frame's new screenshot with the one from the previous round first. A
frame that comes out identical where a fix was reported means the fix did not land, and that is
the first finding.

**Result:** PASS, or a list of regions, each with the screenshot path, the region, and the nearest
node id.

## Modes of application

Rows are mutually exclusive — pick the one that names the actual constraint on this round, not
just "is this the first time it's shown." A first showing built to a direction the user specified
is still the user-chose-this-direction row, not the first-showing row. Each row is a complete list
of what runs for that mode: everything listed runs, nothing listed is out of scope for it. No row
singles out one listed check as more required than the others listed beside it.

| Situation | Checks to run |
|---|---|
| First showing of a new screen, direction was the agent's own call | all four |
| After fixes | the checks tied to the listed findings, "did anything else break", and Composition on every frame the fixes touched, whole frame, with the previous-round comparison |
| The user chose this direction themselves | Completeness, Accuracy and Composition. **Taste is out of scope**: the critic does not rule on whether a device the user explicitly asked for belongs in the product — that question was already decided by the person who asked for it. Composition is not taste: a hole or a misaligned edge is a defect in any direction |
| Edit inside approved work | Accuracy, scoped to the touched element, Product style, and Composition of the frame — all run in full; a batch of textbook-correct edits with no Product style check is exactly the kind that gets rejected. Completeness is out of scope: nothing was added, there's nothing new to count. Reviewed **one element at a time**, never as a batch |

A SHOW covers the file as the critic read it. Any write after it — a one-line fix, a rename, a copy
pass — voids it for every frame the write touched: run the after-fixes round on those frames before
the link goes out, or say in the message which frames changed after the check.

## Critic prompt (copy-paste ready)

The critic is a separate, read-only agent — not the one that built the screen, so there's no
incentive to confirm its own success. The output below is a checklist to fill in, not a paragraph
to write, and it has exactly two legitimate results per section: a completed result (PASS / a
list), or `out of scope for this mode` — and that second value is legitimate **only** for a check
the mode's row in "Modes of application" does not list. A section left blank, or marked out of
scope for a check the row *does* list, means that check didn't run: treat the verdict as FIX-FIRST.
Fill in the bracketed lines before sending.

```
You are reviewing a Figma screen against four checks: Completeness, Accuracy, Product style,
Composition (criteria in references/checks.md). You are the critic, not the builder — a separate pass.

Skills to load: a critique skill if this session has one on the shelf (`design-critique` is one
name worth looking for) — otherwise none; the criteria below are self-contained either way.
Accuracy reads node properties that get_metadata does not return — fills, fonts, bindings, fractional
positions — so the critic runs read-only use_figma scripts. Load figma-use and figma-plugin-api-rules
before the first one; a read-only script is subject to the same return cap and `figma.mixed` traps as
a write.

Inputs — each line below is an absolute path, filled in before sending. A line left unfilled
blocks the check that depends on it exactly the way a blank result section does (see Verdict):
- design.md for this project. Accuracy reads its Settings section (design system, tokens);
  Product style reads Signature traits. Required whenever either check runs — every mode row
  except the one where neither is listed: [absolute path]
- Saved screenshot of the approved screen, needed for the Product style check and for "edit
  inside approved work" mode: [absolute path / not applicable — this mode's row does not list
  Product style]
- The screen's task list that Completeness is checked against — the brief that carries it, or
  the task list itself, pasted in full: [absolute path to the brief / the task list itself]
- Node ids of the sibling screens in the same flow, for Composition: [ids / none — single screen]
- Screenshots of the previous round, per frame, for the after-fixes comparison: [absolute paths /
  not applicable — first showing]

Rules:
- Read-only. Do not write, move, or edit anything in Figma.
- Verify every item yourself, directly against node properties or the screenshot. A builder's
  report of what it did is not evidence of what it did — re-derive each result from the file.
- Every finding names a specific node id. "Spacing looks off" is not a finding; "node 12:34,
  padding-top 14px, grid step is 8px" is.
- If something looks wrong but is a limitation of the tool or the export (e.g. a rendering
  artifact from the screenshot pipeline, not the file itself), say so and separate it from an
  actual defect in the file.
- Mode: [first showing / after fixes / user-chosen direction / edit inside approved work] —
  run every check that mode's row lists (references/checks.md, "Modes of application").
- For a check the row does **not** list, write `out of scope for this mode` as its result — do
  not leave the section blank. For a check the row **does** list, `out of scope` is not a valid
  answer for it; produce a real result instead.

Fill in every section below for the mode given. Do not summarize instead of filling it in.

## Completeness
Result: [PASS / list of missing elements or states / out of scope for this mode]

## Accuracy
Result: [PASS / list of findings, each with a node id and a number / out of scope for this mode —
note if scoped to a single touched element rather than the whole screen]

## Product style
Result: [SHOW-compatible / list of mismatches against the signature-traits list or saved
screenshot, each naming the trait or region / out of scope for this mode]

## Composition
Screenshots looked at, scale 1, one per frame and per sibling compared: [absolute paths]
Result: [PASS / list of regions, each with the screenshot path, the region and the nearest node id]

## Verdict
SHOW or FIX-FIRST. A section legitimately marked out of scope does not block this; a section
left blank, an input slot left unfilled, a Composition section with no screenshot path, or a
result marked out of scope despite being listed for this mode, does.
```

For **after fixes**, replace the Completeness/Accuracy/Product style sections with:

```
## Findings from last round
- [finding 1]: ADDRESSED / NOT ADDRESSED
- [finding 2]: ADDRESSED / NOT ADDRESSED

## Composition
Screenshots, previous round → now, per touched frame: [absolute path → absolute path]
Fix landed: [per frame: changed / identical — the reported fix did not land]
Result: [PASS / list of regions, each with the screenshot path, the region and the nearest node id]

## New breakage
[Anything the fixes broke that wasn't broken before. "None found" is a valid, explicit answer —
an empty line is not.]

## Verdict
SHOW or FIX-FIRST. A Composition section with no screenshot paths, or a frame marked identical
where a fix was reported, is FIX-FIRST.
```
