# Historial de cambios

Todos los cambios relevantes de Telar se documentan aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

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
