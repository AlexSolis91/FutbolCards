// Cafu. Categoría Estrella: solo Épico y Legendario (bicampeón del mundo,
// capitán en 2002). Atributos en Legendario (Épico resta 6). Como carrilero,
// a la par de Roberto Carlos y Dani Alves (91).
export default {
  id: 'cafu',
  nombre: 'Cafu',
  nacion: 'Brasil',
  escuela: 'Garra',
  categoria: 'estrella',
  roles: ['carrilero', 'lateral'],
  pie: 'derecho',
  pieMalo: 3,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-26)
  atributos: {
    definicion: 66, cabeza: 66, tiroLejano: 72,
    paseCorto: 86, paseLargo: 80, vision: 78, centros: 90,
    regate: 86, control: 84,
    entrada: 90, marcaje: 84, anticipacion: 86,
    velocidad: 93, resistencia: 97, fuerza: 82, salto: 72,
    posicionamiento: 82, compostura: 88,
    reflejos: 10, colocacion: 10, juegoAereo: 10, juegoPie: 25,
  },
  bonificaciones: [
    {
      nombre: 'Pendolino',
      descripcion: 'Si juega de Carrilero o Lateral: él gana +3 Resistencia y +2 Velocidad.',
      condicion: { tipo: 'rol', roles: ['carrilero', 'lateral'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { resistencia: 3, velocidad: 2 } },
    },
    {
      nombre: 'Corazón',
      descripcion: 'Con al menos 2 compañeros de escuela Garra: todos los de Garra ganan +2 Entrada y +2 Resistencia.',
      condicion: { tipo: 'companeros', filtro: { escuela: 'Garra' }, minimo: 2 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { escuela: 'Garra' } }, atributos: { entrada: 2, resistencia: 2 } },
    },
  ],
  capitan: {
    nombre: 'Penta 2002',
    descripcion: 'Con el brazalete: todos los defensas y mediocampistas ganan +2 Resistencia y +1 Entrada.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: ['DEF', 'MED'] } }, atributos: { resistencia: 2, entrada: 1 } },
  },
};
