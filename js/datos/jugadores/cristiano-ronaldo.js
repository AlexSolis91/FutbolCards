// Cristiano Ronaldo. Atributos en Legendario (las demás rarezas restan 6/12/18).
// Medias resultantes: Delantero interior 96 · Delantero de área 95 · Extremo 92.
export default {
  id: 'cristiano-ronaldo',
  nombre: 'Cristiano Ronaldo',
  nacion: 'Portugal',
  escuela: 'Vértigo',
  roles: ['interior', 'delanteroArea', 'extremo'],
  pie: 'derecho',
  pieMalo: 4,
  estado: 'propuesta', // 'propuesta' hasta que el usuario la apruebe
  atributos: {
    definicion: 99, cabeza: 95, tiroLejano: 96,
    paseCorto: 82, paseLargo: 74, vision: 80, centros: 82,
    regate: 95, control: 93,
    entrada: 35, marcaje: 30, anticipacion: 45,
    velocidad: 97, resistencia: 88, fuerza: 88, salto: 96,
    posicionamiento: 95, compostura: 92,
    reflejos: 10, colocacion: 10, juegoAereo: 12, juegoPie: 20,
  },
  bonificaciones: [
    {
      nombre: 'Cazador del área',
      descripcion: 'Si juega de Delantero interior o Delantero de área: él gana +3 Definición y +3 Remate de cabeza.',
      condicion: { tipo: 'rol', roles: ['interior', 'delanteroArea'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { definicion: 3, cabeza: 3 } },
    },
    {
      nombre: 'Orgullo luso',
      descripcion: 'Con al menos 2 compañeros portugueses: todos los portugueses ganan +2 Velocidad, +2 Resistencia y +2 Compostura.',
      condicion: { tipo: 'companeros', filtro: { nacion: 'Portugal' }, minimo: 2 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { nacion: 'Portugal' } }, atributos: { velocidad: 2, resistencia: 2, compostura: 2 } },
    },
  ],
  capitan: {
    nombre: 'Ambición de campeón',
    descripcion: 'Con el brazalete: todos los delanteros ganan +3 Definición y +2 Compostura.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'DEL' } }, atributos: { definicion: 3, compostura: 2 } },
  },
};
