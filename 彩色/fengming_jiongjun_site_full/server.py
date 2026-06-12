#!/usr/bin/env python3
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import webbrowser

class Handler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp',
    }

if __name__ == '__main__':
    port = 8000
    root = Path(__file__).resolve().parent
    import os
    os.chdir(root)
    url = f'http://127.0.0.1:{port}'
    print(f'Serving {root} at {url}')
    try:
        webbrowser.open(url)
    except Exception:
        pass
    ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
