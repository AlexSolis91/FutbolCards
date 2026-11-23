// Arranque y navegación entre pantallas (#inicio, #alineacion, #partido).

import { vaciar } from './dom.js';
import { cargarClub, cambiarTema, temaActual } from './estado.js';
import { pantallaInicio } from './inicio.js';
import { pantallaAlineacion } from './alineacion.js';
import { pantallaPartido } from './partido.js';

const app = document.getElementById('app');
const nav = document.getElementById('nav');
const botonTema = document.getElementById('tema');
const club = cargarClub();
let limpiar = null;

const PANTALLAS = { inicio: pantallaInicio, alineacion: pantallaAlineacion, partido: pantallaPartido };

function ir(ruta) {
  if (location.hash !== `#${ruta}`) location.hash = ruta;
  else mostrar();
}

function mostrar() {
  const ruta = PANTALLAS[location.hash.slice(1)] ? location.hash.slice(1) : 'inicio';
  if (limpiar) limpiar();
  limpiar = null;
  vaciar(app);
  for (const b of nav.querySelectorAll('button')) {
    if (b.dataset.ruta === ruta) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  }
  limpiar = PANTALLAS[ruta](app, { club, ir }) ?? null;
  window.scrollTo(0, 0);
}

function pintarBotonTema() {
  botonTema.textContent = temaActual() === 'claro' ? '🌙' : '☀️';
  document.querySelector('meta[name="theme-color"]').content = temaActual() === 'claro' ? '#f4f5f7' : '#0a0c0f';
}

nav.addEventListener('click', (e) => {
  const ruta = e.target.closest('button')?.dataset.ruta;
  if (ruta) ir(ruta);
});
botonTema.addEventListener('click', () => { cambiarTema(); pintarBotonTema(); });
window.addEventListener('hashchange', mostrar);

pintarBotonTema();
mostrar();

// Depuración desde la consola.
window.__fc = { club };
