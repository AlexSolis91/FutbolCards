// Frank Rijkaard. Categoría Estrella: solo Épico y Legendario.
// Atributos en Legendario (Épico resta 6). Leyenda de su puesto, sin Balón de Oro.
export default {
  id: 'frank-rijkaard',
  nombre: 'Frank Rijkaard',
  nacion: 'Países Bajos',
  escuela: 'Fútbol total',
  categoria: 'estrella',
  roles: ['ancla', 'boxToBox', 'central'],
  pie: 'derecho',
  pieMalo: 4,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-25)
  atributos: {
    definicion: 76, cabeza: 86, tiroLejano: 80,
    paseCorto: 88, paseLargo: 84, vision: 84, centros: 70,
    regate: 78, control: 86,
    entrada: 92, marcaje: 90, anticipacion: 94,
    velocidad: 80, resistencia: 92, fuerza: 92, salto: 86,
    posicionamiento: 92, compostura: 90,
    reflejos: 10, colocacion: 10, juegoAereo: 12, juegoPie: 25,
  },
  bonificaciones: [
    {
      nombre: 'Escudo rossonero',
      descripcion: 'Si juega de Ancla o Box-to-box: él gana +3 Anticipación y +2 Fuerza.',
      condicion: { tipo: 'rol', roles: ['ancla', 'boxToBox'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { anticipacion: 3, fuerza: 2 } },
    },
    {
      nombre: 'Fútbol total',
      descripcion: 'Con al menos 2 compañeros de escuela Fútbol total: todos los de Fútbol total ganan +2 Pase corto y +2 Anticipación.',
      condicion: { tipo: 'companeros', filtro: { escuela: 'Fútbol total' }, minimo: 2 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { escuela: 'Fútbol total' } }, atributos: { paseCorto: 2, anticipacion: 2 } },
    },
  ],
  capitan: {
    nombre: 'Trío de oro',
    descripcion: 'Con el brazalete: todos los mediocampistas y defensas ganan +2 Anticipación y +1 Entrada.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: ['MED', 'DEF'] } }, atributos: { anticipacion: 2, entrada: 1 } },
  },
};
