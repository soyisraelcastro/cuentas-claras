/**
 * Las piezas compartidas de los simuladores del blog (los componentes viven en
 * src/components/simulador/; cada entrada arma el suyo, p. ej. CalculadoraIva7.astro).
 *
 * Dos clases de funciones:
 * - **Puras** (formato, escala de montos, geometría de las barras y de la regla): corren también en
 *   el servidor, así el HTML ya trae calculado el caso inicial y el navegador solo actualiza.
 * - **De página** (campo de monto, interruptores, chips, URL, copiar enlace, eventos): reciben la
 *   raíz del simulador y buscan solo dentro de ella. Dos simuladores en la misma página no chocan.
 *   Nada se ejecuta al importar este archivo: no hay efectos a nivel de módulo.
 *
 * Eventos:
 * - `simulador:resultado` (sale de la raíz y burbujea): `detail` = { titulo, filas, veredicto, tono,
 *   resumen }. Lo escucha el riel "Tu cuenta" de Entrada.astro. Genérico: sirve para cualquier simulador.
 * - `simulador:pedir` (en `document`): cada simulador vuelve a emitir su último resultado. El riel lo
 *   manda al arrancar, por si llegó tarde al primero.
 * - `simulador:caso` (en la raíz): `detail` = { caso }. Carga ese caso (las ligas `?caso=` de la prosa).
 */

/* ============================== Puras ============================== */

/** Signo menos tipográfico (U+2212), el de la guía: −$1,833.33. La fuente del sitio lo trae desde 2026-11-19. */
export const MENOS = '−';

const NUM = [0, 2].map((d) => new Intl.NumberFormat('es-MX', { minimumFractionDigits: d, maximumFractionDigits: d }));
const PCT = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 });

/** ¿Lleva centavos? (redondeado a centavos, para no arrastrar errores de punto flotante) */
export const llevaCentavos = (n: number) => Math.round(Math.abs(n) * 100) % 100 !== 0;

/** $40,000 o −$1,833.33. Sin `decimales`, los pone solo si el monto trae centavos. */
export function pesos(n: number, decimales: boolean = llevaCentavos(n)): string {
  const fijo = Math.round(n * 100) / 100;
  return (fijo < 0 ? MENOS : '') + '$' + NUM[decimales ? 1 : 0].format(Math.abs(fijo));
}

/** 40,000 (sin signo de pesos): lo que se ve dentro del campo. */
export const numero = (n: number) => NUM[0].format(Math.round(n));

/** 7.5% o 56.25% (hasta dos decimales, sin ceros de más). */
export const porcentaje = (p: number) => `${PCT.format(p * 100)}%`;

/** Si alguno de los montos de una misma cuenta lleva centavos, todos se muestran con centavos (como en la guía). */
export const conCentavos = (...ns: number[]) => ns.some(llevaCentavos);

export interface Escala {
  /** Monto más alto del slider. */
  max: number;
  /** Pasos del control (el `max` del input range). */
  posiciones: number;
  aPos(v: number): number;
  dePos(p: number): number;
  /** El paso "bonito" para ese monto: 500, 1,000, 10,000 o 50,000. */
  paso(v: number): number;
  redondea(v: number): number;
  /** Las marcas de abajo del slider: valor, posición en % y texto. */
  marcas: { valor: number; x: number; texto: string }[];
}

/**
 * Escala logarítmica para montos de $0 a millones en un solo slider: $40,000 y $1,000,000 caben en
 * el mismo control sin que los montos chicos queden aplastados. La posición 0 es $0; las demás van
 * de `base` a `max`. El campo de texto acepta cualquier monto, aunque el slider no llegue.
 */
export function escalaDeMontos({ max = 5_000_000, base = 500, posiciones = 1000 } = {}): Escala {
  const tramo = Math.log(max / base);
  const paso = (v: number) => (v < 10_000 ? 500 : v < 100_000 ? 1_000 : v < 1_000_000 ? 10_000 : 50_000);
  const redondea = (v: number) => Math.round(v / paso(v)) * paso(v);
  const aPos = (v: number) => (v <= 0 ? 0 : Math.min(posiciones, Math.max(1, Math.round((posiciones * Math.log(Math.max(v, base) / base)) / tramo))));
  const dePos = (p: number) => (p <= 0 ? 0 : Math.min(max, redondea(base * Math.exp((tramo * p) / posiciones))));
  const marcas = [
    { valor: 0, texto: '$0' },
    { valor: 10_000, texto: '$10 mil' },
    { valor: 100_000, texto: '$100 mil' },
    { valor: 1_000_000, texto: '$1 millón' },
  ]
    .filter((m) => m.valor <= max)
    .map((m) => ({ ...m, x: Math.round((aPos(m.valor) / posiciones) * 10_000) / 100 }));
  return { max, posiciones, aPos, dePos, paso, redondea, marcas };
}

const porc = (x: number) => `${Math.round(x * 100_000) / 1000}%`;

export interface GeometriaBarra {
  signo: 'pos' | 'neg';
  /** Posición horizontal (left y width), la misma para la barra, su etiqueta y su nombre. */
  lado: string;
  /** Estilos en línea para la barra, su relleno y su etiqueta (los mismos en el servidor y en el navegador). */
  barra: string;
  relleno: string;
  etiqueta: string;
}

/**
 * Barras en la misma escala (hoy contra la opción, o las que sean). Si algún valor es negativo (un
 * saldo), la línea del cero sube y esa barra cuelga hacia abajo. `base` es la altura de la línea del
 * cero, de arriba (0) a abajo (1).
 */
export function geometriaBarras(valores: number[]): { base: string; barras: GeometriaBarra[] } {
  const n = valores.length || 1;
  const maxPos = Math.max(0, ...valores);
  const maxNeg = Math.max(0, ...valores.map((v) => -v));
  const total = maxPos + maxNeg || 1;
  const base = maxNeg ? maxPos / total : 1;
  const ancho = 100 / n;
  return {
    base: `top:${porc(base)}`,
    barras: valores.map((v, i) => {
      const fraccion = Math.abs(v) / total;
      const lado = `left:${porc((i * ancho + ancho * 0.16) / 100)};width:${porc((ancho * 0.68) / 100)}`;
      if (v < 0) {
        return {
          signo: 'neg',
          lado,
          barra: `${lado};top:${porc(base)};height:${porc(1 - base)}`,
          relleno: `transform-origin:top;transform:scaleY(${1 - base ? fraccion / (1 - base) : 0})`,
          etiqueta: `${lado};bottom:calc(${porc(1 - base)} + 6px)`,
        };
      }
      return {
        signo: 'pos',
        lado,
        barra: `${lado};bottom:${porc(1 - base)};height:${porc(base)}`,
        relleno: `transform-origin:bottom;transform:scaleY(${base ? fraccion / base : 0})`,
        etiqueta: `${lado};bottom:calc(${porc(1 - base + fraccion)} + 6px)`,
      };
    }),
  };
}

/** La marca de la regla: dónde cae tu proporción (de 0 a 1; lo que pasa de 1 se queda en la orilla). */
export const estiloRegla = (proporcion: number) => `--pf:${Math.min(Math.max(proporcion, 0), 1)}`;

/* ============================ De página ============================ */

export type Raiz = HTMLElement;

export const quieto = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const iniciados = new WeakSet<Element>();
let instancias = 0;

/** Arranca cada simulador una sola vez, aunque su script venga dos veces en la página. */
export function iniciarTodos(selector: string, iniciar: (raiz: Raiz, n: number) => void): void {
  const correr = () =>
    document.querySelectorAll<HTMLElement>(selector).forEach((raiz) => {
      if (iniciados.has(raiz)) return;
      iniciados.add(raiz);
      iniciar(raiz, ++instancias);
    });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', correr, { once: true });
  else correr();
}

/** Pone el texto en todos los `[data-sim-texto="clave"]` de la raíz. */
export function ponerTexto(raiz: Raiz, clave: string, texto: string): void {
  raiz.querySelectorAll(`[data-sim-texto="${clave}"]`).forEach((el) => {
    if (el.textContent !== texto) el.textContent = texto;
  });
}

/** Muestra u oculta los `[data-sim-si="clave"]` de la raíz. */
export function mostrar(raiz: Raiz, clave: string, visible: boolean): void {
  raiz.querySelectorAll<HTMLElement>(`[data-sim-si="${clave}"]`).forEach((el) => { el.hidden = !visible; });
}

/** Una nota (Notas.astro): título y texto, u oculta si no hay texto. */
export function ponerNota(raiz: Raiz, clave: string, nota: { titulo: string; texto: string } | null): void {
  const li = raiz.querySelector<HTMLElement>(`[data-sim-nota="${clave}"]`);
  if (!li) return;
  li.hidden = !nota;
  if (!nota) return;
  li.querySelector('[data-sim-nota-titulo]')!.textContent = nota.titulo;
  li.querySelector('[data-sim-nota-texto]')!.textContent = nota.texto;
}

/** Campo de monto (CampoMonto.astro): la cifra grande con comas y el slider, siempre de acuerdo. */
export function campoMonto(raiz: Raiz, nombre: string, alCambiar: (valor: number) => void) {
  const campo = raiz.querySelector<HTMLInputElement>(`[data-sim-monto="${nombre}"]`)!;
  const rango = raiz.querySelector<HTMLInputElement>(`[data-sim-rango="${nombre}"]`)!;
  const escala = escalaDeMontos({ max: Number(rango.dataset.max) || undefined, posiciones: Number(rango.max) || undefined });
  let valor = Number(campo.value.replace(/\D/g, '')) || 0;

  const pintarRango = () => {
    rango.style.setProperty('--p', `${(Number(rango.value) / escala.posiciones) * 100}%`);
    rango.setAttribute('aria-valuetext', pesos(valor, false));
  };
  const poner = (v: number, origen?: HTMLInputElement) => {
    valor = Math.max(0, Math.round(v));
    if (origen !== campo) campo.value = numero(valor);
    if (origen !== rango) rango.value = String(escala.aPos(valor));
    pintarRango();
  };

  campo.addEventListener('input', () => {
    /* Comas al vuelo sin que el cursor brinque: se cuenta cuántos dígitos había antes del cursor */
    const antes = campo.value.slice(0, campo.selectionStart ?? campo.value.length).replace(/\D/g, '').length;
    const digitos = campo.value.replace(/\D/g, '').slice(0, 10);
    valor = digitos ? Number(digitos) : 0;
    campo.value = digitos ? numero(valor) : '';
    let pos = 0;
    for (let vistos = 0; pos < campo.value.length && vistos < antes; pos++) if (/\d/.test(campo.value[pos])) vistos++;
    campo.setSelectionRange(pos, pos);
    poner(valor, campo);
    alCambiar(valor);
  });
  campo.addEventListener('blur', () => { campo.value = numero(valor); });
  rango.addEventListener('input', () => { poner(escala.dePos(Number(rango.value)), rango); alCambiar(valor); });
  /* Con teclado: pasos de monto "bonitos" (las flechas del slider logarítmico se atoran en el redondeo) */
  rango.addEventListener('keydown', (e) => {
    const mov = ({ ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10 } as Record<string, number>)[e.key];
    let nuevo: number;
    if (mov) {
      nuevo = valor;
      for (let i = 0; i < Math.abs(mov); i++) nuevo = mov > 0 ? nuevo + escala.paso(nuevo) : Math.max(0, nuevo - escala.paso(Math.max(0, nuevo - 1)));
    } else if (e.key === 'Home') nuevo = 0;
    else if (e.key === 'End') nuevo = escala.max;
    else return;
    e.preventDefault();
    poner(Math.min(escala.max, escala.redondea(nuevo)));
    alCambiar(valor);
  });
  pintarRango();
  return {
    get valor() { return valor; },
    poner: (v: number) => poner(v),
    enfocar: () => { campo.focus(); campo.select(); },
  };
}

/** Interruptor segmentado (Segmentado.astro). Los radios se renombran por instancia: dos simuladores no se mezclan. */
export function segmentado(raiz: Raiz, nombre: string, n: number, alCambiar: (valor: string) => void) {
  const radios = [...raiz.querySelectorAll<HTMLInputElement>(`input[data-sim-opcion="${nombre}"]`)];
  radios.forEach((r) => {
    r.name = `sim-${n}-${nombre}`;
    r.addEventListener('change', () => { if (r.checked) alCambiar(r.value); });
  });
  return {
    get valor() { return radios.find((r) => r.checked)?.value ?? ''; },
    poner: (v: string) => radios.forEach((r) => { r.checked = r.value === v; }),
    deshabilitar: (v: string, si: boolean) => radios.forEach((r) => { if (r.value === v) r.disabled = si; }),
  };
}

/** Chips de casos (Chips.astro). `marcar(null)` marca "Tus números". En el teléfono la tira se desliza al elegido. */
export function chips(raiz: Raiz, alElegir: (id: string) => void, alTuyos?: () => void) {
  const tira = raiz.querySelector<HTMLElement>('[data-sim-casos]');
  raiz.querySelectorAll<HTMLButtonElement>('[data-sim-caso]').forEach((b) => b.addEventListener('click', () => alElegir(b.dataset.simCaso!)));
  raiz.querySelector<HTMLButtonElement>('[data-sim-tuyos]')?.addEventListener('click', () => alTuyos?.());
  let primero = true;
  return {
    marcar(id: string | null) {
      raiz.querySelectorAll<HTMLButtonElement>('[data-sim-caso]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.simCaso === id)));
      raiz.querySelector('[data-sim-tuyos]')?.setAttribute('aria-pressed', String(id === null));
      const elegido = tira?.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (tira && elegido && tira.scrollWidth > tira.clientWidth) {
        tira.scrollTo({ left: Math.max(0, elegido.offsetLeft - tira.offsetLeft - 16), behavior: primero || quieto() ? 'auto' : 'smooth' });
      }
      primero = false;
    },
  };
}

const mostrados = new WeakMap<Element, number>();
const cuadros = new WeakMap<Element, number>();

/** La cifra grande cuenta hasta su valor (sin movimiento si así lo pide el sistema). */
export function contar(el: Element | null, valor: number, formato: (n: number) => string): void {
  if (!el) return;
  const desde = mostrados.get(el);
  cancelAnimationFrame(cuadros.get(el) ?? 0);
  mostrados.set(el, valor);
  if (desde === undefined || desde === valor || quieto()) { el.textContent = formato(valor); return; }
  const t0 = performance.now();
  const paso = (ahora: number) => {
    const k = Math.min(1, (ahora - t0) / 520);
    el.textContent = k < 1 ? pesos(Math.round(desde + (valor - desde) * (1 - (1 - k) ** 3)), false) : formato(valor);
    if (k < 1) cuadros.set(el, requestAnimationFrame(paso));
  };
  cuadros.set(el, requestAnimationFrame(paso));
}

/** El remate se vuelve a pegar con rebote cuando cambia el veredicto (nada si el sistema pide no moverse). */
export function pegar(el: Element | null): void {
  if (!el || quieto()) return;
  el.classList.remove('sim-pega');
  void (el as HTMLElement).offsetWidth;
  el.classList.add('sim-pega');
}

/** Barras (Barras.astro): misma geometría que en el servidor. `textos` va en el mismo orden que las barras. */
export function pintarBarras(raiz: Raiz, valores: number[], textos: string[]): void {
  const plot = raiz.querySelector<HTMLElement>('[data-sim-plot]');
  if (!plot) return;
  const geo = geometriaBarras(valores);
  plot.querySelector('[data-sim-base]')?.setAttribute('style', geo.base);
  plot.querySelectorAll<HTMLElement>('[data-sim-barra]').forEach((b, i) => {
    const g = geo.barras[i];
    if (!g) return;
    b.dataset.signo = g.signo;
    b.setAttribute('style', g.barra);
    b.firstElementChild?.setAttribute('style', g.relleno);
  });
  plot.querySelectorAll<HTMLElement>('[data-sim-barra-valor]').forEach((e, i) => {
    const g = geo.barras[i];
    if (!g) return;
    e.setAttribute('style', g.etiqueta);
    e.textContent = textos[i] ?? '';
  });
}

/** La regla (Regla.astro): dónde cae la marca y si está apagada (cuando la regla no aplica). */
export function pintarRegla(raiz: Raiz, proporcion: number, marca: string, apagada = false): void {
  const regla = raiz.querySelector<HTMLElement>('[data-sim-regla]');
  if (!regla) return;
  regla.style.setProperty('--pf', String(Math.min(Math.max(proporcion, 0), 1)));
  regla.toggleAttribute('data-apagada', apagada);
  ponerTexto(raiz, 'marca', marca);
}

/** La URL solo la lee y la escribe el simulador con `data-enlace` (uno por página). */
export function leerUrl(raiz: Raiz): URLSearchParams {
  return raiz.hasAttribute('data-enlace') ? new URLSearchParams(location.search) : new URLSearchParams();
}

const relojes = new WeakMap<Element, number>();
export function escribirUrl(raiz: Raiz, consulta: string): void {
  if (!raiz.hasAttribute('data-enlace')) return;
  clearTimeout(relojes.get(raiz));
  relojes.set(raiz, window.setTimeout(() => {
    try { history.replaceState(history.state, '', `${location.pathname}${consulta}${location.hash}`); } catch { /* file:// u otro origen */ }
  }, 500));
}

/** Copiar enlace (CopiarEnlace.astro): arma la URL del caso o de tus números. */
export function copiarEnlace(raiz: Raiz, consulta: () => string, aviso = 'Listo: el enlace abre esta cuenta tal cual.'): void {
  const boton = raiz.querySelector<HTMLButtonElement>('[data-sim-copiar]');
  const estado = raiz.querySelector<HTMLElement>('[data-sim-copiado]');
  boton?.addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}${consulta()}${raiz.id ? `#${raiz.id}` : ''}`;
    try {
      await navigator.clipboard.writeText(url);
      if (estado) estado.textContent = aviso;
    } catch {
      window.prompt('Copia el enlace:', url);
    }
  });
}

const voces = new WeakMap<Element, number>();
/** Lo que oye un lector de pantalla: una frase, cuando el usuario deja de mover (no a cada paso del slider). */
export function anunciar(raiz: Raiz, texto: string): void {
  clearTimeout(voces.get(raiz));
  voces.set(raiz, window.setTimeout(() => {
    const voz = raiz.querySelector('[data-sim-voz]');
    if (voz) voz.textContent = texto;
  }, 650));
}

export interface ResultadoSimulador {
  /** "Ana: te conviene" o "Tus números: quédate como estás". */
  titulo: string;
  /** Renglones cortos para el riel: [{ nombre: 'Hoy', valor: '$5,920' }, …]. */
  filas: { nombre: string; valor: string }[];
  /** La clave del veredicto de ese simulador. */
  veredicto: string;
  /** bien (maíz), mal (rosa) o neutro (crema): el color del resultado, igual en todos los simuladores. */
  tono: Tono;
  /** Una línea: "$3,120 menos al mes". */
  resumen: string;
}
export type Tono = 'bien' | 'mal' | 'neutro';

const ultimos = new Map<Element, ResultadoSimulador>();
let escuchando = false;

/** Avisa el resultado (para el riel) y pinta el tono en la raíz. */
export function emitirResultado(raiz: Raiz, detalle: ResultadoSimulador): void {
  raiz.dataset.tono = detalle.tono;
  raiz.dataset.veredicto = detalle.veredicto;
  ultimos.set(raiz, detalle);
  if (!escuchando) {
    escuchando = true;
    document.addEventListener('simulador:pedir', () => ultimos.forEach((d, r) => r.dispatchEvent(new CustomEvent('simulador:resultado', { bubbles: true, detail: d }))));
  }
  raiz.dispatchEvent(new CustomEvent('simulador:resultado', { bubbles: true, detail: detalle }));
}

/** Escucha los pedidos de caso de fuera (las ligas `?caso=` de la prosa). */
export function alPedirCaso(raiz: Raiz, cargar: (id: string) => void): void {
  raiz.addEventListener('simulador:caso', (e) => {
    const id = (e as CustomEvent<{ caso?: string }>).detail?.caso;
    if (id) cargar(id);
  });
}
