// Catálogo de jugadores reales. Cada jugador va en su propio archivo.
// Añadir aquí cada ficha nueva. estado: 'propuesta' (pendiente) | 'aprobada'.
import cristianoRonaldo from './cristiano-ronaldo.js';

export const JUGADORES = [cristianoRonaldo];
export const APROBADOS = JUGADORES.filter((j) => j.estado === 'aprobada');
