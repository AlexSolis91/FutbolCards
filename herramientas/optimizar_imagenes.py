"""Optimiza las fotos de jugadores para el juego.

Uso (desde la carpeta del proyecto):
    python herramientas/optimizar_imagenes.py

Lee assets/originales/jugadores/<Nombre> <Rareza>.<ext>
(ej. "Cristiano Ronaldo Legendario.jpg") y escribe
assets/jugadores/<nombre-en-slug>-<rareza>.webp (ej. cristiano-ronaldo-legendario.webp).

NO recorta: conserva la foto completa y solo la reduce de tamaño. El encuadre
lo hace la carta (anclado arriba, así nunca se corta la cabeza).
Ignora mayúsculas, acentos y extensiones dobles de Windows ("x.PNG.png").
"""
import re
import sys
import unicodedata
from pathlib import Path

from PIL import Image, ImageOps

RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = RAIZ / 'assets' / 'originales' / 'jugadores'
DESTINO = RAIZ / 'assets' / 'jugadores'
ANCHO = 480
CALIDAD = 82
EXTENSIONES = {'.jpg', '.jpeg', '.png', '.webp', '.avif', '.bmp'}
RAREZAS = {
    'comun': 'comun', 'raro': 'raro', 'rara': 'raro',
    'epico': 'epico', 'epica': 'epico',
    'legendario': 'legendario', 'legendaria': 'legendario',
}


def slug(texto: str) -> str:
    texto = unicodedata.normalize('NFD', texto)
    texto = ''.join(c for c in texto if unicodedata.category(c) != 'Mn').lower()
    return re.sub(r'[^a-z0-9]+', '-', texto).strip('-')


def nombre_base(ruta: Path) -> str:
    nombre = ruta.name
    while Path(nombre).suffix.lower() in EXTENSIONES:
        nombre = nombre[: -len(Path(nombre).suffix)]
    return nombre


def main() -> int:
    DESTINO.mkdir(parents=True, exist_ok=True)
    errores = 0
    for ruta in sorted(ORIGEN.iterdir()):
        if not ruta.is_file() or ruta.suffix.lower() not in EXTENSIONES:
            continue
        partes = slug(nombre_base(ruta)).split('-')
        rareza = RAREZAS.get(partes[-1])
        if not rareza or len(partes) < 2:
            print(f'  ✖ {ruta.name}: el nombre debe terminar en la rareza (Comun, Raro, Epico, Legendario)')
            errores += 1
            continue
        salida = DESTINO / f"{'-'.join(partes[:-1])}-{rareza}.webp"
        if salida.exists() and salida.stat().st_mtime >= ruta.stat().st_mtime:
            continue
        with Image.open(ruta) as im:
            im = ImageOps.exif_transpose(im).convert('RGB')
            if im.width > ANCHO:
                im = im.resize((ANCHO, round(im.height * ANCHO / im.width)), Image.LANCZOS)
            im.save(salida, 'WEBP', quality=CALIDAD, method=6)
        print(f'  ✔ {ruta.name} → {salida.name} ({im.width}×{im.height}, {salida.stat().st_size // 1024} KB)')
    return 1 if errores else 0


if __name__ == '__main__':
    sys.exit(main())
