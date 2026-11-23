// Secciones del lobby que aún no tienen su sistema completo.

import { h } from './dom.js';

function aviso(titulo, texto, extra = null) {
  return h('section', { class: 'panel seccion-pronto' },
    h('h2', {}, titulo),
    h('p', {}, texto),
    extra);
}

export function pantallaTemporadas(app, { ir }) {
  app.append(h('section', { class: 'seccion' },
    h('div', { class: 'panel' },
      h('h2', {}, 'Amistoso contra la IA'),
      h('p', { class: 'ayuda', style: { margin: '0 0 12px' } }, 'Juega un partido en vivo o simúlalo directamente para ver el resultado.'),
      h('button', { class: 'boton primario', onclick: () => ir('partido') }, '⚽ Jugar amistoso')),
    h('div', { class: 'rejilla-competiciones' },
      [['Liga', 'Divisiones con ascensos y descensos contra clubes de la IA.'],
        ['Copa', 'Eliminatorias a partido único.'],
        ['Torneo de Campeones', 'Los mejores de cada división se enfrentan.']].map(([t, d]) =>
        h('div', { class: 'panel competicion' }, h('h3', {}, t), h('p', { class: 'ayuda' }, d), h('span', { class: 'recuadro-estado pronto' }, 'Próximamente'))))));
}

export function pantallaMercado(app) {
  app.append(aviso('El mercado está cerrado',
    'El Mercado de Fichajes solo abre en ciertas fechas. Mientras está abierto podrás comprar y vender jugadores con los clubes de tus amigos y con los clubes de la IA.'));
}

export function pantallaLigaMaster(app) {
  app.append(aviso('Liga Master — próximamente',
    'Aquí competirás contra los clubes de tus amigos y clubes de relleno de la IA, con partidos automáticos a una hora fija y la opción de intervenir en vivo si estás conectado.'));
}

export function pantallaTienda(app) {
  app.append(aviso('Tienda del Club — próximamente',
    'Aquí comprarás sobres de 3 jugadores con la moneda del juego. Probabilidades: Común 90 %, Raro 9 %, Épico 0.99 %, Legendario 0.01 %.'));
}
