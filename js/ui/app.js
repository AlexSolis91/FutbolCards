// Arranque y navegación. El lobby (#inicio) es el menú principal; cada
// recuadro abre su pantalla y la flecha ← vuelve al lobby.

import { vaciar } from './dom.js';
import { cargarClub, cambiarTema, temaActual } from './estado.js';
import { pantallaLobby } from './lobby.js';
import { pantallaAlineacion } from './alineacion.js';
import { pantallaColeccion } from './coleccion.js';
import { pantallaTemporadas, pantallaMercado, pantallaLigaMaster, pantallaTienda } from './secciones.js';
import { pantallaPartido } from './partido.js';
import { iniciarMusica, estadoMusica, cambiarVolumen, alternarSilencio, alCambiarMusica, iconoSonido } from './musica.js';

const app = document.getElementById('app');
const titulo = document.getElementById('titulo');
const botonVolver = document.getElementById('volver');
const botonTema = document.getElementById('tema');
const club = cargarClub();
let limpiar = null;

const PANTALLAS = {
  inicio: { titulo: '', pintar: pantallaLobby },
  club: { titulo: 'Mi Club', pintar: pantallaAlineacion },
  coleccion: { titulo: 'Colección', pintar: pantallaColeccion },
  mercado: { titulo: 'Mercado de Fichajes', pintar: pantallaMercado },
  temporadas: { titulo: 'Temporadas', pintar: pantallaTemporadas },
  ligamaster: { titulo: 'Liga Master', pintar: pantallaLigaMaster },
  tienda: { titulo: 'Tienda del Club', pintar: pantallaTienda },
  partido: { titulo: 'Partido', pintar: pantallaPartido, volver: 'temporadas' },
};

function ir(ruta) {
  if (location.hash !== `#${ruta}`) location.hash = ruta;
  else mostrar();
}

function rutaActual() {
  const r = location.hash.slice(1);
  return PANTALLAS[r] ? r : 'inicio';
}

function mostrar() {
  const ruta = rutaActual();
  const p = PANTALLAS[ruta];
  if (limpiar) limpiar();
  limpiar = null;
  vaciar(app);
  document.body.classList.toggle('en-lobby', ruta === 'inicio');
  titulo.textContent = p.titulo;
  botonVolver.hidden = ruta === 'inicio';
  document.title = p.titulo ? `${p.titulo} · Futbol Cards` : 'Futbol Cards';
  limpiar = p.pintar(app, { club, ir }) ?? null;
  window.scrollTo(0, 0);
}

function pintarBotonTema() {
  botonTema.textContent = temaActual() === 'claro' ? '🌙' : '☀️';
  document.querySelector('meta[name="theme-color"]').content = temaActual() === 'claro' ? '#f4f5f7' : '#0a0c0f';
}

botonVolver.addEventListener('click', () => ir(PANTALLAS[rutaActual()].volver ?? 'inicio'));
document.getElementById('marca').addEventListener('click', () => ir('inicio'));
botonTema.addEventListener('click', () => { cambiarTema(); pintarBotonTema(); });
window.addEventListener('hashchange', mostrar);

// ---------------------------------------------------------------- Música
const botonSonido = document.getElementById('sonido');
const panelSonido = document.getElementById('panel-sonido');
const botonSilencio = document.getElementById('silencio');
const barraVolumen = document.getElementById('volumen');
const valorVolumen = document.getElementById('volumen-valor');

function pintarSonido(e = estadoMusica()) {
  botonSonido.textContent = iconoSonido(e);
  botonSilencio.textContent = iconoSonido(e);
  botonSilencio.setAttribute('aria-pressed', String(e.silencio));
  barraVolumen.value = Math.round(e.volumen * 100);
  valorVolumen.textContent = Math.round(e.volumen * 100);
  document.getElementById('pista').textContent = `♪ ${e.pista}`;
}

function abrirPanelSonido(abrir) {
  panelSonido.hidden = !abrir;
  botonSonido.setAttribute('aria-expanded', String(abrir));
}

botonSonido.addEventListener('click', (ev) => { ev.stopPropagation(); abrirPanelSonido(panelSonido.hidden); });
panelSonido.addEventListener('click', (ev) => ev.stopPropagation());
document.addEventListener('click', () => abrirPanelSonido(false));
document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') abrirPanelSonido(false); });
botonSilencio.addEventListener('click', alternarSilencio);
barraVolumen.addEventListener('input', () => cambiarVolumen(barraVolumen.value / 100));
alCambiarMusica(pintarSonido);

iniciarMusica();
pintarSonido();
pintarBotonTema();
mostrar();

// Depuración desde la consola.
window.__fc = { club };
