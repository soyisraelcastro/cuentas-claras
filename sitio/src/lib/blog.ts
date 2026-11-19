/**
 * Lectura del blog (src/content.config.ts). Las páginas y llms.txt piden las entradas aquí para
 * que la regla de los borradores sea una sola.
 */
import { getCollection, type CollectionEntry } from 'astro:content';

export type EntradaBlog = CollectionEntry<'blog'>;

/**
 * Los borradores se ven en `pnpm dev` y en las previews de Vercel (rama distinta de main), para revisarlos
 * antes de publicar; esas URLs ya llevan noindex. En producción no se generan.
 */
const VER_BORRADORES = import.meta.env.DEV || process.env.VERCEL_ENV === 'preview';

/** Las entradas visibles, de la más nueva a la más vieja. En producción, sin borradores. */
export async function entradas(): Promise<EntradaBlog[]> {
  const lista = await getCollection('blog', ({ data }) => VER_BORRADORES || !data.borrador);
  return lista.sort((a, b) => b.data.fecha.valueOf() - a.data.fecha.valueOf());
}

export const rutaEntrada = (e: Pick<EntradaBlog, 'id'>) => `/blog/${e.id}`;

/** Las fechas del frontmatter son días sin hora (medianoche UTC): se formatean en UTC para no restar un día. */
export const fechaLarga = (d: Date) =>
  d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export const fechaIso = (d: Date) => d.toISOString().slice(0, 10);
