// Catálogo de jugadores reales. Cada jugador va en su propio archivo.
// Añadir aquí cada ficha nueva. estado: 'propuesta' (pendiente) | 'aprobada'.
import cristianoRonaldo from './cristiano-ronaldo.js';
import lionelMessi from './lionel-messi.js';

export const JUGADORES = [cristianoRonaldo, lionelMessi];
export const APROBADOS = JUGADORES.filter((j) => j.estado === 'aprobada');
