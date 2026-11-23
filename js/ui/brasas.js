// Brasas de fuego que flotan por la pantalla de inicio (canvas detrás del menú).
// Suben desde abajo empujadas por un viento suave, parpadean y se apagan.
// Devuelve una función que detiene la animación y quita el canvas.

const COLORES = [[255, 190, 90], [255, 150, 50], [255, 115, 30], [255, 220, 140]];

export function iniciarBrasas(contenedor = document.body) {
  const reducido = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.createElement('canvas');
  canvas.className = 'brasas';
  canvas.setAttribute('aria-hidden', 'true');
  contenedor.prepend(canvas);
  const ctx = canvas.getContext('2d');
  let ancho = 0;
  let alto = 0;
  let brasas = [];
  let cuadro = 0;
  let anterior = performance.now();
  let activo = true;

  function cantidad() {
    const base = Math.round((ancho * alto) / 14000);
    return Math.max(25, Math.min(reducido ? 30 : 130, base));
  }

  function nueva(desdeAbajo) {
    const [r, g, b] = COLORES[Math.floor(Math.random() * COLORES.length)];
    return {
      x: Math.random() * ancho,
      y: desdeAbajo ? alto + Math.random() * 40 : Math.random() * alto,
      vx: 8 + Math.random() * 28, // el viento las lleva hacia la derecha
      vy: -(18 + Math.random() * 55), // y hacia arriba
      radio: 1.2 + Math.random() * 2.4,
      vida: 0,
      duracion: 5 + Math.random() * 7,
      fase: Math.random() * Math.PI * 2,
      ondula: 0.6 + Math.random() * 1.6,
      color: `${r}, ${g}, ${b}`,
    };
  }

  function redimensionar() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ancho = window.innerWidth;
    alto = window.innerHeight;
    canvas.width = Math.round(ancho * dpr);
    canvas.height = Math.round(alto * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const objetivo = cantidad();
    while (brasas.length < objetivo) brasas.push(nueva(false));
    brasas.length = Math.min(brasas.length, objetivo);
  }

  function dibujar(ahora) {
    if (!activo) return;
    const dt = Math.min(0.05, (ahora - anterior) / 1000);
    anterior = ahora;
    ctx.clearRect(0, 0, ancho, alto);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < brasas.length; i++) {
      const b = brasas[i];
      b.vida += dt;
      b.fase += dt * 3;
      b.x += (b.vx + Math.sin(b.fase * b.ondula) * 14) * dt;
      b.y += b.vy * dt;
      const t = b.vida / b.duracion;
      if (t >= 1 || b.y < -20 || b.x > ancho + 20) {
        brasas[i] = nueva(true);
        continue;
      }
      // Aparece, brilla y se apaga, con parpadeo.
      const brillo = Math.sin(Math.PI * t) * (0.65 + 0.35 * Math.sin(b.fase * 2.3));
      const r = b.radio * (1 - t * 0.4);
      ctx.fillStyle = `rgba(${b.color}, ${0.26 * brillo})`;
      ctx.beginPath();
      ctx.arc(b.x, b.y, r * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(${b.color}, ${0.95 * brillo})`;
      ctx.beginPath();
      ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    cuadro = requestAnimationFrame(dibujar);
  }

  redimensionar();
  window.addEventListener('resize', redimensionar);
  cuadro = requestAnimationFrame(dibujar);

  return () => {
    activo = false;
    cancelAnimationFrame(cuadro);
    window.removeEventListener('resize', redimensionar);
    canvas.remove();
  };
}
