"""Genera los iconos de la app (PWA) en assets/iconos/.

Uso: python herramientas/generar_iconos.py

Diseño: fondo oscuro con brillo dorado (como el balón de la portada) y el
logo FUTBOL (blanco) / CARDS (verde) en dos líneas. El logo queda dentro de la
zona segura (80 % central) para que el icono "maskable" no se recorte en
Android.
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

RAIZ = Path(__file__).resolve().parent.parent
DESTINO = RAIZ / 'assets' / 'iconos'
FUENTE = 'C:/Windows/Fonts/bahnschrift.ttf'
VERDE = (34, 197, 94)
BLANCO = (255, 255, 255)


def fuente(tam):
    f = ImageFont.truetype(FUENTE, tam)
    try:
        f.set_variation_by_name('Bold Condensed')
    except Exception:
        pass
    return f


def icono(lado, zona_segura):
    escala = 4  # dibujar grande y reducir = bordes suaves
    L = lado * escala
    im = Image.new('RGB', (L, L), (10, 8, 6))
    # Brillo dorado radial.
    brillo = Image.new('L', (L, L), 0)
    d = ImageDraw.Draw(brillo)
    d.ellipse((L * 0.05, L * -0.05, L * 0.95, L * 0.85), fill=255)
    brillo = brillo.filter(ImageFilter.GaussianBlur(L * 0.18))
    oro = Image.new('RGB', (L, L), (150, 82, 20))
    im = Image.composite(oro, im, brillo.point(lambda v: int(v * 0.75)))
    # Logo en dos líneas, ajustado al ancho de la zona segura.
    ancho_util = L * zona_segura * 0.86
    d = ImageDraw.Draw(im)
    tam = int(L * 0.4)
    while True:
        f = fuente(tam)
        w1 = d.textlength('FUTBOL', font=f)
        w2 = d.textlength('CARDS', font=f)
        if max(w1, w2) <= ancho_util or tam < 10:
            break
        tam -= 4
    asc, desc = f.getmetrics()
    alto_linea = asc * 0.92
    total = alto_linea * 2
    y0 = (L - total) / 2 - asc * 0.08
    sombra = Image.new('RGBA', (L, L), (0, 0, 0, 0))
    ds = ImageDraw.Draw(sombra)
    for texto, y, color in (('FUTBOL', y0, BLANCO), ('CARDS', y0 + alto_linea, VERDE)):
        w = d.textlength(texto, font=f)
        ds.text(((L - w) / 2, y + L * 0.012), texto, font=f, fill=(0, 0, 0, 170))
    sombra = sombra.filter(ImageFilter.GaussianBlur(L * 0.01))
    im = im.convert('RGBA')
    im.alpha_composite(sombra)
    d = ImageDraw.Draw(im)
    for texto, y, color in (('FUTBOL', y0, BLANCO), ('CARDS', y0 + alto_linea, VERDE)):
        w = d.textlength(texto, font=f)
        d.text(((L - w) / 2, y), texto, font=f, fill=color)
    return im.convert('RGB').resize((lado, lado), Image.LANCZOS)


def main():
    DESTINO.mkdir(parents=True, exist_ok=True)
    salidas = {
        'icono-192.png': icono(192, 0.92),
        'icono-512.png': icono(512, 0.92),
        'icono-maskable-512.png': icono(512, 0.72),
        'apple-touch-icon.png': icono(180, 0.86),
        'favicon-32.png': icono(32, 1.0),
    }
    for nombre, im in salidas.items():
        im.save(DESTINO / nombre, optimize=True)
        print(f'  ✔ {nombre} ({im.width}×{im.height})')


if __name__ == '__main__':
    main()
