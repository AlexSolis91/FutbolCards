// Chispas de fuego en la pantalla de inicio (canvas detrás del menú).
// Estilo "brasas en el aire": trazos alargados en la dirección del movimiento,
// núcleo amarillo casi blanco con halo naranja, y profundidad: las cercanas
// son más grandes, rápidas y difusas; las lejanas, pequeñas y nítidas.
// Devuelve una función que detiene la animación y quita el canvas.

const ANGULO_BASE = -Math.PI / 3; // suben en diagonal hacia la derecha

// Sprite de una chispa (elipse con degradado radial), dibujado una sola vez.
function crearSprite(suave) {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 32;
  const g = c.getContext('2d');
  g.translate(64, 16);
  g.scale(4, 1); // estira el círculo para hacer el trazo
  const r = 16;
  const grad = g.createRadialGradient(0, 0, 0, 0, 0, r);
  if (suave) {
    grad.addColorStop(0, 'rgba(255, 200, 120, 0.9)');
    grad.addColorStop(0.35, 'rgba(255, 130, 40, 0.45)');
    grad.addColorStop(1, 'rgba(255, 80, 10, 0)');
  } else {
    grad.addColorStop(0, 'rgba(255, 250, 220, 1)');
    grad.addColorStop(0.18, 'rgba(255, 215, 120, 0.95)');
    grad.addColorStop(0.45, 'rgba(255, 140, 40, 0.55)');
    grad.addColorStop(1, 'rgba(255, 90, 10, 0)');
  }
  g.fillStyle = grad;
  g.beginPath();
  g.arc(0, 0, r, 0, Math.PI * 2);
  g.fill();
  return c;
}

export function iniciarBrasas(contenedor = document.body) {
  const reducido = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.createElement('canvas');
  canvas.className = 'brasas';
  canvas.setAttribute('aria-hidden', 'true');
  contenedor.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const nitida = crearSprite(false);
  const difusa = crearSprite(true);
  let ancho = 0;
  let alto = 0;
  let chispas = [];
  let cuadro = 0;
  let anterior = performance.now();
  let activo = true;

  function cantidad() {
    const base = Math.round((ancho * alto) / 26000);
    return Math.max(18, Math.min(reducido ? 20 : 80, base));
  }

  function nueva(alInicio) {
    const z = Math.random() ** 1.25; // muchas lejanas, pocas cercanas
    const velocidad = 70 + z * 260 + Math.random() * 40;
    const angulo = ANGULO_BASE + (Math.random() - 0.5) * 0.7;
    return {
      x: alInicio ? Math.random() * ancho : Math.random() * ancho * 0.9 - ancho * 0.1,
      y: alInicio ? Math.random() * alto : alto + 30 + Math.random() * 60,
      z,
      angulo,
      velocidad,
      giro: (Math.random() - 0.5) * 0.5, // curva ligera de la trayectoria
      vida: alInicio ? Math.random() * 2 : 0,
      duracion: 2.5 + Math.random() * 3.5,
      fase: Math.random() * Math.PI * 2,
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
    while (chispas.length < objetivo) chispas.push(nueva(true));
    chispas.length = Math.min(chispas.length, objetivo);
  }

  function dibujar(ahora) {
    if (!activo) return;
    const dt = Math.min(0.05, (ahora - anterior) / 1000);
    anterior = ahora;
    const dpr = canvas.width / ancho;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, ancho, alto);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < chispas.length; i++) {
      const c = chispas[i];
      c.vida += dt;
      c.fase += dt * 9;
      c.angulo += c.giro * dt;
      c.x += Math.cos(c.angulo) * c.velocidad * dt;
      c.y += Math.sin(c.angulo) * c.velocidad * dt;
      const t = c.vida / c.duracion;
      if (t >= 1 || c.y < -60 || c.x > ancho + 60) {
        chispas[i] = nueva(false);
        continue;
      }
      // Aparece rápido, brilla con parpadeo y se apaga.
      const entrada = Math.min(1, t / 0.15);
      const salida = Math.min(1, (1 - t) / 0.35);
      const parpadeo = 0.75 + 0.25 * Math.sin(c.fase);
      const alfa = entrada * salida * parpadeo * (0.75 + c.z * 0.25);
      // Tamaño y estela según la profundidad y la velocidad.
      const grosor = 4 + c.z * 13;
      const largo = grosor * 3 + c.velocidad * (0.1 + c.z * 0.08);
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.angulo);
      ctx.globalAlpha = alfa;
      ctx.drawImage(c.z > 0.7 ? difusa : nitida, -largo / 2, -grosor / 2, largo, grosor);
      if (c.z > 0.7) { // las cercanas, con un halo extra desenfocado
        ctx.globalAlpha = alfa * 0.35;
        ctx.drawImage(difusa, -largo * 0.8, -grosor * 1.2, largo * 1.6, grosor * 2.4);
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
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
