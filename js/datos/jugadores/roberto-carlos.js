// Roberto Carlos. Categoría Estrella con 3 rarezas: Raro, Épico y Legendario.
// Atributos en Legendario (Épico resta 6, Raro resta 12).
export default {
  id: 'roberto-carlos',
  nombre: 'Roberto Carlos',
  nacion: 'Brasil',
  escuela: 'Jogo bonito',
  categoria: 'estrella',
  rarezas: ['raro', 'epico', 'legendario'],
  roles: ['carrilero', 'lateral'],
  pie: 'izquierdo',
  pieMalo: 2,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-25)
  atributos: {
    definicion: 72, cabeza: 66, tiroLejano: 95,
    paseCorto: 86, paseLargo: 84, vision: 80, centros: 92,
    regate: 86, control: 86,
    entrada: 86, marcaje: 82, anticipacion: 84,
    velocidad: 96, resistencia: 96, fuerza: 86, salto: 72,
    posicionamiento: 80, compostura: 86,
    reflejos: 10, colocacion: 10, juegoAereo: 10, juegoPie: 25,
  },
  bonificaciones: [
    {
      nombre: 'Cohete por la banda',
      descripcion: 'Si juega de Carrilero o Lateral: él gana +3 Centros y +2 Velocidad.',
      condicion: { tipo: 'rol', roles: ['carrilero', 'lateral'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { centros: 3, velocidad: 2 } },
    },
    {
      nombre: 'Servicio al área',
      descripcion: 'Con al menos 2 delanteros compañeros: todos los delanteros ganan +2 Cabeza y +2 Posicionamiento.',
      condicion: { tipo: 'companeros', filtro: { linea: 'DEL' }, minimo: 2 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'DEL' } }, atributos: { cabeza: 2, posicionamiento: 2 } },
    },
  ],
  capitan: {
    nombre: 'Galáctico',
    descripcion: 'Con el brazalete: todos los defensas ganan +2 Velocidad y +1 Centros.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'DEF' } }, atributos: { velocidad: 2, centros: 1 } },
  },
};
