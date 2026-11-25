// Luka Modrić. Categoría Estrella: solo Épico y Legendario.
// Atributos en Legendario (Épico resta 6). Por debajo del techo de 96.
export default {
  id: 'luka-modric',
  nombre: 'Luka Modrić',
  nacion: 'Croacia',
  escuela: 'Fútbol total',
  categoria: 'estrella',
  roles: ['regista', 'mediapunta', 'boxToBox'],
  pie: 'derecho',
  pieMalo: 4,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-25)
  atributos: {
    definicion: 76, cabeza: 60, tiroLejano: 88,
    paseCorto: 95, paseLargo: 92, vision: 94, centros: 88,
    regate: 92, control: 95,
    entrada: 78, marcaje: 70, anticipacion: 88,
    velocidad: 76, resistencia: 94, fuerza: 66, salto: 62,
    posicionamiento: 88, compostura: 94,
    reflejos: 10, colocacion: 10, juegoAereo: 10, juegoPie: 25,
  },
  bonificaciones: [
    {
      nombre: 'Exterior mágico',
      descripcion: 'Si juega de Regista o Mediapunta: él gana +3 Visión y +2 Centros.',
      condicion: { tipo: 'rol', roles: ['regista', 'mediapunta'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { vision: 3, centros: 2 } },
    },
    {
      nombre: 'Vatreni',
      descripcion: 'Con al menos 2 compañeros croatas: todos los croatas ganan +2 Resistencia, +2 Pase corto y +2 Compostura.',
      condicion: { tipo: 'companeros', filtro: { nacion: 'Croacia' }, minimo: 2 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { nacion: 'Croacia' } }, atributos: { resistencia: 2, paseCorto: 2, compostura: 2 } },
    },
  ],
  capitan: {
    nombre: 'Balón de Oro 2018',
    descripcion: 'Con el brazalete: todos los mediocampistas ganan +2 Resistencia y +2 Visión.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'MED' } }, atributos: { resistencia: 2, vision: 2 } },
  },
};
