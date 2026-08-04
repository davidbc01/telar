# Historial de cambios

Todos los cambios relevantes de Telar se documentan aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

---

## [0.24.1] - 2026-08-04

### Corregido
- **Bug real y serio, encontrado al ampliar telar.dev con una sección de novedades**: `telar servir` trataba cualquier ruta de más de un segmento (`/blog/mi-articulo`) como una carpeta anidada en disco (`blog/mi-articulo.html`), cuando el archivo real que genera Telar es plano y con guion (`blog-mi-articulo.html`, igual que hace `rutaANombre` al compilar). Esto hacía que el servidor de desarrollo **crasheara** al pedir cualquier artículo real de una colección, y llevaba roto para cualquier ruta estática de dos o más segmentos desde que `telar servir` existe — nunca se había probado con una
- 1 test de regresión nuevo (263 en total)

---

## [0.24.0] - 2026-08-04

### Contexto
Tercero y último de los huecos que salieron al comparar Telar con Astro. El más grande con diferencia — casi un subsistema nuevo, no una palabra clave más.

### Añadido
- `colección Articulos en "contenido/articulos"` — declara una colección respaldada por una carpeta de archivos `.md`
- Cabecera YAML simple (`título`, `fecha`, cualquier clave: valor de una línea) en cada archivo `.md`
- Conversor Markdown → HTML propio, sin dependencias externas: encabezados (`#`/`##`/`###`), párrafos, negrita, cursiva, código en línea, bloques de código, listas, citas, enlaces
- `listar Articulos` — lista generada en tiempo de compilación (con `ordenados por` y `máximo`, igual que `mostrar`), enlazando a la URL real de cada artículo
- `artículo Articulos` — genera **un HTML real y distinto por cada archivo `.md`**, con el contenido ya dentro. A diferencia de las rutas dinámicas normales (`/producto/(id)`, que resuelven todo en el navegador con JS porque los datos vienen de una API en tiempo de ejecución), aquí el contenido ya existe en disco al compilar — mejor para SEO, más rápido, sin depender de JS para ver el artículo
- Validación nueva: usar `artículo` en una página sin segmento dinámico en la ruta es un error de compilación claro (si no, todos los artículos generarían el mismo nombre de archivo y se pisarían entre sí)
- El `título`/`descripción` del frontmatter se usan automáticamente como `<title>`, `og:title`, `og:description`, etc. de cada artículo
- El `sitemap.xml` incluye la URL real de cada artículo automáticamente, no una plantilla
- `tests/colecciones.test.ts` — 17 tests nuevos, con archivos `.md` reales en disco (262 en total)

### Corregido
- Otro caso de colisión de palabra reservada, encontrado al probar con un ejemplo real: una página no podía llamarse "articulo" porque la palabra ya estaba reservada para la nueva sintaxis. Mismo problema que tuvimos con `imagen` como nombre de campo en v0.13 — el nombre de una página ahora acepta cualquier palabra en esa posición, igual que se arregló entonces para los campos de `datos`

---

## [0.23.0] - 2026-08-04

### Contexto
Segundo de los tres huecos que salieron al comparar Telar con Astro (el primero, control del `<head>`, ya cerrado en v0.22). Rediseño completo de cómo funcionan los componentes.

### Cambiado — breaking change
El "item" genérico e implícito desaparece. Ahora los parámetros se declaran con nombre:

```telar
# Antes (v0.8–v0.22)
componente TarjetaProducto
  mostrar item.nombre
página inicio en "/"
  TarjetaProducto con producto

# Ahora
componente TarjetaProducto con producto
  mostrar producto.nombre
página inicio en "/"
  TarjetaProducto con producto
```

Todo componente necesita ahora declarar al menos un parámetro con `con`. Varios parámetros se separan con `y`, tanto al declarar como al usar.

### Añadido
- Slots: contenido pasado desde fuera con `contenido` como marcador de dónde va dentro del componente, o insertado al final si no hay marcador — mismo criterio que ya usa `diseño` con el contenido de una página
- `si <parámetro>` — nueva condición que comprueba un parámetro booleano. En un componente usado como plantilla de lista (`mostrar ... con X`) se evalúa de verdad, generando un ternario JavaScript real (`${destacado ? '...' : ''}`) con datos reales por cada elemento. En el uso suelto (`X con producto`) se renderiza siempre — limitación documentada, ese camino sigue siendo sustitución de texto en compilación, sin datos reales detrás
- Validación nueva: usar un componente con un número de argumentos distinto al declarado es ahora un error de compilación claro, con el uso correcto en la sugerencia
- Validación nueva: un componente de varios parámetros no se puede usar como plantilla de lista (`mostrar ... con X` solo admite componentes de un único parámetro, porque un elemento de lista es un solo valor) — error de compilación claro en vez de comportamiento indefinido
- 19 tests nuevos, incluida una prueba de extremo a extremo con un DOM real y datos simulados confirmando el ternario `si <parámetro>` con dos elementos, uno cumpliendo la condición y otro no (245 en total)

### Corregido
- Bug encontrado durante la propia implementación: la función de plantilla generada para listas seguía usando `item` como nombre del parámetro de la función aunque el cuerpo ya usara el nombre real declarado (ej. `producto`) — el parámetro nunca coincidía con las referencias del cuerpo, lo que habría lanzado `ReferenceError` en el navegador. Corregido antes de publicar

---

## [0.22.0] - 2026-08-04

### Contexto
Al comparar Telar con frameworks como Astro para decidir qué falta antes de v1.0, salieron tres huecos reales: control del `<head>`, componentes más potentes, y contenido tipo Markdown. Esta versión cierra el primero — el más pequeño y sin riesgo de los tres.

### Añadido
- `favicon "url"` en `app.telar` — genera `<link rel="icon">` en todas las páginas. Antes no había ninguna forma de declarar un favicon
- `meta "nombre" "valor"` — genera un `<meta name="nombre" content="valor">` personalizado, repetible tantas veces como haga falta (color de tema, título de app iOS/Android, verificación de buscadores, etc.)
- 8 tests nuevos (226 en total)

---

## [0.21.1] - 2026-08-04

### Corregido
- Detectado al construir telar.dev (el proyecto real exigido por el propio roadmap para v1.0): `botón "X" ir a "https://..."` — la sintaxis documentada desde siempre para enlaces externos — **nunca había funcionado**. El parser solo aceptaba nombres de página internos tras `ir a`, nunca una URL entre comillas. Cualquier botón apuntando a una URL externa fallaba al compilar
- 2 tests de regresión

---

## [0.21.0] - 2026-08-04

### Auditoría pre-v1.0: prueba combinando todo lo construido esta sesión en un solo proyecto

Antes de comprometerse a v1.0, se compiló un proyecto que usa diseño + componente + lista real + ruta dinámica + variable + tema + SEO + formulario a la vez, y se revisó el HTML/JS generado línea por línea. Salieron 4 bugs reales que ningún test había pillado por separado:

### Corregido
- **`campo "X" área de texto`** generaba `<input type="área de texto">` en vez de un `<textarea>` real — `parsearTipoCampo` devolvía `"texto"` para ambos casos, así que el generador nunca distinguía uno de otro. Esto llevaba roto desde que existe la validación de formularios (v0.10)
- **`campo "X" texto`** generaba `type="texto"`, que no es un tipo válido de HTML5 (el navegador lo trata como texto plano, sin más — funcionalmente inocuo pero técnicamente incorrecto)
- **`campo "X" número`** generaba lo mismo que `texto`, sin usar nunca `type="number"` — la palabra clave existía pero no producía ningún comportamiento distinto en el HTML
- **Botones con texto sin letras/números** (`botón "+" ...`, `botón "−" ...`) generaban una clase CSS vacía y rota: `class="boton boton-"`. Mismo problema latente en `título` y `descripción` con texto similar — arreglado en los tres sitios con un helper común

### Añadido
- 11 tests de regresión nuevos cubriendo los 4 bugs (216 en total)
- Confirmado: `package.json` no incluye `paquetes/` en el paquete publicado (correcto, `telar añadir` los descarga de GitHub en vivo) y el CI usa Node 20, compatible con `fetch` nativo para los tests de `telar servir`

---

## [0.20.0] - 2026-08-04

### Cambiado — último ajuste de sintaxis antes de v1.0

`según` → `donde`, en el modificador de `mostrar`:

```telar
mostrar Producto según id = parametro.id     # antes
mostrar Producto donde id = parametro.id     # ahora
```

Motivo: "según" es una palabra de prosa ("according to"), y sonaba raro justo al lado del operador `=`. "donde" es el mismo patrón que `WHERE` en SQL — una palabra clave reconocible, no una preposición conversacional. Con este cambio, la mezcla de prosa + símbolos que quedaba en la sintaxis queda resuelta.

Ejemplos, tests (205) y documentación migrados y verificados compilando.

---

## [0.19.0] - 2026-08-04

### Añadido
- `telar servir app.telar -p <puerto>` — puerto configurable (antes fijo a 3000, sin alternativa)
- `tests/cli-servir.test.ts` — primera cobertura automática de `telar servir`: 7 tests de integración con peticiones HTTP reales contra el servidor real (rutas estáticas, rutas dinámicas combinadas con estáticas, 404, content-type de CSS/JS, inyección del script de live reload, y recompilación real al modificar un archivo `.telar`)
- `comandoServir` ahora exportado y devuelve un objeto con el servidor y un método `cerrar()`, para poder levantarlo y pararlo limpiamente desde tests sin depender de `SIGINT`
- 7 tests nuevos (205 en total)

---

## [0.18.0] - 2026-08-04

### Añadido
- Validación semántica de referencias: `diseño X` o `NombreComponente con Y` (o `mostrar ... con X`) donde `X`/`NombreComponente` no existe ahora es un **error de compilación**, con las opciones realmente declaradas en la sugerencia
- La validación recorre páginas, diseños, y bloques `si`/`si no`/`si falla`/`si funciona` anidados
- 8 tests nuevos dedicados a la validación (198 en total)

### Corregido
- Antes, un typo en un nombre de diseño o componente compilaba en silencio: el diseño simplemente no se aplicaba, o el componente generaba un comentario HTML (`<!-- componente desconocido: X -->`) que nadie mira nunca en la práctica. Ahora `telar verificar` y `telar compilar` lo detectan de inmediato
- 3 tests que probaban a propósito el comportamiento silencioso anterior, actualizados para reflejar el nuevo comportamiento (error en vez de compilación silenciosa)

---

## [0.17.0] - 2026-08-04

### Añadido
- `mostrar Modelo ... con NombreComponente` — conecta por fin los componentes con listas de datos reales. Antes, `componente` y `mostrar Modelo recientes` eran dos sistemas que nunca se hablaban entre sí: las listas mostraban todos los campos sin control de diseño, y los componentes solo servían sueltos, sin datos reales detrás
- Cada `item.propiedad` dentro de un componente usado así se convierte en una interpolación real (`${item.propiedad}`), rellenada en el navegador con el valor de cada elemento — no texto fijo
- 9 tests nuevos, incluida una prueba de extremo a extremo con un DOM real y datos simulados vía `fetch`, confirmando que se ven los valores reales (191 tests en total)

### Nota
Sin `con NombreComponente`, `mostrar Modelo recientes` se comporta exactamente igual que antes — este cambio es puramente aditivo.

---

## [0.16.0] - 2026-08-04

### ⚠️ Breaking change — sintaxis más limpia antes de v1.0

Rediseño deliberado de la gramática: cada palabra clave tiene que aportar significado. Se quitan las que eran puro pegamento gramatical.

| Antes | Ahora |
|---|---|
| `campo "X" tipo email` | `campo "X" email` |
| `mostrar Modelo filtrados por id = parametro.id` | `mostrar Modelo según id = parametro.id` |
| `botón "X" hacer sumar cuenta` | `botón "X" suma cuenta` |
| `botón "X" hacer restar cuenta` | `botón "X" resta cuenta` |
| `botón "X" hacer cambiar tema` | `botón "X" alterna tema` |
| `botón "X" hacer accionPersonalizada` | `botón "X" accionPersonalizada` |

`ir a`, `diseño`, `componente ... con`, `variable`, `texto`, `tema`, `dominio`, `imagen`, `mostrar ... máximo/ordenados por/recientes`, `si`/`si no`/`si falla`, `optimizar para móvil`, `caché`, `usar`, `incluir` y `código ... fin código` no cambian.

### Corregido
- Los 3 paquetes locales (`paquetes/formulario`, `paquetes/lista`, `paquetes/navbar`) migrados a la nueva sintaxis y verificados compilando de verdad, incluidos entre ellos e incluidos en una app real
- `paquetes/formulario`: quitado un bloque `si funciona` tras un botón — no es sintaxis real (`NodoBoton` nunca ha soportado eso), y el parser lo trataba como una condición desconocida, mostrando el mensaje de éxito siempre, incondicionalmente
- `paquetes/lista`: quitada una interpolación `"Total: (elementos.total) elementos"` — Telar no interpola variables dentro de strings; se mostraba el texto `(elementos.total)` literal, no un número real

### Nota
Las entradas anteriores de este changelog (v0.7–v0.15) se dejan tal cual — documentan la sintaxis real de cada versión en su momento, no la actual.

---

## [0.15.0] - 2026-08-03

### Añadido
- `tests/cli.test.ts` — primera cobertura automática de `telar nuevo`, `compilar` y `verificar` (antes, cero tests; solo verificación manual)
- El punto de entrada del CLI ahora está protegido con `require.main === module`, para poder importar sus funciones desde tests sin disparar el despacho de comandos con los argumentos del test runner
- `comandoCompilar`, `comandoVerificar` y `comandoNuevo` ahora son funciones exportadas
- Tests de combinaciones diseño + rutas dinámicas + componentes (múltiples diseños, diseño inexistente referenciado, diseño en páginas con ruta dinámica, componente dentro de un diseño)
- Tests de edge cases de `estilos` (Tailwind CDN, `.js` explícito, CSS externo normal, `estilos.css` local con prioridad)
- 22 tests nuevos (181 en total)

### Corregido
- El CDN de Tailwind (`estilos "https://cdn.tailwindcss.com"` — el ejemplo destacado del propio README desde v0.7) generaba `<link rel="stylesheet">` en vez de `<script src="...">`. Tailwind nunca llegó a cargarse con ese patrón documentado. Ahora se detecta correctamente y genera `<script>`

---

## [0.14.0] - 2026-08-03

### Añadido
- `docs/inicio-rapido.md` — guía de inicio rápido, de instalación a primera web interactiva en 5 minutos
- Enlaces a la guía desde el README (instalación y sección de contribuir)

### Corregido
- `examples/blog/app.telar` y `examples/tienda/app.telar` reescritos por completo. Los anteriores usaban sintaxis que nunca existió en el compilador (interpolación `"(variable.campo)"`, `filtrados por` con un valor que no era literal ni `parametro.X`) y no compilaban. Los nuevos están verificados compilando de verdad, línea por línea
- `telar nuevo` no respetaba rutas absolutas: `path.join` trataba una ruta como `/tmp/proyecto` como un segmento relativo más, creando el proyecto silenciosamente en el sitio equivocado (`<cwd>/tmp/proyecto`). Ahora usa `path.resolve`
- En ese mismo caso, el nombre de la aplicación generado incluía la ruta completa en vez de solo el nombre de la carpeta, produciendo un `app.telar` inválido. Ahora se deriva del `path.basename`
- `docs/especificacion.md` actualizado: quitada la cabecera "v0.5" y la tabla de roadmap duplicada y desincronizada del README — ahora apunta al README como única fuente de verdad para el estado del proyecto

---

## [0.13.0] - 2026-08-03

### Añadido
- `og:title`, `og:description`, `og:image`, `twitter:card` (y demás etiquetas Twitter) generados automáticamente en cada página a partir de título/descripción/imagen — sin configuración
- `dominio "https://..."` en `app.telar` — habilita `og:url` con URL absoluta, `sitemap.xml` y `robots.txt`
- `imagen "url"` — nuevo elemento de página: se renderiza como `<img>` visible y, si es la primera de la página, se usa también como imagen para compartir en redes
- Las rutas dinámicas (`/producto/(id)`) se excluyen automáticamente del sitemap
- 12 tests nuevos cubriendo SEO y metadatos (159 tests en total)

### Corregido
- Un modelo de datos con un campo llamado igual que una palabra reservada (ej. `imagen: foto`) desincronizaba el parseo de todos los campos siguientes. El parser ahora reconoce un campo de datos por llevar `:` detrás, no por el tipo exacto de token — más robusto también ante futuras palabras reservadas

---

## [0.12.0] - 2026-08-03

### Añadido
- `tema oscuro` / `tema claro` en `app.telar` — fija el tema para toda la web, sin importar el sistema operativo
- Sin declarar tema, se mantiene el comportamiento automático anterior (sigue el sistema operativo del visitante)
- `botón "X" hacer cambiar tema` — acción incorporada que alterna el tema en vivo en el navegador
- El tema elegido por el usuario se recuerda entre visitas con `localStorage`, sin llamar a ninguna API
- `Telar.iniciarTema()` y `Telar.alternarTema()` en el runtime JS generado
- CSS con los 3 modos resueltos: automático (`@media` + `:not([data-tema="claro"])`), y fijo (`html[data-tema="oscuro"]` / `html[data-tema="claro"]`)
- 10 tests nuevos cubriendo temas visuales (147 tests en total)
- Probado de extremo a extremo con un DOM real (jsdom): tema fijo inicial, alternado en vivo, y persistencia simulando una nueva visita

### Notas
- Colores de tema totalmente personalizados (más allá de oscuro/claro) quedan para una versión futura

---

## [0.11.0] - 2026-08-03

### Añadido
- Variables de página con estado local: `variable cuenta = 0`
- `texto cuenta` — muestra el valor y se actualiza sola cuando cambia
- Acciones incorporadas `hacer sumar <variable>` / `hacer restar <variable>` — modifican el estado directamente en el navegador, sin llamar a ninguna API
- `Telar.estado` y `Telar.actualizarVariable()` en el runtime JS generado
- 14 tests nuevos cubriendo variables y estado local (137 tests en total)
- Probado de extremo a extremo con un DOM real (jsdom): clics simulados confirmando que el contador se actualiza correctamente en pantalla

### Notas
- Las variables son locales a la página, no compartidas a nivel de aplicación — queda para una versión futura
- `hacer sumar`/`hacer restar` solo suman o restan 1; asignar valores arbitrarios queda para una versión futura

---

## [0.10.0] - 2026-08-03

### Añadido
- Validación de campos: `campo requerido`, `campo mínimo N [caracteres]`, `campo máximo N [caracteres]` — se pueden combinar en cualquier orden
- Atributos HTML5 nativos generados automáticamente (`required`, `minlength`, `maxlength`)
- Mensaje de error visible por campo, junto a cada campo inválido
- `Telar.validarCampos()` y `Telar.recogerCampos()` en el runtime JS generado
- 13 tests nuevos cubriendo validación de formularios (123 tests en total)

### Corregido
- Los botones `hacer` nunca enviaban los valores del formulario en el POST — la petición siempre iba vacía. Ahora se envían como JSON, validados antes de enviar
- `campo tipo contraseña` generaba `type="contraseña"`, que no es un tipo válido de HTML5; el navegador lo trataba como texto plano y las contraseñas nunca se ocultaban. Ahora genera `type="password"` correctamente

---

## [0.9.0] - 2026-08-02

### Añadido
- Rutas dinámicas: `página detalle en "/producto/(id)"` — segmentos entre paréntesis se extraen como parámetros
- `mostrar Modelo filtrados por campo = parametro.nombre` para acceder al parámetro de la ruta en tiempo de ejecución
- `telar servir` resuelve rutas dinámicas en tiempo real (deja de ser un servidor puramente estático): una sola página compilada atiende cualquier valor del parámetro
- `Telar.parametroActual(nombre)` y `Telar.rutas` en el runtime JS generado
- 10 tests nuevos cubriendo rutas dinámicas (111 tests en total)

### Corregido
- El modificador `filtrados por campo = "valor"` (existente desde antes) se parseaba correctamente pero nunca llegaba a generarse en el JS runtime — quedaba sin efecto. Ahora está conectado, junto con la nueva variante dinámica

---

## [0.8.0] - 2026-07-24

### Añadido
- Diseños reutilizables con `diseño <nombre>` — envuelven el contenido de las páginas
- Diseño aplicado automáticamente a todas las páginas si hay uno declarado en la aplicación, sin necesidad de referenciarlo
- Una página puede sobreescribir el diseño por defecto con `diseño <nombre>` explícito
- Componentes reutilizables con `componente <Nombre>` — sin paréntesis ni argumentos posicionales
- Uso de componentes con `NombreComponente con argumento`, accediendo a propiedades vía `item.propiedad`
- 10 tests nuevos cubriendo diseños y componentes (101 tests en total)

### Corregido
- 3 tests del generador desactualizados desde antes de v0.7 (comprobaban HTML/CSS de una versión anterior sin clases automáticas ni variables CSS renombradas)

---

## [0.7.0] - 2026-03-23

### Añadido
- Directiva `incluir ruta` para proyectos multi-archivo — cada página y modelo en su propio `.telar`
- Palabra clave `clase "..."` en títulos, descripciones, botones, campos y `mostrar` — compatible con CSS propio y Tailwind
- Directiva `estilos "url"` en `app.telar` para cargar CSS o Tailwind desde CDN
- `estilos.css` generado en la raíz del proyecto — editable libremente, Telar lo usa automáticamente
- `telar nuevo` genera estructura completa con carpetas `paginas/`, `modelos/`, `componentes/` y páginas de ejemplo navegables
- Live reload ahora vigila todos los archivos `.telar` y `.css` del proyecto, no solo `app.telar`
- CSS base completamente renovado: tipografía Inter, variables CSS, modo oscuro automático, botones con hover y sombra, spinner de carga animado, responsive con `clamp`
- Clases automáticas por nombre en el HTML generado (`boton-entrar`, `titulo-bienvenido`) para estilar desde CSS sin tocar el `.telar`

### Corregido
- `ir a inicio` ahora genera `href="/"` correctamente — el generador busca la ruta real en el AST en lugar de construirla del nombre
- `mostrar "texto literal"` ya no envuelve el contenido en llaves `{}`
- Navegación entre páginas funciona correctamente con nombres en camelCase (`ir a sobreNosotros` → `/sobre-nosotros`)

---

## [0.6.0] - 2026-03-20
- 94 tests automatizados - lexer (36), parser (25), generador (33)
- Cobertura completa de palabras clave, indentación, errores y generación HTML

---

## [0.5.2] - 2026-03-20

### Añadido
- Paquete oficial `telar-navbar` - barra de navegación reponsive
- Paquete oficial `telar-lista` - lista de elementos con paginación

---

## [0.5.1] - 2026-03-20

### Añadido
- Comando `telar nuevo <nombre>` - crea un proyecto completo desde cero
- Genera app.telar, README.md, .gitignore y telar.paquetes.json

---

## [0.5.0] - 2026-03-19

### Añadido
- Sintaxis `usar paquete` para incluir componentes reutilizables
- Bloque `código ... fin código` para JavaScript directo
- Parser refactorizado con tokens de indentación para bloques correctos

### Corregido
- Condicionales anidados ahora se generan correctamente
- Modificadores de `mostrar` respetan los niveles de indentación
- IDs de campos con tildes y ñ se normalizan correctamente

---

## [0.4.0] — 2026-03-19

### Añadido
- Gestor de paquetes - comandos `añadir`, `quitar`, `buscar` y `paquetes`
- Los paquetes son repositorios de GitHub con prefijo `telar-`
- Soporte para ramas `main` y `master`
- Registro local en `telar.paquetes.json`
- Primer paquete oficial: `telar-formulario`

---

## [0.3.1] — 2026-03-19

### Mejorado
- Mensajes de error con contexto visual — muestra las líneas del archivo
- Indicador de columna con ^^^^^
- Flecha → señalando la línea exacta del error

---

## [0.3.0] — 2026-03-18

### Añadido
- Live reload en `telar servir` — el navegador se recarga al guardar el archivo
- Extensión oficial para VS Code con resaltado de sintaxis
- WebSocket integrado sin dependencias externas
- Debounce para evitar recompilaciones dobles en Windows

---

## [0.2.1] — 2026-03-18

### Añadido
- Generador JavaScript completo
- Runtime Telar con manejo de sesión y condiciones dinámicas
- Cargadores de datos automáticos con manejo de errores
- Acciones de botones con feedback visual

---

## [0.2.0] — 2026-03-18

### Añadido
- CLI completa — comandos `compilar`, `servir` y `verificar`
- Servidor HTTP integrado en `telar servir`
- Flag `-o` para especificar carpeta de salida
- Flag `--version` y `--ayuda`

---

## [0.1.3] — 2026-03-18

### Añadido
- Generador HTML completo — produce HTML semántico, CSS responsivo
- Soporte para condiciones, formularios, botones y listas
- CSS base generado automáticamente con variables y responsive
- CLI acepta carpeta de salida: telar compilar app.telar dist/

---

## [0.1.2] — 2026-03-18

### Añadido
- Parser completo — construye AST desde tokens
- Soporte para páginas, modelos, condiciones, botones, campos
- Manejo de bloques "si falla" en mostrar y botones
- Validación de sintaxis con errores en español

---

## [0.1.1] — 2026-03-17

### Añadido
- Lexer completo — tokeniza archivos .telar
- Soporte para tildes, ñ y caracteres especiales del español
- Manejo de saltos de línea Windows y Unix
- Mensajes de error en español con sugerencias

---

## [0.1.0] — 2026-03-17

### Añadido
- Especificación fundacional del lenguaje (v0.1)
- Definición de sintaxis declarativa en español
- Filosofía de diseño: 4 principios core
- Hoja de ruta hasta v1.0
- Ejemplos de código: tienda y blog
- Licencia Apache 2.0
