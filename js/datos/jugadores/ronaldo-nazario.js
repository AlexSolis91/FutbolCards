// Ronaldo Nazário. Categoría Estrella: solo Épico y Legendario.
// Atributos en Legendario (Épico resta 6). Por debajo del techo de 96.
export default {
  id: 'ronaldo-nazario',
  nombre: 'Ronaldo Nazário',
  nacion: 'Brasil',
  escuela: 'Vértigo',
  categoria: 'estrella',
  roles: ['interior', 'delanteroArea'],
  pie: 'derecho',
  pieMalo: 4,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-25)
  atributos: {
    definicion: 97, cabeza: 86, tiroLejano: 86,
    paseCorto: 82, paseLargo: 70, vision: 82, centros: 70,
    regate: 97, control: 95,
    entrada: 30, marcaje: 22, anticipacion: 70,
    velocidad: 97, resistencia: 80, fuerza: 90, salto: 76,
    posicionamiento: 95, compostura: 95,
    reflejos: 10, colocacion: 10, juegoAereo: 10, juegoPie: 20,
  },
  bonificaciones: [
    {
      nombre: 'O Fenômeno',
      descripcion: 'Si juega de Delantero de área o Delantero interior: él gana +3 Regate y +2 Velocidad.',
      condicion: { tipo: 'rol', roles: ['delanteroArea', 'interior'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { regate: 3, velocidad: 2 } },
    },
    {
      nombre: 'Vértigo puro',
      descripcion: 'Con al menos 2 compañeros de escuela Vértigo: todos los de Vértigo ganan +2 Velocidad y +2 Definición.',
      condicion: { tipo: 'companeros', filtro: { escuela: 'Vértigo' }, minimo: 2 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { escuela: 'Vértigo' } }, atributos: { velocidad: 2, definicion: 2 } },
    },
  ],
  capitan: {
    nombre: 'Yokohama 2002',
    descripcion: 'Con el brazalete: todos los delanteros ganan +2 Definición y +1 Velocidad.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'DEL' } }, atributos: { definicion: 2, velocidad: 1 } },
  },
};
