// Ángel Di María. Categoría Figura: solo Raro y Épico.
// Atributos en Épico (Raro resta 6). Como extremo, por encima de Beckham
// (84) y por debajo de los extremos Estrella (Henry, Neymar y Figo, 91).
export default {
  id: 'angel-di-maria',
  nombre: 'Ángel Di María',
  nacion: 'Argentina',
  escuela: 'Vértigo',
  categoria: 'figura',
  roles: ['extremo', 'carrilero', 'mediapunta'],
  pie: 'izquierdo',
  pieMalo: 2,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-25)
  atributos: {
    definicion: 80, cabeza: 58, tiroLejano: 84,
    paseCorto: 86, paseLargo: 84, vision: 86, centros: 90,
    regate: 90, control: 88,
    entrada: 55, marcaje: 48, anticipacion: 72,
    velocidad: 91, resistencia: 90, fuerza: 64, salto: 60,
    posicionamiento: 82, compostura: 84,
    reflejos: 10, colocacion: 10, juegoAereo: 10, juegoPie: 22,
  },
  bonificaciones: [
    {
      nombre: 'Fideo',
      descripcion: 'Si juega de Extremo o Carrilero: él gana +3 Velocidad y +2 Centros.',
      condicion: { tipo: 'rol', roles: ['extremo', 'carrilero'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { velocidad: 3, centros: 2 } },
    },
    {
      nombre: 'Asistidor',
      descripcion: 'Con al menos 1 compañero de Delantero interior: todos los Extremos ganan +2 Velocidad y +2 Pase corto.',
      condicion: { tipo: 'companeros', filtro: { rol: 'interior' }, minimo: 1 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { rol: 'extremo' } }, atributos: { velocidad: 2, paseCorto: 2 } },
    },
  ],
  capitan: {
    nombre: 'Hombre de finales',
    descripcion: 'Con el brazalete: todos los mediocampistas y delanteros ganan +2 Resistencia y +1 Velocidad.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: ['MED', 'DEL'] } }, atributos: { resistencia: 2, velocidad: 1 } },
  },
};
