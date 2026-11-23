// node --test pruebas/
import test from 'node:test';
import assert from 'node:assert/strict';
import { crearRng } from '../js/motor/rng.js';
import {
  RAREZAS, ORDEN_RAREZAS, FORMACIONES, ORDEN_FORMACIONES, PUESTOS, ROLES,
  TABLA_ESTRATEGIAS, ORDEN_OFENSIVAS, ORDEN_DEFENSIVAS, ventajaFormacion,
} from '../js/motor/reglas.js';
import { atributosDeRareza, prepararEquipo, vecinosFormacion } from '../js/motor/encaje.js';
import { crearPartido, simularPartido } from '../js/motor/partido.js';
import { equipoAleatorio, generarFicha } from '../js/datos/prueba.js';

const ordenar = (xs) => [...xs].sort((a, b) => a - b);

test('rarezas: probabilidades suman 1 y restan 18/12/6/0', () => {
  const total = ORDEN_RAREZAS.reduce((s, r) => s + RAREZAS[r].probabilidad, 0);
  assert.ok(Math.abs(total - 1) < 1e-9);
  assert.deepEqual(ORDEN_RAREZAS.map((r) => RAREZAS[r].resta), [18, 12, 6, 0]);
  const ficha = { atributos: { definicion: 98, cabeza: 10 } };
  assert.equal(atributosDeRareza(ficha, 'comun').definicion, 80);
  assert.equal(atributosDeRareza(ficha, 'comun').cabeza, 1);
});

test('regla de oro: cada estrategia tiene ++, +, −, −− una vez (filas y columnas)', () => {
  for (const o of ORDEN_OFENSIVAS) {
    assert.deepEqual(ordenar(ORDEN_DEFENSIVAS.map((d) => TABLA_ESTRATEGIAS[o][d])), [-2, -1, 1, 2]);
  }
  for (const d of ORDEN_DEFENSIVAS) {
    assert.deepEqual(ordenar(ORDEN_OFENSIVAS.map((o) => TABLA_ESTRATEGIAS[o][d])), [-2, -1, 1, 2]);
  }
});

test('regla de oro: cada formación tiene ++, +, −, −− contra las demás y es antisimétrica', () => {
  for (const a of ORDEN_FORMACIONES) {
    const vals = ORDEN_FORMACIONES.filter((b) => b !== a).map((b) => ventajaFormacion(a, b));
    assert.deepEqual(ordenar(vals), [-2, -1, 1, 2]);
    assert.equal(ventajaFormacion(a, a), 0);
    for (const b of ORDEN_FORMACIONES) assert.equal(ventajaFormacion(a, b) + ventajaFormacion(b, a), 0);
  }
});

test('formaciones: 11 huecos, 1 portero, roles válidos y química con vecinos', () => {
  for (const f of ORDEN_FORMACIONES) {
    const huecos = FORMACIONES[f].huecos;
    assert.equal(huecos.length, 11, f);
    assert.equal(huecos.filter((h) => h.puesto === 'POR').length, 1, f);
    for (const h of huecos) for (const r of PUESTOS[h.puesto].roles) assert.ok(ROLES[r], r);
    assert.equal(FORMACIONES[f].vinculos.length, 17, `${f}: debe tener 17 vínculos`);
    for (const v of vecinosFormacion(f)) assert.ok(v.length >= 2, `${f}: hueco con menos de 2 vínculos`);
  }
});

test('encaje: jugar fuera de rol baja la media visible', () => {
  const rng = crearRng(7);
  const eq = equipoAleatorio(rng, { formacion: '4-3-3' });
  const normal = prepararEquipo(eq);
  const delantero = eq.alineacion[10].ficha;
  delantero.roles = ['central'];
  const fuera = prepararEquipo(eq);
  assert.ok(fuera.jugadores[10].media < normal.jugadores[10].media);
});

test('bonificaciones: condición de rol + efecto a una línea, y capitán solo con brazalete', () => {
  const rng = crearRng(3);
  const eq = equipoAleatorio(rng, { formacion: '4-2-3-1' });
  const mcoIndex = FORMACIONES['4-2-3-1'].huecos.findIndex((h) => h.puesto === 'MCO');
  const ficha = generarFicha(rng, 'mediapunta', 90);
  ficha.bonificaciones = [{
    nombre: 'Diez clásico',
    condicion: { tipo: 'rol', roles: ['mediapunta'] },
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'MED' } }, atributos: { paseCorto: 3 } },
  }];
  ficha.capitan = { nombre: 'Líder', efecto: { tipo: 'atributos', objetivo: { tipo: 'equipo' }, atributos: { compostura: 2 } } };
  eq.alineacion[mcoIndex] = { ficha, rareza: 'legendario', rol: 'mediapunta' };
  eq.capitan = 0;
  const sin = prepararEquipo(eq);
  const mcd = sin.jugadores.find((j) => j.puesto === 'MCD');
  assert.equal(mcd.bonos.paseCorto, 3);
  assert.equal(mcd.bonos.compostura, undefined);
  eq.capitan = mcoIndex;
  const con = prepararEquipo(eq);
  assert.equal(con.jugadores.find((j) => j.puesto === 'MCD').bonos.compostura, 2);
  assert.ok(con.bonificaciones.some((b) => b.capitan));
});

test('partido: misma semilla = mismo partido; termina a los 90 minutos', () => {
  const rng = crearRng(11);
  const a = equipoAleatorio(rng);
  const b = equipoAleatorio(rng);
  const r1 = simularPartido({ local: a, visitante: b, semilla: 42 });
  const r2 = simularPartido({ local: a, visitante: b, semilla: 42 });
  assert.deepEqual(r1, r2);
  const p = crearPartido({ local: a, visitante: b, semilla: 5 });
  p.jugarCompleto();
  assert.equal(p.estado.eventos.at(-1).tipo, 'final');
  assert.ok(p.estado.eventos.some((e) => e.tipo === 'descanso'));
});

test('partido: cambio táctico y sustitución en vivo', () => {
  const rng = crearRng(13);
  const a = equipoAleatorio(rng, { formacion: '4-4-2' });
  const b = equipoAleatorio(rng);
  const p = crearPartido({ local: a, visitante: b, semilla: 9 });
  p.jugarHasta(1800);
  p.cambiarTactica(0, { ofensiva: 'contraataque', defensiva: 'bloqueBajo' });
  assert.equal(p.estado.eq[0].ofensiva, 'contraataque');
  const suplente = { ficha: generarFicha(rng, 'delanteroArea', 80), rareza: 'raro' };
  p.sustituir(0, 10, suplente);
  assert.equal(p.estado.eq[0].jugadores[10].id, suplente.ficha.id);
  assert.equal(p.estado.eq[0].jugadores[10].energia, 100);
  p.jugarCompleto();
  assert.ok(p.terminado);
});

test('alineación: auto-alinear pone 11 distintos y un portero en la portería', async () => {
  const { autoAlinear } = await import('../js/motor/alineacion.js');
  const { crearPlantillaPrueba } = await import('../js/datos/club-prueba.js');
  const cartas = crearPlantillaPrueba(2026, 'p');
  for (const f of ORDEN_FORMACIONES) {
    const xi = autoAlinear(cartas, f);
    assert.equal(new Set(xi.map((a) => a.uid)).size, 11, f);
    const portero = cartas.find((c) => c.uid === xi[0].uid);
    assert.equal(portero.ficha.roles[0], 'portero', f);
  }
});
