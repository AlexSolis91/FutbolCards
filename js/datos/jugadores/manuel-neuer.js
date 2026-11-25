// Manuel Neuer. Categoría Estrella: solo Épico y Legendario.
// Atributos en Legendario (Épico resta 6). Por debajo del techo de 96.
export default {
  id: 'manuel-neuer',
  nombre: 'Manuel Neuer',
  nacion: 'Alemania',
  escuela: 'Gegenpressing',
  categoria: 'estrella',
  roles: ['portero'],
  pie: 'derecho',
  pieMalo: 4,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-24)
  atributos: {
    definicion: 15, cabeza: 35, tiroLejano: 25,
    paseCorto: 82, paseLargo: 84, vision: 78, centros: 30,
    regate: 45, control: 75,
    entrada: 35, marcaje: 25, anticipacion: 90,
    velocidad: 75, resistencia: 78, fuerza: 86, salto: 86,
    posicionamiento: 90, compostura: 94,
    reflejos: 95, colocacion: 94, juegoAereo: 91, juegoPie: 96,
  },
  bonificaciones: [
    {
      nombre: 'Portero líbero',
      descripcion: 'Si juega de Portero: él gana +3 Juego de pie y +2 Anticipación.',
      condicion: { tipo: 'rol', roles: ['portero'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { juegoPie: 3, anticipacion: 2 } },
    },
    {
      nombre: 'Línea adelantada',
      descripcion: 'Con al menos 4 defensas compañeros: todos los defensas ganan +2 Velocidad y +2 Anticipación.',
      condicion: { tipo: 'companeros', filtro: { linea: 'DEF' }, minimo: 4 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'DEF' } }, atributos: { velocidad: 2, anticipacion: 2 } },
    },
  ],
  capitan: {
    nombre: 'Campeón del mundo 2014',
    descripcion: 'Con el brazalete: el portero y todos los defensas ganan +2 Compostura y +1 Pase corto.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: ['POR', 'DEF'] } }, atributos: { compostura: 2, paseCorto: 1 } },
  },
};
