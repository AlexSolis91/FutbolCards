// Calibración automática: node herramientas/calibrar.mjs [iteraciones] [partidos] [procesos]
// Ajusta MOTOR.calibracion para que ninguna estrategia ofensiva, defensiva ni
// casilla del campo sea superior por sí sola, y la escribe en
// js/motor/partido.js. Volver a ejecutar cuando cambien reglas o jugadores.
//
// - Estrategias: su % de puntos contra rivales al azar se lleva al 50 %.
// - Casillas: regresión (mínimos cuadrados con ridge) del resultado sobre qué
//   casillas usa cada equipo; se resta lo que aporta cada una. Los equipos
//   usan plantillas (70 %) y plantillas con un jugador movido (30 %). No se
//   usan formas al azar: casi siempre tienen huecos y la regresión acabaría
//   premiando las casillas de esas formas, borrando el castigo por huecos.
// El trabajo se reparte en varios procesos (por defecto, 12).

import { readFileSync, writeFileSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { crearRng } from '../js/motor/rng.js';
import { MOTOR, simularPartido } from '../js/motor/partido.js';
import { ORDEN_CASILLAS, PLANTILLAS, ORDEN_FORMACIONES } from '../js/motor/reglas.js';
import { equipoAleatorio } from '../js/datos/prueba.js';

const CAMPO = ORDEN_CASILLAS.filter((c) => c !== 'POR');
const D = CAMPO.length;

// Casillas de un equipo de calibración.
function casillasMuestra(rng) {
  const casillas = [...PLANTILLAS[rng.elegir(ORDEN_FORMACIONES)]];
  const movidos = rng() < 0.7 ? 0 : 1;
  for (let k = 0; k < movidos; k++) {
    const libres = CAMPO.filter((id) => !casillas.includes(id));
    casillas[rng.entero(1, 10)] = rng.elegir(libres);
  }
  return casillas;
}

// ---------------------------------------------------------------- Trabajo (un proceso)
function trabajar(it, parte, n) {
  const rng = crearRng(1000 * it + 17 * parte + 1);
  const XtX = Array.from({ length: D }, () => new Array(D).fill(0));
  const Xty = new Array(D).fill(0);
  const est = { ofensiva: {}, defensiva: {} };
  const sumar = (fam, k, v) => { est[fam][k] ??= [0, 0]; est[fam][k][0] += v; est[fam][k][1]++; };
  for (let i = 0; i < n; i++) {
    const a = equipoAleatorio(rng, { media: 80, casillas: casillasMuestra(rng) });
    const b = equipoAleatorio(rng, { media: 80, casillas: casillasMuestra(rng) });
    const r = simularPartido({ local: a, visitante: b, semilla: it * 1e6 + parte * 1e5 + i });
    const pa = r.ganador === null ? 0.5 : r.ganador === 0 ? 1 : 0;
    for (const [eq, v] of [[a, pa], [b, 1 - pa]]) {
      sumar('ofensiva', eq.ofensiva, v);
      sumar('defensiva', eq.defensiva, v);
    }
    const x = new Array(D).fill(0);
    for (const c of a.alineacion) if (c.casilla !== 'POR') x[CAMPO.indexOf(c.casilla)] += 1;
    for (const c of b.alineacion) if (c.casilla !== 'POR') x[CAMPO.indexOf(c.casilla)] -= 1;
    const y = pa - 0.5;
    for (let p = 0; p < D; p++) {
      if (!x[p]) continue;
      Xty[p] += x[p] * y;
      for (let q = 0; q < D; q++) if (x[q]) XtX[p][q] += x[p] * x[q];
    }
  }
  return { XtX, Xty, est };
}

// Resuelve (A + λI) w = b por eliminación de Gauss-Jordan.
function resolver(A, b, lambda) {
  const n = b.length;
  const M = A.map((fila, i) => [...fila.map((v, j) => v + (i === j ? lambda : 0)), b[i]]);
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
    [M[c], M[piv]] = [M[piv], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((fila, i) => fila[n] / fila[i]);
}

const esPrincipal = import.meta.url === pathToFileURL(process.argv[1]).href;

if (esPrincipal && process.argv[2] === 'trabajo') {
  // Proceso hijo: aplica la calibración recibida y devuelve sus sumas.
  const [, , , it, parte, n] = process.argv;
  Object.assign(MOTOR.calibracion, JSON.parse(process.env.FC_CALIBRACION));
  console.log(JSON.stringify(trabajar(+it, +parte, +n)));
} else if (esPrincipal) {
  const ITER = Number(process.argv[2] ?? 6);
  const N = Number(process.argv[3] ?? 24000);
  const P = Number(process.argv[4] ?? 12);
  const PASO_ESTRATEGIA = 0.6; // logit por punto de desvío
  const PASO_CASILLA = 0.5;
  const cal = MOTOR.calibracion;
  // Desde cero cada vez (no arrastrar sesgos de calibraciones anteriores).
  cal.casilla = {};
  const script = fileURLToPath(import.meta.url);
  const correr = promisify(execFile);

  for (let it = 1; it <= ITER; it++) {
    const env = { ...process.env, FC_CALIBRACION: JSON.stringify(cal) };
    const partes = await Promise.all(Array.from({ length: P }, (_, p) => correr(process.execPath,
      [script, 'trabajo', String(it), String(p), String(Math.ceil(N / P))], { env, maxBuffer: 1 << 26 })));
    const XtX = Array.from({ length: D }, () => new Array(D).fill(0));
    const Xty = new Array(D).fill(0);
    const est = { ofensiva: {}, defensiva: {} };
    for (const s of partes) {
      const r = JSON.parse(s.stdout.trim().split('\n').at(-1));
      for (let p = 0; p < D; p++) {
        Xty[p] += r.Xty[p];
        for (let q = 0; q < D; q++) XtX[p][q] += r.XtX[p][q];
      }
      for (const fam of Object.keys(est)) {
        for (const [k, [v, n]] of Object.entries(r.est[fam])) {
          est[fam][k] ??= [0, 0];
          est[fam][k][0] += v;
          est[fam][k][1] += n;
        }
      }
    }
    const linea = [];
    for (const fam of Object.keys(est)) {
      for (const [k, [v, n]] of Object.entries(est[fam])) {
        const x = v / n;
        cal[fam][k] = +(cal[fam][k] + PASO_ESTRATEGIA * (0.5 - x)).toFixed(3);
        linea.push(`${k} ${(100 * x).toFixed(1)}`);
      }
    }
    // Ridge: 1 % de la diagonal media, para estabilizar casillas poco usadas.
    const lambda = 0.01 * XtX.reduce((s, f, i) => s + f[i], 0) / D;
    const w = resolver(XtX, Xty, lambda);
    CAMPO.forEach((c, i) => { cal.casilla[c] = +((cal.casilla[c] ?? 0) - PASO_CASILLA * w[i]).toFixed(4); });
    const mayor = Math.max(...w.map(Math.abs));
    console.log(`iteración ${it}: ${linea.join(' | ')} | mayor efecto de una casilla ${(100 * mayor).toFixed(2)} puntos`);
  }

  const archivo = fileURLToPath(new URL('../js/motor/partido.js', import.meta.url));
  const fmt = (o) => `{ ${Object.entries(o).map(([k, v]) => `${/^\w+$/.test(k) ? k : `'${k}'`}: ${v}`).join(', ')} }`;
  const bloque = `calibracion: {
    ofensiva: ${fmt(cal.ofensiva)},
    defensiva: ${fmt(cal.defensiva)},
    casilla: ${fmt(Object.fromEntries(CAMPO.map((c) => [c, cal.casilla[c] ?? 0])))},
  },`;
  const texto = readFileSync(archivo, 'utf8').replace(/calibracion: \{[\s\S]*?\n  \},/, bloque);
  writeFileSync(archivo, texto);
  console.log('\nGuardado en js/motor/partido.js:\n  ' + bloque);
}
