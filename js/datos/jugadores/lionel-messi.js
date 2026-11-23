// Lionel Messi. Categoría Estrella: solo Épico y Legendario.
// Atributos en Legendario (Épico resta 6).
export default {
  id: 'lionel-messi',
  nombre: 'Lionel Messi',
  nacion: 'Argentina',
  escuela: 'Tiki-taka',
  categoria: 'estrella',
  roles: ['falso9', 'extremo', 'mediapunta', 'segundoDelantero'],
  pie: 'izquierdo',
  pieMalo: 3,
  estado: 'propuesta',
  atributos: {
    definicion: 95, cabeza: 70, tiroLejano: 93,
    paseCorto: 94, paseLargo: 88, vision: 96, centros: 88,
    regate: 99, control: 98,
    entrada: 32, marcaje: 25, anticipacion: 62,
    velocidad: 92, resistencia: 80, fuerza: 66, salto: 68,
    posicionamiento: 93, compostura: 96,
    reflejos: 10, colocacion: 10, juegoAereo: 10, juegoPie: 22,
  },
  bonificaciones: [
    {
      nombre: 'La Pulga',
      descripcion: 'Si juega de Falso 9, Mediapunta o Segundo delantero: él gana +3 Regate y +3 Visión.',
      condicion: { tipo: 'rol', roles: ['falso9', 'mediapunta', 'segundoDelantero'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { regate: 3, vision: 3 } },
    },
    {
      nombre: 'Albiceleste',
      descripcion: 'Con al menos 2 compañeros argentinos: todos los argentinos ganan +2 Pase corto, +2 Control y +2 Compostura.',
      condicion: { tipo: 'companeros', filtro: { nacion: 'Argentina' }, minimo: 2 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { nacion: 'Argentina' } }, atributos: { paseCorto: 2, control: 2, compostura: 2 } },
    },
  ],
  capitan: {
    nombre: 'Genio del 10',
    descripcion: 'Con el brazalete: todos los mediocampistas ganan +3 Pase corto y +2 Visión.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'MED' } }, atributos: { paseCorto: 3, vision: 2 } },
  },
};
