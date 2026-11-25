// Dani Alves. Categoría Estrella con 3 rarezas: Raro, Épico y Legendario.
// Atributos en Legendario (Épico resta 6, Raro resta 12).
export default {
  id: 'dani-alves',
  nombre: 'Dani Alves',
  nacion: 'Brasil',
  escuela: 'Tiki-taka',
  categoria: 'estrella',
  rarezas: ['raro', 'epico', 'legendario'],
  roles: ['carrilero', 'lateral'],
  pie: 'derecho',
  pieMalo: 3,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-25)
  atributos: {
    definicion: 70, cabeza: 62, tiroLejano: 78,
    paseCorto: 92, paseLargo: 84, vision: 86, centros: 92,
    regate: 88, control: 88,
    entrada: 82, marcaje: 78, anticipacion: 84,
    velocidad: 92, resistencia: 95, fuerza: 72, salto: 70,
    posicionamiento: 82, compostura: 86,
    reflejos: 10, colocacion: 10, juegoAereo: 10, juegoPie: 25,
  },
  bonificaciones: [
    {
      nombre: 'Carril derecho',
      descripcion: 'Si juega de Carrilero o Lateral: él gana +3 Pase corto y +2 Centros.',
      condicion: { tipo: 'rol', roles: ['carrilero', 'lateral'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { paseCorto: 3, centros: 2 } },
    },
    {
      nombre: 'Salida por fuera',
      descripcion: 'Con al menos 3 mediocampistas compañeros: todos los defensas ganan +2 Pase corto y +2 Resistencia.',
      condicion: { tipo: 'companeros', filtro: { linea: 'MED' }, minimo: 3 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'DEF' } }, atributos: { paseCorto: 2, resistencia: 2 } },
    },
  ],
  capitan: {
    nombre: 'Coleccionista de títulos',
    descripcion: 'Con el brazalete: todo el equipo gana +2 Resistencia y +1 Pase corto.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'equipo' }, atributos: { resistencia: 2, paseCorto: 1 } },
  },
};
