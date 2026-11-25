// Xavi Hernández. Categoría Estrella: solo Épico y Legendario.
// Atributos en Legendario (Épico resta 6). Por debajo del techo de 96.
export default {
  id: 'xavi-hernandez',
  nombre: 'Xavi Hernández',
  nacion: 'España',
  escuela: 'Tiki-taka',
  categoria: 'estrella',
  roles: ['regista', 'mediapunta'],
  pie: 'derecho',
  pieMalo: 4,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-24)
  atributos: {
    definicion: 74, cabeza: 60, tiroLejano: 80,
    paseCorto: 99, paseLargo: 90, vision: 95, centros: 82,
    regate: 86, control: 96,
    entrada: 62, marcaje: 58, anticipacion: 88,
    velocidad: 72, resistencia: 90, fuerza: 64, salto: 60,
    posicionamiento: 90, compostura: 95,
    reflejos: 10, colocacion: 10, juegoAereo: 10, juegoPie: 25,
  },
  bonificaciones: [
    {
      nombre: 'Metrónomo',
      descripcion: 'Si juega de Regista: él gana +3 Pase corto y +2 Visión.',
      condicion: { tipo: 'rol', roles: ['regista'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { paseCorto: 3, vision: 2 } },
    },
    {
      nombre: 'La Roja',
      descripcion: 'Con al menos 2 compañeros españoles: todos los españoles ganan +2 Pase corto, +2 Control y +2 Compostura.',
      condicion: { tipo: 'companeros', filtro: { nacion: 'España' }, minimo: 2 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { nacion: 'España' } }, atributos: { paseCorto: 2, control: 2, compostura: 2 } },
    },
  ],
  capitan: {
    nombre: 'Tiki-taka',
    descripcion: 'Con el brazalete: todo el equipo gana +2 Pase corto y +1 Control.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'equipo' }, atributos: { paseCorto: 2, control: 1 } },
  },
};
