# Run: python3 -m unittest discover -s skills/design-screens/scripts
import json
import os
import subprocess
import sys
import tempfile
import unittest

SCRIPT = os.path.join(os.path.dirname(__file__), "session-digest.py")


def line(**kw):
    return json.dumps(kw, ensure_ascii=False)


def user(text, ts):
    return line(type="user", timestamp=ts, message={"role": "user", "content": text})


def tool_result(ts):
    return line(type="user", timestamp=ts, message={"role": "user", "content": [
        {"type": "tool_result", "tool_use_id": "t1", "content": "x" * 5000}]})


def assistant(text, ts):
    return line(type="assistant", timestamp=ts, message={"role": "assistant", "content": [
        {"type": "text", "text": text}]})


def tool_call(ts):
    return line(type="assistant", timestamp=ts, message={"role": "assistant", "content": [
        {"type": "tool_use", "id": "t1", "name": "Bash", "input": {"command": "ls"}}]})


class Digest(unittest.TestCase):
    def setUp(self):
        self.home = tempfile.mkdtemp()
        self.cwd = "/work/my proj"
        self.proj = os.path.join(self.home, ".claude", "projects", "-work-my-proj")
        os.makedirs(self.proj)

    def write(self, sid, rows, mtime):
        p = os.path.join(self.proj, sid + ".jsonl")
        with open(p, "w") as f:
            f.write("\n".join(rows) + "\n")
        os.utime(p, (mtime, mtime))
        return p

    def run_script(self, *args):
        env = dict(os.environ, HOME=self.home)
        r = subprocess.run([sys.executable, SCRIPT, *args, "--cwd", self.cwd],
                           capture_output=True, text=True, env=env)
        return r.returncode, r.stdout, r.stderr

    def test_keeps_user_words_and_last_agent_reply(self):
        self.write("aaaa1111", [
            user("Сделай шапку тёмной", "2026-10-26T07:12:00Z"),
            tool_call("2026-10-26T07:12:05Z"),
            tool_result("2026-10-26T07:12:06Z"),
            assistant("Смотрю шапку", "2026-10-26T07:12:07Z"),
            assistant("Шапка тёмная на S4–S7", "2026-10-26T07:13:00Z"),
            user("<command-name>/ctx</command-name>", "2026-10-26T07:14:00Z"),
            user("Кейхинт я вернул руками, не трогай", "2026-10-26T07:15:00Z"),
        ], 100)
        code, out, _ = self.run_script("aaaa")
        self.assertEqual(code, 0)
        self.assertIn("Сделай шапку тёмной", out)
        self.assertIn("Шапка тёмная на S4–S7", out)
        self.assertNotIn("Смотрю шапку", out)       # only the last reply of a turn
        self.assertNotIn("xxxxx", out)              # tool output dropped
        self.assertNotIn("command-name", out)       # host markup dropped
        self.assertIn("Кейхинт я вернул руками", out)

    def test_cap_keeps_the_most_recent_turns(self):
        rows = []
        for i in range(50):
            rows.append(user(f"просьба {i} " + "я" * 400, f"2026-10-26T08:{i:02d}:00Z"))
            rows.append(assistant(f"ответ {i}", f"2026-10-26T08:{i:02d}:30Z"))
        self.write("bbbb2222", rows, 100)
        code, out, _ = self.run_script("bbbb", "--max-chars", "3000")
        self.assertEqual(code, 0)
        self.assertIn("просьба 49", out)
        self.assertNotIn("просьба 0 ", out)
        self.assertIn("earlier turns omitted", out)
        self.assertLess(len(out), 3600)

    def test_agent_reply_is_trimmed_user_words_are_not(self):
        self.write("cccc3333", [
            user("слово " * 400, "2026-10-26T09:00:00Z"),
            assistant("ответ " * 400, "2026-10-26T09:01:00Z"),
        ], 100)
        code, out, _ = self.run_script("cccc")
        self.assertEqual(code, 0)
        self.assertEqual(out.count("слово"), 400)
        self.assertLess(out.count("ответ"), 220)
        self.assertIn("[reply trimmed]", out)

    def test_current_id_is_the_newest_transcript(self):
        self.write("old00000", [user("a", "2026-10-25T00:00:00Z")], 100)
        self.write("new11111", [user("b", "2026-10-26T00:00:00Z")], 200)
        code, out, _ = self.run_script("--current-id")
        self.assertEqual((code, out.strip()), (0, "new11111"))

    def test_unknown_id_fails_with_a_message(self):
        code, _, err = self.run_script("zzzz")
        self.assertNotEqual(code, 0)
        self.assertIn("no session", err)


if __name__ == "__main__":
    unittest.main()
