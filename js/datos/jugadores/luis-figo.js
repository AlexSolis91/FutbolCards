// Luís Figo. Categoría Estrella: solo Épico y Legendario (Balón de Oro 2000).
// Atributos en Legendario (Épico resta 6). Como extremo, a la par de Henry y
// Neymar (91), por debajo de Cristiano y Ronaldinho (92).
export default {
  id: 'luis-figo',
  nombre: 'Luís Figo',
  nacion: 'Portugal',
  escuela: 'Vértigo',
  categoria: 'estrella',
  roles: ['extremo', 'mediapunta'],
  pie: 'derecho',
  pieMalo: 4,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-25)
  atributos: {
    definicion: 82, cabeza: 70, tiroLejano: 86,
    paseCorto: 90, paseLargo: 86, vision: 90, centros: 95,
    regate: 94, control: 92,
    entrada: 52, marcaje: 42, anticipacion: 72,
    velocidad: 89, resistencia: 88, fuerza: 80, salto: 70,
    posicionamiento: 84, compostura: 90,
    reflejos: 10, colocacion: 10, juegoAereo: 10, juegoPie: 22,
  },
  bonificaciones: [
    {
      nombre: 'Bicicleta',
      descripcion: 'Si juega de Extremo: él gana +3 Centros y +2 Regate.',
      condicion: { tipo: 'rol', roles: ['extremo'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { centros: 3, regate: 2 } },
    },
    {
      nombre: 'Sociedad por banda',
      descripcion: 'Con al menos 1 compañero de Lateral: todos los Laterales ganan +2 Centros y +2 Velocidad.',
      condicion: { tipo: 'companeros', filtro: { rol: 'lateral' }, minimo: 1 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { rol: 'lateral' } }, atributos: { centros: 2, velocidad: 2 } },
    },
  ],
  capitan: {
    nombre: 'Balón de Oro 2000',
    descripcion: 'Con el brazalete: todos los mediocampistas y delanteros ganan +2 Centros y +1 Regate.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: ['MED', 'DEL'] } }, atributos: { centros: 2, regate: 1 } },
  },
};
