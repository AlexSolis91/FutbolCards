// Calibración automática: node herramientas/calibrar.mjs [iteraciones] [partidos]
// Ajusta MOTOR.calibracion hasta que cada estrategia ofensiva, defensiva y
// formación ronde el 50 % de puntos contra rivales al azar, y la escribe en
// js/motor/partido.js. Volver a ejecutar cuando cambien reglas o jugadores.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { crearRng } from '../js/motor/rng.js';
import { MOTOR, simularPartido } from '../js/motor/partido.js';
import { equipoAleatorio } from '../js/datos/prueba.js';

const ITER = Number(process.argv[2] ?? 8);
const N = Number(process.argv[3] ?? 3000);
const PASO = 0.6;
const cal = MOTOR.calibracion;

for (let it = 1; it <= ITER; it++) {
  const rng = crearRng(1000 + it);
  const res = { ofensiva: {}, defensiva: {}, formacion: {} };
  const sumar = (fam, k, v) => { res[fam][k] ??= { p: 0, n: 0 }; res[fam][k].p += v; res[fam][k].n++; };
  for (let i = 0; i < N; i++) {
    const a = equipoAleatorio(rng, { media: 80 });
    const b = equipoAleatorio(rng, { media: 80 });
    const r = simularPartido({ local: a, visitante: b, semilla: it * 100000 + i });
    for (const [lado, eq] of [[0, a], [1, b]]) {
      const v = r.ganador === null ? 0.5 : r.ganador === lado ? 1 : 0;
      sumar('ofensiva', eq.ofensiva, v);
      sumar('defensiva', eq.defensiva, v);
      sumar('formacion', eq.formacion, v);
    }
  }
  const linea = [];
  for (const fam of Object.keys(res)) {
    for (const [k, { p, n }] of Object.entries(res[fam])) {
      const x = p / n;
      // Una defensiva fuerte se compensa restándole (se resta en el duelo).
      cal[fam][k] = +(cal[fam][k] + PASO * (0.5 - x)).toFixed(3);
      linea.push(`${k} ${(100 * x).toFixed(1)}`);
    }
  }
  console.log(`iteración ${it}: ${linea.join(' | ')}`);
}

const archivo = fileURLToPath(new URL('../js/motor/partido.js', import.meta.url));
const fmt = (o) => `{ ${Object.entries(o).map(([k, v]) => `${/^\w+$/.test(k) ? k : `'${k}'`}: ${v}`).join(', ')} }`;
const bloque = `calibracion: {
    ofensiva: ${fmt(cal.ofensiva)},
    defensiva: ${fmt(cal.defensiva)},
    formacion: ${fmt(cal.formacion)},
  },`;
const texto = readFileSync(archivo, 'utf8').replace(/calibracion: \{[\s\S]*?\n  \},/, bloque);
writeFileSync(archivo, texto);
console.log('\nGuardado en js/motor/partido.js:\n  ' + bloque);
