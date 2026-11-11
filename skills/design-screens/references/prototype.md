# Prototype

A prototype is a served HTML page outside the product, built to choose and approve a design before it is ported. This file holds what differs from Figma; the rest of `SKILL.md` applies as is.

## Versions

- Each round is a copy of the last take in a folder of its own (`<name>-v2`, `<name>-v3`). Earlier versions are not edited and stay served, so the user can compare.
- Every version gets its own served link, `http://localhost:<port>/…`, never `file://`.
- A rejected version stays on disk and leaves the panel and any page that lists versions. `design.md` › Rejected records it with the user's words.

## Panel

One review panel per project; every prototype is reviewed through it and none builds its own. Its code is this skill's `assets/panel/`: the first prototype copies the folder into the project as is, and `design.md` › Settings records the copy's path. The project never edits the copy. A fix goes into the package, and the agent replaces the copy when the package's version, on the first line of each file, is newer. How to mount the panel and write steps is at the top of `panel.js`; `serve.py` serves the prototype with no cache.

- On a wide screen it sits in a corner and collapses to a small pill. A device frame keeps its place whether the panel is open or collapsed, and the open panel never covers it; the pill may. The whole-window view takes the full window, and the panel floats over it.
- Screen: phone, tablet, desktop, the whole window. A device frame is shown at the device's size: never grown, never shrunk for height (the page scrolls), shrunk only when the window is narrower than the frame.
- Scenarios: named paths of steps, grouped by milestone. Groups and steps fold. A tap on a step opens the page in that state at once, with no animation.
- The chosen step has a play button: the scenario plays on from that step to its end at a person's pace. Each press is shown, text is typed letter by letter, and there is time to read. The step's caption stays above a device frame and in the open panel. A new play stops the one running. The panel puts no checkmarks or other marks on played paths or steps.
- Data presets only when the user asks to compare the screen on different data. The panel has none by default.
- Theme, when the product has more than one.
- The panel holds only what this round tests. Options left from earlier rounds leave it.
- Opened on a phone (below the product's phone breakpoint; 640 px when none is recorded), the page fills the screen with no device frame, and the screen choice hides. The panel is a sheet from the bottom that tucks away while a path plays. A tap on a path plays it from its start; a small pill shows the step ("2/5") and brings the panel back.

## Checks on a running page

- The checks run as `SKILL.md` › Prototype or product code says, in each theme. Every scenario plays start to end with no console errors.
- Screenshots are taken with a browser tool the host already has. When none is found, ask the user how to proceed before installing anything. Images go to a temp folder outside the repository and are read by absolute path.
- The recipe that works (serve command, port, screenshot script) is the Running page line in `design.md` › Settings; the first session that finds it missing writes it.
- Whatever renders only when served (WebGL, data from an API mock) is captured from the running page, never from the static file.

## Porting into the product

- Order: the user approves the prototype; the shared parts it changed go into the design system after the user's review; then the screen is ported.
- The product's dev build gets the same panel paths as the prototype, so both are walked step by step the same way. The panel never ships to production.
- A port is done when each path matches the prototype step for step, at each width the product supports, in each theme. The proof is screenshots of the prototype and the product side by side for every step. Each difference is listed, then fixed or recorded as decided.
- A third-party component library the system is built on can override it (line height, fonts in buttons and inputs). The comparison reads computed styles, not only the picture.
