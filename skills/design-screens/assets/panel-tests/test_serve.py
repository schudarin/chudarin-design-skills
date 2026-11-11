# Run: python3 -m unittest discover -s skills/design-screens/assets/panel-tests
import importlib.util
import os
import sys
import tempfile
import threading
import unittest
import urllib.error
import urllib.request

sys.dont_write_bytecode = True  # no __pycache__ inside panel/, which projects copy as is
spec = importlib.util.spec_from_file_location("serve", os.path.join(os.path.dirname(__file__), "..", "panel", "serve.py"))
serve = importlib.util.module_from_spec(spec)
spec.loader.exec_module(serve)


class ServeTest(unittest.TestCase):
    def setUp(self):
        self.root = tempfile.mkdtemp()
        for p, text in [("index.html", "<p>hi</p>"), ("v2/app.html", "app"), (".env", "SECRET"), (".git/config", "token")]:
            os.makedirs(os.path.dirname(os.path.join(self.root, p)), exist_ok=True)
            with open(os.path.join(self.root, p), "w") as f:
                f.write(text)
        self.srv = serve.make_server("127.0.0.1", 0, self.root)
        threading.Thread(target=self.srv.serve_forever, daemon=True).start()

    def tearDown(self):
        self.srv.shutdown()
        self.srv.server_close()

    def get(self, path):
        try:
            with urllib.request.urlopen("http://127.0.0.1:%d%s" % (self.srv.server_address[1], path)) as res:
                return res.status, res.headers, res.read().decode()
        except urllib.error.HTTPError as e:
            with e:
                return e.code, e.headers, ""

    def test_serves_the_folder_and_never_lets_it_be_cached(self):
        code, headers, body = self.get("/index.html")
        self.assertEqual((code, body), (200, "<p>hi</p>"))
        self.assertEqual(headers["Cache-Control"], "no-store")
        self.assertEqual(self.get("/v2/app.html")[::2], (200, "app"))

    def test_hidden_files_and_folder_listings_are_not_served(self):
        for path in ["/.env", "/.git/config", "/v2/", "/v2/../.env"]:
            self.assertEqual(self.get(path)[0], 404, path)


if __name__ == "__main__":
    unittest.main()
