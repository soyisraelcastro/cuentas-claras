/**
 * El IVA al 7% para RESICO (Ley de Ingresos de la Federación 2027, art. 25, fr. XVIII): los cinco
 * casos de la entrada del blog, la cuenta y todo lo que dice el simulador. Fuente única: el servidor
 * la usa para pintar el caso inicial (el HTML ya trae cifras reales) y el navegador para actualizar,
 * así el texto, la tabla y la calculadora nunca se desfasan.
 *
 * Supuesto a confirmar con las reglas del SAT: el 7% se calcula sobre lo cobrado SIN IVA.
 * Retención: quien le factura a personas morales recibe la retención de 2/3 del IVA trasladado
 * (LIVA art. 1-A, fr. II, inciso a; RLIVA art. 3, fr. I); a una persona moral no se le hace. Con el
 * 7% la ley dice que "únicamente" se disminuye el IVA retenido y no dice qué pasa si queda saldo a
 * favor: por eso con retención no se calcula nada "al año".
 */
import { conCentavos, pesos, porcentaje, type Tono } from '../scripts/simulador';

export { pesos };

export const TASA_IVA = 0.16;
export const TASA_OPCION = 0.07;
export const RETENCION = 2 / 3;
/** Hasta qué proporción de compras con IVA sobre lo cobrado conviene el 7%: 9% ÷ 16% = 56.25%. */
export const RAYA = (TASA_IVA - TASA_OPCION) / TASA_IVA;
/** Topes del RESICO en 2027: LISR 2027, arts. 113-E (persona física) y 206 (persona moral). */
export const TOPE_RESICO = { fisica: 5_000_000, moral: 50_000_000 } as const;

export type Persona = 'fisica' | 'moral';

export interface Caso {
  id: string;
  nombre: string;
  /** El nombre en el chip y en el riel. */
  corto: string;
  /** Quién es, en una línea. */
  quien: string;
  /** Lo que dice el chip debajo del nombre. */
  oficio: string;
  persona: Persona;
  /** Lo que cobra al mes, sin IVA. */
  cobra: number;
  /** Sus compras con IVA al mes, sin IVA. */
  compras: number;
  /** Si sus clientes (personas morales) le retienen 2/3 del IVA. */
  retencion: boolean;
  titular: string;
  historia: string;
  porque: string;
  /** La calcomanía del chip: src/assets/stickers/<icono>.png. */
  icono: string;
}

/** Personas y empresas ficticias; las cifras y los textos salen de la guía (social-studio/entregables/reforma-2027-iva-7). */
export const CASOS: Caso[] = [
  {
    id: 'ana', nombre: 'Ana', corto: 'Ana', quien: 'Diseñadora; sus clientes son personas físicas', oficio: 'Diseñadora', persona: 'fisica', cobra: 40_000, compras: 3_000, retencion: false, icono: 'celular',
    titular: 'Ana, diseñadora: le conviene, y mucho',
    historia: 'Está en RESICO como persona física y sus clientes son personas físicas, así que no le retienen IVA. Cobra $40,000 al mes, más IVA. Sus compras con IVA son poquitas: software e internet, $3,000 al mes.',
    porque: 'Vende servicios y casi no compra nada con IVA: sus compras son el 7.5% de lo que cobra. Si eres freelance, consultor, das clases, tienes un despacho chico o un consultorio y tus clientes son personas, probablemente eres Ana.',
  },
  {
    id: 'jorge', nombre: 'Jorge', corto: 'Jorge', quien: 'Tienda de ropa', oficio: 'Tienda de ropa', persona: 'fisica', cobra: 200_000, compras: 140_000, retencion: false, icono: 'compras',
    titular: 'Jorge, tienda de ropa: no le conviene',
    historia: 'Tiene una tienda de ropa, en RESICO como persona física. Vende $200,000 al mes y compra mercancía por $140,000.',
    porque: 'El que revende mercancía compra mucho con IVA, y con el 7% lo pierde todo. Sus compras son el 70% de lo que vende.',
  },
  {
    id: 'luis', nombre: 'Luis', corto: 'Luis', quien: 'Taller mecánico: mano de obra y refacciones', oficio: 'Taller mecánico', persona: 'fisica', cobra: 100_000, compras: 40_000, retencion: false, icono: 'coche',
    titular: 'Luis, taller mecánico: le conviene, aunque menos',
    historia: 'Tiene un taller: cobra mano de obra y refacciones. Está en RESICO como persona física, sin retenciones. Cobra $100,000 al mes y compra refacciones por $40,000.',
    porque: 'Menos que a Ana, pero le conviene, porque sus compras son el 40% de lo que cobra. Está del lado bueno de la raya del 56%.',
  },
  {
    id: 'marta', nombre: 'Marta', corto: 'Marta', quien: 'Consultora que le factura a empresas', oficio: 'Factura a empresas', persona: 'fisica', cobra: 50_000, compras: 1_000, retencion: true, icono: 'pregunta',
    titular: 'Marta, consultora que le factura a empresas: espera las reglas',
    historia: 'Es consultora en RESICO como persona física, pero le factura a empresas. Cobra $50,000 al mes, y las empresas que reciben servicios de una persona física le retienen dos terceras partes del IVA, aunque esté en RESICO. Sus compras con IVA son $1,000 al mes.',
    porque: 'Con la opción le quedan $1,833 “a favor” cada mes, y la ley no dice qué pasa con eso: solo dice que a ese pago “únicamente” se le disminuye el IVA retenido. No dice si el saldo se devuelve, si se compensa o si se pierde. Si tus clientes son empresas y te retienen IVA, no te subas al 7% todavía.',
  },
  {
    id: 'sa', nombre: 'Una S.A. de C.V.', corto: 'S.A. de C.V.', quien: 'Sociedad en el RESICO de personas morales', oficio: 'Sociedad', persona: 'moral', cobra: 1_000_000, compras: 300_000, retencion: false, icono: 'factura',
    titular: 'Una S.A. de C.V. en RESICO: le conviene',
    historia: 'No es solo para personas físicas. Una sociedad en el RESICO de personas morales vende $1,000,000 al mes y compra con IVA $300,000. No tiene retenciones.',
    porque: 'Sus compras son el 30% de lo que vende. Y a sus clientes, que son empresas, no les cambia nada: siguen recibiendo su factura con 16% y lo acreditan igual.',
  },
];

export type Veredicto = 'conviene' | 'quedate' | 'igual' | 'espera';

export interface Resultado {
  ivaCobrado: number;
  ivaCompras: number;
  retenido: number;
  /** 7% de lo cobrado, antes de restar la retención. */
  siete: number;
  /** IVA a pagar hoy (negativo = saldo a favor). */
  hoy: number;
  /** IVA a pagar con el 7% (negativo = la ley no dice qué pasa con la diferencia). */
  conOpcion: number;
  /** Lo que te ahorras al mes con el 7% (negativo = pagarías de más). */
  ahorroMes: number;
  ahorroAnio: number;
  /** Compras con IVA entre lo cobrado (0.075 = 7.5%). */
  proporcion: number;
  veredicto: Veredicto;
}

/**
 * La cuenta, exacta. Todo en trescientosavos de peso (16% = 48/300, 7% = 21/300, 2/3 del 16% = 32/300):
 * así los 2/3 no dejan residuos de punto flotante y se redondea a centavos una sola vez, al final.
 */
export function calcular({ cobra, compras, retencion }: Pick<Caso, 'cobra' | 'compras' | 'retencion'>): Resultado {
  const C = Math.max(0, Math.round(cobra));
  const P = Math.max(0, Math.round(compras));
  const r = retencion ? 1 : 0;
  const aPesos = (x: number) => (Math.sign(x) * Math.round(Math.abs(x) / 3)) / 100;
  const ahorro = 27 * C - 48 * P;
  return {
    ivaCobrado: aPesos(48 * C),
    ivaCompras: aPesos(48 * P),
    retenido: aPesos(32 * C * r),
    siete: aPesos(21 * C),
    hoy: aPesos(48 * C - 48 * P - 32 * C * r),
    conOpcion: aPesos(21 * C - 32 * C * r),
    ahorroMes: aPesos(ahorro),
    ahorroAnio: aPesos(ahorro * 12),
    proporcion: C > 0 ? P / C : 0,
    veredicto: r ? 'espera' : ahorro > 0 ? 'conviene' : ahorro < 0 ? 'quedate' : 'igual',
  };
}

export const VEREDICTOS: Record<Veredicto, string> = {
  conviene: 'Te conviene',
  quedate: 'Quédate como estás',
  igual: 'Te da lo mismo',
  espera: 'Espera las reglas del SAT',
};

/* ========================= Lo que muestra el simulador ========================= */

export interface Estado {
  cobra: number;
  compras: number;
  retencion: boolean;
  persona: Persona;
}

export const estadoDe = (c: Caso): Estado => ({ cobra: c.cobra, compras: c.compras, retencion: c.retencion, persona: c.persona });

/** El caso cuyos números son exactamente estos (o ninguno: son tus números). */
export const casoDe = (e: Estado): Caso | null =>
  CASOS.find((c) => c.cobra === e.cobra && c.compras === e.compras && c.retencion === e.retencion && c.persona === e.persona) ?? null;

/** Lee `?caso=` o `?cobra=&compras=&retencion=si&persona=moral`. Sin nada de eso, `null`. */
export function estadoDeUrl(q: URLSearchParams): Estado | null {
  const caso = CASOS.find((c) => c.id === q.get('caso'));
  if (caso) return estadoDe(caso);
  if (!q.has('cobra')) return null;
  const monto = (x: string | null) => Math.min(9_999_999_999, Math.max(0, Math.round(Number(String(x ?? '').replace(/[^\d.]/g, '')) || 0)));
  const persona: Persona = q.get('persona') === 'moral' ? 'moral' : 'fisica';
  return { cobra: monto(q.get('cobra')), compras: monto(q.get('compras')), persona, retencion: persona === 'fisica' && ['si', '1', 'true'].includes(q.get('retencion') ?? '') };
}

export type VeredictoVista = Veredicto | 'vacio';
export interface Nota { titulo: string; texto: string }

export interface Vista {
  estado: Estado;
  caso: Caso | null;
  r: Resultado;
  /** Si en esta cuenta alguno lleva centavos, todos van con centavos. */
  decimales: boolean;
  veredicto: VeredictoVista;
  tono: Tono;
  etiqueta: string;
  /** El remate en Shrikhand. */
  rotulo: string;
  /** La cifra grande, como número (cuenta hasta él) y lo que va junto. */
  cifra: number;
  que: string;
  anio: string;
  /** Una línea para el riel. */
  resumen: string;
  /** La barra pegada del teléfono: corta, para que quepa en un renglón. */
  fija: { que: string; cifra: string };
  hoyTexto: string;
  conTexto: string;
  formulaHoy: { expresion: string; resultado: string };
  formulaCon: { expresion: string; resultado: string };
  proporcionTexto: string;
  marca: string;
  titular: string;
  porque: string;
  notaRetencion: Nota;
  notaPersona: Nota;
  notaTope: Nota | null;
  copiar: string;
  /** Para el riel ("Tu cuenta"). */
  titulo: string;
  filas: { nombre: string; valor: string }[];
  /** La frase de la región aria-live. */
  voz: string;
  /** `?caso=ana` o `?cobra=…&compras=…` para la URL y el botón de copiar. */
  consulta: string;
}

const ROTULOS: Record<VeredictoVista, string> = {
  conviene: '¡Te conviene!',
  quedate: 'Quédate como estás',
  espera: 'Espera las reglas',
  igual: 'Te da lo mismo',
  vacio: 'Pon tus números',
};
const TONOS: Record<VeredictoVista, Tono> = { conviene: 'bien', quedate: 'mal', espera: 'neutro', igual: 'neutro', vacio: 'neutro' };

export function presentar(estado: Estado): Vista {
  const r = calcular(estado);
  const caso = casoDe(estado);
  const d = conCentavos(r.ivaCobrado, r.ivaCompras, r.retenido, r.siete, r.hoy, r.conOpcion, r.ahorroMes, r.ahorroAnio);
  const $ = (n: number) => pesos(n, d);
  const veredicto: VeredictoVista = estado.cobra <= 0 ? 'vacio' : r.veredicto;
  const etiqueta = veredicto === 'vacio' ? 'Pon lo que cobras' : VEREDICTOS[veredicto];
  const porc = estado.cobra > 0 ? (r.proporcion > 1 ? 'más de 100%' : porcentaje(r.proporcion)) : '0%';

  let cifra = 0, que = 'de diferencia al mes', anio = 'Pagas lo mismo con o sin el 7%', resumen = 'Pagas lo mismo', corta = 'Lo mismo';
  if (veredicto === 'conviene') { cifra = r.ahorroMes; que = 'menos al mes con el 7%'; anio = `${pesos(r.ahorroAnio, d)} al año, sin ISR encima`; resumen = `${$(r.ahorroMes)} menos al mes`; corta = resumen; }
  else if (veredicto === 'quedate') { cifra = -r.ahorroMes; que = 'más al mes con el 7%'; anio = `${pesos(-r.ahorroAnio, d)} más al año`; resumen = `${$(-r.ahorroMes)} más al mes`; corta = resumen; }
  else if (veredicto === 'espera') { cifra = r.conOpcion; que = 'de saldo al mes con el 7%, ¿y luego?'; anio = 'Al año: sin dato todavía. Depende de las reglas del SAT'; resumen = `Saldo de ${$(r.conOpcion)} al mes`; corta = `Saldo ${$(r.conOpcion)}`; }
  else if (veredicto === 'vacio') { que = 'de diferencia'; anio = 'Escribe lo que cobras al mes'; resumen = 'Pon tus números'; corta = ''; }

  const formulaHoy = estado.retencion
    ? { expresion: `${$(r.ivaCobrado)} − ${$(r.ivaCompras)} de compras − ${$(r.retenido)} retenido =`, resultado: $(r.hoy) }
    : { expresion: `16% de ${pesos(estado.cobra, false)} − 16% de ${pesos(estado.compras, false)} = ${$(r.ivaCobrado)} − ${$(r.ivaCompras)} =`, resultado: `${$(r.hoy)}${r.hoy < 0 ? ' a favor' : ''}` };
  const formulaCon = estado.retencion
    ? { expresion: `7% de ${pesos(estado.cobra, false)} = ${$(r.siete)}, menos ${$(r.retenido)} retenido =`, resultado: $(r.conOpcion) }
    : { expresion: `7% de ${pesos(estado.cobra, false)} =`, resultado: $(r.siete) };

  const titular = caso ? caso.titular : {
    conviene: 'Con tus números, te conviene',
    quedate: 'Con tus números, quédate como estás',
    espera: 'Con tus números, espera las reglas del SAT',
    igual: 'Con tus números, te da lo mismo',
    vacio: 'Pon lo que cobras al mes',
  }[veredicto];
  const porque = caso ? caso.porque : {
    conviene: `Tus compras con IVA son el ${porc} de lo que cobras: estás del lado de la raya donde conviene. Con el 7% pagarías ${$(r.ahorroMes)} menos al mes, ${pesos(r.ahorroAnio, d)} al año, y lo que te ahorras no paga ISR.`,
    quedate: `Tus compras con IVA son el ${porc} de lo que cobras: pasan de la raya del 56.25%. Con el 7% dejas de acreditar ${$(r.ivaCompras)} de IVA de compras y pagarías ${$(-r.ahorroMes)} más al mes.${r.hoy < 0 ? ' Hoy hasta te queda saldo a favor, porque compras más de lo que cobras.' : ''}`,
    espera: `Con el 7%, lo que te retienen (${$(r.retenido)}) es más que el 7% de lo que cobras (${$(r.siete)}). Te quedarían ${$(-r.conOpcion)} “a favor” cada mes, y la ley no dice si eso se devuelve, se compensa o se pierde. Espera las reglas del SAT antes de decidir.`,
    igual: 'Tus compras con IVA son justo el 56.25% de lo que cobras: con el 7% pagas lo mismo que hoy.',
    vacio: 'Escribe cuánto cobras al mes, sin IVA, y la cuenta se hace sola.',
  }[veredicto];

  const moral = estado.persona === 'moral';
  const anual = estado.cobra * 12;
  const notaTope: Nota | null = anual > TOPE_RESICO[estado.persona]
    ? { titulo: 'Ojo con el tope', texto: `${pesos(estado.cobra, false)} al mes son ${pesos(anual, false)} al año, y el RESICO de ${moral ? 'personas morales llega hasta $50 millones' : 'persona física llega hasta $5 millones'} al año en 2027. Si pasas del tope, sales del RESICO y del 7%.` }
    : null;

  const q = new URLSearchParams();
  if (caso) q.set('caso', caso.id);
  else {
    q.set('cobra', String(estado.cobra));
    q.set('compras', String(estado.compras));
    if (estado.retencion) q.set('retencion', 'si');
    if (moral) q.set('persona', 'moral');
  }

  const quien = caso ? caso.corto : 'Tus números';
  const voz = veredicto === 'vacio'
    ? 'Escribe lo que cobras al mes.'
    : `${quien}: hoy ${r.hoy < 0 ? 'saldo a favor de' : 'a pagar'} ${$(Math.abs(r.hoy))}; con el 7%, ${r.conOpcion < 0 ? `saldo de ${$(r.conOpcion)}` : $(r.conOpcion)}. ${etiqueta}.`
      + (veredicto === 'conviene' ? ` ${$(r.ahorroMes)} menos al mes, ${pesos(r.ahorroAnio, d)} al año.` : veredicto === 'quedate' ? ` ${$(-r.ahorroMes)} más al mes.` : '')
      + (estado.retencion ? '' : ` Tus compras son el ${porc} de lo que cobras; la raya está en 56.25%.`);

  return {
    estado, caso, r, decimales: d, veredicto, tono: TONOS[veredicto], etiqueta, rotulo: ROTULOS[veredicto],
    cifra, que, anio, resumen,
    fija: { que: ROTULOS[veredicto].replace(/[¡!]/g, ''), cifra: corta },
    hoyTexto: $(r.hoy), conTexto: $(r.conOpcion), formulaHoy, formulaCon,
    proporcionTexto: porc, marca: estado.cobra > 0 ? `Tú · ${porc}` : 'Tú',
    titular, porque,
    notaRetencion: { titulo: 'Retención', texto: moral ? 'A una sociedad no le aplica: la de 2/3 es para servicios que da una persona física.' : 'Te la hacen las empresas cuando eres persona física y les das servicios.' },
    notaPersona: moral
      ? { titulo: 'Persona moral', texto: 'Va por el RESICO de personas morales. La dispensa de contabilidad es solo para personas físicas.' }
      : { titulo: 'Persona física', texto: 'Con el 7%, por esas actividades no estás obligado a llevar contabilidad. Llévala igual: de qué lado de la raya estás sale de tus reportes.' },
    notaTope,
    copiar: caso ? 'Copiar enlace a este caso' : 'Copiar enlace con tus números',
    titulo: `${quien}: ${etiqueta.charAt(0).toLowerCase()}${etiqueta.slice(1)}`,
    filas: [{ nombre: 'Hoy', valor: $(r.hoy) }, { nombre: 'Con el 7%', valor: $(r.conOpcion) }],
    voz,
    consulta: `?${q}`,
  };
}
