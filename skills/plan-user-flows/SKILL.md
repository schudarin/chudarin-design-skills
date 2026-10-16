---
name: plan-user-flows
description: "Plan user flows and screen states for a Figma design before any designing starts. Use when asked to plan a user flow, map out screens for a feature, define screen states, plan a Figma file structure, or work out what needs to be designed before opening Figma. Produces a complete flow map with all screens, states, entry/exit points, and a suggested Figma page structure."
---

# Figma Plan User Flows

Plans what needs to be designed before a pixel is touched — mapping all screens, states, entry points, and edge cases so designers do not discover missing states mid-build.

## Required Inputs

- **Feature or task being designed**
- **User type** (who performs this flow?)
- **Platform** (iOS / Android / Web / Multi-platform)
- **Starting point** (where does the user begin?)
- **Known edge cases** (optional)

## Output Structure

### 1. Flow Overview
Feature, user, goal, entry points, success exit, failure exits.

A flow that puts the user into a mode — a queue walk, a wizard, a guided pass — also maps three paths: where each exit lands, by screen; what an outside event does mid-mode (a new message, opening another item) and what the user sees next; how the user gets back in, and whether progress is kept. Each is a row in the screen map, not a note.

### 2. Screen Map

| # | Screen name | Type | Triggered by | Notes |
|---|---|---|---|---|
| 1 | [Screen] | New/Modal/Drawer/Toast | [What triggers] | [Considerations] |

Screen types to cover: entry, happy path, loading, success, error (network/validation/permission), empty, first-time/onboarding, edge cases.

### 3. State Matrix

**[Screen name]**

| State | Trigger | Visual change | Action available |
|---|---|---|---|
| Default | Page load | [Description] | [What user can do] |
| Loading | User taps action | Skeleton/spinner | None |
| Error | API failure | Error message | Retry/Go back |
| Empty | No data | Empty state | [CTA] |

### 4. Decision Points

**Decision: [Name]**
- If yes: [Screen N]
- If no: [Screen X]

### 5. Suggested Figma File Structure

```
Feature name/
- Cover
- Flow Map
- Happy Path
- Error States
- Empty States
- Edge Cases
- Handoff
```

### 6. What Not to Design Yet
[Explicit out-of-scope items — prevents scope creep]

## Quality Checks
- [ ] Loading, error and empty are covered for what this feature adds; states that reused components already handle are listed by component name, not mapped as new screens; every state traces to a source or is marked as a question
- [ ] All decision points mapped with both branches
- [ ] Entry points include all realistic user paths
- [ ] Out-of-scope section is explicit
- [ ] Figma file structure matches screen map

## Drawing the map in Figma
When the map goes on the canvas as blocks and arrows:
- If the user gives an example board, read it through the API — sizes, colours, text styles, connector ends — not from a screenshot, and ask what each colour or mark means. Without an example, use the default style below; do not invent one.
- Build inside the frame the user prepared for the map, not in new frames next to it.
- Place blocks on one grid, left to right in the order of the path.
- End every connector on a block, never on the frame that holds the scheme.
- Before showing, walk the connector graph: every block except an entry has an incoming connector, every block except a final exit has an outgoing one. Fix or list the ones that fail.

**Default style.** Four colour roles; when the file has colour variables, map each role to the closest one, otherwise use the values given.

| Role | Default | Used for |
|---|---|---|
| Accent | `#3a88f5` | text, other paths, key block fill, outlines |
| Tint | `#dfecfd` | block fill |
| Grid | `#daf0ff` | canvas grid lines |
| Main path | `#ff62b2` | the main path's connectors, marks |

- Font: the file's main sans family; Inter when the file has none. Only Bold and Medium are used — check both styles exist before the first text write.
- Canvas: white frame with a 1 px grid in the Grid colour.
- Step: 394 wide, Tint fill, radius 35, vertical auto-layout, padding 40, gap 24; title Bold 36 and description Medium 18 in Accent.
- Entry or short block: horizontal, height 127, padding 40, width hugs the title; title only.
- Key block (the finish): Accent fill, white text.
- Mark on a block: pill 42 high, radius 999, padding 8/16, white Bold 20 on Main path.
- Connectors: elbowed, 2 px, arrow at the end; the main path in Main path, every other path in Accent; a two-way transition has arrows at both ends. In a Design file connectors cannot be created, only cloned — see the connectors file of `figma-plugin-api-rules`.
- A sub-scheme sits in an outline: 4 px Accent at 48 %, radius 144.
- Header: Bold 144, subtitle Bold 46, in Accent.
