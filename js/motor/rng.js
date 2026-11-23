// Generador aleatorio con semilla (mulberry32): el mismo partido con la misma
// semilla se repite idéntico (repeticiones, verificación en servidor).

export function hashTexto(texto) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

export function crearRng(semilla = 1) {
  let s = (typeof semilla === 'number' ? semilla : hashTexto(String(semilla))) >>> 0;
  const rng = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  rng.entero = (min, max) => min + Math.floor(rng() * (max - min + 1));
  rng.elegir = (lista) => lista[Math.floor(rng() * lista.length)];
  // Elige un elemento con probabilidad proporcional a su peso.
  rng.ponderado = (lista, peso) => {
    let total = 0;
    for (const x of lista) total += Math.max(0, peso(x));
    if (total <= 0) return lista[Math.floor(rng() * lista.length)];
    let r = rng() * total;
    for (const x of lista) {
      r -= Math.max(0, peso(x));
      if (r <= 0) return x;
    }
    return lista[lista.length - 1];
  };
  return rng;
}
