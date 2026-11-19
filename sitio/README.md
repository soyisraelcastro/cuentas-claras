# Sitio de Cuentas Claras (cc.sicastro.com)

Astro 7 estático con dos funciones en Vercel. Es el sitio de presentación del canal: capta
correos a cambio de "La guía" y precalifica la consulta 1:1. **No vende**: los servicios
y precios viven en sicastro.com (`/honorarios`), y aquí solo se enlazan con utm.

```sh
pnpm install
pnpm dev        # http://localhost:4321 (los formularios responden "simulado" sin .env)
pnpm check      # tipos
pnpm build      # .vercel/output
```

## Qué hay

| Ruta | Qué es |
|---|---|
| `/` | La portada ("libro mayor vivo", 2026-11-02): Israel y la guía, marquesina, calculadora de deducciones, tres cajones, las series, quién está detrás, la guía, cinco preguntas y colaboraciones |
| `/agendar` | Precalificación de la consulta 1:1 (seis pasos). Quien pasa recibe la página de citas de Google Calendar, que cobra con Stripe al reservar. Quien no, su salida: trámite, despacho, paquete o lo gratis |
| `/privacidad` | Aviso de privacidad |
| `/blog`, `/blog/<entrada>` | El blog (content collection `blog`, MDX). Ver "Blog" abajo |
| `/sistema` | El design system vivo (noindex, fuera del sitemap) |
| `/llms.txt`, `/llms-full.txt` | Para LLMs, con el patrón de soycontador-ai: salen de `src/lib`, no se escriben a mano |
| `/api/guia` | Alta en Sendy, lista "guia" (doble opt-in) |
| `/api/agendar` | Vuelve a correr la precalificación, avisa por SES y da de alta en la lista "diagnostico" |
| `/guia`, `/consulta` | Alias para decir en video (302) |

## Blog

Entradas en `src/content/blog/<entrada>.mdx`, con una colección de contenido de Astro 7: `src/content.config.ts`, con el cargador `glob` y `z` de `astro/zod`. La URL es el nombre del archivo, `/blog/<entrada>`.

- **Frontmatter**, validado por el schema:
  - `titulo`, `descripcion` (de 50 a 170 caracteres; es la meta description) y `fecha`;
  - opcionales: `actualizado`, `serie`, `etiquetas`, `portada` (imagen local, sale como og:image a 1200×630), `video` (`titulo`, `youtubeId`, `duracion` ISO 8601), `palabraInstagram` (la palabra del bot en Pregón), `vigencia` (aviso de qué ley y desde cuándo), `herramienta` (el simulador que abre la entrada, ver "Simuladores"), `fuentes` y `borrador`.
- **`borrador: true`:** la entrada solo existe en `pnpm dev` y en las previews de Vercel (cualquier rama que no sea `main`, con `VERCEL_ENV=preview`), con `noindex`. En el build de producción no se genera ni entra al sitemap ni a `llms.txt`. Mientras no haya entradas publicadas, `/blog` lleva `noindex`.
- **Componentes en el texto:** se importan arriba del MDX (`import CalculadoraIva7 from '../../components/blog/CalculadoraIva7.astro'`) y se usan como etiqueta. El script de un componente busca solo dentro de su contenedor, así que se puede usar dos veces en la misma página.
- **Video:** `src/components/blog/Video.astro` es una fachada. Al cargar la página solo baja la miniatura; el iframe de `youtube-nocookie` entra con el play. Así no se carga JavaScript de terceros al abrir. Sin `youtubeId`, el bloque dice "Próximamente".
- **Layout:** `src/layouts/Entrada.astro` es el diseño 2 de `design/blog/iva-7/` ("Simulador", elegido el 2026-11-19) y aplica a todas las entradas. **La herramienta es condicional:** con `herramienta` en el frontmatter, Israel se recarga en el simulador, que abre la entrada justo bajo el encabezado, y en escritorio el riel lleva "Tu cuenta" (sigue al simulador) arriba del índice; sin `herramienta`, el encabezado lleva la foto de Israel pensando parado sobre el filete, no hay aparato ni barra pegada en el teléfono, y el riel es solo el índice (si hay más de 3 secciones). Luego el video, el cierre a `/agendar`, las fuentes y el aviso. El JSON-LD es `BlogPosting` (más `VideoObject` si hay video) y las migas (`src/lib/schema.ts`). `og:type` es `article`.
- **La prosa del MDX** es Markdown puro (h2, h3, p, listas, tablas, blockquote) y el layout la viste con `.prosa > …` (solo hijos directos, para no meterse en los componentes): el blockquote es la nota cacao con la calcomanía del ¡Ojo!, un párrafo que es solo cursiva (`*Fundamento: …*`) sale chico, las columnas de en medio de una tabla no se parten (montos), y una liga `[Ana](?caso=ana)` carga ese caso en el simulador sin recargar la página.
- **Lectura:** `src/lib/blog.ts` (`entradas()`, la única regla de borradores; y las fechas, que se formatean en UTC para no restar un día).
- **IVA al 7%:** `herramienta: iva7`. Los casos, la cuenta y los textos del simulador están en `src/lib/iva7.ts` (fuente única); `src/components/blog/CalculadoraIva7.astro` es la composición de las piezas. Acepta `?caso=ana|jorge|luis|marta|sa` o `?cobra=&compras=&retencion=si&persona=moral` para compartir.

Nueva entrada: copiar el frontmatter de `iva-7-resico-2027.mdx` (quitar `herramienta` si el live no trae simulador), escribir en Markdown y correr `pnpm check` (valida el frontmatter) y `pnpm dev`.

### Simuladores (uno por live)

Cada live con números puede traer su simulador. Se arma con las piezas de `src/components/simulador/`, sin copiar CSS ni JS:

| Pieza | Qué es |
|---|---|
| `Aparato.astro` | La caja cacao con etiqueta y título. Slots: `casos`, `controles`, `resultado`, el de en medio, `pie` y `fija`. Trae `simulador.css` (una vez por página, todo con `.sim`; las columnas dependen del ancho del aparato, así que sirve igual a todo lo ancho que a media prosa) |
| `Chips.astro` | Casos de ejemplo con su calcomanía (`src/assets/stickers/`), más "Tus números" |
| `CampoMonto.astro` | La cifra grande, editable y con comas, y un slider de $0 a millones (escala logarítmica; con teclado avanza de 500, mil, 10 mil o 50 mil) |
| `Segmentado.astro` | Un interruptor de opciones (Sí/No, física/moral) con radios de verdad |
| `Notas.astro` | Notas chicas que cambian con lo que eliges |
| `Resultado.astro` | El remate en Shrikhand (el único de la pieza), la cifra grande y lo que significa al año |
| `Barras.astro` | Barras en la misma escala; un saldo negativo cuelga bajo la línea del cero |
| `Renglones.astro` | La cuenta en renglones cortos; el resultado de cada renglón no se parte |
| `Regla.astro` | Una regla de 0 a 100% con la raya donde cambia el veredicto y tu marca; `apagada` cuando no aplica |
| `Explicacion.astro` | El porqué del resultado |
| `BarraFija.astro` | El resultado en una línea, pegado abajo en el teléfono mientras el simulador está en pantalla |
| `CopiarEnlace.astro` | Copia el enlace que abre el simulador con el caso o tus números |

`src/scripts/simulador.ts` trae lo que se repite. Puras (también corren en el servidor): `pesos()` con el menos tipográfico (−$1,833.33), `porcentaje()`, `escalaDeMontos()`, `geometriaBarras()`. De página: `iniciarTodos`, `campoMonto`, `segmentado`, `chips`, `ponerTexto`, `ponerNota`, `mostrar`, `contar`, `pegar`, `pintarBarras`, `pintarRegla`, `leerUrl`/`escribirUrl` (solo el simulador con `data-enlace` toca la URL), `copiarEnlace`, `anunciar` (la región aria-live, cuando dejas de mover) y `emitirResultado`. El color del resultado sale de `data-tono` en la raíz (`bien` maíz, `mal` rosa, `neutro` crema): cada simulador decide qué veredicto es qué tono. Eventos: `simulador:resultado` ({ titulo, filas, veredicto, tono, resumen }, lo escucha el riel), `simulador:pedir` y `simulador:caso` (las ligas `?caso=` de la prosa).

Reglas: la cuenta y los textos van en `src/lib/<tema>.ts`, sin DOM, como fuente única. El componente la usa en su frontmatter (el HTML sale con el caso inicial calculado: buscadores y LLMs ven cifras reales sin JavaScript) y en su `<script>` para actualizar. No se ponen cifras en un JSON dentro del HTML.

**Ejemplo: Buen Fin y meses sin intereses** (el live con Diana):

1. `src/lib/buen-fin.ts`: los casos (id, nombre, icono, depósito, gastos fijos, mensualidades, compras a meses con precio y plazo, aguinaldo), `calcular()` y `presentar(estado)`, que devuelve los textos, el tono y las `filas` del riel.
2. `src/components/blog/SimuladorBuenFin.astro`, con las piezas:

   ```astro
   <Aparato tipo="buen-fin" kicker="Simulador · tus meses sin intereses" titulo="¿Te alcanza en enero?"
     etiqueta="Simulador: compras a meses" id={id} enlace={enlace} inicial={caso.id} tono={v.tono}>
     <Chips slot="casos" marcado={caso.id} casos={CASOS.map((c) => ({ id: c.id, nombre: c.nombre, detalle: c.detalle, icono: icono(c.icono) }))} />
     <Fragment slot="controles">
       <CampoMonto nombre="deposito" etiqueta="Lo que te depositan al mes" valor={v.estado.deposito} />
       <CampoMonto nombre="fijos" etiqueta="Tus gastos fijos" valor={v.estado.fijos} />
       <CampoMonto nombre="aguinaldo" etiqueta="Tu aguinaldo" valor={v.estado.aguinaldo} />
     </Fragment>
     <Fragment slot="resultado">
       <Resultado rotulo={v.rotulo} cifra={v.cifraTexto} que={v.que} anio={v.anio} />
       <Barras barras={[{ clave: 'libre', nombre: 'Te queda', valor: v.libre, texto: v.libreTexto, rol: 'referencia' },
                        { clave: 'meses', nombre: 'Mensualidades', valor: v.meses, texto: v.mesesTexto }]} />
     </Fragment>
     <Regla titulo="Tus mensualidades contra lo que te queda" … />
     <BarraFija slot="fija" que={v.fija.que} cifra={v.fija.cifra} />
   </Aparato>
   <script>
     import { iniciarTodos, campoMonto, chips, emitirResultado /* … */ } from '../../scripts/simulador';
     import { presentar /* … */ } from '../../lib/buen-fin';
     iniciarTodos('[data-simulador="buen-fin"]', (raiz, n) => { /* estado, campos, pintar(), emitirResultado(…) */ });
   </script>
   ```

   La lista de compras a meses (un renglón por compra, con precio y plazo) sería una pieza nueva en `simulador/`, con su función en `simulador.ts`, para que la use el que sigue.
3. En `src/content.config.ts`, `herramienta: z.enum(['iva7', 'buen-fin'])`; en `Entrada.astro`, `HERRAMIENTAS = { iva7: CalculadoraIva7, 'buen-fin': SimuladorBuenFin }`; en el MDX, `herramienta: buen-fin`.

Los que siguen salen igual: deducciones personales (`CampoMonto` por tipo de deducción y `Regla` con el tope del 15% o 5 UMA), y "¿solo tienes sueldo, tengo que declarar?" (un `Segmentado` por pregunta, `CampoMonto` para los montos y `Explicacion` con la respuesta). Si el live no se presta a calculadora, la entrada va sin `herramienta`. Si una entrada quiere una calculadora a media prosa, se importa en el MDX como cualquier componente (con `enlace` si debe leer la URL).

## Fuentes únicas

- `src/lib/sitio.ts`: nombre, URL, persona, despacho, canal, WhatsApp, `RESERVA_URL` (la página
  de citas) y `conUtm()`. Toda liga que sale lleva `utm_source=cuentas-claras&utm_medium=<landing|agendar|guia>&utm_campaign=cuentas-claras&utm_content=<lugar>`.
- `src/lib/guia.ts`: los meses y las cinco preguntas (también alimentan el JSON-LD FAQPage y
  `llms-full.txt`). El texto largo de la guía está en `../docs/guia-hoja-del-anio.md`.
- `src/lib/agendar.ts`: catálogos y la regla de la precalificación (`salida()`), compartida
  entre navegador y servidor.
- `src/styles/tokens.css`: el design system. Ver `DESIGN-SYSTEM.md`.

## Rendimiento (Lighthouse 100)

Medido el 2026-10-26 contra el deploy de Vercel (celular simulado): `/` y `/agendar` **100 en las
cuatro** (LCP 1.6 s y 1.3 s). En local con un servidor sin CDN la portada daba 99.

Lo que lo sostiene, no romperlo:
- **Cero JavaScript de terceros en el render** y cero librerías de animación: el movimiento es CSS
  más `src/scripts/movimiento.ts` (unos 1.4 KB). GA4 y el pixel se piden hasta después del `load`
  (ver "Medición").
- **Fuente propia recortada**: `src/assets/fuentes/bricolage-cc.woff2` (81 KB contra 131 KB del
  paquete), generada con `herramientas/fuente.sh`. Si el sitio usa un carácter nuevo fuera del
  español básico, se agrega ahí y se vuelve a correr.
- **Foto del hero en AVIF** con `<Picture>`, `fetchpriority="high"`.
- CSS incrustado (`inlineStylesheets: 'always'`).

## Medición (GA4 y pixel de Meta)

Lista, pero apagada: **los dos IDs van en `src/lib/sitio.ts`, constante `MEDICION`**
(`MEDICION.ga = 'G-XXXXXXXXXX'` y `MEDICION.metaPixel = '<ID del conjunto de datos>'`). Es el
único lugar; no son variables de entorno (un ID de medición viaja en el HTML, no es secreto). En
`null` no se carga ni se emite nada. Aun con IDs, solo cargan en el despliegue de producción
(`VERCEL_ENV === 'production'`): nunca en local ni en los previews. Patrón copiado de
soycontador-ai (`Analytics.astro`, `lib/medir.ts`, `lib/origen.ts`).

- `src/components/Analytics.astro` (montado en `Base.astro`): stubs de `gtag`/`fbq` en línea, las
  dos librerías hasta después del `load` en un momento ocioso, el origen de la visita y un escucha
  de clics delegado para las ligas salientes.
- `src/lib/medir.ts`: `medir()` (GA4) y `medirMeta()` (pixel, con `eventID` para deduplicar contra
  una futura API de conversiones). Las dos son inofensivas si el tag no está.
- `src/lib/origen.ts`: guarda en `sessionStorage` la primera página relevante de la sesión, el
  dominio de origen y los `utm_*`. `/sistema`, `/listo`, `/404` y `/api/*` no cuentan como
  aterrizaje.
- **Nunca un dato personal** (nombre, correo, WhatsApp, RFC, el texto del caso, las respuestas de
  la precalificación): solo categorías. Coincidencia avanzada automática del pixel **apagada** en
  el panel de Meta.

| Evento | Herramienta | Cuándo | Parámetros |
|---|---|---|---|
| `page_view` / `PageView` | GA4 / Meta | Cada página | (los de siempre; el PageView con `eventID`) |
| `scroll_profundidad` | GA4 | Primera vez que se pasa el 25, 50, 75 y 100 % de la página | `porcentaje`, `pagina` |
| `seccion_vista` | GA4 | Un bloque con id (celda `.cel`, `.cajones` o `section`, sin los paneles de resultado) llega a la franja central de la pantalla | `seccion`, `pagina` |
| `permanencia` | GA4 | A los 15, 30, 60, 120 y 300 s con la pestaña a la vista | `segundos`, `pagina` |
| `pregunta_abierta` | GA4 | Alguien abre una pregunta de la portada (no cuenta la que viene abierta) | `pregunta`, `pagina` |
| `calculadora_usada` | GA4 | Al soltar el control o cambiar la tasa; hasta 6 por visita | `uso`, `deduccion`, `tasa`, `regresa` |
| `formulario_inicio` | GA4 | Primer foco en el formulario de la guía o de la agenda | `formulario` (`guia`/`agendar`), `pagina` |
| `formulario_error` | GA4 | Falla de validación o de servidor | `formulario`, `campo` (nombre del campo o `servidor`) |
| `formulario_abandonado` | GA4 | Se oculta la página con el formulario empezado y sin terminar | `formulario`, `ultimo_campo`, `pagina` |
| `guia_enviada` / `Lead` | GA4 / Meta | Alta exitosa a la guía (no si ya estaba en la lista) | `con_whatsapp` + origen / `content_name: guia` |
| `guia_repetida` | GA4 | Se registró alguien que ya estaba en la lista | `pagina` |
| `guia_confirmada` | GA4 | Llegada a `/listo` (Sendy regresa ahí al confirmar el correo) | origen |
| `agendar_paso` | GA4 | Cada paso de `/agendar` mostrado, una vez por visita | `paso` (1 a 6), `de` |
| `agendar_atras` | GA4 | Clic en "Atrás" | `desde_paso` |
| `agendar_resultado` | GA4 | Sale la salida o pasa la precalificación | `resultado` (`pasa`/`salida`), `salida` (`tramite`, `empresa`, `paquete-anual`, `paquete-mes`, `no-obligado`, `sin-ingresos`), `r_tema`, `r_situacion`, `r_ingreso`, `r_busca`, `r_cuando` + origen |
| `agenda_abierta` / `Schedule` | GA4 / Meta | Clic a la agenda de Google Calendar | origen, `seccion`, `texto` / `content_name: consulta` |
| `clic_interno` | GA4 | Clic a otra página o ancla del sitio | `destino` (ruta + ancla), `seccion`, `texto`, `pagina` |
| `clic_saliente` / `Contact` | GA4 / Meta (solo WhatsApp) | Clic a sicastro.com, YouTube, WhatsApp, soycontador.ai, todoconta.com, Instagram, Facebook, correo, teléfono u otro dominio | `destino` (u `otro` con `dominio`), `lugar` (el `utm_content` de la liga), `seccion`, `texto`, `pagina` (WhatsApp lleva además el origen) / `content_name: whatsapp` |
| `descarga` | GA4 | Clic a un PDF, ZIP, Excel o Word del sitio | `archivo`, `seccion`, `texto`, `pagina` |
| `pagina_no_encontrada` | GA4 | Se carga el 404 | `ruta`, `desde` (la página nuestra que tenía la liga rota, o el dominio externo) |
| `error_js` | GA4 | Error de JavaScript en el navegador (hasta 3 por página) | `mensaje`, `archivo`, `linea`, `pagina` |

**Qué datos son:** nombres de campo, rutas, categorías de listas cerradas y cifras del ejemplo de
la calculadora. `r_*` (las opciones marcadas en la precalificación) van solo a GA4, nunca al
pixel, y se declaran en `/privacidad`. Nunca texto libre ni datos de contacto.

**Para ver en GA4:** Administrar, Definiciones personalizadas, y registrar como dimensiones de
evento `seccion`, `porcentaje`, `formulario`, `campo`, `ultimo_campo`, `destino`, `dominio`,
`lugar`, `texto`, `pregunta`, `r_tema`, `r_situacion`, `r_ingreso`, `r_busca`, `r_cuando`, y como
métricas `deduccion`, `regresa`. Marcar como evento clave: `guia_enviada`, `agendar_resultado`,
`agenda_abierta` y el `clic_saliente` a WhatsApp.

"Origen" son `origen_fuente` (utm_source, o el dominio de origen, o `directo`), `origen_medio`,
`origen_campana`, `origen_contenido`, `origen_referente`, `aterrizaje` y `pagina`. Para verlos como
columnas en GA4 hay que registrarlos como **dimensiones personalizadas de evento** (Administrar,
Definiciones personalizadas), igual que `destino`, `paso`, `resultado` y `salida`. Las historias
destacadas de Instagram enlazan con
`?utm_source=instagram&utm_medium=social&utm_campaign=destacado-<nombre>&utm_content=<id-de-la-story>`:
en los informes se ven por `origen_campana` y `origen_contenido` (y en la sesión, por la campaña
manual de GA4).

En Meta, Schedule y Contact detienen el clic 300 ms antes de navegar para que salga la petición
del pixel (las ligas abren en la misma pestaña).

**Cómo probar.** En producción: GA4, Administrar, DebugView con la extensión Google Analytics
Debugger; Meta, Administrador de eventos, Probar eventos, con la URL de `cc.sicastro.com`. Sin
tocar producción: `VERCEL_ENV=production pnpm build` con los IDs puestos y servir
`.vercel/output/static` en `localhost` (ahí GA4 va con `debug_mode` y aparece en DebugView). Los
previews de Vercel no cargan nada a propósito. Al activarla, volver a medir Lighthouse contra
producción.

## Antes de publicar

1. ~~Repo y proyecto~~: hecho el 2026-10-26. Repo `soycontadorAI/cuentas-claras` (privado), proyecto
   de Vercel `cuentas-claras` (*Root Directory* `sitio`, cada push a `main` despliega). Público en
   https://cuentas-claras-tau-three.vercel.app; la protección de Vercel queda solo en previews.
2. ~~Dominio~~: hecho el 2026-10-26. CNAME `cc` → `c871661ddde04ea7.vercel-dns-017.com` en
   Cloudflare, **nube gris**. El certificado no salió solo: se emitió con
   `vercel certs issue cc.sicastro.com --scope iscasurs-projects` (Let's Encrypt, se renueva solo).
3. **Variables** (ver `.env.example`): Sendy (API key, `SENDY_GUIA_LIST_ID`,
   `SENDY_DIAGNOSTICO_LIST_ID`) y SES (llave del usuario acotado del despacho, no una nueva: ver el
   inventario de IAM antes).
4. **Sendy**: brand "Cuentas Claras" (id 6) y su lista "La guía" (id 46, doble opt-in,
   conectada y probada el 2026-10-26; ver `../docs/sendy-guia.md`). Falta el autoresponder con el
   PDF y, en el brand del despacho, la lista de prospectos "diagnostico" (campos `Whatsapp`,
   `Regimen`, `Interes`, `RangoInterno`, `Origen`).
5. **Calendario con cobro**: seguir `../docs/agendar-calendario.md` y poner el enlace nuevo en
   `RESERVA_URL`.
6. **Aviso de privacidad**: confirmar domicilio y correo para derechos ARCO.
7. Search Console del subdominio y enviar `sitemap-index.xml`.
