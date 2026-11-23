// Convierte eventos del motor en frases. Devuelve null para eventos que no se
// narran (solo mueven el balón).

const CARRIL = { izq: 'por la izquierda', cen: 'por el centro', der: 'por la derecha' };
const elegir = (lista, e) => lista[(e.t + (e.jugador?.length ?? 0)) % lista.length];

// nombre(lado, id) → nombre visible del jugador.
export function narrar(e, nombre, equipos) {
  const n = (id, lado = e.lado) => (id ? nombre(lado, id) : equipos[lado]);
  switch (e.tipo) {
    case 'avance':
      if (e.fase === 'salida') return elegir([`${n(e.jugador)} saca el balón jugado desde atrás`, `${n(e.jugador)} supera la primera línea de presión`, `Buena salida de ${n(e.jugador)}`], e);
      return elegir([`${n(e.jugador)} encuentra espacio ${CARRIL[e.carril]}`, `${n(e.jugador)} conduce hacia el área ${CARRIL[e.carril]}`, `Pase filtrado de ${n(e.jugador)}`], e);
    case 'perdida':
      if (!e.recupera) return `${equipos[e.lado]} pierde el balón`;
      return elegir([`${n(e.recupera, 1 - e.lado)} le roba el balón a ${n(e.jugador)}`, `Recuperación de ${n(e.recupera, 1 - e.lado)}`, `${n(e.recupera, 1 - e.lado)} corta el avance de ${equipos[e.lado]}`], e);
    case 'contragolpe':
      return `¡Contragolpe de ${equipos[e.lado]}! ${n(e.jugador)} sale lanzado`;
    case 'gol': {
      const como = e.remate === 'cabeza' ? ' de cabeza' : e.remate === 'lejano' ? ' desde fuera del área' : '';
      const asis = e.asistente ? `, asistencia de ${n(e.asistente)}` : '';
      return `¡GOOOL de ${n(e.jugador)}${como}${asis}!`;
    }
    case 'parada':
      return elegir([`${n(e.portero, 1 - e.lado)} detiene el ${e.remate === 'cabeza' ? 'cabezazo' : 'disparo'} de ${n(e.jugador)}`, `¡Paradón de ${n(e.portero, 1 - e.lado)}!`], e);
    case 'fuera':
      return elegir([`${n(e.jugador)} ${e.remate === 'cabeza' ? 'cabecea' : 'dispara'} desviado`, `Ocasión de ${n(e.jugador)}, pero se va fuera`, `${n(e.jugador)} lo intenta${e.remate === 'lejano' ? ' desde lejos' : ''}… fuera`], e);
    case 'descanso':
      return `Descanso: ${equipos[0]} ${e.marcador[0]} – ${e.marcador[1]} ${equipos[1]}`;
    case 'final':
      return `Final del partido: ${equipos[0]} ${e.marcador[0]} – ${e.marcador[1]} ${equipos[1]}`;
    case 'tactica':
      return `${equipos[e.lado]} cambia su planteamiento`;
    case 'cambio':
      return `Cambio en ${equipos[e.lado]}: entra ${n(e.entra)}, sale ${n(e.sale)}`;
    default:
      return null;
  }
}
