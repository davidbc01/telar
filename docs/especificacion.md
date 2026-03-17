# Especificación de Telar v0.1

> Este documento define qué es Telar, que problema resuelve, cómo se ve el código
> y cuál es la hoja de ruta. Es el documento fundacional del proyecto.

---

## 1. Qué es Telar

Telar es un lenguaje de programación declarativo para la web. Está diseñado para que un desarrollador pueda describir lo que quiere construir usando frases estructuradas en español, sin tener que preocuparse por cómo se implementa por debajo.

El compilador de Telar traduce esas instrucciones a HTML, CSS y JavaScript optimizados. El desarrollador nunca toca esos archivos directamente.

> **La idea en una frase:** Escribes lo que quieres. Telar construye cómo hacerlo.

### El problema que resuelve

El desarrollo web moderno tiene un problema de complejidad acumulada. Para construir una aplicación simple hoy, un desarrollador necesita aprender JavaScript y sus peculiaridades históricas, elegir entre decenas de frameworks, configurar bundlers, gestionar dependencias, pensar en optimización, manejar errores asíncronos, y escribir CSS responsivo.

Todo eso es trabajo que no tiene nada que ver con el problema que el desarrollador quería resolver. Telar elimina esa carga.

### Lo que Telar no es

- No es un framework de JavaScript
- No es un generador de código por IA
- No es un lenguaje de propósito general
- No es un lenguaje visual o de bloques

---

## 2. Filosofía de diseño

### Principio 1 - Declarativo siempre

El desarrollador describe qué quiere, nunca cómo conseguirlo.

```telar
✓  mostrar productos recientes
     máximo 8
     ordenados por precio
```

### Principio 2 - El silencio no existe

Telar nunca falla en silencio. Los errores son claros, en español, y sugieren cómo arreglarlos.

```telar
✗  Línea 12: "máximo muchos" — se esperaba un número
   ¿Quisiste decir "máximo 10"?
   Sugerencia: los números van sin comillas en Telar
```

### Principio 3 - Defaults con opinión

Optimización móvil, caché, acesibilidad ARIA y lazy loading activados por defecto. Sin configuración.

### Principio 4 - Legibilidad humana

El código de Telar debe poder ser leído por alguien sin experiencia técnica.
Es una restricción de diseño, no un objetivo estético.

---

## 3. Sintaxis

Telar usa un dialecto estructurado del español. No es español completamente libre - es un conjunto finito y aprendible de patrones de frase.

### Reglas fundamentales

- La indentación es significativa (2 espacios)
- Los nombres propios van en mayúscula inicial
- Las cademas de texto van entre comillas dobles
- Los números van sin comillas y sin unidades
- Los comentarios empiezan con `#`

### Estructura de un archivo Telar

```telar
# Declaración de aplicación
aplicación NombreApp
  idioma español

# Modelos de datos
datos Producto
  nombre: texto
  precio: número
  imagen: foto

# Páginas
página inicio en "/"
  título "Bienvenido"

  mostrar productos recientes
    máximo 8
    ordenados por precio

  si el usuario está conectado
    mostrar "Hola, (usuario.nombre)"
    botón "Mi cuenta" ir a cuenta
  si no
    botón "Entrar" ir a login

  caché 10 minutos
  optimizar para móvil
```

### Manejo de errores

```telar
mostrar productos recientes
  máximo 8
  si falla
    mostrar "No hay conexión. Intenta de nuevo."
    reintentar en 5 segundos
```

---

## 4. El compilador

El compilador toma un archivo `.telar` y produce un bundle listo para desplegar. No requiere configuración.

### Qué genera automáticamente

- HTML semántico con atributos ARIA
- CSS mínimo y responsivo
- JavaScript optimizado (<5kb base)
- Lazy loading automático
- Cache headers configurados

### Estrategia de compilación

La v0.1 complila a JavaScript estándar. Las versiones futuras explorarán WebAssembly para mayor rendimiento.

---

## 5. Hoja de ruta

| Versión | Estado | Objetivo |
| --------- | --------- | --------- |
| 0.1 | 🔄 En progreso | Parser y validador de sintaxis |
| 0.2 | ⬜ Pendiente | Compilador funcional |
| 0.3 | ⬜ Pendiente | Tooling (VS Code, CLI) |
| 1.0 | ⬜ Pendiente | Lanzamiento público |

---

## 6. Comparativa

| | React | Svelte | Elm | Telar |
| --- | --- | --- | --- | --- |
| Sintaxis | JSX + JS | HTML+JS | Haskell-like | Español natural |
| Curva aprendizaje | Alta | Media | Media | Ninguna |
| Config inicial | Alta | Media | Media | Ninguna |
| Errores claros | No | Parcial | Sí | Sí |
| Optimización auto | No | Parcial | Parcial | Sí |

---

*Especificación v0.1 - Marzo 2026*
