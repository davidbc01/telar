# Historial de cambios

Todos los cambios relevantes de Telar se documentan aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

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
