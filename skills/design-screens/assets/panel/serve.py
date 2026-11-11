# panel v1.0.0 — serves a prototype folder with no cache, so every reload shows the last edit.
# Run: python3 serve.py --root <prototype folder> [--port 8000] [--host 127.0.0.1]
import argparse
import os
import posixpath
import urllib.parse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_head(self):
        path = posixpath.normpath(urllib.parse.unquote(self.path.split("?", 1)[0].split("#", 1)[0]))
        if any(part.startswith(".") for part in path.split("/")):  # .env, .git and the like are never served
            self.send_error(404)
            return None
        return super().send_head()

    def list_directory(self, path):
        self.send_error(404)  # no folder listings: they show every file in the folder
        return None

    def log_request(self, code="-", size="-"):
        pass  # errors still go to stderr through log_error


def make_server(host, port, root):
    return ThreadingHTTPServer((host, port), partial(Handler, directory=root))


if __name__ == "__main__":
    p = argparse.ArgumentParser(description="Serve a prototype folder with no cache.")
    p.add_argument("--root", default=".", help="folder to serve")
    p.add_argument("--port", type=int, default=8000)
    p.add_argument("--host", default="127.0.0.1", help="0.0.0.0 to open it from a phone on the same network")
    a = p.parse_args()
    srv = make_server(a.host, a.port, a.root)
    if a.host not in ("127.0.0.1", "localhost", "::1"):
        print("Anyone on this network can open these files while it runs.")
    print("Serving %s on http://%s:%d" % (os.path.abspath(a.root), a.host, srv.server_address[1]))
    srv.serve_forever()
