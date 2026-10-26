#!/usr/bin/env python3
"""Digest of a past Claude Code session: the user's messages verbatim and the agent's
last reply to each, from the session log in ~/.claude/projects. A new session reads this
instead of a retold summary.

  python3 session-digest.py <session id or its first characters> [--max-chars N]
  python3 session-digest.py --current-id     # id of this project's newest session
"""
import argparse
import glob
import json
import os
import re
import sys

REPLY_CHARS = 1200  # the user's words are the record; the agent's reply is context for them
HOST_MARKUP = ("<", "Caveat:", "Base directory for this skill", "Another Claude session",
               "This session is being continued", "[Request interrupted")


def project_dir(cwd):
    # Claude Code names a project's log folder after its path, every other character as '-'
    return os.path.join(os.path.expanduser("~"), ".claude", "projects", re.sub(r"[^A-Za-z0-9]", "-", cwd))


def transcripts(cwd):
    return sorted(glob.glob(os.path.join(project_dir(cwd), "*.jsonl")), key=os.path.getmtime)


def text_of(content):
    if isinstance(content, str):
        return content
    parts = []
    for b in content or []:
        if not isinstance(b, dict):
            continue
        if b.get("type") == "text":
            parts.append(b.get("text", ""))
        elif b.get("type") == "image":
            parts.append("[image]")
    return "\n".join(p for p in parts if p)


def turns(path):
    """[(timestamp, user text, last agent reply)] in order."""
    out, cur = [], None
    with open(path, encoding="utf-8", errors="replace") as f:
        for raw in f:
            try:
                d = json.loads(raw)
            except ValueError:
                continue
            if d.get("isMeta") or d.get("isCompactSummary") or d.get("isSidechain"):
                continue
            msg = d.get("message") or {}
            content = msg.get("content")
            if d.get("type") == "user":
                if isinstance(content, list) and any(isinstance(b, dict) and b.get("type") == "tool_result" for b in content):
                    continue
                t = text_of(content).strip()
                if not t or t.startswith(HOST_MARKUP):
                    continue
                cur = [d.get("timestamp", "")[:16].replace("T", " "), t, ""]
                out.append(cur)
            elif d.get("type") == "assistant" and cur is not None:
                t = text_of(content).strip()
                if t:
                    cur[2] = t  # keep only the last reply of the turn
    return out


def render(rows, max_chars):
    def reply(a):
        if not a:
            return "(no text reply)"
        return a if len(a) <= REPLY_CHARS else a[:REPLY_CHARS] + " … [reply trimmed]"
    blocks = [f"## {ts}\nUser:\n{u}\n\nAgent:\n{reply(a)}\n" for ts, u, a in rows]
    kept, size = [], 0
    for b in reversed(blocks):
        if size + len(b) > max_chars and kept:
            break
        kept.append(b)
        size += len(b)
    kept.reverse()
    head = ""
    if len(kept) < len(blocks):
        head = f"[{len(blocks) - len(kept)} earlier turns omitted; raise --max-chars to see them]\n\n"
    return head + "\n".join(kept)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("session", nargs="?")
    ap.add_argument("--current-id", action="store_true")
    ap.add_argument("--max-chars", type=int, default=40000)
    ap.add_argument("--cwd", default=os.getcwd())
    a = ap.parse_args()
    files = transcripts(a.cwd)
    if a.current_id:
        if not files:
            sys.exit(f"no session logs in {project_dir(a.cwd)}")
        print(os.path.basename(files[-1])[:-len(".jsonl")])
        return
    if not a.session:
        ap.error("give a session id, or --current-id")
    match = [f for f in files if os.path.basename(f).startswith(a.session)]
    if not match:
        sys.exit(f"no session starting with '{a.session}' in {project_dir(a.cwd)}")
    print(render(turns(match[-1]), a.max_chars))


if __name__ == "__main__":
    main()
