"""Local export server: serves offline/ and writes POSTed files into assets/.
   python3 tools/export_server.py  then open http://localhost:8766/index.html#export"""
import http.server, pathlib, urllib.parse, os
root = pathlib.Path(__file__).resolve().parent.parent
assets = root / "assets"
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=str(root / "offline"), **k)
    def do_POST(self):
        q = urllib.parse.urlparse(self.path)
        name = urllib.parse.parse_qs(q.query).get("name", [""])[0]
        dest = (assets / name).resolve()
        if q.path != "/save" or not name or assets.resolve() not in dest.parents:
            self.send_response(400); self.end_headers(); return
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(self.rfile.read(int(self.headers.get("Content-Length", 0))))
        self.send_response(200); self.end_headers(); self.wfile.write(b"ok")
    def log_message(self, *a): pass
http.server.ThreadingHTTPServer(("127.0.0.1", 8766), H).serve_forever()
