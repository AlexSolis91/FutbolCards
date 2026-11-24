// Pantalla de alineación: formación, estrategias, roles, capitán y cambios.
// Las medias que se ven ya incluyen el encaje oculto (rol, estrategias, química)
// y las bonificaciones; el desglose nunca se muestra.

import { h, vaciar, opcion } from './dom.js';
import { crearCarta, abreviatura, mediaNatural } from './carta.js';
import { guardarClub } from './estado.js';
import {
  FORMACIONES, ORDEN_FORMACIONES, OFENSIVAS, ORDEN_OFENSIVAS, DEFENSIVAS, ORDEN_DEFENSIVAS,
  PUESTOS, ROLES, ATRIBUTOS, ATRIBUTOS_PORTERO, LISTA_ATRIBUTOS, ORDEN_RAREZAS,
} from '../motor/reglas.js';
import { prepararEquipo } from '../motor/encaje.js';
import { autoAlinear, cambiarFormacion, definicionEquipo, valorEnPuesto, banquillo } from '../motor/alineacion.js';

// Agrupa los huecos en filas (portero, defensa, medios…) por su altura:
// dos huecos están en la misma fila si su y difiere 10 o menos.
export function filasFormacion(huecos) {
  const orden = huecos.map((h, i) => ({ i, y: h.y })).sort((a, b) => a.y - b.y);
  const fila = new Array(huecos.length);
  let f = 0;
  let previa = null;
  for (const o of orden) {
    if (previa !== null && o.y - previa > 10) f++;
    fila[o.i] = f;
    previa = o.y;
  }
  return { fila, n: f + 1 };
}

// Coloca las cartas en el campo lo más grandes posible sin que se empalmen:
// las filas se reparten a lo alto y el tamaño de carta sale del espacio entre filas.
const PROPORCION_CARTA = 7.6 / 5;
export function ajustarCampo(campo, huecos) {
  const W = campo.clientWidth;
  const H = campo.clientHeight;
  if (!W || !H) return;
  const { fila, n } = filasFormacion(huecos);
  const margen = 8;
  const separacion = 0.9; // la carta ocupa el 90 % del espacio entre filas
  let alto = (separacion * (H - 2 * margen)) / (n - 1 + separacion);
  // Límite horizontal: en la fila más apretada (p. ej. 5 medios) las cartas
  // vecinas tampoco pueden tocarse. dx = separación mínima en % del ancho útil.
  let dx = 1;
  for (let f = 0; f < n; f++) {
    const xs = huecos.filter((_, i) => fila[i] === f).map((h) => h.x / 100).sort((a, b) => a - b);
    for (let k = 1; k < xs.length; k++) dx = Math.min(dx, xs[k] - xs[k - 1]);
  }
  const k = dx * 0.94;
  const anchoMaxFila = (k * (W - 2 * margen)) / (1 + k);
  let ancho = Math.min(alto / PROPORCION_CARTA, W * 0.17, anchoMaxFila);
  alto = ancho * PROPORCION_CARTA;
  const paso = n > 1 ? (H - 2 * margen - alto) / (n - 1) : 0;
  campo.style.setProperty('--carta-campo', `${ancho}px`);
  campo.querySelectorAll('.hueco').forEach((el, i) => {
    const x = margen + ancho / 2 + (huecos[i].x / 100) * (W - 2 * margen - ancho);
    const y = H - margen - alto / 2 - fila[i] * paso;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  });
}

export function pantallaAlineacion(app, { club }) {
  let seleccion = null; // índice del hueco seleccionado

  const raiz = h('section', { class: 'alineacion' });
  app.append(raiz);

  function guardar() {
    guardarClub(club);
    pintar();
  }

  function rolPara(carta, puesto, rolActual) {
    if (rolActual && PUESTOS[puesto].roles.includes(rolActual) && carta.ficha.roles.includes(rolActual)) return rolActual;
    return valorEnPuesto(carta, puesto).rol;
  }

  function colocar(i, uid) {
    const t = club.tactica;
    const huecos = FORMACIONES[t.formacion].huecos;
    const carta = club.cartas.find((c) => c.uid === uid);
    const otro = t.alineacion.findIndex((a) => a.uid === uid);
    // Nunca dos cartas del mismo jugador en el campo.
    const repetido = t.alineacion.some((a, k) => k !== i && a.uid !== uid
      && club.cartas.find((c) => c.uid === a.uid)?.ficha.id === carta.ficha.id);
    if (repetido) { seleccion = null; pintar(); return; }
    if (otro !== -1) {
      // Intercambio entre dos huecos del campo.
      const a = t.alineacion[i];
      const cartaA = club.cartas.find((c) => c.uid === a.uid);
      t.alineacion[otro] = { uid: a.uid, rol: rolPara(cartaA, huecos[otro].puesto, a.rol) };
    }
    t.alineacion[i] = { uid, rol: rolPara(carta, huecos[i].puesto, null) };
    seleccion = null;
    guardar();
  }

  function pintar() {
    const t = club.tactica;
    const equipo = prepararEquipo(definicionEquipo(club.nombre, club.cartas, t));
    const huecos = FORMACIONES[t.formacion].huecos;
    const banca = banquillo(club.cartas, t.alineacion, ORDEN_RAREZAS);
    vaciar(raiz);

    // ---------------------------------------------------------- Campo
    const campo = h('div', { class: 'campo', 'aria-label': 'Campo con la alineación' },
      h('div', { class: 'medio' }), h('div', { class: 'circulo' }));
    huecos.forEach((hueco, i) => {
      const j = equipo.jugadores[i];
      const carta = club.cartas.find((c) => c.uid === t.alineacion[i].uid);
      campo.append(h('div', { class: 'hueco' },
        crearCarta({
          ficha: carta.ficha, rareza: carta.rareza, media: j.media, etiqueta: hueco.puesto,
          mini: true, capitan: t.capitan === carta.uid, seleccionada: seleccion === i,
          onclick: () => {
            if (seleccion === null) seleccion = i;
            else if (seleccion === i) seleccion = null;
            else return colocar(seleccion, carta.uid);
            pintar();
          },
        })));
    });

    // ---------------------------------------------------------- Táctica
    const selector = (titulo, valor, orden, nombres, alCambiar) => h('label', {},
      h('span', { class: 'etiqueta' }, titulo),
      h('select', { onchange: (e) => alCambiar(e.target.value) },
        orden.map((k) => opcion(k, nombres(k), k === valor))));

    const panelTactica = h('div', { class: 'panel' },
      h('div', { class: 'fila', style: { alignItems: 'center', marginBottom: '10px' } },
        h('div', {}, h('span', { class: 'etiqueta' }, 'Media del once'), h('div', { class: 'media-equipo' }, equipo.media)),
        h('button', {
          class: 'boton', style: { flex: '0 0 auto' },
          onclick: () => { t.alineacion = autoAlinear(club.cartas, t.formacion); if (!t.alineacion.some((a) => a.uid === t.capitan)) t.capitan = t.alineacion[0].uid; seleccion = null; guardar(); },
        }, '✨ Auto-alinear')),
      h('div', { class: 'fila' },
        selector('Formación', t.formacion, ORDEN_FORMACIONES, (k) => k, (v) => { Object.assign(t, cambiarFormacion(club.cartas, t, v)); seleccion = null; guardar(); }),
        selector('Ataque', t.ofensiva, ORDEN_OFENSIVAS, (k) => OFENSIVAS[k].nombre, (v) => { t.ofensiva = v; guardar(); }),
        selector('Defensa', t.defensiva, ORDEN_DEFENSIVAS, (k) => DEFENSIVAS[k].nombre, (v) => { t.defensiva = v; guardar(); })),
      h('p', { class: 'ayuda' }, 'Toca un jugador del campo y luego otro del campo o del banquillo para cambiarlos.'));

    // ---------------------------------------------------------- Jugador seleccionado
    let panelJugador = null;
    if (seleccion !== null) {
      const j = equipo.jugadores[seleccion];
      const hueco = huecos[seleccion];
      const carta = club.cartas.find((c) => c.uid === t.alineacion[seleccion].uid);
      const attrs = j.linea === 'POR'
        ? ATRIBUTOS_PORTERO
        : LISTA_ATRIBUTOS.filter((a) => !ATRIBUTOS_PORTERO.includes(a));
      panelJugador = h('div', { class: 'panel' },
        h('h2', {}, `${PUESTOS[hueco.puesto].nombre}`),
        h('div', { class: 'detalle-jugador' },
          crearCarta({ ficha: carta.ficha, rareza: carta.rareza, media: j.media, etiqueta: hueco.puesto, capitan: t.capitan === carta.uid,
            detalle: `${carta.ficha.nacion} · ${carta.ficha.escuela}` }),
          h('div', {},
            h('label', {},
              h('span', { class: 'etiqueta' }, 'Rol'),
              h('select', { onchange: (e) => { t.alineacion[seleccion].rol = e.target.value; guardar(); } },
                PUESTOS[hueco.puesto].roles.map((r) => opcion(r, ROLES[r].nombre + (carta.ficha.roles.includes(r) ? ' ★' : ''), r === j.rol)))),
            h('p', { class: 'ayuda' }, `Roles naturales: ${carta.ficha.roles.map((r) => ROLES[r].nombre).join(', ')}`),
            h('div', { class: 'acciones', style: { margin: '10px 0' } },
              h('button', { class: 'boton peque', disabled: t.capitan === carta.uid, onclick: () => { t.capitan = carta.uid; guardar(); } },
                t.capitan === carta.uid ? 'Es el capitán' : 'Hacer capitán'),
              h('button', { class: 'boton peque', onclick: () => { seleccion = null; pintar(); } }, 'Cerrar')))),
        h('div', { class: 'atributos', style: { marginTop: '12px' } },
          attrs.map((a) => h('div', {}, h('span', {}, ATRIBUTOS[a]), h('b', {}, Math.round(j.attrs[a]))))));
    }

    // ---------------------------------------------------------- Banquillo
    const panelBanca = h('div', { class: 'panel' },
      h('h2', {}, seleccion === null ? 'Banquillo' : `Banquillo — elige quién entra como ${huecos[seleccion].puesto}`),
      h('div', { class: 'banca' }, banca.map(({ carta: c, copias }) => {
        const v = seleccion !== null ? valorEnPuesto(c, huecos[seleccion].puesto) : null;
        const nat = mediaNatural(c);
        const tarjeta = crearCarta({
          ficha: c.ficha, rareza: c.rareza, mini: true,
          media: v ? Math.round(v.valor) : nat.media,
          etiqueta: v ? huecos[seleccion].puesto : abreviatura(nat.rol),
          onclick: seleccion === null ? undefined : () => colocar(seleccion, c.uid),
        });
        if (copias > 1) tarjeta.append(h('span', { class: 'copias-banca', title: `${copias} cartas de este jugador` }, `×${copias}`));
        return tarjeta;
      })));

    raiz.append(
      h('div', { class: 'contenedor-campo' }, campo),
      h('div', { style: { display: 'grid', gap: '16px', alignContent: 'start' } }, panelTactica, panelJugador, panelBanca));
    campoActual = campo;
    huecosActuales = huecos;
    observador.disconnect();
    observador.observe(campo);
    ajustarCampo(campo, huecos);
  }

  // Recoloca las cartas cuando cambia el tamaño del campo (ventana, giro del celular).
  let campoActual = null;
  let huecosActuales = null;
  const observador = new ResizeObserver(() => { if (campoActual) ajustarCampo(campoActual, huecosActuales); });

  pintar();
  return () => observador.disconnect();
}
