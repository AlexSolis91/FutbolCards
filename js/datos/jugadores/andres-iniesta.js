// Andrés Iniesta. Categoría Estrella: solo Épico y Legendario.
// Atributos en Legendario (Épico resta 6). Como mediapunta, a la par de
// Modrić y Kaká (93), por debajo de Xavi como regista (94).
export default {
  id: 'andres-iniesta',
  nombre: 'Andrés Iniesta',
  nacion: 'España',
  escuela: 'Tiki-taka',
  categoria: 'estrella',
  roles: ['mediapunta', 'regista'],
  pie: 'derecho',
  pieMalo: 5,
  estado: 'aprobada', // publicada directamente por indicación del usuario (2026-11-25)
  atributos: {
    definicion: 80, cabeza: 58, tiroLejano: 84,
    paseCorto: 95, paseLargo: 86, vision: 93, centros: 82,
    regate: 95, control: 95,
    entrada: 66, marcaje: 58, anticipacion: 84,
    velocidad: 80, resistencia: 86, fuerza: 62, salto: 58,
    posicionamiento: 86, compostura: 95,
    reflejos: 10, colocacion: 10, juegoAereo: 10, juegoPie: 25,
  },
  bonificaciones: [
    {
      nombre: 'Ilusionista',
      descripcion: 'Si juega de Mediapunta o Regista: él gana +3 Regate y +2 Control.',
      condicion: { tipo: 'rol', roles: ['mediapunta', 'regista'] },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'propio' }, atributos: { regate: 3, control: 2 } },
    },
    {
      nombre: 'Rondo',
      descripcion: 'Con al menos 2 compañeros de escuela Tiki-taka: todos los de Tiki-taka ganan +2 Pase corto y +2 Control.',
      condicion: { tipo: 'companeros', filtro: { escuela: 'Tiki-taka' }, minimo: 2 },
      efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { escuela: 'Tiki-taka' } }, atributos: { paseCorto: 2, control: 2 } },
    },
  ],
  capitan: {
    nombre: 'Johannesburgo 2010',
    descripcion: 'Con el brazalete: todos los mediocampistas y delanteros ganan +2 Compostura y +1 Regate.',
    efecto: { tipo: 'atributos', objetivo: { tipo: 'filtro', filtro: { linea: ['MED', 'DEL'] } }, atributos: { compostura: 2, regate: 1 } },
  },
};
