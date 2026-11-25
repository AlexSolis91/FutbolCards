// Andrea Pirlo. Categoría Estrella: solo Épico y Legendario.
// Atributos en Legendario (Épico resta 6). Por debajo del techo de 96.
export default {
  id: 'andrea-pirlo',
  nombre: 'Andrea Pirlo',
  nacion: 'Italia',
  escuela: 'Catenaccio',
  categoria: 'estrella',
  roles: ['regista', 'mediapunta'],
  pie: 'derecho',
  pieMalo: 4,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-25)
  atributos: {
    definicion: 74, cabeza: 58, tiroLejano: 90,
    paseCorto: 95, paseLargo: 96, vision: 95, centros: 88,
    regate: 82, control: 94,
    entrada: 62, marcaje: 56, anticipacion: 88,
    velocidad: 62, resistencia: 80, fuerza: 66, salto: 60,
    posicionamiento: 88, compostura: 93,
    reflejos: 10, colocacion: 10, juegoAereo: 10, juegoPie: 25,
  },
  bonificaciones: [
    {
      nombre: "L'Architetto",
      descripcion: 'Si juega de Regista: él gana +3 Pase largo y +2 Visión.',
      condicion: { tipo: 'rol', roles: ['regista'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { paseLargo: 3, vision: 2 } },
    },
    {
      nombre: 'Pase al hueco',
      descripcion: 'Con al menos 2 delanteros compañeros: todos los delanteros ganan +2 Posicionamiento y +2 Compostura.',
      condicion: { tipo: 'companeros', filtro: { linea: 'DEL' }, minimo: 2 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'DEL' } }, atributos: { posicionamiento: 2, compostura: 2 } },
    },
  ],
  capitan: {
    nombre: 'Il Professore',
    descripcion: 'Con el brazalete: todos los mediocampistas ganan +2 Pase largo y +2 Compostura.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'MED' } }, atributos: { paseLargo: 2, compostura: 2 } },
  },
};
