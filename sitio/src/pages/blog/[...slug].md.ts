/**
 * GET /blog/<entrada>.md: la entrada en Markdown limpio (convención de llms.txt: cada página con su
 * versión .md). Solo las publicadas en producción; la página la anuncia con <link rel="alternate">.
 */
import type { APIRoute, GetStaticPaths } from 'astro';

import { entradas, type EntradaBlog } from '../../lib/blog';
import { aMarkdown } from '../../lib/blog-markdown';

export const getStaticPaths = (async () =>
  (await entradas()).map((entrada) => ({ params: { slug: entrada.id }, props: { entrada } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(aMarkdown((props as { entrada: EntradaBlog }).entrada), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
