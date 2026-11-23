"""Servidor local para probar Futbol Cards sin problemas de caché.

Uso (desde la carpeta del proyecto):
    python herramientas/servidor.py          -> http://localhost:3300
    python herramientas/servidor.py 8080     -> otro puerto
"""
import functools
import http.server
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
PUERTO = int(sys.argv[1]) if len(sys.argv) > 1 else 3300


class SinCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')   # siempre la versión más reciente de cada archivo
        super().end_headers()


if __name__ == '__main__':
    handler = functools.partial(SinCache, directory=str(RAIZ))
    with http.server.ThreadingHTTPServer(('', PUERTO), handler) as srv:
        print(f'Futbol Cards en http://localhost:{PUERTO}  (Ctrl+C para detener)')
        srv.serve_forever()
