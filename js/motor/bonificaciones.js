// Bonificaciones de jugador y habilidades de Capitán.
// Una función universal por tipo de condición y por tipo de efecto; las fichas
// de los jugadores solo combinan estas piezas (nunca código propio).
//
// Forma de una bonificación en la ficha:
// { nombre, descripcion?, condicion: {...}, efecto: { tipo: 'atributos', objetivo: {...}, atributos: { pase: 3 } } }

// ---------------------------------------------------------------- Filtros
// Filtro de compañeros: { linea?, nacion?, escuela?, puesto?, rol?, excluirPropio? }
export function cumpleFiltro(j, filtro = {}) {
  if (filtro.linea && ![].concat(filtro.linea).includes(j.linea)) return false;
  if (filtro.nacion && ![].concat(filtro.nacion).includes(j.nacion)) return false;
  if (filtro.escuela && ![].concat(filtro.escuela).includes(j.escuela)) return false;
  if (filtro.puesto && ![].concat(filtro.puesto).includes(j.puesto)) return false;
  if (filtro.rol && ![].concat(filtro.rol).includes(j.rol)) return false;
  return true;
}

// ---------------------------------------------------------------- Condiciones
export const CONDICIONES = {
  siempre: () => true,
  // El propio jugador juega en alguno de estos roles.
  rol: (c, propio) => [].concat(c.roles).includes(propio.rol),
  // El propio jugador juega en alguna de estas líneas.
  linea: (c, propio) => [].concat(c.lineas).includes(propio.linea),
  // Hay al menos `minimo` compañeros (sin contarse a sí mismo) que cumplen el filtro.
  companeros: (c, propio, equipo) =>
    equipo.filter((j) => j !== propio && cumpleFiltro(j, c.filtro)).length >= (c.minimo ?? 1),
  // Todas las condiciones a la vez.
  todas: (c, propio, equipo) => c.condiciones.every((x) => evaluarCondicion(x, propio, equipo)),
  // Al menos una.
  alguna: (c, propio, equipo) => c.condiciones.some((x) => evaluarCondicion(x, propio, equipo)),
};

export function evaluarCondicion(condicion, propio, equipo) {
  const fn = CONDICIONES[condicion?.tipo ?? 'siempre'];
  if (!fn) throw new Error(`Condición desconocida: ${condicion.tipo}`);
  return fn(condicion ?? {}, propio, equipo);
}

// ---------------------------------------------------------------- Objetivos
// { tipo: 'propio' } | { tipo: 'equipo' } | { tipo: 'filtro', filtro: {...} }
export function resolverObjetivo(objetivo = { tipo: 'propio' }, propio, equipo) {
  switch (objetivo.tipo) {
    case 'propio': return [propio];
    case 'equipo': return equipo;
    case 'filtro': return equipo.filter((j) => cumpleFiltro(j, objetivo.filtro));
    default: throw new Error(`Objetivo desconocido: ${objetivo.tipo}`);
  }
}

// ---------------------------------------------------------------- Efectos
export const EFECTOS = {
  // Suma puntos a atributos concretos de los objetivos.
  atributos: (e, objetivos) => {
    for (const j of objetivos) {
      for (const [attr, valor] of Object.entries(e.atributos)) {
        j.bonos[attr] = (j.bonos[attr] ?? 0) + valor;
      }
    }
  },
};

export function aplicarEfecto(efecto, propio, equipo) {
  const fn = EFECTOS[efecto.tipo];
  if (!fn) throw new Error(`Efecto desconocido: ${efecto.tipo}`);
  fn(efecto, resolverObjetivo(efecto.objetivo, propio, equipo));
}

// Aplica todas las bonificaciones activas del equipo. Cada jugador debe tener
// `bonos = {}` antes. Devuelve la lista de bonificaciones que se activaron.
export function aplicarBonificaciones(equipo) {
  const activas = [];
  for (const j of equipo) {
    const lista = [...(j.ficha.bonificaciones ?? [])];
    if (j.esCapitan && j.ficha.capitan) lista.push({ ...j.ficha.capitan, esCapitan: true });
    for (const b of lista) {
      if (!evaluarCondicion(b.condicion, j, equipo)) continue;
      aplicarEfecto(b.efecto, j, equipo);
      activas.push({ jugador: j.id, nombre: b.nombre, capitan: !!b.esCapitan });
    }
  }
  return activas;
}
