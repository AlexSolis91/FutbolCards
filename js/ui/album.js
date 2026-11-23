// Álbum: todos los jugadores reales con sus 4 cartas, bonificaciones y capitán.

import { h } from './dom.js';
import { crearCarta } from './carta.js';
import { abreviatura } from './inicio.js';
import { ORDEN_RAREZAS, ROLES } from '../motor/reglas.js';
import { atributosDeRareza, mediaEnRol } from '../motor/encaje.js';
import { JUGADORES } from '../datos/jugadores/index.js';

export function pantallaAlbum(app) {
  app.append(h('section', { style: { display: 'grid', gap: '16px' } },
    JUGADORES.map((j) => {
      const rol = j.roles[0];
      return h('article', { class: 'panel' },
        h('div', { class: 'album-cabecera' },
          h('h2', {}, j.nombre),
          j.estado !== 'aprobada' ? h('span', { class: 'sello' }, 'Propuesta pendiente de aprobar') : null),
        h('p', { class: 'ayuda', style: { margin: '0 0 12px' } },
          `${j.nacion} · ${j.escuela} · ${j.roles.map((r) => ROLES[r].nombre).join(' / ')}`),
        h('div', { class: 'galeria' }, ORDEN_RAREZAS.map((r) => crearCarta({
          ficha: j, rareza: r, etiqueta: abreviatura(rol),
          media: Math.round(mediaEnRol(atributosDeRareza(j, r), rol)),
          detalle: `${ROLES[rol].nombre} · ${j.nacion}`,
        }))),
        h('ul', { class: 'bonos' },
          (j.bonificaciones ?? []).map((b) => h('li', {}, h('b', {}, b.nombre), ' — ', b.descripcion)),
          j.capitan ? h('li', { class: 'capitan-bono' }, h('b', {}, `Capitán: ${j.capitan.nombre}`), ' — ', j.capitan.descripcion) : null));
    })));
}
