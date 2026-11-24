// Kaká. Categoría Figura: solo Raro y Épico.
// Atributos en Épico (Raro resta 6).
export default {
  id: 'kaka',
  nombre: 'Kaká',
  nacion: 'Brasil',
  escuela: 'Vértigo',
  categoria: 'figura',
  roles: ['mediapunta', 'segundoDelantero', 'interior'],
  pie: 'derecho',
  pieMalo: 3,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-24)
  atributos: {
    definicion: 86, cabeza: 70, tiroLejano: 87,
    paseCorto: 88, paseLargo: 84, vision: 90, centros: 78,
    regate: 90, control: 89,
    entrada: 45, marcaje: 40, anticipacion: 68,
    velocidad: 92, resistencia: 86, fuerza: 76, salto: 72,
    posicionamiento: 86, compostura: 88,
    reflejos: 10, colocacion: 10, juegoAereo: 10, juegoPie: 20,
  },
  bonificaciones: [
    {
      nombre: 'Arrancada',
      descripcion: 'Si juega de Mediapunta: él gana +3 Velocidad y +2 Regate.',
      condicion: { tipo: 'rol', roles: ['mediapunta'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { velocidad: 3, regate: 2 } },
    },
    {
      nombre: 'Contragolpe letal',
      descripcion: 'Con al menos 4 defensas compañeros: todos los mediocampistas ganan +2 Velocidad y +2 Pase corto.',
      condicion: { tipo: 'companeros', filtro: { linea: 'DEF' }, minimo: 4 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'MED' } }, atributos: { velocidad: 2, paseCorto: 2 } },
    },
  ],
  capitan: {
    nombre: 'Balón de Oro 2007',
    descripcion: 'Con el brazalete: todos los mediocampistas ganan +2 Resistencia y +1 Velocidad.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'MED' } }, atributos: { resistencia: 2, velocidad: 1 } },
  },
};
