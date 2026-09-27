#!/usr/bin/env python3
# Link check for skills/ — run from pre-commit on the STAGED tree. Blocks a
# commit where a skill file names a rule (`### slug`) or a .md path that does
# not exist. Names that look like slugs or paths but are not (third-party
# skills, project files, CSS values) go in the IGNORE sets below.
import os, re, subprocess, sys

IGNORE_SLUGS = {
    # third-party skills named in design-screens
    "mobile-app-ui-design", "design-motion-principles", "emil-design-eng", "figma-use-slides",
    # CSS values, concept labels, layer names
    "repeating-linear-gradient", "hug-from-children", "children-fill-from-parent",
    "icon-logo-mark", "missing-on-figma",
}
IGNORE_PATHS = {
    # files that live in the user's project, not in this repo
    "design.md", "DESIGN.md", "DESIGN_SYSTEM.md", "PRODUCT.md", "CLAUDE.md", "AGENTS.md",
    "design/ledger.md", "design/ledger-admin.md",
    # a token name, not a file
    "radius.md",
}

def git(*args):
    return subprocess.run(["git", *args], capture_output=True, text=True, check=True).stdout

staged = set(git("ls-files").split("\n")) - {""}
md = sorted(f for f in staged if f.startswith("skills/") and f.endswith(".md"))
text = {f: git("show", f":{f}") for f in md}
skills = {f.split("/")[1] for f in md}
heads = {l[4:].strip() for t in text.values() for l in t.split("\n") if l.startswith("### ")}

def exists(base, p):
    return os.path.normpath(os.path.join(base, p)) in staged

errors = []
for f, t in text.items():
    here, root = os.path.dirname(f), "/".join(f.split("/")[:2])
    for m in re.finditer(r"`([a-z0-9]+(?:-[a-z0-9]+){2,})`", t):
        s = m.group(1)
        if s not in heads and s not in skills and s not in IGNORE_SLUGS:
            errors.append(f"{f}: no rule named `{s}`")
    for m in re.finditer(r"(?:`|\]\()([A-Za-z0-9_./-]+\.md)(?:`|\))", t):
        p = m.group(1)
        if p in IGNORE_PATHS:
            continue
        if not any(exists(b, p) for b in (here, root, root + "/references", "skills")):
            errors.append(f"{f}: no file at `{p}`")

if errors:
    print("✖ pre-commit: broken references in skills/:", file=sys.stderr)
    for e in sorted(set(errors))[:30]:
        print("  " + e, file=sys.stderr)
    print("Fix the name or path; if it is not meant as a reference, add it to IGNORE in .githooks/check-links.py.", file=sys.stderr)
    sys.exit(1)
