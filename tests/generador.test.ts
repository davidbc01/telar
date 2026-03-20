// ─────────────────────────────────────────────────────────────
// generador.test.ts
// Tests del generador HTML de Telar.
// Ejecutar con: npm test
// ─────────────────────────────────────────────────────────────

import { describe, it, expect } from "vitest"
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
        expect(resultado).toContain('<h1>Bienvenido</h1>')
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
        expect(resultado).toContain('class="boton"')
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
        expect(css.contenido).toContain('--color-primario')
    })

    it("el CSS contiene estilos responsivos", () => {
        const archivos = compilar(`aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`)
        const css = archivos.find(a => a.nombre === "telar.css")!
        expect(css.contenido).toContain('@media')
    })

})
