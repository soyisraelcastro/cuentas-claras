/**
 * Colecciones de contenido (Content Layer de Astro 7). Por ahora una: el blog.
 *
 * Cada entrada es un .mdx (o .md) en src/content/blog/. La URL sale del nombre del archivo:
 * src/content/blog/iva-7-resico-2027.mdx → /blog/iva-7-resico-2027. Los archivos que empiezan con
 * "_" no se cargan (notas de trabajo). Con `borrador: true` la entrada solo se ve en `pnpm dev`.
 *
 * Docs: https://docs.astro.build/en/guides/content-collections/ (z se importa de astro/zod;
 * importarlo de astro:content está deprecado y se quita en Astro 8).
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/[^_]*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string().max(100),
      /** Meta description y resumen del índice: lo que sale en Google y al compartir. */
      descripcion: z.string().min(50).max(170),
      fecha: z.coerce.date(),
      actualizado: z.coerce.date().optional(),
      autor: z.string().default('Israel Castro'),
      /** Serie del canal a la que pertenece (docs/series.md), si aplica. Va en la pestaña. */
      serie: z.string().optional(),
      etiquetas: z.array(z.string()).default([]),
      /** Imagen del índice y de og:image (se recorta a 1200×630). Sin portada se usa /og.png. */
      portada: image().optional(),
      portadaAlt: z.string().optional(),
      /** La clase completa en YouTube. Sin `youtubeId` todavía, el bloque dice "Próximamente". */
      video: z
        .object({
          titulo: z.string(),
          youtubeId: z.string().regex(/^[\w-]{11}$/, 'El id de YouTube son 11 caracteres').optional(),
          /** Duración ISO 8601 para el JSON-LD (VideoObject), p. ej. PT51M. */
          duracion: z.string().regex(/^PT(\d+H)?(\d+M)?(\d+S)?$/).optional(),
          subido: z.coerce.date().optional(),
        })
        .optional(),
      /** Palabra que se comenta en Instagram para recibir esta entrada (regla del bot en Pregón). */
      palabraInstagram: z.string().optional(),
      /** Aviso de vigencia: qué ley y desde cuándo aplica. Se muestra arriba del texto. */
      vigencia: z.string().optional(),
      /**
       * El simulador que abre la entrada, justo bajo el encabezado (Israel se recarga en él). Cada uno
       * es un componente de src/components/blog/ hecho con las piezas de src/components/simulador/; se
       * registra en HERRAMIENTAS de src/layouts/Entrada.astro. Sin herramienta, encabezado normal con foto.
       */
      herramienta: z.enum(['iva7']).optional(),
      fuentes: z.array(z.object({ texto: z.string(), url: z.url().optional() })).default([]),
      /** true: solo en `pnpm dev`. En el build de producción no se genera ni entra al sitemap. */
      borrador: z.boolean().default(false),
    }),
});

export const collections = { blog };
