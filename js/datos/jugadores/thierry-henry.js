// Thierry Henry. Categoría Estrella: solo Épico y Legendario.
// Atributos en Legendario (Épico resta 6). Por debajo del techo de 96.
export default {
  id: 'thierry-henry',
  nombre: 'Thierry Henry',
  nacion: 'Francia',
  escuela: 'Vértigo',
  categoria: 'estrella',
  roles: ['interior', 'delanteroArea', 'extremo'],
  pie: 'derecho',
  pieMalo: 4,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-24)
  atributos: {
    definicion: 95, cabeza: 76, tiroLejano: 86,
    paseCorto: 86, paseLargo: 78, vision: 86, centros: 84,
    regate: 92, control: 93,
    entrada: 38, marcaje: 30, anticipacion: 66,
    velocidad: 97, resistencia: 86, fuerza: 82, salto: 80,
    posicionamiento: 92, compostura: 92,
    reflejos: 10, colocacion: 10, juegoAereo: 10, juegoPie: 20,
  },
  bonificaciones: [
    {
      nombre: 'Va-va-voom',
      descripcion: 'Si juega de Delantero interior o Extremo: él gana +3 Velocidad y +2 Definición.',
      condicion: { tipo: 'rol', roles: ['interior', 'extremo'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { velocidad: 3, definicion: 2 } },
    },
    {
      nombre: 'Invencibles',
      descripcion: 'Con al menos 4 mediocampistas compañeros: todos los delanteros ganan +2 Velocidad y +2 Posicionamiento.',
      condicion: { tipo: 'companeros', filtro: { linea: 'MED' }, minimo: 4 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'DEL' } }, atributos: { velocidad: 2, posicionamiento: 2 } },
    },
  ],
  capitan: {
    nombre: 'Rey de Highbury',
    descripcion: 'Con el brazalete: todos los delanteros ganan +2 Definición y +2 Compostura.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'DEL' } }, atributos: { definicion: 2, compostura: 2 } },
  },
};
