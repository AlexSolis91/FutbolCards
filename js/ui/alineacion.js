// Pantalla de alineación: formación, estrategias, roles, capitán y cambios.
// Las medias que se ven ya incluyen el encaje oculto (rol, estrategias, química)
// y las bonificaciones; el desglose nunca se muestra.

import { h, vaciar, opcion } from './dom.js';
import { crearCarta } from './carta.js';
import { guardarClub } from './estado.js';
import { abreviatura, mediaNatural } from './inicio.js';
import {
  FORMACIONES, ORDEN_FORMACIONES, OFENSIVAS, ORDEN_OFENSIVAS, DEFENSIVAS, ORDEN_DEFENSIVAS,
  PUESTOS, ROLES, ATRIBUTOS, ATRIBUTOS_PORTERO, LISTA_ATRIBUTOS,
} from '../motor/reglas.js';
import { prepararEquipo } from '../motor/encaje.js';
import { autoAlinear, cambiarFormacion, definicionEquipo, valorEnPuesto } from '../motor/alineacion.js';

// Posición en pantalla de un hueco (campo vertical, portería propia abajo).
export function posicionHueco(hueco) {
  return { left: `${6 + hueco.x * 0.88}%`, bottom: `${5 + hueco.y * 0.82}%` };
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
    const enCampo = new Set(t.alineacion.map((a) => a.uid));
    const banca = club.cartas.filter((c) => !enCampo.has(c.uid));
    vaciar(raiz);

    // ---------------------------------------------------------- Campo
    const campo = h('div', { class: 'campo', 'aria-label': 'Campo con la alineación' },
      h('div', { class: 'medio' }), h('div', { class: 'circulo' }));
    huecos.forEach((hueco, i) => {
      const j = equipo.jugadores[i];
      const carta = club.cartas.find((c) => c.uid === t.alineacion[i].uid);
      campo.append(h('div', { class: 'hueco', style: posicionHueco(hueco) },
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
      h('div', { class: 'banca' }, banca.map((c) => {
        const v = seleccion !== null ? valorEnPuesto(c, huecos[seleccion].puesto) : null;
        const nat = mediaNatural(c);
        return crearCarta({
          ficha: c.ficha, rareza: c.rareza, mini: true,
          media: v ? Math.round(v.valor) : nat.media,
          etiqueta: v ? huecos[seleccion].puesto : abreviatura(nat.rol),
          onclick: seleccion === null ? undefined : () => colocar(seleccion, c.uid),
        });
      })));

    raiz.append(
      h('div', {}, campo),
      h('div', { style: { display: 'grid', gap: '16px' } }, panelTactica, panelJugador, panelBanca));
  }

  pintar();
}
