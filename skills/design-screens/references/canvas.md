# Working canvas

Use the defaults below for a new file or a page with no layout of its own. For an existing page,
inspect the neighboring scenario on the destination page and use it as the layout reference.
Use source frames for screen content. Before sharing, compare step direction, grouping, and
spacing with the destination scenario. Change an existing layout when the person asks for it.

Every screen goes into this structure the moment it is created — never loose on the page and tidied
later. All containers are auto-layout, hug both axes, no fill, `clipsContent = false`. Font: the
file's main sans family; Inter when the file has none. Colours: text primary `#121212`, secondary
`#808080`, arrows `#9e9e9e`, number circle `#e0e0e0` — or the file's neutral variables.

- **Page background:** `#eef2f7` on every page.
- **Section** per product or feature: fill black 2 %, stroke black 16 % 1 px, radius 144. Flows sit
  inside with an 80 inset; several flows side by side, 400 apart.
- **Flow:** VERTICAL, gap 144 → Header, then scenarios.
- **Header:** VERTICAL, gap 24 → Title row (HORIZONTAL, gap 16: a 46 circle with the flow number,
  Semi Bold 24; title Bold 40) and a one-line subtitle, Medium 20 secondary.
- **Scenario:** VERTICAL, gap 24 → name Bold 32, then Steps (HORIZONTAL, gap 24).
- **Step:** VERTICAL, gap 40 on mobile, 32 on desktop → caption "what the user did", Medium 16
  secondary, then the screen at device size. Notes for a screen go in a frame under it, inside the
  step.
- **Arrow between steps:** a frame with `→` Bold 40 in the arrow colour; `paddingTop` puts it at the
  screen's vertical middle. A branch uses `или` / `or` instead of the arrow.
- **A screen from another flow or a system screen** is a placeholder of the same size: radius 24,
  fill `#f6f6f6`, dashed stroke `#b8b8b8` 1.5 (9, 7), a centred label `Переход · <from> → <to>`
  Medium 18 secondary.
- **A story beat** (optional, when the flows follow one person's day): the first step of a scenario
  is a card 800 wide, padding-top 48, gap 16 — the time Bold 64 and one sentence Medium 32.

A new screen is inserted as a step into its scenario, with the arrow copied from a neighbour.
Screens nested in steps cannot carry prototype links, so a clickable Figma prototype lives on its own
page, built from copies of the main scenario.
