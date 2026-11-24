// Pantalla de partido: simulación en vivo con crónica, balón en el campo,
// velocidad, cambios tácticos y sustituciones; o simular directo al final.

import { h, vaciar, opcion } from './dom.js';
import { iniciales } from './carta.js';
import { crearPartido, MOTOR } from '../motor/partido.js';
import {
  ORDEN_FORMACIONES, OFENSIVAS, ORDEN_OFENSIVAS, DEFENSIVAS, ORDEN_DEFENSIVAS, ESPEJO_FRANJA, ORDEN_RAREZAS,
} from '../motor/reglas.js';
import { definicionEquipo, cambiarFormacion, valorEnPuesto, banquillo } from '../motor/alineacion.js';
import { crearRivalPrueba } from '../datos/club-prueba.js';
import { narrar } from './narracion.js';

const ESPERA = { gol: 1900, parada: 900, fuera: 900, perdida: 650, avance: 650, contragolpe: 750, descanso: 1500, tactica: 600, cambio: 800, final: 0 };
const ESPERA_SILENCIOSA = 220;

// Coordenadas (%) del balón: el local ataca hacia la derecha.
function posicionBalon(lado, franja, carril) {
  const fx = { def: 17, med: 50, ata: 83 }[franja] ?? 50;
  const cy = { izq: 17, cen: 50, der: 83 }[carril] ?? 50;
  return lado === 0 ? { x: fx, y: cy } : { x: 100 - fx, y: 100 - cy };
}

export function pantallaPartido(app, { club, ir }) {
  const rival = crearRivalPrueba(Date.now() % 1e9);
  // Táctica del partido (copia: lo que cambies aquí no toca tu alineación guardada).
  const tp = structuredClone(club.tactica);
  const local = definicionEquipo(club.nombre, club.cartas, tp);
  const visitante = definicionEquipo(rival.nombre, rival.cartas, rival.tactica);
  const partido = crearPartido({ local, visitante, semilla: Date.now() % 1e9 });
  const equipos = [club.nombre, rival.nombre];
  const nombres = [new Map(club.cartas.map((c) => [c.uid, c.ficha.nombre])), new Map(rival.cartas.map((c) => [c.uid, c.ficha.nombre]))];
  const nombre = (lado, id) => nombres[lado].get(id) ?? '—';

  let cola = [];
  let temporizador = null;
  let enPausa = true;
  let velocidad = 1;
  let ultimoMinuto = 0;
  let pelota = { lado: partido.estado.lado, franja: 'def', carril: 'cen' };

  // ---------------------------------------------------------- Estructura
  const golesEl = h('div', { class: 'goles' }, '0 – 0');
  const minutoEl = h('span', { class: 'minuto' }, "0'");
  const balon = h('div', { class: 'balon', style: { left: '50%', top: '50%' } });
  const zonaEl = h('div', { class: 'zona-activa' });
  const campo = h('div', { class: 'campo-h' }, h('div', { class: 'medio-v' }), h('div', { class: 'circulo' }), zonaEl, balon);
  const cronica = h('ol', { class: 'cronica', 'aria-live': 'polite' });
  const statsEl = h('div', { class: 'estadisticas' });
  const botonPlay = h('button', { class: 'boton primario', onclick: () => (enPausa ? reanudar() : pausar()) }, '▶ Empezar');
  const botonesVel = [1, 2, 4].map((v) => h('button', {
    'aria-pressed': String(v === velocidad),
    onclick: () => { velocidad = v; botonesVel.forEach((b, i) => b.setAttribute('aria-pressed', String([1, 2, 4][i] === v))); },
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
    h('div', { style: { display: 'grid', gap: '12px' } },
      campo,
      h('div', { class: 'controles' }, botonPlay, h('div', { class: 'velocidad', role: 'group', 'aria-label': 'Velocidad' }, botonesVel),
        botonSimular, botonTactica, botonCambio),
      pie,
      h('div', { class: 'panel' }, h('h2', {}, 'Estadísticas'), statsEl)),
    h('div', { class: 'panel' }, h('h2', {}, 'Crónica'), cronica)));

  pintarStats();

  // ---------------------------------------------------------- Reproducción
  function mover(lado, franja, carril) {
    pelota = { lado, franja, carril };
    const p = posicionBalon(lado, franja, carril);
    balon.style.left = `${p.x}%`;
    balon.style.top = `${p.y}%`;
    zonaEl.style.left = `${Math.min(66.6, Math.max(0, p.x - 16.7))}%`;
    zonaEl.style.top = `${Math.min(66.6, Math.max(0, p.y - 16.7))}%`;
    zonaEl.className = `zona-activa ${lado === 0 ? 'local' : 'visitante'}`;
  }

  function aplicarPosicion(e) {
    switch (e.tipo) {
      case 'posesion': case 'avance': case 'recicla': mover(e.lado, e.franja, e.carril); break;
      case 'perdida': mover(1 - e.lado, ESPEJO_FRANJA[e.franja], pelota.carril === 'izq' ? 'der' : pelota.carril === 'der' ? 'izq' : 'cen'); break;
      case 'contragolpe': mover(e.lado, pelota.franja === 'def' ? 'med' : 'ata', pelota.carril); break;
      case 'gol': case 'parada': case 'fuera': {
        const x = e.lado === 0 ? 96 : 4;
        balon.style.left = `${x}%`;
        balon.style.top = '50%';
        break;
      }
      case 'descanso': case 'final': balon.style.left = '50%'; balon.style.top = '50%'; break;
      default:
    }
  }

  function mostrarEvento(e, rapido = false) {
    ultimoMinuto = e.minuto;
    minutoEl.textContent = `${e.minuto}'`;
    aplicarPosicion(e);
    if (e.tipo === 'gol') {
      golesEl.textContent = `${e.marcador[0]} – ${e.marcador[1]}`;
    }
    if (e.tipo === 'gol' && !rapido) {
      const flash = h('div', { class: 'flash-gol' }, '¡GOL!');
      campo.append(flash);
      setTimeout(() => flash.remove(), 1700);
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
    const espera = (visible ? ESPERA[e.tipo] ?? 600 : ESPERA_SILENCIOSA) / velocidad;
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
    const f = sel(ORDEN_FORMACIONES, tp.formacion, (k) => k);
    const o = sel(ORDEN_OFENSIVAS, tp.ofensiva, (k) => OFENSIVAS[k].nombre);
    const d = sel(ORDEN_DEFENSIVAS, tp.defensiva, (k) => DEFENSIVAS[k].nombre);
    modal('Cambiar táctica', h('div', { class: 'fila' },
      h('label', {}, h('span', { class: 'etiqueta' }, 'Formación'), f),
      h('label', {}, h('span', { class: 'etiqueta' }, 'Ataque'), o),
      h('label', {}, h('span', { class: 'etiqueta' }, 'Defensa'), d)), () => {
      if (f.value !== tp.formacion) Object.assign(tp, cambiarFormacion(club.cartas, tp, f.value));
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
      opcion(String(i), `${j.puesto} · ${j.nombre} · energía ${Math.round(j.energia)}%`, i === masCansado)));
    // Una carta por jugador; ni los que están en el campo ni los que ya salieron.
    const salieron = new Set(partido.estado.eventos.filter((e) => e.tipo === 'cambio' && e.lado === 0)
      .map((e) => club.cartas.find((c) => c.uid === e.sale)?.ficha.id));
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
      partido.sustituir(0, i, { ficha: carta.ficha, rareza: carta.rareza, rol: valorEnPuesto(carta, puesto).rol, uid: carta.uid });
      tp.alineacion[i] = { uid: carta.uid, rol: partido.estado.eq[0].jugadores[i].rol };
      mostrarEvento(partido.estado.eventos.at(-1));
    }, 'Hacer cambio');
  }

  return () => { pausar(); document.querySelectorAll('.modal-fondo').forEach((m) => m.remove()); };
}
