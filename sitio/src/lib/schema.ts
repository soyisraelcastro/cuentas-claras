/**
 * JSON-LD. Todo sale de sitio.ts y guia.ts; las páginas componen su grafo con estos bloques.
 * Sin nodos Offer: Cuentas Claras no publica precios (viven en sicastro.com/honorarios).
 */

import type { EntradaBlog } from './blog';
import { PREGUNTAS } from './guia';
import { CANAL, DESPACHO, PERSONA, SITIO } from './sitio';

type Nodo = Record<string, unknown>;

const ID = {
  sitio: `${SITIO.url}/#sitio`,
  persona: `${SITIO.url}/#israel-castro`,
  despacho: `${DESPACHO.url}/#despacho`,
  canal: `${SITIO.url}/#canal`,
};

export function sitioWeb(): Nodo {
  return {
    '@type': 'WebSite',
    '@id': ID.sitio,
    url: SITIO.url,
    name: SITIO.nombre,
    description: SITIO.descripcion,
    inLanguage: SITIO.lang,
    publisher: { '@id': ID.despacho },
  };
}

export function despacho(): Nodo {
  return {
    '@type': 'AccountingService',
    '@id': ID.despacho,
    name: DESPACHO.nombre,
    legalName: DESPACHO.razonSocial,
    url: DESPACHO.url,
    areaServed: { '@type': 'Country', name: 'México' },
    sameAs: [DESPACHO.facebook, CANAL.url],
    employee: { '@id': ID.persona },
  };
}

export function persona(): Nodo {
  return {
    '@type': 'Person',
    '@id': ID.persona,
    name: PERSONA.nombre,
    alternateName: PERSONA.nombreCompleto,
    jobTitle: PERSONA.titulo,
    image: `${SITIO.url}/israel-castro.jpg`,
    worksFor: { '@id': ID.despacho },
    sameAs: [...PERSONA.sameAs],
    knowsAbout: ['SAT', 'Declaración anual de personas físicas', 'Deducciones personales', 'ISR', 'RESICO', 'Finanzas personales'],
  };
}

export function canal(): Nodo {
  return {
    '@type': 'CreativeWorkSeries',
    '@id': ID.canal,
    name: CANAL.nombre,
    url: CANAL.url,
    inLanguage: SITIO.lang,
    author: { '@id': ID.persona },
    publisher: { '@id': ID.despacho },
    about: 'Trámites del SAT, la declaración anual y finanzas personales en México',
  };
}

export function preguntas(): Nodo {
  return {
    '@type': 'FAQPage',
    mainEntity: PREGUNTAS.map((p) => ({
      '@type': 'Question',
      name: p.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: p.respuesta, author: { '@id': ID.persona } },
    })),
  };
}

export function consulta(): Nodo {
  return {
    '@type': 'Service',
    '@id': `${SITIO.url}/agendar#consulta`,
    name: 'Consulta 1:1 por videollamada',
    description:
      'Revisión de tu caso con el SAT (declaración anual, cartas, deducciones, ingresos extra) con un contador público, por videollamada. El precio está publicado en sicastro.com/honorarios.',
    provider: { '@id': ID.despacho },
    areaServed: { '@type': 'Country', name: 'México' },
    availableLanguage: 'es',
    url: `${SITIO.url}/agendar`,
  };
}

/** Una entrada del blog (BlogPosting) y, si ya tiene video, la clase en YouTube (VideoObject). */
export function entradaBlog(e: EntradaBlog, url: string, imagen: string): Nodo[] {
  const d = e.data;
  const nodo: Nodo = {
    '@type': 'BlogPosting',
    '@id': `${url}#entrada`,
    headline: d.titulo,
    description: d.descripcion,
    url,
    image: imagen,
    datePublished: d.fecha.toISOString(),
    dateModified: (d.actualizado ?? d.fecha).toISOString(),
    inLanguage: SITIO.lang,
    author: { '@id': ID.persona },
    publisher: { '@id': ID.despacho },
    isPartOf: { '@id': ID.sitio },
    keywords: d.etiquetas.join(', ') || undefined,
  };
  const v = d.video;
  if (!v?.youtubeId) return [nodo];
  const video: Nodo = {
    '@type': 'VideoObject',
    '@id': `${url}#video`,
    name: v.titulo,
    description: d.descripcion,
    thumbnailUrl: `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${v.youtubeId}`,
    contentUrl: `https://www.youtube.com/watch?v=${v.youtubeId}`,
    uploadDate: (v.subido ?? d.fecha).toISOString(),
    duration: v.duracion,
    isPartOf: { '@id': ID.canal },
  };
  return [{ ...nodo, video: { '@id': `${url}#video` } }, video];
}

/** Migas de una página interna (Inicio › … › la página), para que el buscador entienda dónde está. */
export function migas(items: { nombre: string; url: string }[]): Nodo {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [{ nombre: 'Inicio', url: SITIO.url }, ...items].map((x, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: x.nombre,
      item: x.url,
    })),
  };
}

/** Preguntas frecuentes de una entrada (frontmatter `preguntas`): FAQPage con respuesta de Israel. */
export function preguntasEntrada(lista: { pregunta: string; respuesta: string }[], url: string): Nodo {
  return {
    '@type': 'FAQPage',
    '@id': `${url}#preguntas`,
    mainEntity: lista.map((p) => ({
      '@type': 'Question',
      name: p.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: p.respuesta, author: { '@id': ID.persona } },
    })),
  };
}
