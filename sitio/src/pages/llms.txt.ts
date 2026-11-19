/**
 * GET /llms.txt (se genera en build). El índice corto para LLMs, con el patrón de soycontador-ai:
 * los datos salen de sitio.ts y guia.ts; aquí solo vive la descripción de cada página.
 */
import type { APIRoute } from 'astro';

import { entradas, rutaEntrada } from '../lib/blog';
import { CANAL, DESPACHO, PERSONA, PRECIO_CONSULTA_URL, SITIO } from '../lib/sitio';

const PAGINAS = [
  { ruta: '/', titulo: 'Inicio', que: 'qué es el canal, la calculadora de deducciones, cinco preguntas frecuentes sobre impuestos y una guía gratis de qué hacer con el SAT mes por mes' },
  { ruta: '/agendar', titulo: 'Consulta 1:1', que: `precalificación para una consulta por videollamada de media hora con un contador público; el precio está publicado en ${PRECIO_CONSULTA_URL}` },
  { ruta: '/privacidad', titulo: 'Aviso de privacidad', que: 'qué datos se piden y cómo ejercer los derechos ARCO' },
];

export const GET: APIRoute = async () => {
  const blog = await entradas();
  const doc = `# ${SITIO.nombre} (${SITIO.url.replace('https://', '')})

> ${SITIO.nombre} es el canal de YouTube (${CANAL.url}) de ${DESPACHO.nombre}, un
> despacho contable familiar en México. Lo conduce ${PERSONA.nombre}, contador público.
> Explica trámites del SAT paso a paso, la declaración anual de personas físicas
> (obligación, deducciones personales, saldos a favor), ingresos extra como intereses
> y Sofipos, y finanzas personales desde lo fiscal. Formato: una duda de un cliente
> por video, resuelta como en una consulta; los de un mismo tema forman una serie.

Idioma: español de México. Contexto fiscal: SAT, LISR, CFF, UMA. El contenido es
orientación general; cada caso tiene sus detalles. Los límites en pesos dependen de
la UMA vigente de cada año.

Este sitio no vende servicios: los servicios contables y sus precios están en
${DESPACHO.url} (precios públicos en ${DESPACHO.url}/honorarios).

## Páginas

${PAGINAS.map((p) => `- [${p.titulo}](${SITIO.url}${p.ruta}): ${p.que}`).join('\n')}

${blog.length ? `## Blog\n\nCada entrada tiene su versión en Markdown limpio (la misma URL con .md al final).\n\n${blog.map((e) => `- [${e.data.titulo}](${SITIO.url}${rutaEntrada(e)}) ([Markdown](${SITIO.url}${rutaEntrada(e)}.md)): ${e.data.descripcion}`).join('\n')}\n\n` : ''}## Recursos

- [Contenido completo en texto plano](${SITIO.url}/llms-full.txt)
- [El despacho: ${DESPACHO.nombre}](${DESPACHO.url})

## Perfiles verificados

${PERSONA.sameAs.map((u) => `- ${u}`).join('\n')}
`;
  return new Response(doc, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
