# Historial de cambios

Todos los cambios relevantes de Telar se documentan aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

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
