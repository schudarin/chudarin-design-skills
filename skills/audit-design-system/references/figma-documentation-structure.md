# Figma Documentation Structure

Use this reference before creating or proposing design-system documentation pages in Figma.

## Page structure

Pick pages from this list. Create a page only when this run fills it: an empty page, or a section that promises content later, is a defect. A product whose screens already serve as templates needs no Templates page.

```txt
00 Cover
01 Principles
02 Foundations
03 Tokens
04 Components
05 Patterns
06 Templates
07 Accessibility
08 Governance
09 Migration Backlog
99 Archive
```

Do not modify source product screens unless the user explicitly asks.

## 00 Cover

Include:

- Design-system name
- Scope analyzed
- Source pages/flows
- What lives on which page

Version, date and status stay out of the canvas (`figma-plugin-api-rules/references/publishing-hygiene.md`); they go in the chat report.

## 01 Principles

Include:

- Product principles
- Visual principles
- Interaction principles
- Accessibility principles
- Naming principles
- Tokenization principles

## 02 Foundations

Include:

- Color system
- Typography
- Spacing
- Grid/layout
- Radius
- Elevation/shadow
- Iconography
- Motion

## 03 Tokens

Include three tables:

| Primitive token | Value | Type | Notes |
|---|---|---|---|

| Semantic token | References | Role | Modes |
|---|---|---|---|

| Component token | References | Component | State |
|---|---|---|---|

## 04 Components

For each component create sections:

- Purpose
- Anatomy
- Variants
- States
- Properties
- Tokens
- Usage
- Do / Don't
- Accessibility
- Examples from real Figma frames

## 05 Patterns

For each pattern include:

- Scenario
- User intent
- Components used
- Layout rules
- Interaction rules
- Examples
- Anti-patterns

## 06 Templates

Include:

- Page templates
- Layout zones
- Responsive behavior
- Composition rules

## 07 Accessibility

Include:

- Focus states
- Keyboard behavior
- Contrast
- Target size
- Error handling
- Motion reduction
- Non-color-only meaning

## 08 Governance

Include:

- How to add a component
- How to change a token
- How to add a variant
- How to deprecate a component
- Review/approval rules
- Versioning
- Changelog

## 09 Migration Backlog

Use table:

| Priority | Finding | Source | Recommendation | Effort | Impact |
|---|---|---|---|---|---|

## Building the boards

### Layout
- One vertical auto-layout root frame per page and no SECTION nodes. A section has no auto layout and does not grow with its content: every change needs a manual resize, and whatever is missed ends up past its edge.
- Inside the root, one group per topic: its title and its board. A board is a horizontal frame with a fixed width and `layoutWrap = 'WRAP'`, so cards sit side by side and move to the next line when the row is full.
- Every container hugs its height, has `clipsContent = false` and no manual x/y: when content grows, its container grows and everything after it moves down.
- Text wraps: `textAutoResize = 'HEIGHT'` with a fixed or fill width. No truncation and no ellipsis; a long name makes its row taller.

### Component card
One card per component set or standalone component, a vertical auto-layout frame holding:
- the component name;
- its `description`, copied by the script. The panel is the single source; the canvas text is a copy, rewritten whenever the description changes. A component with an empty description gets no invented text: list it in the chat report and ask the user for one;
- the component itself. Variants sit in a grid: columns by State, one row per combination of the other axes, a label on every column and every row. State columns go in interaction order (Default, Hover, Focus, Pressed, then values such as Open or Selected, then Error, Disabled), not in the order of `variantOptions`. A grid wider than about 1600 px is stacked into one column with a label per row;
- notes that used to float next to the component, moved into the card or into `description`.

The card title sits one heading step below the group title. A variant made for a dark background (Inverse, On dark) gets a backing bound to a dark token behind its row; without it the cell reads as empty. A component the user finished by hand and asked to keep goes into its card as it is: no grid, its axes listed as text.

A component set often carries auto layout, which ignores the x/y of its variants (`component-set-auto-layout-ignores-variant-xy` in figma-plugin-api-rules). Before laying out the grid, save its layout settings in plugin data (`origLayout`) and switch it to `layoutMode = 'NONE'`; then place the variants and fit the set with `resizeWithoutConstraints`. Row label cells are pinned to the height of their row and tagged `rowcell`.

### Values from the source
Swatches, type samples, numbers and names are read from the file at build time: a swatch's fill is bound to its variable, a type sample has its text style applied, names and descriptions come from the variable, style or component itself. A board built this way follows the tokens when they change. A token table has one value column per mode, headed with the mode's name.

### Tags and rebuilds
Tag every node the script creates with `setSharedPluginData('dsdocs', 'role', …)` (`board`, `card`, `label`), and every card or table row with `setSharedPluginData('dsdocs', 'sourceId', <component, variable or style id>)`. Record the namespace and keys in the project notes (`sharedplugindata-namespace-is-not-enumerable`). A rebuild rewrites tagged labels and descriptions in place and leaves untagged nodes alone. A card that holds a component is never removed: to drop such a card, move the component out first and check it is still on the page.

### Order
Build the first card or table row, run the check below on it and fix it. Only then build the rest, in batches.

### Check before showing
One read-only script over the boards you touched, reading the drawn layers rather than the script's own input. It passes when every count is zero:
1. Components, variables and styles with no card or row, or with more than one (matched by `sourceId`).
2. Nodes outside their parent's bounds, including a card wider than its fixed-width board.
3. Documentation containers with a fixed height (except `rowcell`) or `clipsContent = true`. Previews such as swatches and shape samples may clip.
4. TEXT nodes with zero width or height, or with truncation on.
5. TEXT nodes without a text style. In a file with no text styles, skip this count and say so in the report.
6. Card descriptions that differ from the component's `description`.
7. Swatches and samples not bound to the variable or style named in their own row. A binding elsewhere on the board, such as the board's own spacing, does not count.
8. Components whose instance count changed: count with `getInstancesAsync` before the first write and again at the end. Moving a component or laying out its variants never changes it. If a count falls, list where the instances live before calling it a loss (`getinstancesasync-counts-instances-in-pageless-nodes` in figma-plugin-api-rules).

While any count is above zero, the boards are not shown to the user: fix, then run the check again. After it passes, screenshot each section and look for overlap and empty previews, which the script cannot see.

### Report
Counts, components without a description and anything still failing go to the chat. The canvas carries no summary, date or version.

## Write-to-Figma protocol

Before writing, ensure the user explicitly asked to create or modify Figma content.

Allowed write actions after explicit request:

- Create documentation pages.
- Create documentation frames.
- Add analysis tables and text blocks.
- Add source references.

Do not alter product screens unless the user explicitly asks.
