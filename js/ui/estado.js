// Estado local del club (en este navegador) hasta que existan las cuentas.

import { crearClubPrueba, copiasDemo } from '../datos/club-prueba.js';
import { JUGADORES, APROBADOS } from '../datos/jugadores/index.js';
import { ORDEN_RAREZAS, rarezasDe } from '../motor/reglas.js';
import { repararAlineacion } from '../motor/alineacion.js';

const CLAVE = 'fc-club';

// Pone al día un club guardado: fichas reales actualizadas desde el catálogo,
// cada carta en una rareza que su jugador tenga (regla de 2 rarezas) y copias
// de prueba de los jugadores aprobados que aún no tenga, y alineación válida.
function actualizarClub(club) {
  const catalogo = new Map(JUGADORES.map((j) => [j.id, j]));
  const ajustar = (c) => {
    const ficha = catalogo.get(c.ficha.id) ?? c.ficha;
    const propias = rarezasDe(ficha);
    let rareza = c.rareza;
    if (!propias.includes(rareza)) {
      rareza = ORDEN_RAREZAS.indexOf(rareza) < ORDEN_RAREZAS.indexOf(propias[0]) ? propias[0] : propias.at(-1);
    }
    return { ...c, ficha, rareza };
  };
  club.cartas = club.cartas.map(ajustar);
  const tiene = new Set(club.cartas.map((c) => c.ficha.id));
  club.cartas.push(...copiasDemo(APROBADOS.filter((j) => !tiene.has(j.id))));
  // Alineaciones dañadas (p. ej. dos copias del mismo jugador en el campo).
  club.tactica = repararAlineacion(club.cartas, club.tactica).tactica;
  return club;
}

export function cargarClub() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE));
    if (guardado?.version === 2 && guardado.cartas?.length) {
      const club = actualizarClub(guardado);
      guardarClub(club);
      return club;
    }
  } catch (e) { /* almacenamiento no disponible o dañado */ }
  const club = crearClubPrueba();
  guardarClub(club);
  return club;
}

export function guardarClub(club) {
  try { localStorage.setItem(CLAVE, JSON.stringify(club)); } catch (e) { /* sin almacenamiento */ }
}

export function temaActual() {
  return document.documentElement.dataset.tema === 'claro' ? 'claro' : 'oscuro';
}

export function cambiarTema() {
  const nuevo = temaActual() === 'claro' ? 'oscuro' : 'claro';
  document.documentElement.dataset.tema = nuevo;
  try { localStorage.setItem('fc-tema', nuevo); } catch (e) { /* sin almacenamiento */ }
  return nuevo;
}
