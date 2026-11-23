// Portada: lo primero que se ve al abrir el juego. Fondo del inicio con las
// chispas, el logo de Futbol Cards en grande y "Iniciar" parpadeando.
// Un clic (o Enter/Espacio) entra al juego. Devuelve una promesa que se
// cumple cuando el jugador entra.

import { h } from './dom.js';
import { iniciarBrasas } from './brasas.js';

export function mostrarPortada() {
  return new Promise((entrar) => {
    const portada = h('div', {
      class: 'portada', role: 'button', tabindex: 0, 'aria-label': 'Iniciar Futbol Cards',
    },
    h('div', { class: 'portada-contenido' },
      h('h1', { class: 'portada-logo' }, 'Futbol ', h('span', {}, 'Cards')),
      h('p', { class: 'portada-iniciar' }, 'Iniciar')));
    document.body.append(portada);
    const pararBrasas = iniciarBrasas(portada);
    portada.focus();

    let hecho = false;
    function iniciar(ev) {
      if (hecho) return;
      if (ev.type === 'keydown' && !['Enter', ' '].includes(ev.key)) return;
      hecho = true;
      portada.classList.add('saliendo');
      setTimeout(() => {
        pararBrasas();
        portada.remove();
        entrar();
      }, 450);
    }
    portada.addEventListener('click', iniciar);
    portada.addEventListener('keydown', iniciar);
  });
}
