// Lothar Matthäus. Categoría Estrella: solo Épico y Legendario.
// Atributos en Legendario (Épico resta 6). Por debajo del techo de 96.
export default {
  id: 'lothar-matthaus',
  nombre: 'Lothar Matthäus',
  nacion: 'Alemania',
  escuela: 'Gegenpressing',
  categoria: 'estrella',
  roles: ['boxToBox', 'libero', 'regista'],
  pie: 'derecho',
  pieMalo: 4,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-24)
  atributos: {
    definicion: 84, cabeza: 80, tiroLejano: 94,
    paseCorto: 92, paseLargo: 92, vision: 91, centros: 80,
    regate: 86, control: 90,
    entrada: 92, marcaje: 88, anticipacion: 94,
    velocidad: 84, resistencia: 97, fuerza: 90, salto: 80,
    posicionamiento: 93, compostura: 93,
    reflejos: 10, colocacion: 10, juegoAereo: 12, juegoPie: 25,
  },
  bonificaciones: [
    {
      nombre: 'Motor alemán',
      descripcion: 'Si juega de Box-to-box: él gana +3 Resistencia y +2 Tiro lejano.',
      condicion: { tipo: 'rol', roles: ['boxToBox'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { resistencia: 3, tiroLejano: 2 } },
    },
    {
      nombre: 'Die Mannschaft',
      descripcion: 'Con al menos 2 compañeros alemanes: todos los alemanes ganan +2 Entrada, +2 Fuerza y +2 Compostura.',
      condicion: { tipo: 'companeros', filtro: { nacion: 'Alemania' }, minimo: 2 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { nacion: 'Alemania' } }, atributos: { entrada: 2, fuerza: 2, compostura: 2 } },
    },
  ],
  capitan: {
    nombre: 'Capitán de Italia 90',
    descripcion: 'Con el brazalete: todo el equipo gana +2 Resistencia y +1 Anticipación.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'equipo' }, atributos: { resistencia: 2, anticipacion: 1 } },
  },
};
