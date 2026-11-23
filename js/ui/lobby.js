// Lobby: pantalla de inicio con el fondo del juego y un recuadro por sección.
// Fondo: assets/fondos/lobby.webp (si no existe, se ve un degradado).

import { h } from './dom.js';
import { iniciales } from './carta.js';
import { prepararEquipo } from '../motor/encaje.js';
import { definicionEquipo } from '../motor/alineacion.js';

export const SECCIONES = [
  { ruta: 'club', icono: '🛡️', titulo: 'Mi Club', texto: 'Formación, estrategias, roles y alineación de tus jugadores.' },
  { ruta: 'coleccion', icono: '🃏', titulo: 'Colección', texto: 'Todas tus cartas, sus copias y la subida de rango.' },
  { ruta: 'mercado', icono: '💱', titulo: 'Mercado de Fichajes', texto: 'Compra y vende jugadores cuando el mercado está abierto.', estado: 'Cerrado' },
  { ruta: 'temporadas', icono: '🏆', titulo: 'Temporadas', texto: 'Liga, copa y torneo de campeones contra la IA.', estado: 'Amistosos' },
  { ruta: 'ligamaster', icono: '🌍', titulo: 'Liga Master', texto: 'Compite contra los clubes de tus amigos y la IA.', estado: 'Próximamente' },
  { ruta: 'tienda', icono: '🛒', titulo: 'Tienda del Club', texto: 'Compra sobres para conseguir nuevos jugadores.', estado: 'Próximamente' },
];

export function pantallaLobby(app, { club, ir }) {
  const equipo = prepararEquipo(definicionEquipo(club.nombre, club.cartas, club.tactica));
  app.append(h('section', { class: 'lobby' },
    h('div', { class: 'lobby-club' },
      h('div', { class: 'escudo' }, iniciales(club.nombre)),
      h('div', {},
        h('h1', {}, club.nombre),
        h('p', {}, `Media del once ${equipo.media} · ${club.tactica.formacion} · ${club.cartas.length} cartas`))),
    h('nav', { class: 'lobby-menu', 'aria-label': 'Menú principal' },
      SECCIONES.map((s) => h('button', { class: 'recuadro', onclick: () => ir(s.ruta) },
        h('span', { class: 'recuadro-icono', 'aria-hidden': 'true' }, s.icono),
        h('span', { class: 'recuadro-titulo' }, s.titulo),
        h('span', { class: 'recuadro-texto' }, s.texto),
        s.estado ? h('span', { class: `recuadro-estado ${{ 'Próximamente': 'pronto', Cerrado: 'cerrado' }[s.estado] ?? ''}` }, s.estado) : null)))));
}
