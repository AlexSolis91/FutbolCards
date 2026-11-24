// node --test pruebas/
import test from 'node:test';
import assert from 'node:assert/strict';
import { crearRng } from '../js/motor/rng.js';
import {
  RAREZAS, ORDEN_RAREZAS, CATEGORIAS, rarezasDe, FORMACIONES, ORDEN_FORMACIONES, PUESTOS, ROLES,
  TABLA_ESTRATEGIAS, ORDEN_OFENSIVAS, ORDEN_DEFENSIVAS, CASILLAS, ORDEN_CASILLAS, PLANTILLAS,
  formacionDeCasillas, PERSONALIZADA, pesosCarril,
} from '../js/motor/reglas.js';
import { atributosDeRareza, prepararEquipo, vecinosFormacion } from '../js/motor/encaje.js';
import { crearPartido, simularPartido } from '../js/motor/partido.js';
import { equipoAleatorio, generarFicha } from '../js/datos/prueba.js';

const ordenar = (xs) => [...xs].sort((a, b) => a - b);

test('rarezas: probabilidades suman 1; cada categoría son 2 rarezas seguidas y la baja resta 6', () => {
  const total = ORDEN_RAREZAS.reduce((s, r) => s + RAREZAS[r].probabilidad, 0);
  assert.ok(Math.abs(total - 1) < 1e-9);
  for (const c of Object.values(CATEGORIAS)) {
    assert.equal(c.rarezas.length, 2);
    assert.equal(ORDEN_RAREZAS.indexOf(c.rarezas[1]) - ORDEN_RAREZAS.indexOf(c.rarezas[0]), 1);
  }
  const estrella = { categoria: 'estrella', atributos: { definicion: 98, cabeza: 4 } };
  assert.equal(atributosDeRareza(estrella, 'legendario').definicion, 98);
  assert.equal(atributosDeRareza(estrella, 'epico').definicion, 92);
  assert.equal(atributosDeRareza(estrella, 'epico').cabeza, 1);
  assert.throws(() => atributosDeRareza(estrella, 'raro'));
  const base = { categoria: 'base', atributos: { definicion: 80 } };
  assert.equal(atributosDeRareza(base, 'raro').definicion, 80);
  assert.equal(atributosDeRareza(base, 'comun').definicion, 74);
  assert.throws(() => atributosDeRareza(base, 'epico'));
  // Jugador con 3 rarezas: atributos en la alta, −6 por cada rareza por debajo.
  const tres = { categoria: 'figura', rarezas: ['comun', 'raro', 'epico'], atributos: { definicion: 88 } };
  assert.deepEqual(rarezasDe(tres), ['comun', 'raro', 'epico']);
  assert.equal(atributosDeRareza(tres, 'epico').definicion, 88);
  assert.equal(atributosDeRareza(tres, 'raro').definicion, 82);
  assert.equal(atributosDeRareza(tres, 'comun').definicion, 76);
  assert.throws(() => atributosDeRareza(tres, 'legendario'));
  // Ficticios de prueba (sin categoría): 4 rarezas, base en Legendario.
  assert.equal(atributosDeRareza({ atributos: { definicion: 98 } }, 'comun').definicion, 80);
});

test('regla de oro: cada estrategia tiene ++, +, −, −− una vez (filas y columnas)', () => {
  for (const o of ORDEN_OFENSIVAS) {
    assert.deepEqual(ordenar(ORDEN_DEFENSIVAS.map((d) => TABLA_ESTRATEGIAS[o][d])), [-2, -1, 1, 2]);
  }
  for (const d of ORDEN_DEFENSIVAS) {
    assert.deepEqual(ordenar(ORDEN_OFENSIVAS.map((o) => TABLA_ESTRATEGIAS[o][d])), [-2, -1, 1, 2]);
  }
});

test('casillas: 24, nombres y puestos válidos; cobertura de carriles suma 1', () => {
  assert.equal(ORDEN_CASILLAS.length, 24);
  for (const id of ORDEN_CASILLAS) {
    const c = CASILLAS[id];
    assert.ok(PUESTOS[c.puesto], `${id}: puesto ${c.puesto}`);
    for (const r of PUESTOS[c.puesto].roles) assert.ok(ROLES[r], r);
    const w = pesosCarril(c.x);
    assert.ok(Math.abs(w.izq + w.cen + w.der - 1) < 1e-9, id);
  }
  // Un lateral cubre sobre todo su banda; un central puro, el centro.
  assert.ok(pesosCarril(CASILLAS.LI.x).izq > 0.85);
  assert.ok(pesosCarril(CASILLAS.DFC.x).cen > 0.7);
});

test('plantillas: 11 casillas distintas con portero; se reconocen y lo demás es personalizada', () => {
  for (const f of ORDEN_FORMACIONES) {
    const ids = PLANTILLAS[f];
    assert.equal(ids.length, 11, f);
    assert.equal(new Set(ids).size, 11, f);
    assert.equal(ids[0], 'POR', f);
    assert.equal(formacionDeCasillas([...ids].reverse()), f);
    for (const v of vecinosFormacion(f)) assert.ok(v.length >= 1, `${f}: jugador sin vínculos`);
  }
  assert.equal(formacionDeCasillas(['POR', 'LI', 'DFCI', 'DFCD', 'LD', 'MI', 'II', 'ID', 'MD', 'DI', 'EI']), PERSONALIZADA);
});

test('química por cercanía: un jugador aislado no tiene vínculos', async () => {
  const { vecinosPorCercania } = await import('../js/motor/encaje.js');
  const pos = [{ x: 50, y: 5 }, { x: 30, y: 20 }, { x: 70, y: 20 }, { x: 50, y: 38 }, { x: 10, y: 95 }];
  const v = vecinosPorCercania(pos);
  assert.equal(v[4].length, 0);
  assert.ok(v[0].includes(1) && v[1].includes(0), 'los vínculos son mutuos');
});

test('formación personalizada: el motor acepta cualquier casilla y exige portero y casillas distintas', () => {
  const rng = crearRng(21);
  const casillas = ['POR', 'LI', 'DFC', 'LD', 'CAI', 'MCD', 'CAD', 'MCOI', 'MCOD', 'DC', 'DD'];
  const eq = equipoAleatorio(rng, { casillas });
  const prep = prepararEquipo(eq);
  assert.equal(prep.formacion, PERSONALIZADA);
  assert.deepEqual(prep.jugadores.map((j) => j.casilla), casillas);
  const sinPortero = structuredClone(eq);
  sinPortero.alineacion[0].casilla = 'MC';
  assert.throws(() => prepararEquipo(sinPortero), /portero/);
  const repetida = structuredClone(eq);
  repetida.alineacion[2].casilla = 'LI';
  assert.throws(() => prepararEquipo(repetida), /casilla/);
});

test('huecos: atacar una banda sin defensores se aprovecha', () => {
  // Equipo sin nadie en la banda izquierda contra el mismo equipo completo.
  const rng = crearRng(31);
  const sinIzq = ['POR', 'DFC', 'DFCD', 'LD', 'MCD', 'MC', 'ID', 'MD', 'MCO', 'DC', 'DD'];
  let puntos = 0;
  const n = 300;
  for (let i = 0; i < n; i++) {
    const a = equipoAleatorio(rng, { media: 80, casillas: sinIzq });
    const b = equipoAleatorio(rng, { media: 80, formacion: '4-3-3' });
    const r = simularPartido({ local: a, visitante: b, semilla: 7000 + i });
    puntos += r.ganador === null ? 0.5 : r.ganador === 0 ? 1 : 0;
  }
  assert.ok(puntos / n < 0.4, `el equipo con el hueco saca ${(100 * puntos / n).toFixed(1)} %`);
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
  const casillaMco = eq.alineacion[mcoIndex].casilla;
  const ficha = generarFicha(rng, 'mediapunta', 90);
  ficha.bonificaciones = [{
    nombre: 'Diez clásico',
    condicion: { tipo: 'rol', roles: ['mediapunta'] },
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'MED' } }, atributos: { paseCorto: 3 } },
  }];
  ficha.capitan = { nombre: 'Líder', efecto: { tipo: 'atributos', objetivo: { tipo: 'equipo' }, atributos: { compostura: 2 } } };
  eq.alineacion[mcoIndex] = { ficha, rareza: 'legendario', rol: 'mediapunta', casilla: casillaMco };
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
    const portero = cartas.find((c) => c.uid === xi.find((a) => a.casilla === 'POR').uid);
    assert.equal(portero.ficha.roles[0], 'portero', f);
    assert.deepEqual(xi.map((a) => a.casilla), PLANTILLAS[f], f);
  }
});

test('jugadores reales: ninguno supera la media base máxima en Legendario y sus fichas son válidas', async () => {
  const { JUGADORES } = await import('../js/datos/jugadores/index.js');
  const { MEDIA_MAXIMA_LEGENDARIO, LISTA_ATRIBUTOS, ESCUELAS } = await import('../js/motor/reglas.js');
  const { mediaEnRol } = await import('../js/motor/encaje.js');
  const ids = new Set();
  const escuelas = Object.values(ESCUELAS).map((e) => e.nombre);
  for (const j of JUGADORES) {
    assert.ok(!ids.has(j.id), `id repetido: ${j.id}`);
    ids.add(j.id);
    for (const a of LISTA_ATRIBUTOS) assert.ok(j.atributos[a] >= 1 && j.atributos[a] <= 99, `${j.id}.${a}`);
    for (const r of j.roles) assert.ok(ROLES[r], `${j.id}: rol ${r}`);
    assert.ok(escuelas.includes(j.escuela), `${j.id}: escuela ${j.escuela}`);
    assert.ok(CATEGORIAS[j.categoria], `${j.id}: categoría ${j.categoria}`);
    if (j.rarezas) {
      // Rarezas propias: 3 seguidas que incluyen las de su categoría.
      const idx = j.rarezas.map((r) => ORDEN_RAREZAS.indexOf(r));
      assert.equal(j.rarezas.length, 3, `${j.id}: rarezas`);
      assert.ok(idx.every((x, i) => x >= 0 && (i === 0 || x === idx[i - 1] + 1)), `${j.id}: rarezas seguidas`);
      for (const r of CATEGORIAS[j.categoria].rarezas) assert.ok(j.rarezas.includes(r), `${j.id}: ${r}`);
    }
    for (const r of j.roles) {
      assert.ok(Math.round(mediaEnRol(j.atributos, r)) <= MEDIA_MAXIMA_LEGENDARIO, `${j.id} supera ${MEDIA_MAXIMA_LEGENDARIO} como ${r}`);
    }
  }
});

test('colección: 6 copias suben a la siguiente rareza y consumen 5; la alineada conserva su sitio', async () => {
  const { agruparColeccion, puedeMejorar, mejorarCarta } = await import('../js/motor/coleccion.js');
  const ficha = { id: 'x', nombre: 'X', roles: ['delanteroArea'], atributos: {} };
  const cartas = Array.from({ length: 7 }, (_, i) => ({ uid: `u${i}`, ficha, rareza: 'comun' }));
  const tactica = { alineacion: [{ uid: 'u3', rol: 'delanteroArea' }] };
  assert.equal(agruparColeccion(cartas)[0].copias, 7);
  assert.ok(puedeMejorar(cartas, 'x', 'comun'));
  assert.ok(!puedeMejorar(cartas.slice(0, 5), 'x', 'comun'));
  const r = mejorarCarta(cartas, tactica, 'x', 'comun');
  assert.equal(r.uid, 'u3');
  assert.equal(r.cartas.length, 2);
  assert.equal(r.cartas.find((c) => c.uid === 'u3').rareza, 'raro');
  assert.ok(!puedeMejorar(r.cartas, 'x', 'comun'));
  const leg = Array.from({ length: 6 }, (_, i) => ({ uid: `l${i}`, ficha, rareza: 'legendario' }));
  assert.ok(!puedeMejorar(leg, 'x', 'legendario'));
  // Con 2 rarezas, la alta es el tope: una Figura no pasa de Épico.
  const figura = { ...ficha, id: 'f', categoria: 'figura' };
  const raros = Array.from({ length: 6 }, (_, i) => ({ uid: `f${i}`, ficha: figura, rareza: 'raro' }));
  assert.equal(mejorarCarta(raros, { alineacion: [] }, 'f', 'raro').cartas[0].rareza, 'epico');
  const epicos = raros.map((c) => ({ ...c, rareza: 'epico' }));
  assert.ok(!puedeMejorar(epicos, 'f', 'epico'));
});

test('alineación: un jugador no se repite en el campo y el banquillo muestra una carta por jugador', async () => {
  const { autoAlinear, banquillo } = await import('../js/motor/alineacion.js');
  const { crearPlantillaPrueba, copiasDemo } = await import('../js/datos/club-prueba.js');
  const { JUGADORES } = await import('../js/datos/jugadores/index.js');
  const cartas = [...crearPlantillaPrueba(7, 'p'), ...copiasDemo(JUGADORES)];
  for (const f of ORDEN_FORMACIONES) {
    const xi = autoAlinear(cartas, f);
    const fichas = xi.map((a) => cartas.find((c) => c.uid === a.uid).ficha.id);
    assert.equal(new Set(fichas).size, 11, f);
    const banca = banquillo(cartas, xi, ORDEN_RAREZAS);
    const ids = banca.map((b) => b.carta.ficha.id);
    assert.equal(new Set(ids).size, ids.length, f);
    assert.ok(ids.every((id) => !fichas.includes(id)), f);
  }
});

test('alineación: repararAlineacion arregla un once con el mismo jugador dos veces', async () => {
  const { autoAlinear, repararAlineacion } = await import('../js/motor/alineacion.js');
  const { crearPlantillaPrueba, copiasDemo } = await import('../js/datos/club-prueba.js');
  const { JUGADORES } = await import('../js/datos/jugadores/index.js');
  const cartas = [...crearPlantillaPrueba(7, 'p'), ...copiasDemo(JUGADORES)];
  const alineacion = autoAlinear(cartas, '4-4-2');
  // Dos copias de Messi y una carta que ya no existe.
  alineacion[9] = { uid: 'lionel-messi-demo-1', rol: 'falso9' };
  alineacion[10] = { uid: 'lionel-messi-demo-2', rol: 'falso9' };
  alineacion[3] = { uid: 'no-existe', rol: 'central' };
  const { tactica, cambiada } = repararAlineacion(cartas, { formacion: '4-4-2', ofensiva: 'posesion', defensiva: 'bloqueMedio', capitan: 'no-existe', alineacion });
  assert.ok(cambiada);
  const fichas = tactica.alineacion.map((a) => cartas.find((c) => c.uid === a.uid).ficha.id);
  assert.equal(new Set(fichas).size, 11);
  assert.ok(tactica.alineacion.some((a) => a.uid === tactica.capitan));
  const { definicionEquipo } = await import('../js/motor/alineacion.js');
  prepararEquipo(definicionEquipo('X', cartas, tactica)); // no lanza
  const limpia = autoAlinear(cartas, '4-3-3');
  assert.equal(repararAlineacion(cartas, { formacion: '4-3-3', capitan: limpia[0].uid, alineacion: limpia }).cambiada, false);
});

test('mover jugadores: casilla vacía, intercambio, banquillo y portería', async () => {
  const { autoAlinear, moverJugador, repararAlineacion } = await import('../js/motor/alineacion.js');
  const { crearPlantillaPrueba } = await import('../js/datos/club-prueba.js');
  const cartas = crearPlantillaPrueba(5, 'p');
  const al = autoAlinear(cartas, '4-4-2');
  const t = { formacion: '4-4-2', ofensiva: 'posesion', defensiva: 'bloqueMedio', capitan: al[9].uid, alineacion: al };
  // A una casilla vacía: la formación pasa a personalizada.
  const dc = al.find((a) => a.casilla === 'DI');
  let r = moverJugador(cartas, t, dc.uid, { casilla: 'MCO' });
  assert.ok(r.ok);
  assert.equal(r.tactica.alineacion.find((a) => a.uid === dc.uid).casilla, 'MCO');
  assert.ok(ORDEN_FORMACIONES.includes(r.tactica.formacion) || r.tactica.formacion === PERSONALIZADA);
  // Intercambio entre titulares.
  const li = al.find((a) => a.casilla === 'LI');
  r = moverJugador(cartas, t, li.uid, { uid: dc.uid });
  assert.equal(r.tactica.alineacion.find((a) => a.uid === li.uid).casilla, 'DI');
  assert.equal(r.tactica.alineacion.find((a) => a.uid === dc.uid).casilla, 'LI');
  assert.equal(r.tactica.formacion, '4-4-2');
  // Del banquillo sobre un titular: entra en su casilla y hereda el brazalete.
  const suplente = cartas.find((c) => !al.some((a) => a.uid === c.uid));
  const capitan = al.find((a) => a.uid === t.capitan);
  r = moverJugador(cartas, t, suplente.uid, { uid: capitan.uid });
  assert.ok(r.ok);
  assert.equal(r.tactica.alineacion.find((a) => a.uid === suplente.uid).casilla, capitan.casilla);
  assert.equal(r.tactica.capitan, suplente.uid);
  // Del banquillo a una casilla vacía: no (siempre 11).
  assert.equal(moverJugador(cartas, t, suplente.uid, { casilla: 'MCO' }).ok, false);
  // El portero no puede dejar la portería vacía.
  const por = al.find((a) => a.casilla === 'POR');
  assert.equal(moverJugador(cartas, t, por.uid, { casilla: 'MCO' }).ok, false);
  // Una táctica antigua (sin casillas) se repara con su plantilla.
  const vieja = { ...t, alineacion: al.map(({ uid, rol }) => ({ uid, rol })) };
  const rep = repararAlineacion(cartas, vieja);
  assert.deepEqual(rep.tactica.alineacion.map((a) => a.casilla), PLANTILLAS['4-4-2']);
});
