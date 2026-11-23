// Colección: tus cartas con sus copias y la subida de rango, y el álbum con
// todos los jugadores reales del juego.

import { h, vaciar } from './dom.js';
import { crearCarta, mediaNatural, abreviatura } from './carta.js';
import { guardarClub } from './estado.js';
import { confirmar, avisar } from './dialogo.js';
import { ORDEN_RAREZAS, RAREZAS, ROLES, COPIAS_PARA_MEJORAR, rarezasDe } from '../motor/reglas.js';
import { atributosDeRareza, mediaEnRol } from '../motor/encaje.js';
import { agruparColeccion, siguienteRareza, mejorarCarta } from '../motor/coleccion.js';
import { JUGADORES } from '../datos/jugadores/index.js';

export function pantallaColeccion(app, { club }) {
  let pestana = 'mis';
  let filtro = 'todas';
  const raiz = h('section', { class: 'coleccion' });
  app.append(raiz);

  async function subir(grupo) {
    const destino = siguienteRareza(grupo.rareza, grupo.ficha);
    const ok = await confirmar(
      'Subir de rango',
      `${grupo.ficha.nombre} pasará de ${RAREZAS[grupo.rareza].nombre} a ${RAREZAS[destino].nombre}. Se usarán ${COPIAS_PARA_MEJORAR} copias.`,
      `Subir a ${RAREZAS[destino].nombre}`);
    if (!ok) return;
    const r = mejorarCarta(club.cartas, club.tactica, grupo.ficha.id, grupo.rareza);
    club.cartas = r.cartas;
    guardarClub(club);
    pintar();
    await avisar('¡Rango subido!', `${grupo.ficha.nombre} ahora es ${RAREZAS[destino].nombre}.`);
  }

  function misCartas() {
    const grupos = agruparColeccion(club.cartas)
      .filter((g) => filtro === 'todas' || g.rareza === filtro)
      .sort((a, b) => ORDEN_RAREZAS.indexOf(b.rareza) - ORDEN_RAREZAS.indexOf(a.rareza)
        || mediaNatural(b).media - mediaNatural(a).media);
    const filtros = h('div', { class: 'chips', role: 'group', 'aria-label': 'Filtrar por rareza' },
      ['todas', ...ORDEN_RAREZAS].map((r) => h('button', {
        class: 'chip', 'aria-pressed': String(filtro === r),
        onclick: () => { filtro = r; pintar(); },
      }, r === 'todas' ? 'Todas' : RAREZAS[r].nombre)));
    return [filtros, h('div', { class: 'rejilla-cartas' }, grupos.map((g) => {
      const { rol, media } = mediaNatural(g);
      const destino = siguienteRareza(g.rareza, g.ficha);
      const necesarias = COPIAS_PARA_MEJORAR + 1;
      return h('div', { class: 'item-coleccion' },
        h('div', { class: 'carta-con-copias' },
          crearCarta({ ficha: g.ficha, rareza: g.rareza, media, etiqueta: abreviatura(rol), detalle: `${ROLES[rol].nombre} · ${g.ficha.nacion}` }),
          h('span', { class: 'copias', title: 'Copias' }, `×${g.copias}`)),
        destino
          ? h('button', {
            class: `boton peque ${g.copias >= necesarias ? 'primario' : ''}`,
            disabled: g.copias < necesarias,
            onclick: () => subir(g),
          }, `Subir a ${RAREZAS[destino].nombre} (${Math.min(g.copias, necesarias)}/${necesarias})`)
          : h('span', { class: 'ayuda' }, 'Rango máximo'));
    }))];
  }

  function album() {
    // Aprobados primero; las propuestas se ven marcadas para poder revisarlas.
    return [...JUGADORES].sort((a, b) => (a.estado === 'aprobada' ? 0 : 1) - (b.estado === 'aprobada' ? 0 : 1)).map((j) => {
      const rol = j.roles[0];
      return h('article', { class: 'panel' },
        h('h3', { class: 'album-nombre' }, j.nombre,
          j.estado !== 'aprobada' ? h('span', { class: 'etiqueta-propuesta' }, 'Propuesta · pendiente de aprobar') : null),
        h('p', { class: 'ayuda', style: { margin: '0 0 12px' } }, `${j.nacion} · ${j.escuela} · ${j.roles.map((r) => ROLES[r].nombre).join(' / ')}`),
        h('div', { class: 'galeria' }, rarezasDe(j).map((r) => crearCarta({
          ficha: j, rareza: r, etiqueta: abreviatura(rol),
          media: Math.round(mediaEnRol(atributosDeRareza(j, r), rol)),
          detalle: `${ROLES[rol].nombre} · ${j.nacion}`,
        }))),
        h('ul', { class: 'bonos' },
          (j.bonificaciones ?? []).map((b) => h('li', {}, h('b', {}, b.nombre), ' — ', b.descripcion)),
          j.capitan ? h('li', { class: 'capitan-bono' }, h('b', {}, `Capitán: ${j.capitan.nombre}`), ' — ', j.capitan.descripcion) : null));
    });
  }

  function pintar() {
    vaciar(raiz).append(
      h('div', { class: 'pestanas', role: 'tablist' },
        h('button', { role: 'tab', 'aria-selected': String(pestana === 'mis'), onclick: () => { pestana = 'mis'; pintar(); } }, `Mis cartas (${club.cartas.length})`),
        h('button', { role: 'tab', 'aria-selected': String(pestana === 'album'), onclick: () => { pestana = 'album'; pintar(); } }, 'Álbum de jugadores')),
      h('div', { class: pestana === 'mis' ? 'panel' : 'lista-album' }, pestana === 'mis' ? misCartas() : album()));
  }

  pintar();
  return () => document.querySelectorAll('.modal-fondo').forEach((m) => m.remove());
}
