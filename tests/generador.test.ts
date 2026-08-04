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

// Compila código Telar contra un proyecto real en disco, con un
// telar.config.json de verdad — para todo lo que ahora es configuración
// del sitio (idioma, dominio, tema, favicon, meta) y ya no se declara
// dentro de app.telar.
function compilarConConfig(codigo: string, config: Record<string, unknown>) {
    const dirTemp = fs.mkdtempSync(path.join(os.tmpdir(), "telar-test-config-"))
    fs.writeFileSync(path.join(dirTemp, "telar.config.json"), JSON.stringify(config))
    try {
        const tokens = new Lexer(codigo).tokenizar()
        const arbol = new Parser(tokens).parsear()
        return new Generador(arbol, dirTemp).generar()
    } finally {
        fs.rmSync(dirTemp, { recursive: true, force: true })
    }
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

    it("botón ir a con URL externa entre comillas funciona (regresión pre-v1.0)", () => {
        const resultado = html(
            `aplicación MiApp\n\npágina inicio en "/"\n  botón "GitHub" ir a "https://github.com/davidbc01/telar"`
        )
        expect(resultado).toContain('<a href="https://github.com/davidbc01/telar"')
    })

    it("genera button para botón hacer", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  botón "Enviar" enviar`)
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

    it("genera input email", () => {
        const resultado = html(`aplicación MiApp\n\npágina login en "/"\n  campo "Correo" email`)
        expect(resultado).toContain('type="email"')
        expect(resultado).toContain('autocomplete="email"')
    })

    it("genera label asociado al input", () => {
        const resultado = html(`aplicación MiApp\n\npágina login en "/"\n  campo "Correo" email`)
        expect(resultado).toContain('<label')
        expect(resultado).toContain('Correo')
    })

    it("normaliza tildes en el id del campo", () => {
        const resultado = html(`aplicación MiApp\n\npágina login en "/"\n  campo "Correo electrónico" email`)
        expect(resultado).toContain('id="correo-electronico"')
    })

    it("normaliza ñ en el id del campo", () => {
        const resultado = html(`aplicación MiApp\n\npágina login en "/"\n  campo "Contraseña" contraseña`)
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
            `aplicación MiApp\n\ncomponente TarjetaProducto con producto\n  mostrar producto.nombre\n\npágina inicio en "/"\n  TarjetaProducto con producto`
        )
        expect(resultado).toContain('componente-tarjetaproducto')
    })

    it("sustituye el parámetro por el argumento pasado", () => {
        const resultado = html(
            `aplicación MiApp\n\ncomponente TarjetaProducto con item\n  mostrar item.nombre\n\npágina inicio en "/"\n  TarjetaProducto con producto`
        )
        expect(resultado).toContain('producto.nombre')
        expect(resultado).not.toContain('item.nombre')
    })

    it("un componente desconocido ahora es un error de compilación (antes compilaba en silencio)", () => {
        expect(() => html(
            `aplicación MiApp\n\npágina inicio en "/"\n  TarjetaFantasma con producto`
        )).toThrow(/componente que no existe/)
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
            `aplicación MiApp\n\npágina detalle en "/producto/(id)"\n  mostrar Producto donde id = parametro.id`
        )
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain("filtroCampo: 'id'")
        expect(js.contenido).toContain("Telar.parametroActual('id')")
    })

    it("conecta filtrados con valor literal en el cargador", () => {
        const archivos = compilar(
            `aplicación MiApp\n\npágina inicio en "/"\n  mostrar Producto donde categoria = "ropa"`
        )
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain("filtroCampo: 'categoria'")
        expect(js.contenido).toContain("filtroValor: 'ropa'")
    })

})

describe("Generador — validación de formularios (v0.10)", () => {

    it("un campo contraseña genera type=password en HTML (no 'contraseña')", () => {
        const resultado = html(`aplicación MiApp\n\npágina login en "/"\n  campo "Contraseña" contraseña`)
        expect(resultado).toContain('type="password"')
        expect(resultado).not.toContain('type="contraseña"')
    })

    it("un campo texto genera type=text en HTML (no 'texto') — regresión pre-v1.0", () => {
        const resultado = html(`aplicación MiApp\n\npágina login en "/"\n  campo "Nombre" texto`)
        expect(resultado).toContain('type="text"')
        expect(resultado).not.toContain('type="texto"')
    })

    it("un campo número genera type=number en HTML — regresión pre-v1.0", () => {
        const resultado = html(`aplicación MiApp\n\npágina login en "/"\n  campo "Edad" número`)
        expect(resultado).toContain('type="number"')
    })

    it("un campo área de texto genera un <textarea> real, no un <input> — regresión pre-v1.0", () => {
        const resultado = html(`aplicación MiApp\n\npágina contacto en "/"\n  campo "Mensaje" área de texto`)
        expect(resultado).toContain('<textarea')
        expect(resultado).not.toContain('type="área de texto"')
        expect(resultado).not.toContain('type="texto"')
    })

    it("un campo área de texto con validación sigue generando <textarea>", () => {
        const resultado = html(`aplicación MiApp\n\npágina contacto en "/"\n  campo "Mensaje" área de texto requerido máximo 500`)
        expect(resultado).toContain('<textarea')
        expect(resultado).toContain('maxlength="500"')
    })

    it("campo requerido genera el atributo required", () => {
        const resultado = html(`aplicación MiApp\n\npágina login en "/"\n  campo "Correo" email requerido`)
        expect(resultado).toContain('required')
    })

    it("campo con mínimo genera minlength", () => {
        const resultado = html(
            `aplicación MiApp\n\npágina login en "/"\n  campo "Contraseña" contraseña mínimo 8`
        )
        expect(resultado).toContain('minlength="8"')
    })

    it("campo con máximo genera maxlength", () => {
        const resultado = html(`aplicación MiApp\n\npágina login en "/"\n  campo "Nombre" texto máximo 50`)
        expect(resultado).toContain('maxlength="50"')
    })

    it("un campo sin modificadores no genera atributos de validación", () => {
        const resultado = html(`aplicación MiApp\n\npágina login en "/"\n  campo "Correo" email`)
        expect(resultado).not.toContain('required')
        expect(resultado).not.toContain('minlength')
        expect(resultado).not.toContain('maxlength')
    })

    it("cada campo tiene un contenedor de mensaje de error", () => {
        const resultado = html(`aplicación MiApp\n\npágina login en "/"\n  campo "Correo" email`)
        expect(resultado).toContain('class="campo-error"')
        expect(resultado).toContain('id="correo-error"')
    })

    it("el runtime JS incluye validarCampos y recogerCampos", () => {
        const archivos = compilar(`aplicación MiApp\n\npágina login en "/"\n  campo "Correo" email`)
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain('validarCampos()')
        expect(js.contenido).toContain('recogerCampos()')
    })

    it("un botón valida y envía los campos en el POST", () => {
        const archivos = compilar(
            `aplicación MiApp\n\npágina login en "/"\n  campo "Correo" email requerido\n  botón "Entrar" entrar`
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

    it("botón suma X genera una función sin llamada a fetch", () => {
        const archivos = compilar(
            `aplicación MiApp\n\npágina inicio en "/"\n  variable cuenta = 0\n  botón "Sumar" suma cuenta`
        )
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain('function sumar_cuenta()')
        expect(js.contenido).toContain('Telar.estado.cuenta = Telar.estado.cuenta + 1')
        expect(js.contenido).toContain("Telar.actualizarVariable('cuenta')")
        expect(js.contenido).not.toContain("fetch('/api/accion/sumar_cuenta'")
    })

    it("botón resta X resta 1 en vez de sumar", () => {
        const archivos = compilar(
            `aplicación MiApp\n\npágina inicio en "/"\n  variable cuenta = 0\n  botón "Restar" resta cuenta`
        )
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain('Telar.estado.cuenta = Telar.estado.cuenta - 1')
    })

    it("un botón normal (no sumar/restar) sigue llamando a la API", () => {
        const archivos = compilar(`aplicación MiApp\n\npágina inicio en "/"\n  botón "Guardar" guardar`)
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain("fetch('/api/accion/guardar'")
    })

})

describe("Generador — temas visuales (v0.12)", () => {

    it("sin tema declarado, el html no lleva data-tema", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`)
        expect(resultado).not.toContain('data-tema')
    })

    it("tema oscuro (vía telar.config.json) genera data-tema=oscuro en el html", () => {
        const archivos = compilarConConfig(
            `aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`,
            { tema: "oscuro" }
        )
        expect(archivos[0].contenido).toContain('<html lang="es" data-tema="oscuro">')
    })

    it("tema claro (vía telar.config.json) genera data-tema=claro en el html", () => {
        const archivos = compilarConConfig(
            `aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`,
            { tema: "claro" }
        )
        expect(archivos[0].contenido).toContain('<html lang="es" data-tema="claro">')
    })

    it("el CSS incluye la variante fija para html[data-tema=oscuro]", () => {
        const archivos = compilarConConfig(
            `aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`,
            { tema: "oscuro" }
        )
        const css = archivos.find(a => a.nombre === 'telar.css')!
        expect(css.contenido).toContain('html[data-tema="oscuro"]')
    })

    it("el runtime JS incluye iniciarTema y alternarTema", () => {
        const archivos = compilar(`aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`)
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain('iniciarTema()')
        expect(js.contenido).toContain('alternarTema()')
    })

    it("un botón alterna tema no llama a ninguna API", () => {
        const archivos = compilar(
            `aplicación MiApp\n\npágina inicio en "/"\n  botón "Cambiar" alterna tema`
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

    it("con dominio declarado (vía config), genera og:url absoluta", () => {
        const archivos = compilarConConfig(
            `aplicación MiApp\n\npágina contacto en "/contacto"\n  título "Contacto"`,
            { dominio: "https://mitienda.com" }
        )
        expect(archivos[0].contenido).toContain('property="og:url" content="https://mitienda.com/contacto"')
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
        const archivos = compilarConConfig(
            `aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"\n\npágina contacto en "/contacto"\n  título "Contacto"`,
            { dominio: "https://mitienda.com" }
        )
        const sitemap = archivos.find(a => a.nombre === 'sitemap.xml')!
        expect(sitemap.contenido).toContain('<loc>https://mitienda.com</loc>')
        expect(sitemap.contenido).toContain('<loc>https://mitienda.com/contacto</loc>')
    })

    it("las rutas dinámicas no aparecen en el sitemap", () => {
        const archivos = compilarConConfig(
            `aplicación MiApp\n\npágina detalle en "/producto/(id)"\n  título "Detalle"`,
            { dominio: "https://mitienda.com" }
        )
        const sitemap = archivos.find(a => a.nombre === 'sitemap.xml')!
        expect(sitemap.contenido).not.toContain('producto')
    })

    it("con dominio, genera robots.txt apuntando al sitemap", () => {
        const archivos = compilarConConfig(
            `aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`,
            { dominio: "https://mitienda.com" }
        )
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

    it("un estilos.css local en public/ tiene prioridad sobre el CSS generado", () => {
        const dirTemp = fs.mkdtempSync(path.join(os.tmpdir(), "telar-test-estilos-"))
        try {
            fs.mkdirSync(path.join(dirTemp, "public"), { recursive: true })
            fs.writeFileSync(path.join(dirTemp, "public", "estilos.css"), "/* mi css personalizado */\nbody { color: red; }")

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

    it("si una página referencia un diseño que no existe, ahora es un error de compilación", () => {
        expect(() => html(
            `aplicación MiApp\n\npágina inicio en "/"\n  diseño queNoExiste\n  título "Inicio"`
        )).toThrow(/no existe ningún diseño/)
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
            `aplicación MiApp\n\ncomponente Saludo con item\n  mostrar item.nombre\n\ndiseño principal\n  Saludo con usuario\n\npágina inicio en "/"\n  título "Inicio"`
        )
        expect(resultado).toContain('componente-saludo')
        expect(resultado).toContain('usuario.nombre')
    })

})

describe("Generador — componente como plantilla de lista (mostrar ... con X)", () => {

    const codigoBase = `aplicación MiApp

componente TarjetaProducto con item
  mostrar item.nombre
  mostrar item.precio

página inicio en "/"
  mostrar Producto recientes
    máximo 8
    con TarjetaProducto`

    it("genera una función plantilla_X en el JS runtime", () => {
        const archivos = compilar(codigoBase)
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain('function plantilla_TarjetaProducto(item)')
    })

    it("la plantilla usa interpolación real ${item.propiedad}, no texto fijo", () => {
        const archivos = compilar(codigoBase)
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain('${item.nombre}')
        expect(js.contenido).toContain('${item.precio}')
    })

    it("renderizarLista recibe la función de plantilla al cargar la lista", () => {
        const archivos = compilar(codigoBase)
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain("Telar.renderizarLista(contenedor, datos, 'Producto', plantilla_TarjetaProducto)")
    })

    it("sin 'con', renderizarLista no recibe plantilla (usa el genérico de siempre)", () => {
        const archivos = compilar(
            `aplicación MiApp\n\npágina inicio en "/"\n  mostrar Producto recientes\n    máximo 8`
        )
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain("Telar.renderizarLista(contenedor, datos, 'Producto')")
    })

    it("no genera función de plantilla para componentes que no se usan con 'con'", () => {
        const archivos = compilar(
            `aplicación MiApp\n\ncomponente SinUsar con item\n  mostrar item.x\n\npágina inicio en "/"\n  mostrar Producto recientes`
        )
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).not.toContain('function plantilla_SinUsar')
    })

    it("referenciar un componente inexistente con 'con' ahora es un error de compilación", () => {
        expect(() => compilar(
            `aplicación MiApp\n\npágina inicio en "/"\n  mostrar Producto recientes\n    con NoExiste`
        )).toThrow(/componente que no existe/)
    })

})

describe("Generador — clases CSS con texto sin letras/números (regresión pre-v1.0)", () => {

    it("un botón con texto solo símbolos ('+') no genera una clase 'boton-' vacía", () => {
        const resultado = html(
            `aplicación MiApp\n\npágina inicio en "/"\n  variable cuenta = 0\n  botón "+" suma cuenta`
        )
        expect(resultado).toContain('class="boton"')
        expect(resultado).not.toContain('class="boton boton-"')
        expect(resultado).not.toContain('boton- ')
        expect(resultado).not.toContain('boton-"')
    })

    it("un botón con texto normal sigue generando su clase modificadora normalmente", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  botón "Entrar" ir a login`)
        expect(resultado).toContain('boton boton-entrar')
    })

    it("un título con texto solo símbolos no genera una clase 'titulo-' vacía", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  título "—"`)
        expect(resultado).toContain('class="titulo"')
        expect(resultado).not.toContain('titulo-"')
    })

    it("una descripción con texto solo símbolos no genera una clase 'descripcion-' vacía", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  descripción "···"`)
        expect(resultado).toContain('class="descripcion"')
        expect(resultado).not.toContain('descripcion-"')
    })

})

describe("Generador — control del <head>: favicon y meta personalizadas", () => {

    it("sin favicon declarado, no genera <link rel='icon'>", () => {
        const resultado = html(`aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`)
        expect(resultado).not.toContain('rel="icon"')
    })

    it("favicon declarado (vía config) genera el <link rel='icon'>", () => {
        const archivos = compilarConConfig(
            `aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`,
            { favicon: "https://midominio.com/favicon.ico" }
        )
        expect(archivos[0].contenido).toContain('<link rel="icon" href="https://midominio.com/favicon.ico">')
    })

    it("meta personalizada (vía config) genera un <meta name=... content=...>", () => {
        const archivos = compilarConConfig(
            `aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`,
            { meta: { "theme-color": "#0B0B0D" } }
        )
        expect(archivos[0].contenido).toContain('<meta name="theme-color" content="#0B0B0D">')
    })

    it("varias meta personalizadas se generan todas, en orden", () => {
        const archivos = compilarConConfig(
            `aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`,
            { meta: { "theme-color": "#0B0B0D", "apple-mobile-web-app-title": "MiApp" } }
        )
        expect(archivos[0].contenido).toContain('name="theme-color" content="#0B0B0D"')
        expect(archivos[0].contenido).toContain('name="apple-mobile-web-app-title" content="MiApp"')
    })

    it("favicon y meta aparecen en todas las páginas de la app, no solo una", () => {
        const archivos = compilarConConfig(
            `aplicación MiApp\n\npágina inicio en "/"\n  título "Inicio"\n\npágina contacto en "/contacto"\n  título "Contacto"`,
            { favicon: "https://x.com/favicon.ico" }
        )
        for (const archivo of archivos.filter(a => a.nombre.endsWith('.html'))) {
            expect(archivo.contenido).toContain('rel="icon"')
        }
    })

    it("un public/favicon.ico se detecta automáticamente sin declarar nada", () => {
        const dirTemp = fs.mkdtempSync(path.join(os.tmpdir(), "telar-test-favicon-"))
        try {
            fs.mkdirSync(path.join(dirTemp, "public"), { recursive: true })
            fs.writeFileSync(path.join(dirTemp, "public", "favicon.ico"), "contenido-falso-del-icono")

            const tokens = new Lexer(`aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`).tokenizar()
            const arbol = new Parser(tokens).parsear()
            const archivos = new Generador(arbol, dirTemp).generar()

            expect(archivos[0].contenido).toContain('<link rel="icon" href="/favicon.ico">')
        } finally {
            fs.rmSync(dirTemp, { recursive: true, force: true })
        }
    })

})

describe("Generador — componentes: varios parámetros, slots y si-parámetro", () => {

    it("sustituye varios parámetros a la vez, cada uno por su argumento real", () => {
        const resultado = html(
            `aplicación MiApp\n\ncomponente Tarjeta con producto y usuario\n  mostrar producto.nombre\n  mostrar usuario.email\n\npágina inicio en "/"\n  Tarjeta con miProducto y miUsuario`
        )
        expect(resultado).toContain('miProducto.nombre')
        expect(resultado).toContain('miUsuario.email')
    })

    it("el slot se inserta en el marcador 'contenido'", () => {
        const resultado = html(
            `aplicación MiApp\n\ncomponente Tarjeta con producto\n  título "Tarjeta"\n  contenido\n\npágina inicio en "/"\n  Tarjeta con producto\n    descripción "Contenido extra"`
        )
        expect(resultado).toContain('Contenido extra')
    })

    it("sin marcador 'contenido', el slot se inserta al final", () => {
        const resultado = html(
            `aplicación MiApp\n\ncomponente Tarjeta con producto\n  título "Tarjeta"\n\npágina inicio en "/"\n  Tarjeta con producto\n    descripción "Al final"`
        )
        const posTitulo = resultado.indexOf('titulo-')
        const posDescripcion = resultado.indexOf('Al final')
        expect(posDescripcion).toBeGreaterThan(posTitulo)
    })

    it("sin contenido pasado, no hay rastro de un slot vacío", () => {
        const resultado = html(
            `aplicación MiApp\n\ncomponente Tarjeta con producto\n  título "Tarjeta"\n  contenido\n\npágina inicio en "/"\n  Tarjeta con producto`
        )
        expect(resultado).toContain('titulo-')
    })

    it("si <parámetro> se renderiza siempre en el uso estático (limitación documentada)", () => {
        const resultado = html(
            `aplicación MiApp\n\ncomponente Tarjeta con producto y destacado\n  si destacado\n    título "⭐ Destacado"\n\npágina inicio en "/"\n  Tarjeta con producto y noEsUnBooleanoReal`
        )
        expect(resultado).toContain('⭐ Destacado')
    })

    it("si <parámetro> genera un ternario JS real en la plantilla de lista", () => {
        const archivos = compilar(
            `aplicación MiApp\n\ncomponente Tarjeta con producto\n  mostrar producto.nombre\n  si producto.destacado\n    título "⭐ Oferta"\n\npágina inicio en "/"\n  mostrar Producto recientes\n    con Tarjeta`
        )
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain("producto.destacado ? `")
        expect(js.contenido).toContain('⭐ Oferta')
    })

    it("la función de plantilla usa el nombre real del parámetro, no 'item' fijo", () => {
        const archivos = compilar(
            `aplicación MiApp\n\ncomponente Tarjeta con producto\n  mostrar producto.nombre\n\npágina inicio en "/"\n  mostrar Producto recientes\n    con Tarjeta`
        )
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain('function plantilla_Tarjeta(producto)')
        expect(js.contenido).not.toContain('function plantilla_Tarjeta(item)')
    })

})

describe("Generador — JS de elementos interactivos dentro de un diseño (regresión pre-v1.0)", () => {

    it("un botón de acción dentro de un diseño genera su función JS", () => {
        const archivos = compilar(
            `aplicación MiApp\n\ndiseño principal\n  botón "🌙" alterna tema\n\npágina inicio en "/"\n  diseño principal\n  título "Inicio"`
        )
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain('function cambiar_tema()')
    })

    it("un botón de acción dentro de un diseño registra su listener de clic", () => {
        const archivos = compilar(
            `aplicación MiApp\n\ndiseño principal\n  botón "🌙" alterna tema\n\npágina inicio en "/"\n  diseño principal\n  título "Inicio"`
        )
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain("document.querySelector('[data-accion=\"cambiar_tema\"]')")
        expect(js.contenido).toContain('registrarAcciones();')
    })

    it("una variable declarada dentro de un diseño se incluye en Telar.estado", () => {
        const archivos = compilar(
            `aplicación MiApp\n\ndiseño principal\n  variable visitas = 0\n\npágina inicio en "/"\n  diseño principal\n  título "Inicio"`
        )
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain('visitas: 0')
    })

    it("un botón hacer sumar/restar dentro de un diseño funciona igual que en una página", () => {
        const archivos = compilar(
            `aplicación MiApp\n\ndiseño principal\n  variable cuenta = 0\n  botón "+" suma cuenta\n\npágina inicio en "/"\n  diseño principal\n  título "Inicio"`
        )
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain('function sumar_cuenta()')
        expect(js.contenido).toContain('Telar.estado.cuenta = Telar.estado.cuenta + 1')
    })

    it("un 'si' condicional dentro de un diseño dispara aplicarCondiciones", () => {
        const archivos = compilar(
            `aplicación MiApp\n\ndiseño principal\n  si el usuario está conectado\n    botón "Mi cuenta" ir a cuenta\n\npágina inicio en "/"\n  diseño principal\n  título "Inicio"`
        )
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain('aplicarCondiciones();')
        expect(js.contenido).toContain("Telar.aplicarCondicion('usuario-conectado');")
    })

    it("un 'mostrar Modelo' dentro de un diseño genera su cargador y se llama en el init", () => {
        const archivos = compilar(
            `aplicación MiApp\n\ndiseño principal\n  mostrar Notificacion recientes\n\npágina inicio en "/"\n  diseño principal\n  título "Inicio"`
        )
        const js = archivos.find(a => a.nombre === 'telar.js')!
        expect(js.contenido).toContain('async function cargarNotificacion()')
        expect(js.contenido).toContain('cargarNotificacion();')
    })

})
