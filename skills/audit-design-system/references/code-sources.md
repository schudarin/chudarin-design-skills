# Code sources

How an audit runs when the design system lives in code. The analysis framework, classification and P0–P3 apply with page or frame read as file, node as selector, variable as token; the documentation output is a review catalogue. This file holds what differs.

The review page, the review catalogue, edits to the rules file and a new part are writes: they are made only when the user asks.

## What to read

- Tokens: the tokens files (CSS custom properties, a theme file), every theme.
- Parts: the markup each part renders (functions, templates, components) and its CSS.
- Prototypes: every page that uses the system.
- The rules file: a usage-rules document, if the system has one.
- A third-party component library the system is built on. Record the layers: the design source (tokens and markup) and the implementation (the library's theme). Every finding says which layer it is about.

## Copies first

When prototypes were made by copying each other, list the copies first and diff their rules and tokens against the base. Each difference is a decision for the user, and the report asks which copy is the base.

## What to count

Raw colours and px values outside tokens; implementations of one part (how many buttons); local overrides; tokens with zero uses; one token used both as a fill and as a text or icon colour (it splits in two). A base rule that beats a state rule (hover, pressed) is a finding: read each state's computed style, not the source.

## Review page

Conflicts go to a review page: one card per conflict, each variant rendered with its own source's CSS, a choice and a comment. The answers are saved and read back.

## Review catalogue

- One card per part: foundations, components, patterns, screens. Each card has accept and a comment.
- Accepted cards are hidden by default behind a toggle; the open ones come first.
- Samples: a foundation as a table, a component on its real surface at its real width, a screen in a device frame at phone and desktop width. No card inside a card.
- A card's description is one line: what the part is and when to use it.
- A check built into the page runs on every card in each theme, with long text, at phone and desktop width: overflow, clipped text, a box taller than its part allows, broken images, a hover or pressed style equal to rest. It sees only what is measurable; "fits but looks wrong" is judged by eye on screenshots.

## Defaults, not questions

Units follow the system's own convention (rem, px or another), read from its tokens and rules file. The audit flags values that break it and does not ask the user about each one. Every part states its long-text behaviour (wrap, ellipsis or grow) and its longest real value.

## Rules file

It states rules only: no dates, review numbers or quotes. Tokens live in the tokens file and are not copied into the rules. An accepted card means the code is right; the rules are updated to match.

## A new part

1. Start from the nearest existing part, restyled through tokens. Until the user's yes it is a proposal marked "new", shown beside that part; a part built from scratch is shown only when the user asks.
2. Where it lives in the catalogue.
3. One structure: the same slots in the same order wherever the part appears.
4. Its long-text behaviour.
5. Its required states.
6. Values from tokens only.
7. Sample data from the real API fields.
8. Done: a card, a passing check, and the user's ok.
