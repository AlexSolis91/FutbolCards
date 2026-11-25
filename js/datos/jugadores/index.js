// Catálogo de jugadores reales. Cada jugador va en su propio archivo.
// Añadir aquí cada ficha nueva. estado: 'propuesta' (pendiente) | 'aprobada'.
import cristianoRonaldo from './cristiano-ronaldo.js';
import lionelMessi from './lionel-messi.js';
import pele from './pele.js';
import diegoMaradona from './diego-maradona.js';
import zinedineZidane from './zinedine-zidane.js';
import paoloMaldini from './paolo-maldini.js';
import gianluigiBuffon from './gianluigi-buffon.js';
import ronaldinho from './ronaldinho.js';
import thierryHenry from './thierry-henry.js';
import kaka from './kaka.js';
import edgarDavids from './edgar-davids.js';
import lotharMatthaus from './lothar-matthaus.js';
import rafaelMarquez from './rafael-marquez.js';
import manuelNeuer from './manuel-neuer.js';
import xaviHernandez from './xavi-hernandez.js';

export const JUGADORES = [cristianoRonaldo, lionelMessi, pele, diegoMaradona, zinedineZidane, paoloMaldini, gianluigiBuffon, ronaldinho, thierryHenry, kaka, edgarDavids, lotharMatthaus, rafaelMarquez, manuelNeuer, xaviHernandez];
export const APROBADOS = JUGADORES.filter((j) => j.estado === 'aprobada');
