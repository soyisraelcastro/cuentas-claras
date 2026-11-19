# Cada live, una entrada del blog

Decidido el 2026-11-19: cada live de Cuentas Claras se publica también como entrada del blog (`cc.sicastro.com/blog/<entrada>`). Lleva:
- la clase en video;
- el texto completo, sacado del deck y del guion ya verificados;
- **un simulador propio**, con el que la persona mete sus números.

El diseño es el de la propuesta 2, "Simulador" (`design/blog/iva-7/2-simulador.html`). Ya está portado a piezas reutilizables en `sitio/src/components/simulador/`. Cómo se arma uno nuevo: `sitio/README.md`, sección "Blog".

## Por qué así

- **Buscadores.** El 96% del canal llega por búsqueda. Una entrada con texto, tabla, preguntas frecuentes y datos estructurados posiciona una duda en Google mejor que el video solo. Además, el video embebido le suma tiempo de visita al video.
- **LLMs.** ChatGPT, Claude y Perplexity citan texto. Cada entrada tiene su versión `.md`, va completa en `llms-full.txt` y el `robots.txt` ya deja pasar a sus crawlers.
- **Conversión.** El simulador contesta "¿y en mi caso?", que es justo la pregunta que lleva a la consulta 1:1.

## Las entradas

| # | Entrada (URL) | Live y video | Deck | Simulador | Estado |
|---|---|---|---|---|---|
| 1 | `/blog/iva-7-resico-2027` | Reforma 2027 para pymes (se graba; `video.youtubeId` vacío = "Próximamente") | `2026-11-23-reforma-2027-pymes-iva-7.json` | **IVA al 7%**: hoy contra el 7%, con la raya del 56% | Portada al diseño 2, en borrador |
| 2 | `/blog/meses-sin-intereses-cuanto-puedes-comprar` | "Antes del Buen Fin, calcula tu límite real y evita al SAT" (`d4d29T1oeYQ`, 51 min) | `2026-11-11-meses-sin-intereses.json` | **Saca tu número** (abajo) | Texto en borrador (2026-11-19); el simulador espera el OK de Israel |
| 3 | `/blog/deducciones-personales-cuanto-te-regresan` | El live no está completo en el canal: se usan sus cortes (Juan vs Laura `SagYQS2K-ns`, 5 deducciones `ph2i_DemWE8`, el tope `WgK6PrODjAg`, el mito del saldo a favor `icaYpQW83Mk`) | `2026-11-12-deducciones-cuanto-te-regresan.json` | **Cuánto te regresan** (abajo) | Por hacer |
| 4 | `/blog/si-solo-tengo-sueldo-tengo-que-declarar` | "¿Solo tienes sueldo? Cuándo declarar al SAT" (`Oz9LCT2EzhE`, 36 min); cortes `BLKgpNVP1BI` (5 casos) y `nAQf-kIlyMk` (por qué te sale a pagar) | `2026-11-05-si-solo-tengo-sueldo.json` y el carrusel `2026-10-31-me-toca-declarar.json` | **¿Me toca declarar?** (abajo) | Por hacer |
| 5 | `/blog/sueldo-y-algo-mas` | Sin video completo en el canal | `2026-11-13-sueldo-y-algo-mas.json` | Puede ir dentro de la 4 (intereses, Sofipo, herencia) | Decidir |

Títulos y URLs **sin año** (la regla de los videos: "depende de la UMA vigente"): la entrada dura hasta que la ley cambie. La excepción es la reforma 2027, que es noticia con fecha. Cada entrada se actualiza con `actualizado:` cuando cambien la UMA o las tarifas.

## Los simuladores

Todos usan las mismas piezas (aparato, chips de casos con "Tus números", campo de monto con slider, interruptores, resultado con veredicto, cifra y barras, barra pegada en el celular, riel "Tu cuenta" y copiar enlace). Cambian la lógica, que vive en `src/lib/<tema>.ts` como fuente única de cifras para el texto y el simulador, y los casos, que salen del deck.

### 2. Meses sin intereses: saca tu número

- **Casos:** Diana, del deck, con los montos ficticios del live: le depositan $40,000; gastos fijos $27,000; mensualidades que ya traía $2,000; compras del Buen Fin (pantalla $18,000 a 12, laptop $24,000 a 12, refri $14,400 a 18); lo de enero $8,000; aguinaldo neto unos $19,000. Más "Tus números".
- **Entradas:**
  - lo que te depositan al mes;
  - gastos fijos;
  - mensualidades que ya traías;
  - **una lista de compras a meses** (precio, plazo y, opcional, el precio de contado), con botón para agregar y quitar;
  - lo que cae en enero (predial, tenencia, reinscripción);
  - aguinaldo neto, opcional.
- **Salidas:**
  - "De cada $100 que te depositan, $X ya tienen dueño" (mensualidades entre depósito);
  - tu enero con todo: te sobra o te falta;
  - qué compra lo arregla (la de mayor mensualidad);
  - el aguinaldo contra 12 mensualidades ("tapa un enero, no doce");
  - lo que cuesta el plazo si das el precio de contado.
- **Veredicto:** "Cabe en tu enero", "Enero no cuadra" o "Cabe, pero con el aguinaldo".
- **Criterio:** "puedes comprar hasta donde tu enero siga en positivo, contado sin aguinaldo". El deck lo marca como criterio del live, no como regla de ley ni cifra oficial: se dice así.
- **Bloque fiscal en el texto** (es lo que más rindió en redes):
  - discrepancia fiscal (LISR 91);
  - depósitos en efectivo de más de $15,000 al mes (LISR 55);
  - la pantalla no se deduce y lo que sí (LISR 151, RLISR 264).
- **SEO:** "meses sin intereses cuánto puedo comprar", "cuánto de mi sueldo puedo endeudar", "cuesta de enero". Vale todo el año y repunta en Hot Sale y Buen Fin.

### 3. Deducciones personales: cuánto te regresan

- **Reusar** la cuenta de la calculadora de la portada (`src/scripts/calculadora.ts`). Se pasa a `src/lib/deducciones.ts` como fuente única, y la portada y la entrada la importan.
- **Casos:** Juan contra Laura, del deck (Laura con $360,000 al año, "te regresan cerca del 21%"). Más "Tus números".
- **Entradas:** ingreso anual por sueldo y gastos por tipo (médicos y dentales, lentes graduados, seguro de gastos médicos, colegiaturas, intereses reales de hipoteca, aportaciones voluntarias, funerarios, donativos).
- **Salidas:**
  - el tope global: el menor entre el 15% de tus ingresos y 5 UMA anuales. Colegiaturas y aportaciones llevan sus propios topes;
  - lo deducible de verdad;
  - el ISR con y sin deducciones, con la tarifa anual del art. 152 de la UMA vigente, sacada de leyes-mx (`obtener_tarifa`) y nunca de memoria;
  - **cuánto te regresan**;
  - "por cada peso que deduces te regresan X centavos".
- **Ojo:**
  - Topes y UMA se leen de leyes-mx y se escriben con el año en `src/lib/deducciones.ts`. Cada enero se actualiza la tabla.
  - La entrada se marca con `actualizado:`.
- **SEO:** "cuánto me regresan de deducciones personales", "tope de deducciones personales", "saldo a favor declaración anual".

### 4. ¿Me toca declarar si solo tengo sueldo?

- **No son sliders: es un árbol** de preguntas Sí/No con montos. Usa las mismas piezas: interruptores, campo de monto y resultado.
- **Preguntas:** las seis del carrusel y el deck, verificadas en leyes-mx (LISR art. 98, fr. III, y 150; la RMF que aplique):
  - ¿tus ingresos del año pasan de $400,000?
  - ¿tuviste dos o más patrones en el año?
  - ¿dejaste de trabajar antes del 31 de diciembre?
  - ¿tienes intereses reales de más de $20,000?
  - ¿tienes ingresos de otro tipo (renta, ventas, honorarios)?
  - ¿tu patrón te avisó que no te hizo el cálculo anual?
- **Veredicto:**
  - "Sí estás obligado";
  - "No estás obligado";
  - "No estás obligado, pero te conviene si tienes deducciones" (saldo a favor), que liga a la entrada 3.
- **SEO:** "solo tengo sueldo tengo que declarar", "estoy obligado a presentar declaración anual". Es la búsqueda más grande del año, de febrero a abril: **conviene publicarla antes de enero**.

## Proceso para un live nuevo (después de grabar)

Lo hace la skill **`blog-del-live`** (`.claude/skills/blog-del-live/SKILL.md`): Israel le pasa el slug del live (o la transcripción) y ella cruza transcripción y deck, decide si lleva simulador y deja el borrador verificado. En resumen:


1. **Archivo.** `src/content/blog/<entrada>.mdx`, con `borrador: true`, el `video.youtubeId` del live (o de sus cortes), `serie`, `vigencia` si hay ley con fecha, `fuentes` y `preguntas` (las del chat del live, reales, que van al JSON-LD FAQPage).
2. **Texto.** Sale del guion del deck (lo dicho y verificado), no de memoria, y se reescribe para leerse. Un h2 por parte del live.
3. **Casos y cuenta.** Van en `src/lib/<tema>.ts`, verificados contra el deck y leyes-mx. El simulador se arma con las piezas de `src/components/simulador/`.
4. **Revisión.** `pnpm check` y `pnpm dev`, y prueba de los casos contra el deck.
5. **Publicar.** `borrador: false` y merge a `main`, que despliega. Luego:
   - en YouTube, la liga a la entrada en la descripción y en el comentario fijado;
   - en Pregón, la regla del carrusel apuntando a la entrada con utm;
   - en Search Console, pedir la indexación de la URL nueva.
