// Medición precisa del equilibrio de formaciones:
//   node herramientas/formaciones.mjs [partidos por cruce] [parte] [partes]
// - Todos contra todos entre plantillas (cada cruce, en las dos direcciones).
// - Formas extremas contra plantillas al azar.
// Con [parte] y [partes] reparte el trabajo entre varios procesos; sin
// ellos lo hace todo y imprime el resumen.

import { pathToFileURL } from 'node:url';
import { crearRng } from '../js/motor/rng.js';
import { MOTOR, simularPartido } from '../js/motor/partido.js';

// Pruebas de ajuste: FC_MOTOR='{"hueco":{"valor":0.5}}' cambia valores del motor.
if (process.env.FC_MOTOR) {
  for (const [k, v] of Object.entries(JSON.parse(process.env.FC_MOTOR))) {
    MOTOR[k] = typeof v === 'object' && !Array.isArray(v) ? { ...MOTOR[k], ...v } : v;
  }
}
import { ORDEN_FORMACIONES } from '../js/motor/reglas.js';
import { equipoAleatorio } from '../js/datos/prueba.js';

const K = Number(process.argv[2] ?? 300);
const PARTE = Number(process.argv[3] ?? 0);
const PARTES = Number(process.argv[4] ?? 1);

export const FORMAS = {
  'Sin banda izquierda': ['POR', 'DFC', 'DFCD', 'LD', 'MCD', 'MC', 'ID', 'MD', 'MCO', 'DC', 'DD'],
  'Todos por el centro': ['POR', 'DFCI', 'DFC', 'DFCD', 'MCDI', 'MCD', 'MCDD', 'MC', 'MCO', 'DC', 'DD'],
  'Rombo cerrado sin laterales': ['POR', 'DFCI', 'DFC', 'DFCD', 'MCD', 'II', 'ID', 'MCO', 'MCOI', 'DI', 'DD'],
  '3 defensas, sin contención': ['POR', 'LI', 'DFC', 'LD', 'MI', 'II', 'MC', 'ID', 'MD', 'MCO', 'DC'],
  '2 defensas y 8 atacantes': ['POR', 'DFCI', 'DFCD', 'EI', 'MCOI', 'MCO', 'MCOD', 'ED', 'DI', 'DC', 'DD'],
  '6 defensas (autobús)': ['POR', 'LI', 'DFCI', 'DFC', 'DFCD', 'LD', 'MCDI', 'MCD', 'MCDD', 'MCO', 'DC'],
};

const esPrincipal = import.meta.url === pathToFileURL(process.argv[1]).href;
if (esPrincipal) {
const pts = (r, lado) => (r.ganador === null ? 0.5 : r.ganador === lado ? 1 : 0);
  const tareas = [];
  for (const a of ORDEN_FORMACIONES) for (const b of ORDEN_FORMACIONES) if (a < b) tareas.push({ tipo: 'cruce', a, b });
  for (const nombre of Object.keys(FORMAS)) tareas.push({ tipo: 'forma', nombre });
  for (const media of [80, 85]) tareas.push({ tipo: 'ataque', media });
  
  const res = {};
  tareas.forEach((t, i) => {
    if (i % PARTES !== PARTE) return;
    const rng = crearRng(4242 + i);
    let p = 0;
    const n = t.tipo === 'cruce' ? K : K * 2;
    for (let k = 0; k < n; k++) {
      // Mismos jugadores y estrategias al azar; se alterna el lado.
      let A;
      let B;
      if (t.tipo === 'cruce') {
        A = equipoAleatorio(rng, { media: 80, formacion: t.a });
        B = equipoAleatorio(rng, { media: 80, formacion: t.b });
      } else if (t.tipo === 'forma') {
        A = equipoAleatorio(rng, { media: 80, casillas: FORMAS[t.nombre] });
        B = equipoAleatorio(rng, { media: 80 });
      } else {
        // ¿Cuánto rinde ir con 8 atacantes teniendo +5 de media, comparado con
        // una plantilla normal con la misma ventaja?
        A = t.media === 85
          ? equipoAleatorio(rng, { media: 85, casillas: FORMAS['2 defensas y 8 atacantes'] })
          : equipoAleatorio(rng, { media: 85 });
        B = equipoAleatorio(rng, { media: 80 });
      }
      const local = k % 2 === 0;
      const r = simularPartido({ local: local ? A : B, visitante: local ? B : A, semilla: 300000 + i * 10000 + k });
      p += pts(r, local ? 0 : 1);
    }
    res[i] = { ...t, p: p / n, n };
  });
  
    if (PARTES > 1) console.log(JSON.stringify(res));
    else imprimir(Object.values(res), K);
}

export function imprimir(lista, K) {
  const pct = (x) => `${(100 * x).toFixed(1)}%`;
  const media = Object.fromEntries(ORDEN_FORMACIONES.map((f) => [f, []]));
  let peor = { v: 0 };
  for (const r of lista.filter((x) => x.tipo === 'cruce')) {
    media[r.a].push(r.p);
    media[r.b].push(1 - r.p);
    const v = Math.abs(r.p - 0.5);
    if (v > peor.v) peor = { v, r };
  }
  console.log(`Plantillas (todos contra todos, ${K} partidos por cruce):`);
  for (const f of ORDEN_FORMACIONES) {
    const xs = media[f];
    console.log(`  ${f.padEnd(10)} ${pct(xs.reduce((s, x) => s + x, 0) / xs.length)}`);
  }
  if (peor.r) console.log(`  Cruce más desigual: ${peor.r.a} vs ${peor.r.b} → ${pct(peor.r.p)} para ${peor.r.a}`);
  console.log('Formas extremas contra una plantilla al azar (misma media):');
  for (const r of lista.filter((x) => x.tipo === 'forma')) console.log(`  ${r.nombre.padEnd(30)} ${pct(r.p)}`);
  const at = Object.fromEntries(lista.filter((x) => x.tipo === 'ataque').map((r) => [r.media, r.p]));
  if (at[80] !== undefined) console.log(`Con +5 de media: plantilla normal ${pct(at[80])} · 8 atacantes ${pct(at[85])}`);
}
