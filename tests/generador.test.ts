// ─────────────────────────────────────────────────────────────
// generador.test.ts
// Tests del generador HTML de Telar.
// Ejecutar con: npm test
// ─────────────────────────────────────────────────────────────

import { describe, it, expect } from "vitest"
import * as fs from "fs"
import * as path from "path"
import * as os from "os"
import { Lexer } from "../src/lexer"
import { Parser } from "../src/parser"
import { Generador } from "../src/generador"

function compilar(codigo: string) {
    const tokens = new Lexer(codigo).tokenizar()
    const arbol = new Parser(tokens).parsear()
    return new Generador(arbol).generar()
}

function html(codigo: string, pagina = 0): string {
    const archivos = compilar(codigo)
    return archivos[pagina].contenido
}

describe("Generador — estructura HTML", () => {

    it("genera DOCTYPE y html lang=es", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`)
        expect(resultado).toContain('<!DOCTYPE html>')
        expect(resultado).toContain('lang="es"')
    })

    it("genera meta charset UTF-8", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`)
        expect(resultado).toContain('charset="UTF-8"')
    })

    it("genera meta viewport", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`)
        expect(resultado).toContain('name="viewport"')
    })

    it("genera link a telar.css", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`)
        expect(resultado).toContain('href="telar.css"')
    })

    it("genera script telar.js", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`)
        expect(resultado).toContain('src="telar.js"')
    })

    it("genera main con role main", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`)
        expect(resultado).toContain('role="main"')
    })

})

describe("Generador — título y descripción", () => {

    it("genera h1 con el título", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  título "Bienvenido"`)
        expect(resultado).toContain('titulo-bienvenido')
        expect(resultado).toContain('>Bienvenido</h1>')
    })

    it("usa el título en la etiqueta title", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  título "Mi Tienda"`)
        expect(resultado).toContain('<title>Mi Tienda</title>')
    })

    it("genera meta description", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  descripción "Mi app genial"`)
        expect(resultado).toContain('content="Mi app genial"')
    })

    it("escapa caracteres especiales en el título", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  título "Hola & Adiós"`)
        expect(resultado).toContain('Hola &amp; Adiós')
    })

})

describe("Generador — nombres de archivos", () => {

    it("genera index.html para ruta /", () => {
        const archivos = compilar(`aplicación MiApp\n\npágina inicio en "/"\n  título "Inicio"`)
        expect(archivos[0].nombre).toBe("index.html")
    })

    it("genera nombre correcto para rutas", () => {
        const archivos = compilar(`aplicación MiApp\n\npágina login en "/entrar"\n  título "Login"`)
        expect(archivos[0].nombre).toBe("entrar.html")
    })

    it("genera telar.css", () => {
        const archivos = compilar(`aplicación MiApp\n\npágina inicio en "/"\n  título "Inicio"`)
        const css = archivos.find(a => a.nombre === "telar.css")
        expect(css).toBeDefined()
    })

    it("genera telar.js", () => {
        const archivos = compilar(`aplicación MiApp\n\npágina inicio en "/"\n  título "Inicio"`)
        const js = archivos.find(a => a.nombre === "telar.js")
        expect(js).toBeDefined()
    })

})

describe("Generador — botones", () => {

    it("genera enlace para botón ir a", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  botón "Entrar" ir a login`)
        expect(resultado).toContain('<a href="/login"')
        expect(resultado).toContain('Entrar')
    })

    it("genera button para botón hacer", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  botón "Enviar" hacer enviar`)
        expect(resultado).toContain('<button')
        expect(resultado).toContain('data-accion="enviar"')
        expect(resultado).toContain('Enviar')
    })

    it("botón tiene clase boton", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  botón "Entrar" ir a login`)
        expect(resultado).toContain('boton boton-entrar')
    })

})

describe("Generador — campos de formulario", () => {

    it("genera input tipo email", () => {
        const resultado = html(`aplicación MiApp\n\npágina login en "/"\n  campo "Correo" tipo email`)
        expect(resultado).toContain('type="email"')
        expect(resultado).toContain('autocomplete="email"')
    })

    it("genera label asociado al input", () => {
        const resultado = html(`aplicación MiApp\n\npágina login en "/"\n  campo "Correo" tipo email`)
        expect(resultado).toContain('<label')
        expect(resultado).toContain('Correo')
    })

    it("normaliza tildes en el id del campo", () => {
        const resultado = html(`aplicación MiApp\n\npágina login en "/"\n  campo "Correo electrónico" tipo email`)
        expect(resultado).toContain('id="correo-electronico"')
    })

    it("normaliza ñ en el id del campo", () => {
        const resultado = html(`aplicación MiApp\n\npágina login en "/"\n  campo "Contraseña" tipo contraseña`)
        expect(resultado).toContain('id="contrasena"')
    })

})

describe("Generador — mostrar datos", () => {

    it("genera section con data-modelo", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  mostrar Producto`)
        expect(resultado).toContain('data-modelo="Producto"')
    })

    it("genera data-maximo", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  mostrar Producto\n    máximo 8`)
        expect(resultado).toContain('data-maximo="8"')
    })

    it("genera data-ordenar", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  mostrar Producto\n    ordenados por precio`)
        expect(resultado).toContain('data-ordenar="precio"')
    })

    it("genera div de error oculto cuando hay si falla", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  mostrar Producto\n    si falla\n      mostrar "Error"`)
        expect(resultado).toContain('class="error"')
        expect(resultado).toContain('hidden')
    })

})

describe("Generador — condicionales", () => {

    it("genera div data-si para condición", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  si el usuario está conectado\n    botón "Cuenta" ir a cuenta`)
        expect(resultado).toContain('data-si="usuario-conectado"')
    })

    it("genera div data-si-no para rama else", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  si el usuario está conectado\n    botón "Cuenta" ir a cuenta\n  si no\n    botón "Entrar" ir a login`)
        expect(resultado).toContain('data-si-no="usuario-conectado"')
    })

})

describe("Generador — optimización", () => {

    it("genera meta cache-control cuando hay caché", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  caché 10 minutos`)
        expect(resultado).toContain('Cache-Control')
    })

    it("genera meta mobile cuando hay optimizar para móvil", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  optimizar para móvil`)
        expect(resultado).toContain('mobile-web-app-capable')
    })

})

describe("Generador — paquetes y código", () => {

    it("genera div data-paquete para usar", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  usar navbar`)
        expect(resultado).toContain('data-paquete="navbar"')
    })

    it("genera script para bloque código", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  código\n    console.log('hola')\n  fin código`)
        expect(resultado).toContain('<script>')
        expect(resultado).toContain("console.log('hola')")
    })

})

describe("Generador — CSS base", () => {

    it("el CSS contiene variables CSS", () => {
        const archivos = compilar(`aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`)
        const css = archivos.find(a => a.nombre === "telar.css")!
        expect(css.contenido).toContain('--primario')
    })

    it("el CSS contiene estilos responsivos", () => {
        const archivos = compilar(`aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`)
        const css = archivos.find(a => a.nombre === "telar.css")!
        expect(css.contenido).toContain('@media')
    })

})

describe("Generador — diseños (v0.8)", () => {

    it("aplica el diseño por defecto a una página que no lo declara", () => {
        const resultado = html(
            `aplicación MiApp\n\ndiseño principal\n  título "Navbar"\n\npágina inicio en "/"\n  título "Inicio"`
        )
        expect(resultado).toContain('titulo-navbar')
        expect(resultado).toContain('titulo-inicio')
    })

    it("el contenido de la página se inyecta después del diseño", () => {
        const resultado = html(
            `aplicación MiApp\n\ndiseño principal\n  título "Navbar"\n\npágina inicio en "/"\n  título "Inicio"`
        )
        const posNavbar = resultado.indexOf('titulo-navbar')
        const posInicio = resultado.indexOf('titulo-inicio')
        expect(posNavbar).toBeGreaterThan(-1)
        expect(posInicio).toBeGreaterThan(posNavbar)
    })

    it("una página puede declarar explícitamente su diseño", () => {
        const resultado = html(
            `aplicación MiApp\n\ndiseño principal\n  título "Navbar"\n\npágina contacto en "/contacto"\n  diseño principal\n  título "Contacto"`
        )
        expect(resultado).toContain('titulo-navbar')
        expect(resultado).toContain('titulo-contacto')
    })

    it("sin diseños declarados, la página se genera igual que antes", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`)
        expect(resultado).toContain('titulo-hola')
    })

})

describe("Generador — componentes (v0.8)", () => {

    it("expande el uso de un componente dentro de una página", () => {
        const resultado = html(
            `aplicación MiApp\n\ncomponente TarjetaProducto\n  mostrar item.nombre\n\npágina inicio en "/"\n  TarjetaProducto con producto`
        )
        expect(resultado).toContain('componente-tarjetaproducto')
    })

    it("sustituye item.propiedad por el argumento pasado", () => {
        const resultado = html(
            `aplicación MiApp\n\ncomponente TarjetaProducto\n  mostrar item.nombre\n\npágina inicio en "/"\n  TarjetaProducto con producto`
        )
        expect(resultado).toContain('producto.nombre')
        expect(resultado).not.toContain('item.nombre')
    })

    it("un componente desconocido no rompe la compilación", () => {
        const resultado = html(
            `aplicación MiApp\n\npágina inicio en "/"\n  TarjetaFantasma con producto`
        )
        expect(resultado).toContain('componente desconocido')
    })

})

describe("Generador — rutas dinámicas (v0.9)", () => {

    it("genera un nombre de archivo sin paréntesis para rutas dinámicas", () => {
        const archivos = compilar(
            `aplicación MiApp\n\npágina detalle en "/producto/(id)"\n  título "Detalle"`
        )
        const nombres = archivos.map(a => a.nombre)
        expect(nombres).toContain('producto-id.html')
    })

    it("registra la ruta dinámica en Telar.rutas dentro del JS generado", () => {
        const archivos = compilar(
            `aplicación MiApp\n\npágina detalle en "/producto/(id)"\n  título "Detalle"`
        )
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain('Telar.rutas')
        expect(js.contenido).toContain('nombres: ["id"]')
    })

    it("una página sin parámetros no aparece en Telar.rutas", () => {
        const archivos = compilar(`aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`)
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain('Telar.rutas = {};')
    })

    it("conecta filtrados_parametro con Telar.parametroActual en el cargador", () => {
        const archivos = compilar(
            `aplicación MiApp\n\npágina detalle en "/producto/(id)"\n  mostrar Producto filtrados por id = parametro.id`
        )
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain("filtroCampo: 'id'")
        expect(js.contenido).toContain("Telar.parametroActual('id')")
    })

    it("conecta filtrados con valor literal en el cargador", () => {
        const archivos = compilar(
            `aplicación MiApp\n\npágina inicio en "/"\n  mostrar Producto filtrados por categoria = "ropa"`
        )
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain("filtroCampo: 'categoria'")
        expect(js.contenido).toContain("filtroValor: 'ropa'")
    })

})

describe("Generador — validación de formularios (v0.10)", () => {

    it("un campo tipo contraseña genera type=password en HTML (no 'contraseña')", () => {
        const resultado = html(`aplicación MiApp\n\npágina login en "/"\n  campo "Contraseña" tipo contraseña`)
        expect(resultado).toContain('type="password"')
        expect(resultado).not.toContain('type="contraseña"')
    })

    it("campo requerido genera el atributo required", () => {
        const resultado = html(`aplicación MiApp\n\npágina login en "/"\n  campo "Correo" tipo email requerido`)
        expect(resultado).toContain('required')
    })

    it("campo con mínimo genera minlength", () => {
        const resultado = html(
            `aplicación MiApp\n\npágina login en "/"\n  campo "Contraseña" tipo contraseña mínimo 8`
        )
        expect(resultado).toContain('minlength="8"')
    })

    it("campo con máximo genera maxlength", () => {
        const resultado = html(`aplicación MiApp\n\npágina login en "/"\n  campo "Nombre" tipo texto máximo 50`)
        expect(resultado).toContain('maxlength="50"')
    })

    it("un campo sin modificadores no genera atributos de validación", () => {
        const resultado = html(`aplicación MiApp\n\npágina login en "/"\n  campo "Correo" tipo email`)
        expect(resultado).not.toContain('required')
        expect(resultado).not.toContain('minlength')
        expect(resultado).not.toContain('maxlength')
    })

    it("cada campo tiene un contenedor de mensaje de error", () => {
        const resultado = html(`aplicación MiApp\n\npágina login en "/"\n  campo "Correo" tipo email`)
        expect(resultado).toContain('class="campo-error"')
        expect(resultado).toContain('id="correo-error"')
    })

    it("el runtime JS incluye validarCampos y recogerCampos", () => {
        const archivos = compilar(`aplicación MiApp\n\npágina login en "/"\n  campo "Correo" tipo email`)
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain('validarCampos()')
        expect(js.contenido).toContain('recogerCampos()')
    })

    it("un botón hacer valida y envía los campos en el POST", () => {
        const archivos = compilar(
            `aplicación MiApp\n\npágina login en "/"\n  campo "Correo" tipo email requerido\n  botón "Entrar" hacer entrar`
        )
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain('if (!Telar.validarCampos()) return')
        expect(js.contenido).toContain('body: JSON.stringify(Telar.recogerCampos())')
    })

})

describe("Generador — variables y estado local (v0.11)", () => {

    it("texto <variable> muestra el valor inicial en el HTML", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  variable cuenta = 0\n  texto cuenta`)
        expect(resultado).toContain('data-variable="cuenta"')
        expect(resultado).toContain('>0<')
    })

    it("una variable con valor inicial distinto de cero se refleja en el HTML", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  variable vidas = 3\n  texto vidas`)
        expect(resultado).toContain('>3<')
    })

    it("la declaración variable no genera HTML visible", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  variable cuenta = 0`)
        expect(resultado).not.toContain('variable')
    })

    it("Telar.estado incluye todas las variables de la app", () => {
        const archivos = compilar(`aplicación MiApp\n\npágina inicio en "/"\n  variable cuenta = 0`)
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain('Telar.estado = {')
        expect(js.contenido).toContain('cuenta: 0')
    })

    it("sin variables, Telar.estado es un objeto vacío", () => {
        const archivos = compilar(`aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`)
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain('Telar.estado = {};')
    })

    it("botón hacer sumar X genera una función sin llamada a fetch", () => {
        const archivos = compilar(
            `aplicación MiApp\n\npágina inicio en "/"\n  variable cuenta = 0\n  botón "Sumar" hacer sumar cuenta`
        )
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain('function sumar_cuenta()')
        expect(js.contenido).toContain('Telar.estado.cuenta = Telar.estado.cuenta + 1')
        expect(js.contenido).toContain("Telar.actualizarVariable('cuenta')")
        expect(js.contenido).not.toContain("fetch('/api/accion/sumar_cuenta'")
    })

    it("botón hacer restar X resta 1 en vez de sumar", () => {
        const archivos = compilar(
            `aplicación MiApp\n\npágina inicio en "/"\n  variable cuenta = 0\n  botón "Restar" hacer restar cuenta`
        )
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain('Telar.estado.cuenta = Telar.estado.cuenta - 1')
    })

    it("un botón hacer normal (no sumar/restar) sigue llamando a la API", () => {
        const archivos = compilar(`aplicación MiApp\n\npágina inicio en "/"\n  botón "Guardar" hacer guardar`)
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain("fetch('/api/accion/guardar'")
    })

})

describe("Generador — temas visuales (v0.12)", () => {

    it("sin tema declarado, el html no lleva data-tema", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`)
        expect(resultado).not.toContain('data-tema')
    })

    it("tema oscuro genera data-tema=oscuro en el html", () => {
        const resultado = html(`aplicación MiApp\n  tema oscuro\n\npágina inicio en "/"\n  título "Hola"`)
        expect(resultado).toContain('<html lang="es" data-tema="oscuro">')
    })

    it("tema claro genera data-tema=claro en el html", () => {
        const resultado = html(`aplicación MiApp\n  tema claro\n\npágina inicio en "/"\n  título "Hola"`)
        expect(resultado).toContain('<html lang="es" data-tema="claro">')
    })

    it("el CSS incluye la variante fija para html[data-tema=oscuro]", () => {
        const archivos = compilar(`aplicación MiApp\n  tema oscuro\n\npágina inicio en "/"\n  título "Hola"`)
        const css = archivos.find(a => a.nombre === 'telar.css')!
        expect(css.contenido).toContain('html[data-tema="oscuro"]')
    })

    it("el runtime JS incluye iniciarTema y alternarTema", () => {
        const archivos = compilar(`aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`)
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain('iniciarTema()')
        expect(js.contenido).toContain('alternarTema()')
    })

    it("un botón hacer cambiar tema no llama a ninguna API", () => {
        const archivos = compilar(
            `aplicación MiApp\n\npágina inicio en "/"\n  botón "Cambiar" hacer cambiar tema`
        )
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain('function cambiar_tema()')
        expect(js.contenido).toContain('Telar.alternarTema()')
        expect(js.contenido).not.toContain("fetch('/api/accion/cambiar_tema'")
    })

})

describe("Generador — SEO y metadatos (v0.13)", () => {

    it("genera meta og:title y og:description automáticamente", () => {
        const resultado = html(
            `aplicación MiApp\n\npágina inicio en "/"\n  título "Bienvenido"\n  descripción "Una tienda genial"`
        )
        expect(resultado).toContain('property="og:title" content="Bienvenido"')
        expect(resultado).toContain('property="og:description" content="Una tienda genial"')
        expect(resultado).toContain('name="twitter:title" content="Bienvenido"')
    })

    it("sin dominio declarado, no hay og:url ni sitemap/robots", () => {
        const archivos = compilar(`aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`)
        const html = archivos[0].contenido
        expect(html).not.toContain('og:url')
        expect(archivos.find(a => a.nombre === 'sitemap.xml')).toBeUndefined()
        expect(archivos.find(a => a.nombre === 'robots.txt')).toBeUndefined()
    })

    it("con dominio declarado, genera og:url absoluta", () => {
        const resultado = html(
            `aplicación MiApp\n  dominio "https://mitienda.com"\n\npágina contacto en "/contacto"\n  título "Contacto"`
        )
        expect(resultado).toContain('property="og:url" content="https://mitienda.com/contacto"')
    })

    it("una imagen se renderiza en el HTML y se usa como og:image", () => {
        const resultado = html(
            `aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"\n  imagen "https://x.com/foto.jpg"`
        )
        expect(resultado).toContain('<img src="https://x.com/foto.jpg"')
        expect(resultado).toContain('property="og:image" content="https://x.com/foto.jpg"')
        expect(resultado).toContain('name="twitter:card" content="summary_large_image"')
    })

    it("sin imagen, twitter:card es summary (no summary_large_image)", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`)
        expect(resultado).toContain('name="twitter:card" content="summary"')
    })

    it("con dominio, genera sitemap.xml con las páginas estáticas", () => {
        const archivos = compilar(
            `aplicación MiApp\n  dominio "https://mitienda.com"\n\npágina inicio en "/"\n  título "Hola"\n\npágina contacto en "/contacto"\n  título "Contacto"`
        )
        const sitemap = archivos.find(a => a.nombre === 'sitemap.xml')!
        expect(sitemap.contenido).toContain('<loc>https://mitienda.com</loc>')
        expect(sitemap.contenido).toContain('<loc>https://mitienda.com/contacto</loc>')
    })

    it("las rutas dinámicas no aparecen en el sitemap", () => {
        const archivos = compilar(
            `aplicación MiApp\n  dominio "https://mitienda.com"\n\npágina detalle en "/producto/(id)"\n  título "Detalle"`
        )
        const sitemap = archivos.find(a => a.nombre === 'sitemap.xml')!
        expect(sitemap.contenido).not.toContain('producto')
    })

    it("con dominio, genera robots.txt apuntando al sitemap", () => {
        const archivos = compilar(`aplicación MiApp\n  dominio "https://mitienda.com"\n\npágina inicio en "/"\n  título "Hola"`)
        const robots = archivos.find(a => a.nombre === 'robots.txt')!
        expect(robots.contenido).toContain('Allow: /')
        expect(robots.contenido).toContain('Sitemap: https://mitienda.com/sitemap.xml')
    })

})

describe("Generador — estilos y Tailwind (v0.15)", () => {

    it("el CDN de Tailwind genera <script>, no <link> (bug real corregido)", () => {
        const resultado = html(
            `aplicación MiApp\n  estilos "https://cdn.tailwindcss.com"\n\npágina inicio en "/"\n  título "Hola"`
        )
        expect(resultado).toContain('<script src="https://cdn.tailwindcss.com"></script>')
        expect(resultado).not.toContain('<link rel="stylesheet" href="https://cdn.tailwindcss.com">')
    })

    it("una URL .js explícita también genera <script>", () => {
        const resultado = html(
            `aplicación MiApp\n  estilos "https://ejemplo.com/analytics.js"\n\npágina inicio en "/"\n  título "Hola"`
        )
        expect(resultado).toContain('<script src="https://ejemplo.com/analytics.js"></script>')
    })

    it("una URL CSS externa normal sigue generando <link>", () => {
        const resultado = html(
            `aplicación MiApp\n  estilos "https://fonts.googleapis.com/css2"\n\npágina inicio en "/"\n  título "Hola"`
        )
        expect(resultado).toContain('<link rel="stylesheet" href="https://fonts.googleapis.com/css2">')
    })

    it("con estilos declarados, no se enlaza telar.css (el usuario controla el CSS)", () => {
        const resultado = html(
            `aplicación MiApp\n  estilos "https://cdn.tailwindcss.com"\n\npágina inicio en "/"\n  título "Hola"`
        )
        expect(resultado).not.toContain('href="telar.css"')
    })

    it("sin estilos declarados, sí se enlaza telar.css", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`)
        expect(resultado).toContain('href="telar.css"')
    })

    it("un estilos.css local en el proyecto tiene prioridad sobre el CSS generado", () => {
        const dirTemp = fs.mkdtempSync(path.join(os.tmpdir(), "telar-test-estilos-"))
        try {
            fs.writeFileSync(path.join(dirTemp, "estilos.css"), "/* mi css personalizado */\nbody { color: red; }")

            const tokens = new Lexer(`aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`).tokenizar()
            const arbol = new Parser(tokens).parsear()
            const archivos = new Generador(arbol, dirTemp).generar()

            const css = archivos.find(a => a.nombre === "telar.css")!
            expect(css.contenido).toContain("mi css personalizado")
            expect(css.contenido).not.toContain("--primario")
        } finally {
            fs.rmSync(dirTemp, { recursive: true, force: true })
        }
    })

})

describe("Generador — combinaciones diseño + rutas dinámicas + componentes (v0.15)", () => {

    it("con varios diseños declarados, se usa el primero como el de por defecto", () => {
        const resultado = html(
            `aplicación MiApp\n\ndiseño principal\n  título "Diseño A"\n\ndiseño secundario\n  título "Diseño B"\n\npágina inicio en "/"\n  título "Inicio"`
        )
        expect(resultado).toContain('titulo-diseno-a')
        expect(resultado).not.toContain('titulo-diseno-b')
    })

    it("una página puede elegir explícitamente el segundo diseño declarado", () => {
        const resultado = html(
            `aplicación MiApp\n\ndiseño principal\n  título "Diseño A"\n\ndiseño secundario\n  título "Diseño B"\n\npágina inicio en "/"\n  diseño secundario\n  título "Inicio"`
        )
        expect(resultado).toContain('titulo-diseno-b')
        expect(resultado).not.toContain('titulo-diseno-a')
    })

    it("si una página referencia un diseño que no existe, no rompe la compilación", () => {
        const resultado = html(
            `aplicación MiApp\n\npágina inicio en "/"\n  diseño queNoExiste\n  título "Inicio"`
        )
        expect(resultado).toContain('titulo-inicio')
    })

    it("un diseño se aplica también a páginas con ruta dinámica", () => {
        const archivos = compilar(
            `aplicación MiApp\n\ndiseño principal\n  navbar\n    título "Mi Navbar"\n\npágina detalle en "/producto/(id)"\n  título "Detalle"`
        )
        const pagina = archivos.find(a => a.nombre === 'producto-id.html')!
        expect(pagina.contenido).toContain('titulo-mi-navbar')
        expect(pagina.contenido).toContain('titulo-detalle')
    })

    it("un componente se puede usar dentro del bloque de un diseño, no solo en páginas", () => {
        const resultado = html(
            `aplicación MiApp\n\ncomponente Saludo\n  mostrar item.nombre\n\ndiseño principal\n  Saludo con usuario\n\npágina inicio en "/"\n  título "Inicio"`
        )
        expect(resultado).toContain('componente-saludo')
        expect(resultado).toContain('usuario.nombre')
    })

})
