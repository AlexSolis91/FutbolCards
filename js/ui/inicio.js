// Pantalla de inicio: club, accesos y plantilla completa.

import { h } from './dom.js';
import { crearCarta } from './carta.js';
import { ORDEN_RAREZAS, ROLES } from '../motor/reglas.js';
import { atributosDeRareza, mediaEnRol, prepararEquipo } from '../motor/encaje.js';
import { definicionEquipo } from '../motor/alineacion.js';
import { iniciales } from './carta.js';

export function mediaNatural(carta) {
  const rol = carta.ficha.roles[0];
  return { rol, media: Math.round(mediaEnRol(atributosDeRareza(carta.ficha, carta.rareza), rol)) };
}

export function pantallaInicio(app, { club, ir }) {
  const equipo = prepararEquipo(definicionEquipo(club.nombre, club.cartas, club.tactica));
  const cartas = [...club.cartas].sort((a, b) =>
    ORDEN_RAREZAS.indexOf(b.rareza) - ORDEN_RAREZAS.indexOf(a.rareza) || mediaNatural(b).media - mediaNatural(a).media);

  app.append(h('section', { class: 'inicio' },
    h('div', { class: 'panel' },
      h('div', { class: 'club-hero' },
        h('div', { class: 'escudo' }, iniciales(club.nombre)),
        h('div', {},
          h('h1', {}, club.nombre),
          h('p', {}, `Media del once: ${equipo.media} · ${club.tactica.formacion} · ${club.cartas.length} jugadores`))),
      h('div', { class: 'acciones', style: { marginTop: '14px' } },
        h('button', { class: 'boton primario', onclick: () => ir('partido') }, '⚽ Jugar amistoso'),
        h('button', { class: 'boton', onclick: () => ir('alineacion') }, 'Editar alineación'))),
    h('div', { class: 'panel' },
      h('h2', {}, 'Versión de prueba'),
      h('p', { class: 'aviso-prueba' },
        'Estos jugadores son ficticios y sirven para probar el motor y la interfaz. ',
        'Cuando lleguen las fotos se sustituirán por los jugadores reales.'))),
  h('section', { class: 'panel', style: { marginTop: '16px' } },
    h('h2', {}, 'Tu plantilla'),
    h('div', { class: 'galeria' }, cartas.map((c) => {
      const { rol, media } = mediaNatural(c);
      return crearCarta({ ficha: c.ficha, rareza: c.rareza, media, etiqueta: abreviatura(rol), detalle: `${ROLES[rol].nombre} · ${c.ficha.nacion}` });
    }))));
}

export function abreviatura(rol) {
  return {
    portero: 'POR', central: 'DFC', libero: 'LIB', lateral: 'LAT', carrilero: 'CAR', ancla: 'MCD', regista: 'REG',
    boxToBox: 'B2B', mediapunta: 'MCO', extremo: 'EXT', interior: 'INT', falso9: 'F9', delanteroArea: 'DC',
  }[rol] ?? rol;
}
