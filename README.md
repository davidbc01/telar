# Telar 🧵

**Un lenguaje de programación declarativo para la web, escrito en español.**

```telar
aplicación MiTienda

  página inicio en "/"
    título "Bienvenido"

    mostrar productos recientes
      máximo 8
      ordenados por precio

    si el usuario está conectado
      botón "Mi cuenta" ir a cuenta
    si no
      botón "Entrar" ir a login

    optimizar para móvil
    caché 10 minutos
```

*Eso es todo. Sin webpack. Sin JSX. Sin configuración.*

---

## Instalación

```bash
npm install -g @davidbc01/telar
```

O clona el repositorio para desarrollar:

```bash
git clone https://github.com/davidbc01/telar
cd telar
npm install
npx ts-node src/cli.ts compilar examples/tienda/app.telar dist/
```

---

## Uso

```bash
# Verificar la sintaxis de un archivo
telar verificar app.telar

# Compilar a HTML + CSS
telar compilar app.telar

# Compilar a una carpeta específica
telar compilar app.telar -o dist/

# Compilar y servir en el navegador
telar servir app.telar
```

---

## El problema

El desarrollo web moderno tiene un problema de complejidad acumulada. Para construir una aplicación simple hoy, un desarrollador necesita:

- Aprender JavaScript y sus peculiaridades históricas
- Elegir entre decenas de frameworks
- Configurar bundlers y herramientas de build
- Gestionar dependencias
- Pensar en optimización de rendimiento
- Manejar errores asíncronos
- Escribir CSS responsivo

Todo eso es trabajo que no tiene nada que ver con el problema que el desarrollador quería resolver.

## La hipótesis de Telar

Un lenguaje donde describes la **intención**, y el compilador toma todas las decisiones técnicas.

Telar compila a HTML + CSS + JavaScript optimizados. El desarrollador nunca toca esos archivos. El lenguaje tiene opiniones fuertes y defaults inteligentes: responsive, accesible y optimizado por defecto.

## Filosofía

**Declarativo siempre** - Describes qué quieres, no cómo conseguirlo.

**El silencio no existe** - Telar nunca falla silenciosamente. Los errores son claros, en español, y sugieren cómo arreglarlos.

```
✗  Línea 12: "máximo muchos" - se esperaba un número
   ¿Quisiste decir "máximo 10"?
   Sugerencia: los números van sin comillas en Telar
```

**Defaults con opinión** - Optimización móvil, caché, accesibilidad ARIA y lazy loading activados por defecto. Sin configuración.

**Legibilidad humana** - El código de Telar puede ser leído por alguien sin experiencia técnica. No es un objetivo estético: es una restricción de diseño.

## Estado actual

🟢 **En desarrollo activo**

| Fase | Estado |
| ------ | ------ |
| Especificación del lenguaje | ✅ Completa (v0.1) |
| Lexer - tokenización | ✅ Completo |
| Parser - validador de sintaxis | ✅ Completo |
| Generación de HTML + CSS | ✅ Completo |
| CLI — compilar, servir, verificar | ✅ Completo |
| Generación de JavaScript | 🔄 En desarrollo |
| CLI instalable (npm) | 🟪 Pendiente |
| Extensión VS Code | 🟪 Pendiente |
| Lanzamiento público | 🟪 Pendiente |

## Hoja de ruta

### v0.1 - Prueba de concepto
- [x] Lexer que tokeniza archivos `.telar`
- [x] Parser que valida la sintaxis
- [x] Mensajes de error en español
- [x] Generación de HTML estático + CSS estático
- [x] CLI con comandos `compilar`, `servir` y `verificar`

### v0.2 - Compilador funcional
- [ ] Generación de JavaScript
- [ ] Generación de CSS responsivo
- [ ] Soporte para modelos de datos
- [ ] CLI básica: `telar compilar`, `telar servir`

### v1.0 - Lanzamiento público
- [ ] Estabilidad de sintaxis
- [ ] Gestor de paquetes Telar
- [ ] Documentación completa
- [ ] Comunidad

## ¿Por qué en español?

La mayoria de los lenguajes de programación usan palabras clave en inglés. Esto añade una barrera invisible para los más de 500 millones de hispanohablantes que aprenden a programar.

Telar no pretende reemplazar el inglés como lengua franca de la programación. Pretende demostrar que la sintaxis de un lenguaje puede ser un dialecto estructurado de cualquier idioma humano, y que eso reduce drásticamente la curva de aprendizaje.

## Cómo contribuir

El proyecto está en sus primeras fases. La contribución más valiosa ahora mismo es **probar la sintaxis**:

1. Lee la [especificación](./docs/especificacion.md)
2. Intenta escribir tu caso de uso real en Telar
3. Abre un issue con lo que se sintió forzado o incómodo

Toda la discusión de diseño del lenguaje ocurre en [Issues](../../issues).

## Licencia

Apache 2.0 - Ve [LICENSE](./LICENSE) para más detalles.

---

*Telar está en sus primeras fases. La sintaxis puede cambiar. Las ideas son bienvenidas.*
