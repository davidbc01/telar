// ─────────────────────────────────────────────────────────────
// parser.test.ts
// Tests del parser de Telar.
// Ejecutar con: npm test
// ─────────────────────────────────────────────────────────────

import { describe, it, expect } from "vitest"
import { Lexer } from "../src/lexer"
import { Parser } from "../src/parser"

function parsear(codigo: string) {
    const tokens = new Lexer(codigo).tokenizar()
    return new Parser(tokens).parsear()
}

describe("Parser — aplicación", () => {

    it("parsea una aplicación básica", () => {
        const arbol = parsear(`aplicación MiApp\n  idioma español`)
        expect(arbol.tipo).toBe("aplicacion")
        expect(arbol.nombre).toBe("MiApp")
        expect(arbol.idioma).toBe("español")
    })

    it("usa español como idioma por defecto", () => {
        const arbol = parsear(`aplicación MiApp`)
        expect(arbol.idioma).toBe("español")
    })

    it("lanza error sin nombre de aplicación", () => {
        expect(() => parsear(`aplicación`)).toThrow()
    })

    it("lanza error si no empieza con aplicación", () => {
        expect(() => parsear(`página inicio en "/"`)).toThrow()
    })

})

describe("Parser — modelos de datos", () => {

    it("parsea un modelo de datos", () => {
        const arbol = parsear(`aplicación MiApp\n\ndatos Producto\n  nombre: texto\n  precio: número`)
        expect(arbol.datos.length).toBe(1)
        expect(arbol.datos[0].nombre).toBe("Producto")
        expect(arbol.datos[0].campos.length).toBe(2)
    })

    it("parsea tipos de datos correctamente", () => {
        const arbol = parsear(`aplicación MiApp\n\ndatos Item\n  nombre: texto\n  precio: número\n  imagen: foto\n  fecha: fecha\n  activo: verdad`)
        const campos = arbol.datos[0].campos
        expect(campos[0].tipoCampo).toBe("texto")
        expect(campos[1].tipoCampo).toBe("número")
        expect(campos[2].tipoCampo).toBe("foto")
        expect(campos[3].tipoCampo).toBe("fecha")
        expect(campos[4].tipoCampo).toBe("verdad")
    })

    it("parsea múltiples modelos", () => {
        const arbol = parsear(`aplicación MiApp\n\ndatos Producto\n  nombre: texto\n\ndatos Usuario\n  email: texto`)
        expect(arbol.datos.length).toBe(2)
    })

})

describe("Parser — páginas", () => {

    it("parsea una página básica", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina inicio en "/"\n  título "Bienvenido"`)
        expect(arbol.paginas.length).toBe(1)
        expect(arbol.paginas[0].nombre).toBe("inicio")
        expect(arbol.paginas[0].ruta).toBe("/")
    })

    it("parsea múltiples páginas", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina inicio en "/"\n  título "Inicio"\n\npágina login en "/entrar"\n  título "Entrar"`)
        expect(arbol.paginas.length).toBe(2)
        expect(arbol.paginas[1].ruta).toBe("/entrar")
    })

    it("parsea título en página", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina inicio en "/"\n  título "Bienvenido"`)
        const titulo = arbol.paginas[0].hijos[0] as any
        expect(titulo.tipo).toBe("titulo")
        expect(titulo.texto).toBe("Bienvenido")
    })

    it("parsea descripción en página", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina inicio en "/"\n  descripción "Mi app"`)
        const desc = arbol.paginas[0].hijos[0] as any
        expect(desc.tipo).toBe("descripcion")
        expect(desc.texto).toBe("Mi app")
    })

})

describe("Parser — mostrar", () => {

    it("parsea mostrar con modelo", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina inicio en "/"\n  mostrar Producto`)
        const mostrar = arbol.paginas[0].hijos[0] as any
        expect(mostrar.tipo).toBe("mostrar")
        expect(mostrar.modelo).toBe("Producto")
    })

    it("parsea mostrar con modificadores", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina inicio en "/"\n  mostrar Producto recientes\n    máximo 8\n    ordenados por precio`)
        const mostrar = arbol.paginas[0].hijos[0] as any
        expect(mostrar.modificadores.length).toBe(3)
        expect(mostrar.modificadores[0].tipo).toBe("recientes")
        expect(mostrar.modificadores[1].tipo).toBe("maximo")
        expect(mostrar.modificadores[1].cantidad).toBe(8)
        expect(mostrar.modificadores[2].tipo).toBe("ordenados")
        expect(mostrar.modificadores[2].campo).toBe("precio")
    })

    it("parsea mostrar con si falla", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina inicio en "/"\n  mostrar Producto\n    si falla\n      mostrar "Error"`)
        const mostrar = arbol.paginas[0].hijos[0] as any
        expect(mostrar.siFalla).toBeDefined()
        expect(mostrar.siFalla.length).toBe(1)
    })

})

describe("Parser — botones", () => {

    it("parsea botón ir a", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina inicio en "/"\n  botón "Entrar" ir a login`)
        const boton = arbol.paginas[0].hijos[0] as any
        expect(boton.tipo).toBe("boton")
        expect(boton.texto).toBe("Entrar")
        expect(boton.accion).toBe("ir")
        expect(boton.destino).toBe("login")
    })

    it("parsea botón hacer", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina inicio en "/"\n  botón "Enviar" hacer enviarFormulario`)
        const boton = arbol.paginas[0].hijos[0] as any
        expect(boton.accion).toBe("hacer")
        expect(boton.destino).toBe("enviarFormulario")
    })

    it.skip("parsea botón con si falla", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina inicio en "/"\n  botón "Enviar" hacer enviar\n    si falla\n      mostrar "Error"`)
        const boton = arbol.paginas[0].hijos[0] as any
        expect(boton.siFalla).toBeDefined()
    })

})

describe("Parser — campos", () => {

    it("parsea campo tipo email", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina login en "/"\n  campo "Correo" tipo email`)
        const campo = arbol.paginas[0].hijos[0] as any
        expect(campo.tipo).toBe("campo")
        expect(campo.etiqueta).toBe("Correo")
        expect(campo.tipoCampo).toBe("email")
    })

    it("parsea campo tipo contraseña", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina login en "/"\n  campo "Contraseña" tipo contraseña`)
        const campo = arbol.paginas[0].hijos[0] as any
        expect(campo.tipoCampo).toBe("contraseña")
    })

})

describe("Parser — condicionales", () => {

    it("parsea si el usuario está conectado", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina inicio en "/"\n  si el usuario está conectado\n    botón "Cuenta" ir a cuenta`)
        const si = arbol.paginas[0].hijos[0] as any
        expect(si.tipo).toBe("si")
        expect(si.condicion.tipo).toBe("usuario_conectado")
        expect(si.entonces.length).toBe(1)
    })

    it("parsea si hay resultados", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina inicio en "/"\n  si hay resultados\n    mostrar "Hay datos"`)
        const si = arbol.paginas[0].hijos[0] as any
        expect(si.condicion.tipo).toBe("hay_resultados")
    })

    it("parsea si con rama si no", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina inicio en "/"\n  si el usuario está conectado\n    botón "Cuenta" ir a cuenta\n  si no\n    botón "Entrar" ir a login`)
        const si = arbol.paginas[0].hijos[0] as any
        expect(si.siNo).toBeDefined()
        expect(si.siNo.length).toBe(1)
    })

})

describe("Parser — optimización", () => {

    it("parsea optimizar para móvil", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina inicio en "/"\n  optimizar para móvil`)
        const opt = arbol.paginas[0].hijos[0] as any
        expect(opt.tipo).toBe("optimizar")
        expect(opt.objetivo).toBe("movil")
    })

    it("parsea caché en minutos", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina inicio en "/"\n  caché 10 minutos`)
        const cache = arbol.paginas[0].hijos[0] as any
        expect(cache.tipo).toBe("cache")
        expect(cache.cantidad).toBe(10)
        expect(cache.unidad).toBe("minutos")
    })

})

describe("Parser — paquetes y código", () => {

    it("parsea usar paquete", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina inicio en "/"\n  usar navbar`)
        const usar = arbol.paginas[0].hijos[0] as any
        expect(usar.tipo).toBe("usar")
        expect(usar.paquete).toBe("navbar")
    })

})
