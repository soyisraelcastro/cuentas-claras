/** GET /blog/rss.xml: el feed del blog (lectores de RSS, agregadores y buscadores que lo usan para descubrir). */
import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';

import { entradas, rutaEntrada } from '../../lib/blog';
import { SITIO } from '../../lib/sitio';

export const GET: APIRoute = async (context) =>
  rss({
    title: `Blog de ${SITIO.nombre}`,
    description: 'Las clases de Cuentas Claras por escrito: el SAT, tu declaración y tus números, con ejemplos que puedes ajustar a tu caso.',
    site: context.site ?? SITIO.url,
    items: (await entradas()).map((e) => ({
      title: e.data.titulo,
      description: e.data.descripcion,
      pubDate: e.data.fecha,
      link: rutaEntrada(e),
      categories: e.data.etiquetas,
    })),
    customData: `<language>${SITIO.lang}</language>`,
  });
