// Pantalla de alineación: 24 casillas en el campo (arrastrar y soltar),
// plantillas de formación, estrategias, roles, capitán y banquillo.
// Las medias que se ven ya incluyen el encaje oculto (rol, estrategias, química)
// y las bonificaciones; el desglose nunca se muestra.

import { h, vaciar, opcion } from './dom.js';
import { crearCarta, abreviatura, mediaNatural } from './carta.js';
import { guardarClub } from './estado.js';
import {
  ORDEN_FORMACIONES, OFENSIVAS, ORDEN_OFENSIVAS, DEFENSIVAS, ORDEN_DEFENSIVAS, CASILLAS, ORDEN_CASILLAS, PERSONALIZADA,
  PUESTOS, ROLES, ATRIBUTOS, ATRIBUTOS_PORTERO, LISTA_ATRIBUTOS, ORDEN_RAREZAS,
} from '../motor/reglas.js';
import { prepararEquipo } from '../motor/encaje.js';
import {
  alinearEnCasillas, cambiarFormacion, definicionEquipo, valorEnPuesto, banquillo, moverJugador,
} from '../motor/alineacion.js';

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
  // Selección: uid de una carta (del campo o del banquillo) o null.
  let seleccion = null;
  let aviso = '';

  const raiz = h('section', { class: 'alineacion' });
  app.append(raiz);

  function guardar() {
    guardarClub(club);
    pintar();
  }

  const enCampo = (uid) => club.tactica.alineacion.some((a) => a.uid === uid);

  // Aplica un movimiento (arrastrar o tocar-tocar). destino: { casilla } | { uid }.
  function mover(uid, destino) {
    const r = moverJugador(club.cartas, club.tactica, uid, destino);
    seleccion = null;
    aviso = r.ok ? '' : r.motivo;
    if (r.ok) {
      club.tactica = r.tactica;
      guardar();
    } else {
      pintar();
    }
  }

  // Toque sobre una carta o casilla (sin arrastrar).
  function tocar(objetivo) {
    aviso = '';
    if (objetivo.uid) {
      if (seleccion === null) seleccion = objetivo.uid;
      else if (seleccion === objetivo.uid) seleccion = null;
      else if (!enCampo(seleccion) && !enCampo(objetivo.uid)) seleccion = objetivo.uid; // otra del banquillo
      else return mover(seleccion, objetivo);
    } else if (seleccion !== null) {
      return mover(seleccion, objetivo);
    }
    pintar();
  }

  // ---------------------------------------------------------- Arrastrar y soltar
  // Con ratón, lápiz o dedo: se arrastra la carta y se suelta sobre una
  // casilla vacía, otra carta del campo o una del banquillo. Un toque sin
  // mover selecciona (y otro toque decide el destino).
  let arrastre = null;
  // Destino bajo el puntero para la carta uid (que se está arrastrando).
  function objetivoEn(x, y, uid) {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    const carta = el.closest('[data-uid]');
    if (carta) return carta.dataset.uid === uid ? null : { el: carta, destino: { uid: carta.dataset.uid } };
    const casilla = el.closest('[data-casilla]');
    if (casilla) {
      const ocupante = club.tactica.alineacion.find((a) => a.casilla === casilla.dataset.casilla);
      if (ocupante && ocupante.uid === uid) return null;
      return { el: casilla, destino: ocupante ? { uid: ocupante.uid } : { casilla: casilla.dataset.casilla } };
    }
    return null;
  }
  function marcar(el) {
    document.querySelectorAll('.destino-arrastre').forEach((x) => x.classList.remove('destino-arrastre'));
    el?.classList.add('destino-arrastre');
  }
  function iniciarArrastre(ev, uid, origen) {
    if (ev.button !== undefined && ev.button !== 0) return;
    arrastre = { uid, origen, x0: ev.clientX, y0: ev.clientY, activo: false, fantasma: null, id: ev.pointerId };
  }
  function moverArrastre(ev) {
    if (!arrastre || ev.pointerId !== arrastre.id) return;
    if (!arrastre.activo) {
      if (Math.hypot(ev.clientX - arrastre.x0, ev.clientY - arrastre.y0) < 8) return;
      arrastre.activo = true;
      const r = arrastre.origen.getBoundingClientRect();
      // El fantasma usa las mismas reglas de tamaño que las cartas del campo.
      arrastre.fantasma = h('div', { class: 'fantasma-arrastre' }, arrastre.origen.cloneNode(true));
      arrastre.fantasma.style.setProperty('--carta-campo', `${r.width}px`);
      arrastre.dx = arrastre.x0 - r.left;
      arrastre.dy = arrastre.y0 - r.top;
      document.body.append(arrastre.fantasma);
      arrastre.origen.classList.add('arrastrando');
      raiz.classList.add('modo-arrastre');
    }
    ev.preventDefault();
    arrastre.fantasma.style.transform = `translate(${ev.clientX - arrastre.dx}px, ${ev.clientY - arrastre.dy}px)`;
    marcar(objetivoEn(ev.clientX, ev.clientY, arrastre.uid)?.el);
  }
  function terminarArrastre(ev) {
    if (!arrastre || ev.pointerId !== arrastre.id) return;
    const a = arrastre;
    arrastre = null;
    const lejos = Math.hypot(ev.clientX - a.x0, ev.clientY - a.y0) >= 8;
    if (!a.activo && !lejos) return; // fue un toque: lo maneja el clic
    a.fantasma?.remove();
    a.origen.classList.remove('arrastrando');
    raiz.classList.remove('modo-arrastre');
    marcar(null);
    a.origen.dataset.trasArrastre = '1'; // anula el clic que sigue a soltar
    const objetivo = ev.type === 'pointerup' ? objetivoEn(ev.clientX, ev.clientY, a.uid) : null;
    if (objetivo) mover(a.uid, objetivo.destino);
    else pintar();
  }
  window.addEventListener('pointermove', moverArrastre, { passive: false });
  window.addEventListener('pointerup', terminarArrastre);
  window.addEventListener('pointercancel', terminarArrastre);

  function arrastrable(el, uid) {
    el.dataset.uid = uid;
    el.classList.add('arrastrable');
    el.addEventListener('pointerdown', (ev) => iniciarArrastre(ev, uid, el));
    el.addEventListener('click', (ev) => {
      if (el.dataset.trasArrastre) { delete el.dataset.trasArrastre; ev.stopPropagation(); return; }
      tocar({ uid });
    });
    return el;
  }

  // ---------------------------------------------------------- Pintar
  function pintar() {
    const t = club.tactica;
    const equipo = prepararEquipo(definicionEquipo(club.nombre, club.cartas, t));
    const porCasilla = new Map(t.alineacion.map((a, i) => [a.casilla, i]));
    const banca = banquillo(club.cartas, t.alineacion, ORDEN_RAREZAS);
    const iSel = t.alineacion.findIndex((a) => a.uid === seleccion);
    const cartaSel = seleccion !== null ? club.cartas.find((c) => c.uid === seleccion) : null;
    vaciar(raiz);

    // ---------------------------------------------------------- Campo: 24 casillas
    const campo = h('div', { class: 'campo', 'aria-label': 'Campo: arrastra a tus jugadores a cualquier casilla' },
      h('div', { class: 'medio' }), h('div', { class: 'circulo' }));
    for (const id of ORDEN_CASILLAS) {
      const i = porCasilla.get(id);
      if (i === undefined) {
        // Casilla vacía: destino para mover a un titular.
        const puedeIr = cartaSel && enCampo(seleccion) && t.alineacion[iSel].casilla !== 'POR';
        campo.append(h('div', {
          class: ['hueco', 'casilla-vacia', puedeIr && 'disponible'].filter(Boolean).join(' '),
          'data-casilla': id,
          title: CASILLAS[id].nombre,
          onclick: () => tocar({ casilla: id }),
        }, h('span', {}, id)));
        continue;
      }
      const a = t.alineacion[i];
      const j = equipo.jugadores[i];
      const carta = club.cartas.find((c) => c.uid === a.uid);
      const tarjeta = crearCarta({
        ficha: carta.ficha, rareza: carta.rareza, media: j.media, etiqueta: id,
        mini: true, capitan: t.capitan === carta.uid, seleccionada: seleccion === carta.uid,
      });
      campo.append(h('div', { class: 'hueco', 'data-casilla': id }, arrastrable(tarjeta, carta.uid)));
    }

    // ---------------------------------------------------------- Táctica
    const selector = (titulo, valor, orden, nombres, alCambiar) => h('label', {},
      h('span', { class: 'etiqueta' }, titulo),
      h('select', { onchange: (e) => alCambiar(e.target.value) },
        orden.map((k) => opcion(k, nombres(k), k === valor))));
    const formaciones = t.formacion === PERSONALIZADA ? [PERSONALIZADA, ...ORDEN_FORMACIONES] : ORDEN_FORMACIONES;

    const panelTactica = h('div', { class: 'panel' },
      h('div', { class: 'fila', style: { alignItems: 'center', marginBottom: '10px' } },
        h('div', {}, h('span', { class: 'etiqueta' }, 'Media del once'), h('div', { class: 'media-equipo' }, equipo.media)),
        h('button', {
          class: 'boton', style: { flex: '0 0 auto' },
          title: 'Elige a los mejores para las casillas que tienes ahora',
          onclick: () => {
            t.alineacion = alinearEnCasillas(club.cartas, t.alineacion.map((a) => a.casilla));
            if (!t.alineacion.some((a) => a.uid === t.capitan)) t.capitan = t.alineacion[0].uid;
            seleccion = null;
            guardar();
          },
        }, '✨ Auto-alinear')),
      h('div', { class: 'fila' },
        selector('Formación', t.formacion, formaciones, (k) => (k === PERSONALIZADA ? 'Personalizada' : k), (v) => {
          if (v === PERSONALIZADA) return;
          Object.assign(t, cambiarFormacion(club.cartas, t, v));
          seleccion = null;
          guardar();
        }),
        selector('Ataque', t.ofensiva, ORDEN_OFENSIVAS, (k) => OFENSIVAS[k].nombre, (v) => { t.ofensiva = v; guardar(); }),
        selector('Defensa', t.defensiva, ORDEN_DEFENSIVAS, (k) => DEFENSIVAS[k].nombre, (v) => { t.defensiva = v; guardar(); })),
      h('p', { class: 'ayuda' }, 'Arrastra a un jugador a cualquier casilla del campo, sobre otro para intercambiarlos o desde el banquillo para meterlo. También puedes tocar uno y luego su destino.'),
      aviso ? h('p', { class: 'aviso-alineacion', role: 'status' }, aviso) : null);

    // ---------------------------------------------------------- Jugador seleccionado (del campo)
    let panelJugador = null;
    if (iSel !== -1) {
      const j = equipo.jugadores[iSel];
      const casilla = CASILLAS[t.alineacion[iSel].casilla];
      const attrs = j.linea === 'POR'
        ? ATRIBUTOS_PORTERO
        : LISTA_ATRIBUTOS.filter((a) => !ATRIBUTOS_PORTERO.includes(a));
      panelJugador = h('div', { class: 'panel' },
        h('h2', {}, `${casilla.nombre} (${casilla.id})`),
        h('div', { class: 'detalle-jugador' },
          crearCarta({ ficha: cartaSel.ficha, rareza: cartaSel.rareza, media: j.media, etiqueta: casilla.id, capitan: t.capitan === cartaSel.uid,
            detalle: `${cartaSel.ficha.nacion} · ${cartaSel.ficha.escuela}` }),
          h('div', {},
            h('label', {},
              h('span', { class: 'etiqueta' }, 'Rol'),
              h('select', { onchange: (e) => { t.alineacion[iSel].rol = e.target.value; guardar(); } },
                PUESTOS[casilla.puesto].roles.map((r) => opcion(r, ROLES[r].nombre + (cartaSel.ficha.roles.includes(r) ? ' ★' : ''), r === j.rol)))),
            h('p', { class: 'ayuda' }, `Roles naturales: ${cartaSel.ficha.roles.map((r) => ROLES[r].nombre).join(', ')}`),
            h('div', { class: 'acciones', style: { margin: '10px 0' } },
              h('button', { class: 'boton peque', disabled: t.capitan === cartaSel.uid, onclick: () => { t.capitan = cartaSel.uid; guardar(); } },
                t.capitan === cartaSel.uid ? 'Es el capitán' : 'Hacer capitán'),
              h('button', { class: 'boton peque', onclick: () => { seleccion = null; pintar(); } }, 'Cerrar')))),
        h('div', { class: 'atributos', style: { marginTop: '12px' } },
          attrs.map((a) => h('div', {}, h('span', {}, ATRIBUTOS[a]), h('b', {}, Math.round(j.attrs[a]))))));
    }

    // ---------------------------------------------------------- Banquillo
    const casillaSel = iSel !== -1 ? CASILLAS[t.alineacion[iSel].casilla] : null;
    const panelBanca = h('div', { class: 'panel' },
      h('h2', {}, casillaSel ? `Banquillo — elige quién entra como ${casillaSel.id}` : 'Banquillo'),
      h('div', { class: 'banca' }, banca.map(({ carta: c, copias }) => {
        const v = casillaSel ? valorEnPuesto(c, casillaSel.puesto) : null;
        const nat = mediaNatural(c);
        const tarjeta = crearCarta({
          ficha: c.ficha, rareza: c.rareza, mini: true, seleccionada: seleccion === c.uid,
          media: v ? Math.round(v.valor) : nat.media,
          etiqueta: v ? casillaSel.id : abreviatura(nat.rol),
        });
        if (copias > 1) tarjeta.append(h('span', { class: 'copias-banca', title: `${copias} cartas de este jugador` }, `×${copias}`));
        return arrastrable(tarjeta, c.uid);
      })));

    raiz.append(
      h('div', { class: 'contenedor-campo' }, campo),
      h('div', { style: { display: 'grid', gap: '16px', alignContent: 'start' } }, panelTactica, panelJugador, panelBanca));
    campoActual = campo;
    observador.disconnect();
    observador.observe(campo);
    ajustarCampo(campo, LISTA_CASILLAS);
  }

  // Recoloca las cartas cuando cambia el tamaño del campo (ventana, giro del celular).
  const LISTA_CASILLAS = ORDEN_CASILLAS.map((id) => CASILLAS[id]);
  let campoActual = null;
  const observador = new ResizeObserver(() => { if (campoActual) ajustarCampo(campoActual, LISTA_CASILLAS); });

  pintar();
  return () => {
    observador.disconnect();
    window.removeEventListener('pointermove', moverArrastre);
    window.removeEventListener('pointerup', terminarArrastre);
    window.removeEventListener('pointercancel', terminarArrastre);
    document.querySelectorAll('.fantasma-arrastre').forEach((x) => x.remove());
  };
}
