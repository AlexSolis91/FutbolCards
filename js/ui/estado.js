// Estado local del club (en este navegador) hasta que existan las cuentas.

import { crearClubPrueba } from '../datos/club-prueba.js';

const CLAVE = 'fc-club';

export function cargarClub() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE));
    if (guardado?.version === 2 && guardado.cartas?.length) return guardado;
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
