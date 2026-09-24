# figma-plugin-api-rules

The ways the Figma Plugin API breaks when an agent drives it, and what to do instead. Every entry
comes from a real breakage, not a rewrite of the docs, and is written as Principle / Symptom /
Pattern.

It exists because most of these failures are silent: the call returns success, the file looks
plausible, and the binding was never applied. The rules say what to check.

## Do I need to do anything?

**If you installed the `chudarin` plugin, no.** The skill is already there, and the agent loads it
by itself before writing to a Figma file. Installation is in the
[repository README](../../README.md). Stop here.

The rest of this page is for two cases: you want the pack without the plugin system, or you want to
add a rule to it.

## What's inside

- `SKILL.md`: hard rules, the universal principles that keep recurring, a routing table by topic, a
  quick-scan table of common mistakes, and the protocol for adding to the pack.
- `references/*.md`: pitfalls by topic: components and variants, instances, layout and geometry,
  text and fonts, variables and modes, connectors, annotations, publishing hygiene, FigJam, prototype
  links, the MCP tool layer, and building a screen from code.

## Using it without the plugin

The folder is a standard agent skill. Put it where your agent looks for skills:

- **Claude Code:** `~/.claude/skills/figma-plugin-api-rules/` for every project, or
  `<project>/.claude/skills/figma-plugin-api-rules/` for one.
- **Codex:** `~/.agents/skills/figma-plugin-api-rules/` or `<repo>/.agents/skills/`. Call it
  explicitly with `$figma-plugin-api-rules`; implicit invocation is on.
- **Any other agent:** it's plain Markdown. Hand `SKILL.md` to the agent as a context file before
  Figma work.

Load `SKILL.md` before the first programmatic Figma call in a session, on top of your tool's own
instructions for calling the API: `figma-use` in Claude Code, the MCP resource
`skill://figma/figma-use/SKILL.md` elsewhere. This pack adds to those; it never replaces them.
The topic files load on demand, by the routing table inside `SKILL.md`.

## Adding a rule

The full protocol is at the end of `SKILL.md`. In short:

1. One writer at a time. Parallel appends in separate copies diverge and have to be merged by hand.
2. A new rule is a `### slug` section at the end of the matching topic file, in the
   Principle / Symptom / Pattern format. No "verified on <file>" trailer: a reader outside your
   project can't use it, and it's where client names and node ids leak.
3. A new topic means a new file plus a row in the routing table, in the same commit.
4. Commit the pack change separately from the task that produced it, or you'll forget to commit it.

Facts about one specific Figma file (Set IDs, Page IDs, local quirks) go into your own
`references/files/<file>.md`. They don't travel with this pack, and the pack ships none.
