/**
 * Una entrada del blog en Markdown limpio, para LLMs y lectores sin navegador: /blog/<entrada>.md y
 * llms-full.txt. Sale del mismo .mdx que la página (entry.body): se quitan los import/export de MDX y
 * cada componente (la calculadora, etc.) se cambia por una nota con la liga a la página, porque su
 * contenido interactivo no existe en texto.
 */
import { fechaLarga, rutaEntrada, type EntradaBlog } from './blog';
import { PERSONA, SITIO } from './sitio';

const COMPONENTE = /^\s*<([A-Z][\w.]*)\b[^>]*\/>\s*$/;

export function cuerpoLimpio(e: EntradaBlog, url: string): string {
  return (e.body ?? '')
    .split('\n')
    .filter((l) => !/^\s*(import|export)\s/.test(l))
    .map((l) => (COMPONENTE.test(l) ? `> En la página hay un simulador interactivo para hacer esta cuenta con tus números: ${url}` : l))
    .join('\n')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    // Ligas relativas a absolutas: fuera de la página no hay de dónde resolverlas
    .replace(/\]\((\?[^)]+)\)/g, `](${url}$1)`)
    .replace(/\]\((\/[^)]*)\)/g, `](${SITIO.url}$1)`)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function aMarkdown(e: EntradaBlog): string {
  const d = e.data;
  const url = new URL(rutaEntrada(e), SITIO.url).toString();
  const datos = [
    `- Autor: ${d.autor}, ${PERSONA.titulo.toLowerCase()} (${SITIO.nombre})`,
    `- Publicada: ${fechaLarga(d.fecha)}${d.actualizado ? `; actualizada el ${fechaLarga(d.actualizado)}` : ''}`,
    d.vigencia ? `- Vigencia: ${d.vigencia}` : '',
    `- Página: ${url}`,
    d.video?.youtubeId ? `- Video: ${d.video.titulo}, https://www.youtube.com/watch?v=${d.video.youtubeId}` : '',
  ].filter(Boolean);
  const herramienta = d.herramienta ? `\n> La página abre con un simulador interactivo para hacer la cuenta con tus números: ${url}\n` : '';
  const fuentes = d.fuentes.length ? `\n\n## Fuentes\n\n${d.fuentes.map((f) => `- ${f.texto}${f.url ? ` (${f.url})` : ''}`).join('\n')}` : '';
  return `# ${d.titulo}

> ${d.descripcion}

${datos.join('\n')}
${herramienta}
${cuerpoLimpio(e, url)}${fuentes}

Esta entrada es informativa y no sustituye la revisión de tu caso. Las personas y empresas de los ejemplos son ficticias.
`;
}

/**
 * Las preguntas frecuentes salen del texto (una sola fuente) y alimentan el JSON-LD FAQPage. En la
 * sección "## Preguntas frecuentes" se acepta cualquiera de los dos formatos:
 *   ### ¿Pregunta?            (subtítulo y la respuesta en los párrafos de abajo)
 *   **¿Pregunta?** Respuesta. (todo en un renglón)
 */
export function preguntasDelCuerpo(body = ''): { pregunta: string; respuesta: string }[] {
  const seccion = body.split(/^## /m).find((s) => /^Preguntas frecuentes\s*$/.test(s.split('\n')[0] ?? ''));
  if (!seccion) return [];
  const limpio = (t: string) =>
    t.replace(/\*\*|__|`/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s*\n\s*/g, ' ').trim();
  const conTitulo = seccion.split(/^### /m).slice(1).map((b) => {
    const [pregunta, ...resto] = b.split('\n');
    return { pregunta: limpio(pregunta), respuesta: limpio(resto.join('\n')) };
  });
  const enLinea = [...seccion.matchAll(/^\*\*(¿[^*]+?\?)\*\*\s+(.+)$/gm)].map((m) => ({ pregunta: limpio(m[1]), respuesta: limpio(m[2]) }));
  return [...conTitulo, ...enLinea].filter((p) => p.pregunta.endsWith('?') && p.respuesta);
}
