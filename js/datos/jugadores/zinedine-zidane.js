// Zinedine Zidane. Categoría Estrella: solo Épico y Legendario.
// Atributos en Legendario (Épico resta 6). Por debajo del techo de 96.
export default {
  id: 'zinedine-zidane',
  nombre: 'Zinedine Zidane',
  nacion: 'Francia',
  escuela: 'Fútbol total',
  categoria: 'estrella',
  roles: ['mediapunta', 'regista'],
  pie: 'derecho',
  pieMalo: 5,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-24)
  atributos: {
    definicion: 86, cabeza: 85, tiroLejano: 88,
    paseCorto: 95, paseLargo: 92, vision: 96, centros: 84,
    regate: 94, control: 99,
    entrada: 60, marcaje: 52, anticipacion: 78,
    velocidad: 80, resistencia: 84, fuerza: 86, salto: 84,
    posicionamiento: 85, compostura: 98,
    reflejos: 10, colocacion: 10, juegoAereo: 12, juegoPie: 25,
  },
  bonificaciones: [
    {
      nombre: 'Ruleta marsellesa',
      descripcion: 'Si juega de Mediapunta: él gana +3 Regate y +2 Visión.',
      condicion: { tipo: 'rol', roles: ['mediapunta'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { regate: 3, vision: 2 } },
    },
    {
      nombre: 'Les Bleus',
      descripcion: 'Con al menos 2 compañeros franceses: todos los franceses ganan +2 Pase corto, +2 Fuerza y +2 Compostura.',
      condicion: { tipo: 'companeros', filtro: { nacion: 'Francia' }, minimo: 2 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { nacion: 'Francia' } }, atributos: { paseCorto: 2, fuerza: 2, compostura: 2 } },
    },
  ],
  capitan: {
    nombre: 'Elegancia',
    descripcion: 'Con el brazalete: todos los mediocampistas ganan +2 Control y +2 Compostura.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: 'MED' } }, atributos: { control: 2, compostura: 2 } },
  },
};
