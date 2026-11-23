// Simulador de equilibrio: node herramientas/balance.mjs [partidos]
// Mide goles, empates, y el % de victoria de cada estrategia y formación.

import { crearRng } from '../js/motor/rng.js';
import { simularPartido } from '../js/motor/partido.js';
import { ORDEN_FORMACIONES, ORDEN_OFENSIVAS, ORDEN_DEFENSIVAS, TABLA_ESTRATEGIAS, ventajaFormacion } from '../js/motor/reglas.js';
import { equipoAleatorio } from './prueba.mjs';

const N = Number(process.argv[2] ?? 4000);
const rng = crearRng(12345);
const pct = (x) => (100 * x).toFixed(1).padStart(5) + '%';

// Puntos de un resultado para el equipo 0: victoria 1, empate 0.5.
const puntos = (r, lado) => (r.ganador === null ? 0.5 : r.ganador === lado ? 1 : 0);

function jugar(a, b, semilla) {
  return simularPartido({ local: a, visitante: b, semilla });
}

// ---------------------------------------------------------------- 1. General
const acum = { goles: 0, empates: 0, tiros: 0, posMax: 0 };
const porOf = Object.fromEntries(ORDEN_OFENSIVAS.map((k) => [k, { p: 0, n: 0 }]));
const porDef = Object.fromEntries(ORDEN_DEFENSIVAS.map((k) => [k, { p: 0, n: 0 }]));
const porForm = Object.fromEntries(ORDEN_FORMACIONES.map((k) => [k, { p: 0, n: 0 }]));
const golesCelda = {};
const porVentajaEst = {};
const porVentajaForm = {};
const registrar = (obj, k, v) => { obj[k] ??= { p: 0, n: 0 }; obj[k].p += v; obj[k].n++; };

for (let i = 0; i < N; i++) {
  const a = equipoAleatorio(rng, { media: 80 });
  const b = equipoAleatorio(rng, { media: 80 });
  const r = jugar(a, b, i + 1);
  acum.goles += r.marcador[0] + r.marcador[1];
  acum.empates += r.ganador === null ? 1 : 0;
  acum.tiros += r.stats[0].tiros + r.stats[1].tiros;
  acum.posMax += Math.max(r.stats[0].posesion, r.stats[1].posesion);
  for (const [lado, eq, rival] of [[0, a, b], [1, b, a]]) {
    const v = puntos(r, lado);
    registrar(porOf, eq.ofensiva, v);
    registrar(porDef, eq.defensiva, v);
    registrar(porForm, eq.formacion, v);
    registrar(golesCelda, `${eq.ofensiva}|${rival.defensiva}`, r.marcador[lado]);
    // Ventaja neta de estrategias: mi ataque vs su defensa − su ataque vs mi defensa.
    const neta = TABLA_ESTRATEGIAS[eq.ofensiva][rival.defensiva] - TABLA_ESTRATEGIAS[rival.ofensiva][eq.defensiva];
    registrar(porVentajaEst, neta, v);
    registrar(porVentajaForm, ventajaFormacion(eq.formacion, rival.formacion), v);
  }
}

console.log(`\n=== ${N} partidos entre equipos de media 80 ===`);
console.log(`Goles por partido: ${(acum.goles / N).toFixed(2)}   Empates: ${pct(acum.empates / N)}   Tiros: ${(acum.tiros / N).toFixed(1)}   Posesión del dominante: ${pct(acum.posMax / N)}`);

const tabla = (titulo, obj) => {
  console.log(`\n${titulo} (puntos: victoria 1, empate 0.5)`);
  for (const [k, v] of Object.entries(obj)) console.log(`  ${k.padEnd(14)} ${pct(v.p / v.n)}  (n=${v.n})`);
};
tabla('Estrategia ofensiva', porOf);
tabla('Estrategia defensiva', porDef);
tabla('Formación', porForm);
tabla('Ventaja neta de estrategias (−4…+4)', Object.fromEntries(Object.entries(porVentajaEst).sort((x, y) => x[0] - y[0])));
tabla('Ventaja de formación (−2…+2)', Object.fromEntries(Object.entries(porVentajaForm).sort((x, y) => x[0] - y[0])));

console.log('\nGoles del atacante por partido (fila = su ofensiva, columna = defensiva rival)');
console.log('                ' + ORDEN_DEFENSIVAS.map((d) => d.padStart(14)).join(''));
for (const o of ORDEN_OFENSIVAS) {
  console.log(o.padEnd(16) + ORDEN_DEFENSIVAS.map((d) => {
    const c = golesCelda[`${o}|${d}`];
    const sig = { 2: '++', 1: '+', '-1': '−', '-2': '−−' }[TABLA_ESTRATEGIAS[o][d]];
    return `${(c.p / c.n).toFixed(2)} ${sig}`.padStart(14);
  }).join(''));
}

// ---------------------------------------------------------------- 2. Calidad y encaje
function duelo(titulo, crearA, crearB, n = Math.round(N / 2)) {
  let v = 0, e = 0, d = 0;
  for (let i = 0; i < n; i++) {
    const r = jugar(crearA(), crearB(), 900000 + i);
    if (r.ganador === 0) v++; else if (r.ganador === null) e++; else d++;
  }
  console.log(`  ${titulo.padEnd(58)} gana ${pct(v / n)}  empata ${pct(e / n)}  pierde ${pct(d / n)}`);
}

console.log('\nCalidad, roles y estrategia (equipo A contra B)');
duelo('A media 85 vs B media 80', () => equipoAleatorio(rng, { media: 85 }), () => equipoAleatorio(rng, { media: 80 }));
duelo('A media 90 vs B media 80', () => equipoAleatorio(rng, { media: 90 }), () => equipoAleatorio(rng, { media: 80 }));
duelo('A fuera de rol vs B en su rol (misma media)', () => equipoAleatorio(rng, { media: 80, fueraDeRol: true }), () => equipoAleatorio(rng, { media: 80 }));
duelo('A con química máxima vs B al azar', () => equipoAleatorio(rng, { media: 80, nacion: 'Brasil' }), () => equipoAleatorio(rng, { media: 80 }));
duelo('A media 75 con ++ en todo vs B media 80 con −− en todo', () => equipoAleatorio(rng, {
  media: 75, ofensiva: 'contraataque', defensiva: 'marcajeHombre', formacion: '4-4-2',
}), () => equipoAleatorio(rng, {
  media: 80, ofensiva: 'directo', defensiva: 'presionAlta', formacion: '4-3-3',
}));
