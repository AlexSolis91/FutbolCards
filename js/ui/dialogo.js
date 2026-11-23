// Diálogos del juego (nunca confirm/alert del navegador).

import { h } from './dom.js';

function abrir(titulo, mensaje, botones) {
  return new Promise((resolver) => {
    const cerrar = (valor) => { fondo.remove(); document.removeEventListener('keydown', tecla); resolver(valor); };
    const tecla = (e) => { if (e.key === 'Escape') cerrar(false); };
    const fondo = h('div', { class: 'modal-fondo', onclick: (e) => { if (e.target === fondo) cerrar(false); } },
      h('div', { class: 'panel modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': titulo },
        h('h2', {}, titulo),
        typeof mensaje === 'string' ? h('p', { style: { margin: 0 } }, mensaje) : mensaje,
        h('div', { class: 'acciones', style: { marginTop: '16px', justifyContent: 'flex-end' } },
          botones.map((b) => h('button', { class: `boton ${b.primario ? 'primario' : ''}`, onclick: () => cerrar(b.valor) }, b.texto)))));
    document.addEventListener('keydown', tecla);
    document.body.append(fondo);
    fondo.querySelector('.primario')?.focus();
  });
}

export function confirmar(titulo, mensaje, textoSi = 'Aceptar', textoNo = 'Cancelar') {
  return abrir(titulo, mensaje, [{ texto: textoNo, valor: false }, { texto: textoSi, valor: true, primario: true }]);
}

export function avisar(titulo, mensaje, texto = 'Entendido') {
  return abrir(titulo, mensaje, [{ texto, valor: true, primario: true }]);
}
