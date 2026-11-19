---
name: blog-del-live
description: Convierte un live de Cuentas Claras en una entrada del blog de cc.sicastro.com (Astro, MDX). Cruza la transcripción (lo que se dijo, incluido el chat) con el deck (lo que se vio en pantalla, ya verificado), escribe la entrada optimizada para buscadores y LLMs, decide si lleva simulador y, si sí, lo arma con las piezas del sitio. Úsala cuando Israel diga "pasa el live al blog", "haz la entrada del live", "convierte esta transcripción en post" o pase una transcripción o el slug de un live.
argument-hint: "<slug del live, p. ej. 2026-11-11-buen-fin> [--transcripcion ruta] [--deck ruta] [--youtube id]"
---

# blog-del-live

Cada live de Cuentas Claras también es una entrada del blog. El plan, el estado de cada entrada y los simuladores pensados están en `docs/blog-lives.md`. Cómo está armado el blog: `sitio/README.md`, sección "Blog".

**El resultado siempre es un borrador** (`borrador: true`). Israel lo revisa en `pnpm dev` o en la preview de Vercel de la rama, y él decide publicarlo.

## 1. Juntar el material

| Qué | Dónde | Para qué |
|---|---|---|
| **Transcripción** | `~/code/projects/studio-video/.media/<slug>/voz-cruda.lectura.md`, una oración por renglón con su minuto (la deja `live-ingesta`). Si Israel pasa otro archivo, ese | **Lo que se dijo:** el orden real, los ejemplos improvisados, las preguntas del chat y cómo lo explica Israel |
| **Ficha del live** | `~/code/projects/studio-video/edicion/<slug>/live.json` | Marca, fecha, `youtube` y `deck` (a veces vacíos: ver abajo) |
| **Deck** | `~/code/projects/social-studio/decks/cuentas-claras/<fecha>-<tema>.json`. Si la ficha no lo trae, se busca por fecha y tema | **Lo que se vio en pantalla:** `piezas` (títulos, cifras, ejemplos, tablas), `guion` (lo planeado) y `pendientes` (fuentes, supuestos y lo que quedó por confirmar) |
| **Video** | `youtubeId` del live publicado. Si la ficha no lo trae, se saca de lo publicado en el canal (Pregón lo tiene, con la duración) o se le pide a Israel. Si el live no está completo en el canal, el corte más representativo y los demás como ligas | `video` del frontmatter |
| **Rendimiento** (opcional) | `pnpm rendimiento --cuenta cuentasclaras_mx` en Pregón | Qué cortes del live jalaron más: esos temas van arriba y con más espacio |

## 2. Cruzar transcripción y deck (la regla de oro)

- **Las cifras y lo legal salen del deck**, que ya está verificado. Si en el live Israel dijo otra cifra por un tropiezo, manda el deck. Se anota en el reporte, no en la entrada.
- **Lo que solo está en la transcripción** (un ejemplo improvisado, una respuesta al chat, algo como el tianguis o "al cabo que me llega un ingreso extra"):
  - Es oro, porque es lo que conecta.
  - Si trae un dato o una afirmación legal, se verifica con las herramientas de **leyes-mx** (`obtener_articulo`, `obtener_tarifa`, `obtener_subsidio_empleo`) antes de escribirlo.
  - Si no se puede verificar, no entra, o entra marcado en el reporte para que Israel decida.
- **Lo que solo está en el deck** (una pantalla que se saltó en vivo): entra si suma; el deck es la versión completa.
- **Se escribe para leer, no se transcribe.** Fuera muletillas, saludos al chat y "ahorita lo vemos". Se queda la voz de Israel (tuteo, ejemplos con nombre, la frase que remata) y su orden de ideas.
- **Personas de los ejemplos:** ficticias, como en el live. Se dice una vez.

## 3. ¿Lleva simulador?

No todos los lives se prestan. **Lleva** si en el live se hace una cuenta que la persona puede repetir con sus números:
- casos con montos que cambian el resultado (IVA al 7%, meses sin intereses, cuánto te regresan tus deducciones);
- o un árbol de preguntas con veredicto ("¿me toca declarar?").

**No lleva** si es explicativo: un trámite paso a paso, una historia, qué cambió en la ley sin cuentas. Entonces la entrada va sin herramienta: sin `herramienta` en el frontmatter, el layout abre con el encabezado normal y la foto de Israel. **No se fuerza una calculadora.**

Si lleva:
1. **La lógica y los casos** en `sitio/src/lib/<tema>.ts`, fuente única de las cifras del texto y del simulador. Los casos salen del deck tal cual.
2. **El componente**, armado con las piezas de `sitio/src/components/simulador/` y siguiendo `sitio/README.md` ("Cómo se arma un simulador nuevo"). Sin CSS ni JS copiados.
3. **El registro** en el frontmatter (`herramienta`) para que abra la entrada, o importado dentro del MDX si va a media prosa.
4. **Lo que muestra sin JavaScript:** el caso inicial ya renderizado, para buscadores y LLMs.
5. **Las cautelas del deck van en el veredicto.** Por ejemplo: "espera las reglas del SAT", "es un criterio, no una regla de ley".

Si el simulador es grande o nuevo, primero se le propone a Israel en una tabla (entradas, salidas, veredicto, casos) y se construye con su OK.

## 4. Escribir la entrada

Archivo: `sitio/src/content/blog/<entrada>.mdx`. La URL es la duda como se teclea, **sin año** (p. ej. `si-solo-tengo-sueldo-tengo-que-declarar`). La excepción es una ley con fecha (`iva-7-resico-2027`).

**Frontmatter** (lo valida `src/content.config.ts`; copiar el de `iva-7-resico-2027.mdx`):
- `titulo`: lo que la gente busca, de 50 a 65 caracteres si se puede. Pregunta o promesa concreta.
- `descripcion`: de 120 a 160 caracteres. Contesta la duda en una frase: es lo que sale en Google y en el resumen de un LLM.
- `fecha`: el día del live.
- `serie`: la de `docs/series.md`, si aplica.
- `etiquetas`.
- `video`: `titulo` y `youtubeId`; `duracion` en ISO 8601 (p. ej. `PT51M`, de `duracion_s`).
- `vigencia`: si hay una ley con fecha o montos que dependen de la UMA del año.
- `fuentes`: los artículos citados, como en el deck.
- `palabraInstagram`: si el live tiene CTA de comentario.
- `herramienta`: si lleva simulador.
- `borrador: true`.

**Cuerpo** (Markdown puro: h2, h3, párrafos, listas, tablas, citas):
1. **Arranca contestando.** Un "En pocas líneas" de 3 a 5 puntos con la respuesta directa. Es lo que citan los buscadores y los LLMs.
2. **Un h2 por parte del live**, redactado como la duda que alguien teclea ("¿Cuánto de mi sueldo ya tiene dueño?"), no como "Parte 2".
3. **Los ejemplos del deck en tablas** (concepto | monto), con sus totales.
4. **Notas y cautelas en cita** (`>`). El fundamento va en un párrafo en cursiva (*LISR, artículo 151*).
5. **"## Preguntas frecuentes":** las preguntas reales del chat del live (están en la transcripción), en formato `### ¿Pregunta?` y la respuesta debajo. **De ahí sale solo el JSON-LD FAQPage**: no se duplican en el frontmatter.
6. **Ligas internas:** a otras entradas del blog que traten lo mismo y a la guía (`/#guia`) cuando aplique. El cierre a `/agendar`, el video, las fuentes y el aviso los pone el layout: no se escriben en el cuerpo.

**Reglas de copy** (las del `CLAUDE.md` del repo):
- español de México y tuteo;
- sin raya (—) y nunca « »;
- comillas curvas en el texto visible;
- contexto SAT y pesos;
- sin precios del despacho;
- sin año en lo que no lo necesita ("depende de la UMA vigente").

## 5. Verificar antes de entregar

```bash
cd sitio
pnpm check                  # valida el frontmatter y los tipos
pnpm build                  # el borrador NO debe aparecer en .vercel/output (producción)
pnpm exec astro dev --port 4398 --host 127.0.0.1
```

- La entrada en `http://127.0.0.1:4398/blog/<entrada>`, en escritorio y en el celular (390 de ancho): sin scroll horizontal y sin errores en la consola. Las capturas se miran, no se dan por buenas.
- Si hay simulador, sus casos dan **exactamente** las cifras del deck, y `?caso=<id>` funciona.
- `http://127.0.0.1:4398/blog/<entrada>.md` sale limpio, sin `import` ni etiquetas de componentes.
- `grep -n "—\|«" src/content/blog/<entrada>.mdx` no devuelve nada.

## 6. Reportar a Israel

Corto:
- la ruta del archivo y la URL en dev;
- si lleva simulador o no, y por qué;
- **lo que debe revisar él:** lo que salió solo de la transcripción, lo que quedó "a confirmar" en el deck y cualquier cifra que no coincidiera entre live y deck.

Al final, lo que falta para publicar:
1. `borrador: false`, merge a `main` (despliega solo).
2. En YouTube, la liga a la entrada en la descripción y en el comentario fijado del live.
3. En Pregón, si hay regla de Instagram del tema, que apunte a la entrada con utm.
4. En Google Search Console, "Inspeccionar URL" → "Solicitar indexación" de la entrada nueva.

Y actualizar `docs/blog-lives.md` con el estado.
