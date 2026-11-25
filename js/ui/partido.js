// Pantalla de partido: simulación en vivo con crónica, las cartas de los dos
// equipos moviéndose en el campo con el balón, velocidad, cambios tácticos y
// sustituciones; o simular directo al final.

import { h, vaciar, opcion } from './dom.js';
import { iniciales } from './carta.js';
import { crearCampoPartido } from './campo-partido.js';
import { crearPartido, MOTOR } from '../motor/partido.js';
import {
  ORDEN_FORMACIONES, OFENSIVAS, ORDEN_OFENSIVAS, DEFENSIVAS, ORDEN_DEFENSIVAS, ORDEN_RAREZAS, PERSONALIZADA,
} from '../motor/reglas.js';
import { definicionEquipo, cambiarFormacion, valorEnPuesto, banquillo } from '../motor/alineacion.js';
import { crearRivalPrueba } from '../datos/club-prueba.js';
import { narrar } from './narracion.js';

// Espera tras cada evento (ms, a velocidad x1). Los remates necesitan más
// tiempo: pase, remate y balón a la red o al portero.
const ESPERA = { gol: 2900, parada: 1900, fuera: 1800, perdida: 900, avance: 900, contragolpe: 1000, recicla: 800, posesion: 700, descanso: 1800, tactica: 600, cambio: 800, final: 0 };
const ESPERA_SILENCIOSA = 600;

export function pantallaPartido(app, { club, ir }) {
  const rival = crearRivalPrueba(Date.now() % 1e9);
  // Táctica del partido (copia: lo que cambies aquí no toca tu alineación guardada).
  const tp = structuredClone(club.tactica);
  const local = definicionEquipo(club.nombre, club.cartas, tp);
  const visitante = definicionEquipo(rival.nombre, rival.cartas, rival.tactica);
  const partido = crearPartido({ local, visitante, semilla: Date.now() % 1e9 });
  const equipos = [club.nombre, rival.nombre];
  // Los eventos nombran a cada jugador por el id de su ficha.
  const nombres = [club.cartas, rival.cartas].map((cartas) => new Map(cartas.map((c) => [c.ficha.id, c.ficha.nombre])));
  const nombre = (lado, id) => partido.estado.eq[lado].jugadores.find((j) => j.id === id)?.nombre ?? nombres[lado].get(id) ?? '—';

  let cola = [];
  let temporizador = null;
  let enPausa = true;
  let velocidad = 1;
  let ultimoMinuto = 0;

  // ---------------------------------------------------------- Estructura
  const golesEl = h('div', { class: 'goles' }, '0 – 0');
  const minutoEl = h('span', { class: 'minuto' }, "0'");
  const vista = crearCampoPartido();
  const campo = vista.el;
  const cronica = h('ol', { class: 'cronica', 'aria-live': 'polite' });
  const statsEl = h('div', { class: 'estadisticas' });
  const botonPlay = h('button', { class: 'boton primario', onclick: () => (enPausa ? reanudar() : pausar()) }, '▶ Empezar');
  const botonesVel = [1, 2, 4].map((v) => h('button', {
    'aria-pressed': String(v === velocidad),
    onclick: () => { velocidad = v; vista.velocidad(v); botonesVel.forEach((b, i) => b.setAttribute('aria-pressed', String([1, 2, 4][i] === v))); },
  }, `x${v}`));
  const botonSimular = h('button', { class: 'boton', onclick: simularFinal }, '⏩ Simular resultado');
  const botonTactica = h('button', { class: 'boton', onclick: abrirTactica }, '📋 Táctica');
  const botonCambio = h('button', { class: 'boton', onclick: abrirCambio }, '🔁 Cambio');
  const pie = h('div', { class: 'acciones oculto' },
    h('button', { class: 'boton primario', onclick: () => ir('partido') }, 'Jugar otro amistoso'),
    h('button', { class: 'boton', onclick: () => ir('temporadas') }, 'Volver'));

  app.append(h('section', { class: 'partido' },
    h('div', { class: 'panel marcador ancho' },
      h('div', { class: 'equipo' }, h('div', { class: 'escudo' }, iniciales(equipos[0])), h('span', {}, equipos[0])),
      h('div', {}, golesEl, minutoEl),
      h('div', { class: 'equipo visitante' }, h('div', { class: 'escudo rival' }, iniciales(equipos[1])), h('span', {}, equipos[1]))),
    h('div', { class: 'ancho zona-campo' },
      campo,
      h('div', { class: 'controles' }, botonPlay, h('div', { class: 'velocidad', role: 'group', 'aria-label': 'Velocidad' }, botonesVel),
        botonSimular, botonTactica, botonCambio),
      pie),
    h('div', { class: 'panel' }, h('h2', {}, 'Estadísticas'), statsEl),
    h('div', { class: 'panel' }, h('h2', {}, 'Crónica'), cronica)));

  vista.sincronizar(partido.estado.eq);
  vista.saque(partido.estado.lado);
  requestAnimationFrame(() => vista.ajustar());
  pintarStats();

  // ---------------------------------------------------------- Reproducción
  function mostrarEvento(e, rapido = false) {
    ultimoMinuto = e.minuto;
    minutoEl.textContent = `${e.minuto}'`;
    if (e.tipo === 'tactica' || e.tipo === 'cambio') vista.sincronizar(partido.estado.eq);
    vista.evento(e, rapido);
    if (e.tipo === 'gol') {
      golesEl.textContent = `${e.marcador[0]} – ${e.marcador[1]}`;
    }
    if (e.tipo === 'gol' && !rapido) {
      const flash = h('div', { class: 'flash-gol' }, '¡GOL!');
      setTimeout(() => {
        campo.append(flash);
        setTimeout(() => flash.remove(), 1700);
      }, 900 / velocidad);
    }
    const texto = narrar(e, nombre, equipos);
    if (texto) {
      const clase = [e.tipo === 'gol' ? 'gol' : '', e.lado === 0 ? 'local' : e.lado === 1 ? 'visitante' : ''].join(' ');
      cronica.prepend(h('li', { class: clase }, h('span', { class: 'min' }, `${e.minuto}'`), h('span', {}, texto)));
    }
    if (!rapido && texto) pintarStats();
    return texto !== null;
  }

  function siguiente() {
    temporizador = null;
    if (enPausa) return;
    if (!cola.length) {
      if (partido.terminado) return terminar();
      cola = partido.paso();
    }
    const e = cola.shift();
    if (!e) return terminar();
    const visible = mostrarEvento(e);
    if (e.tipo === 'final') return terminar();
    const espera = (ESPERA[e.tipo] ?? (visible ? 800 : ESPERA_SILENCIOSA)) / velocidad;
    temporizador = setTimeout(siguiente, espera);
  }

  function reanudar() {
    if (partido.terminado && !cola.length) return;
    enPausa = false;
    botonPlay.textContent = '⏸ Pausa';
    if (!temporizador) siguiente();
  }

  function pausar() {
    enPausa = true;
    botonPlay.textContent = '▶ Seguir';
    if (temporizador) clearTimeout(temporizador);
    temporizador = null;
  }

  function simularFinal() {
    pausar();
    for (const e of cola) mostrarEvento(e, true);
    cola = [];
    while (!partido.terminado) for (const e of partido.paso()) mostrarEvento(e, true);
    pintarStats();
    vista.saque(0);
    terminar();
  }

  function terminar() {
    pausar();
    golesEl.textContent = `${partido.estado.marcador[0]} – ${partido.estado.marcador[1]}`;
    minutoEl.textContent = 'Final';
    for (const b of [botonPlay, botonSimular, botonTactica, botonCambio]) b.disabled = true;
    pie.classList.remove('oculto');
    pintarStats();
  }

  function pintarStats() {
    const r = partido.resumen();
    const [a, b] = r.stats;
    const filas = [
      ['Posesión', `${Math.round(a.posesion * 100)}%`, `${Math.round(b.posesion * 100)}%`],
      ['Tiros', a.tiros, b.tiros],
      ['A puerta', a.aPuerta, b.aPuerta],
      ['Goles esperados', a.xg.toFixed(1), b.xg.toFixed(1)],
    ];
    vaciar(statsEl).append(...filas.flatMap(([n, x, y]) => [h('div', { class: 'v izq' }, x), h('div', { class: 'n' }, n), h('div', { class: 'v' }, y)]));
  }

  // ---------------------------------------------------------- Táctica y cambios
  function modal(titulo, contenido, alAceptar, textoAceptar = 'Aplicar') {
    const estabaEnPausa = enPausa;
    pausar();
    const cerrar = () => { fondo.remove(); if (!estabaEnPausa) reanudar(); };
    const fondo = h('div', { class: 'modal-fondo', onclick: (e) => { if (e.target === fondo) cerrar(); } },
      h('div', { class: 'panel modal', role: 'dialog', 'aria-label': titulo },
        h('h2', {}, titulo), contenido,
        h('div', { class: 'acciones', style: { marginTop: '14px', justifyContent: 'flex-end' } },
          h('button', { class: 'boton', onclick: cerrar }, 'Cancelar'),
          h('button', { class: 'boton primario', onclick: () => { if (alAceptar() !== false) cerrar(); } }, textoAceptar))));
    document.body.append(fondo);
  }

  function aplicarTacticaPartido() {
    partido.cambiarTactica(0, definicionEquipo(club.nombre, club.cartas, tp));
  }

  function abrirTactica() {
    const sel = (orden, valor, nombreDe) => h('select', {}, orden.map((k) => opcion(k, nombreDe(k), k === valor)));
    const formaciones = tp.formacion === PERSONALIZADA ? [PERSONALIZADA, ...ORDEN_FORMACIONES] : ORDEN_FORMACIONES;
    const f = sel(formaciones, tp.formacion, (k) => (k === PERSONALIZADA ? 'Personalizada' : k));
    const o = sel(ORDEN_OFENSIVAS, tp.ofensiva, (k) => OFENSIVAS[k].nombre);
    const d = sel(ORDEN_DEFENSIVAS, tp.defensiva, (k) => DEFENSIVAS[k].nombre);
    modal('Cambiar táctica', h('div', { class: 'fila' },
      h('label', {}, h('span', { class: 'etiqueta' }, 'Formación'), f),
      h('label', {}, h('span', { class: 'etiqueta' }, 'Ataque'), o),
      h('label', {}, h('span', { class: 'etiqueta' }, 'Defensa'), d)), () => {
      if (f.value !== tp.formacion && f.value !== PERSONALIZADA) Object.assign(tp, cambiarFormacion(club.cartas, tp, f.value));
      tp.ofensiva = o.value;
      tp.defensiva = d.value;
      aplicarTacticaPartido();
      for (const e of partido.estado.eventos.slice(-1)) mostrarEvento(e);
    });
  }

  function abrirCambio() {
    const quedan = MOTOR.maxCambios - partido.estado.cambios[0];
    if (quedan <= 0) {
      modal('Sin cambios', h('p', {}, 'Ya hiciste los 5 cambios.'), () => true, 'Entendido');
      return;
    }
    const enCampo = partido.estado.eq[0].jugadores;
    // Por defecto sale el jugador de campo más cansado.
    const masCansado = enCampo.reduce((m, j, i) => (j.linea !== 'POR' && (m === -1 || j.energia < enCampo[m].energia) ? i : m), -1);
    const sale = h('select', { onchange: () => llenarEntra() }, enCampo.map((j, i) =>
      opcion(String(i), `${j.casilla} · ${j.nombre} · energía ${Math.round(j.energia)}%`, i === masCansado)));
    // Una carta por jugador; ni los que están en el campo ni los que ya salieron.
    const salieron = new Set(partido.estado.eventos.filter((e) => e.tipo === 'cambio' && e.lado === 0).map((e) => e.sale));
    const banca = banquillo(club.cartas, tp.alineacion, ORDEN_RAREZAS).map((b) => b.carta).filter((c) => !salieron.has(c.ficha.id));
    const entra = h('select', {});
    // El banquillo se ordena por lo bien que encaja cada uno en el puesto que queda libre.
    function llenarEntra() {
      const puesto = enCampo[Number(sale.value)].puesto;
      const lista = banca.map((c) => ({ c, v: valorEnPuesto(c, puesto).valor })).sort((a, b) => b.v - a.v);
      vaciar(entra).append(...lista.map(({ c, v }) => opcion(c.uid, `${Math.round(v)} · ${c.ficha.nombre} (${c.rareza})`, false)));
    }
    llenarEntra();
    modal(`Sustitución (quedan ${quedan})`, h('div', { class: 'fila' },
      h('label', {}, h('span', { class: 'etiqueta' }, 'Sale'), sale),
      h('label', {}, h('span', { class: 'etiqueta' }, 'Entra'), entra)), () => {
      const i = Number(sale.value);
      const carta = club.cartas.find((c) => c.uid === entra.value);
      if (!carta) return false;
      const puesto = enCampo[i].puesto;
      const casilla = enCampo[i].casilla;
      partido.sustituir(0, i, { ficha: carta.ficha, rareza: carta.rareza, rol: valorEnPuesto(carta, puesto).rol, uid: carta.uid, casilla });
      tp.alineacion[i] = { uid: carta.uid, rol: partido.estado.eq[0].jugadores[i].rol, casilla };
      mostrarEvento(partido.estado.eventos.at(-1));
    }, 'Hacer cambio');
  }

  return () => { pausar(); vista.destruir(); document.querySelectorAll('.modal-fondo').forEach((m) => m.remove()); };
}
