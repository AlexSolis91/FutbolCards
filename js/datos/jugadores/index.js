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
import toniKroos from './toni-kroos.js';
import lukaModric from './luka-modric.js';
import andreaPirlo from './andrea-pirlo.js';
import robertoCarlos from './roberto-carlos.js';
import ronaldoNazario from './ronaldo-nazario.js';
import sergioRamos from './sergio-ramos.js';
import daniAlves from './dani-alves.js';
import davidBeckham from './david-beckham.js';
import frankRijkaard from './frank-rijkaard.js';
import ruudGullit from './ruud-gullit.js';
import alessandroNesta from './alessandro-nesta.js';
import francescoTotti from './francesco-totti.js';
import fabioCannavaro from './fabio-cannavaro.js';

export const JUGADORES = [cristianoRonaldo, lionelMessi, pele, diegoMaradona, zinedineZidane, paoloMaldini, gianluigiBuffon, ronaldinho, thierryHenry, kaka, edgarDavids, lotharMatthaus, rafaelMarquez, manuelNeuer, xaviHernandez, toniKroos, lukaModric, andreaPirlo, robertoCarlos, ronaldoNazario, sergioRamos, daniAlves, davidBeckham, frankRijkaard, ruudGullit, alessandroNesta, francescoTotti, fabioCannavaro];
export const APROBADOS = JUGADORES.filter((j) => j.estado === 'aprobada');
