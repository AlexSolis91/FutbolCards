// Carta de jugador. El color de marco y panel depende de la rareza.
// La foto se busca en assets/jugadores/<nombre>-<rareza>.webp; si no existe,
// se muestran las iniciales.

import { h } from './dom.js';
import { RAREZAS } from '../motor/reglas.js';

export function slug(texto) {
  return texto
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function iniciales(nombre) {
  const partes = nombre.split(/\s+/).filter(Boolean);
  return (partes.length > 1 ? partes[0][0] + partes.at(-1)[0] : nombre.slice(0, 2)).toUpperCase();
}

export function rutaFoto(ficha, rareza) {
  return `assets/jugadores/${slug(ficha.nombre)}-${rareza}.webp`;
}

// opciones: { ficha, rareza, media, etiqueta (POR, DC…), detalle, mini, capitan, seleccionada, onclick }
export function crearCarta(o) {
  const foto = h('div', { class: 'foto' }, h('span', { class: 'iniciales' }, iniciales(o.ficha.nombre)));
  if (!o.ficha.prueba) {
    const img = h('img', { src: rutaFoto(o.ficha, o.rareza), alt: '', loading: 'lazy', decoding: 'async' });
    img.addEventListener('error', () => img.remove());
    foto.append(img);
  }
  const apellido = o.ficha.nombre.split(' ').slice(-1)[0];
  return h('div', {
    class: ['carta', o.rareza, o.mini && 'mini', o.seleccionada && 'seleccionada', o.onclick && 'clic'].filter(Boolean).join(' '),
    onclick: o.onclick,
    role: o.onclick ? 'button' : undefined,
    tabindex: o.onclick ? 0 : undefined,
    title: `${o.ficha.nombre} · ${RAREZAS[o.rareza].nombre}`,
  },
  h('div', { class: 'media' }, h('b', {}, o.media ?? '—'), o.etiqueta ? h('small', {}, o.etiqueta) : null),
  o.capitan ? h('div', { class: 'capitan', title: 'Capitán' }, 'C') : null,
  foto,
  h('div', { class: 'info' },
    // Nombre completo; la letra se achica en nombres largos para no cortarlo.
    h('div', {
      class: 'nombre',
      style: o.mini ? undefined : { fontSize: `${o.ficha.nombre.length <= 12 ? 15 : o.ficha.nombre.length <= 16 ? 13 : 11.5}px` },
    }, o.mini ? apellido : o.ficha.nombre),
    h('div', { class: 'detalle' }, o.detalle ?? `${o.ficha.nacion} · ${RAREZAS[o.rareza].nombre}`)));
}
