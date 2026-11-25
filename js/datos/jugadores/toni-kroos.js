// Toni Kroos. Categoría Estrella: solo Épico y Legendario.
// Atributos en Legendario (Épico resta 6). Por debajo del techo de 96.
export default {
  id: 'toni-kroos',
  nombre: 'Toni Kroos',
  nacion: 'Alemania',
  escuela: 'Tiki-taka',
  categoria: 'estrella',
  roles: ['regista'],
  pie: 'derecho',
  pieMalo: 5,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-24)
  atributos: {
    definicion: 78, cabeza: 66, tiroLejano: 90,
    paseCorto: 96, paseLargo: 96, vision: 91, centros: 88,
    regate: 80, control: 93,
    entrada: 68, marcaje: 62, anticipacion: 86,
    velocidad: 66, resistencia: 86, fuerza: 76, salto: 66,
    posicionamiento: 88, compostura: 95,
    reflejos: 10, colocacion: 10, juegoAereo: 10, juegoPie: 25,
  },
  bonificaciones: [
    {
      nombre: 'Pase quirúrgico',
      descripcion: 'Si juega de Regista: él gana +3 Pase largo y +2 Compostura.',
      condicion: { tipo: 'rol', roles: ['regista'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { paseLargo: 3, compostura: 2 } },
    },
    {
      nombre: 'Control del ritmo',
      descripcion: 'Con al menos 3 mediocampistas compañeros: todos los mediocampistas ganan +2 Pase largo y +2 Compostura.',
      condicion: { tipo: 'companeros', filtro: { linea: 'MED' }, minimo: 3 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'MED' } }, atributos: { paseLargo: 2, compostura: 2 } },
    },
  ],
  capitan: {
    nombre: 'Seis Champions',
    descripcion: 'Con el brazalete: todo el equipo gana +2 Compostura y +1 Pase largo.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'equipo' }, atributos: { compostura: 2, paseLargo: 1 } },
  },
};
