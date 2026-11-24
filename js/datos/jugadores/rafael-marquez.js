// Rafael Márquez. Categoría Figura con 3 rarezas: Común, Raro y Épico.
// Atributos en Épico (Raro resta 6, Común resta 12).
export default {
  id: 'rafael-marquez',
  nombre: 'Rafael Márquez',
  nacion: 'México',
  escuela: 'Tiki-taka',
  categoria: 'figura',
  rarezas: ['comun', 'raro', 'epico'],
  roles: ['libero', 'central', 'ancla'],
  pie: 'derecho',
  pieMalo: 3,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-24)
  atributos: {
    definicion: 62, cabeza: 82, tiroLejano: 78,
    paseCorto: 89, paseLargo: 90, vision: 84, centros: 70,
    regate: 70, control: 84,
    entrada: 86, marcaje: 86, anticipacion: 90,
    velocidad: 72, resistencia: 80, fuerza: 84, salto: 82,
    posicionamiento: 89, compostura: 90,
    reflejos: 10, colocacion: 10, juegoAereo: 12, juegoPie: 30,
  },
  bonificaciones: [
    {
      nombre: 'Salida limpia',
      descripcion: 'Si juega de Líbero o Central: él gana +3 Pase largo y +2 Anticipación.',
      condicion: { tipo: 'rol', roles: ['libero', 'central'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { paseLargo: 3, anticipacion: 2 } },
    },
    {
      nombre: 'El Tri',
      descripcion: 'Con al menos 2 compañeros mexicanos: todos los mexicanos ganan +2 Pase corto, +2 Resistencia y +2 Compostura.',
      condicion: { tipo: 'companeros', filtro: { nacion: 'México' }, minimo: 2 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { nacion: 'México' } }, atributos: { paseCorto: 2, resistencia: 2, compostura: 2 } },
    },
  ],
  capitan: {
    nombre: 'Cinco Mundiales',
    descripcion: 'Con el brazalete: todos los defensas ganan +2 Compostura y +2 Pase corto.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'DEF' } }, atributos: { compostura: 2, paseCorto: 2 } },
  },
};
