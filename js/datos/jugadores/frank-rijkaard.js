// Frank Rijkaard. Categoría Figura: solo Raro y Épico (decisión del usuario,
// 2026-11-25). Atributos en Épico (Raro resta 6).
export default {
  id: 'frank-rijkaard',
  nombre: 'Frank Rijkaard',
  nacion: 'Países Bajos',
  escuela: 'Fútbol total',
  categoria: 'figura',
  roles: ['ancla', 'boxToBox', 'central'],
  pie: 'derecho',
  pieMalo: 4,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-25)
  atributos: {
    definicion: 72, cabeza: 82, tiroLejano: 76,
    paseCorto: 84, paseLargo: 80, vision: 80, centros: 66,
    regate: 74, control: 82,
    entrada: 88, marcaje: 86, anticipacion: 90,
    velocidad: 76, resistencia: 88, fuerza: 88, salto: 82,
    posicionamiento: 88, compostura: 86,
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
