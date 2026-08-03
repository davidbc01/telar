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
        const arbol = parsear(`aplicación MiApp\n\npágina inicio en "/"\n  botón "Enviar" enviarFormulario`)
        const boton = arbol.paginas[0].hijos[0] as any
        expect(boton.accion).toBe("hacer")
        expect(boton.destino).toBe("enviarFormulario")
    })

    it.skip("parsea botón con si falla", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina inicio en "/"\n  botón "Enviar" enviar\n    si falla\n      mostrar "Error"`)
        const boton = arbol.paginas[0].hijos[0] as any
        expect(boton.siFalla).toBeDefined()
    })

})

describe("Parser — campos", () => {

    it("parsea campo email", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina login en "/"\n  campo "Correo" email`)
        const campo = arbol.paginas[0].hijos[0] as any
        expect(campo.tipo).toBe("campo")
        expect(campo.etiqueta).toBe("Correo")
        expect(campo.tipoCampo).toBe("email")
    })

    it("parsea campo contraseña", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina login en "/"\n  campo "Contraseña" contraseña`)
        const campo = arbol.paginas[0].hijos[0] as any
        expect(campo.tipoCampo).toBe("contraseña")
    })

    it("un campo sin modificadores no es requerido y no tiene límites", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina login en "/"\n  campo "Correo" email`)
        const campo = arbol.paginas[0].hijos[0] as any
        expect(campo.requerido).toBe(false)
        expect(campo.minimo).toBeUndefined()
        expect(campo.maximo).toBeUndefined()
    })

    it("parsea campo requerido", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina login en "/"\n  campo "Correo" email requerido`)
        const campo = arbol.paginas[0].hijos[0] as any
        expect(campo.requerido).toBe(true)
    })

    it("parsea campo con mínimo de caracteres", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina login en "/"\n  campo "Contraseña" contraseña mínimo 8 caracteres`)
        const campo = arbol.paginas[0].hijos[0] as any
        expect(campo.minimo).toBe(8)
    })

    it("parsea campo con máximo de caracteres", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina login en "/"\n  campo "Nombre" texto máximo 50 caracteres`)
        const campo = arbol.paginas[0].hijos[0] as any
        expect(campo.maximo).toBe(50)
    })

    it("combina requerido y mínimo en el mismo campo", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina login en "/"\n  campo "Contraseña" contraseña requerido mínimo 8`)
        const campo = arbol.paginas[0].hijos[0] as any
        expect(campo.requerido).toBe(true)
        expect(campo.minimo).toBe(8)
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

describe("Parser — rutas dinámicas (v0.9)", () => {

    it("una página estática no tiene parámetros", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina inicio en "/"\n  título "Hola"`)
        expect(arbol.paginas[0].parametros).toEqual([])
    })

    it("extrae un parámetro de la ruta", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina detalle en "/producto/(id)"\n  título "Detalle"`)
        expect(arbol.paginas[0].parametros).toEqual(["id"])
    })

    it("extrae varios parámetros de la ruta", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina detalle en "/(categoria)/(id)"\n  título "Detalle"`)
        expect(arbol.paginas[0].parametros).toEqual(["categoria", "id"])
    })

    it("filtrados con valor literal sigue funcionando (compatibilidad)", () => {
        const arbol = parsear(
            `aplicación MiApp\n\npágina inicio en "/"\n  mostrar Producto donde categoria = "ropa"`
        )
        const mostrar = arbol.paginas[0].hijos[0] as any
        expect(mostrar.modificadores[0]).toEqual({ tipo: "filtrados", campo: "categoria", valor: "ropa" })
    })

    it("filtrados con parametro.X genera filtrados_parametro", () => {
        const arbol = parsear(
            `aplicación MiApp\n\npágina detalle en "/producto/(id)"\n  mostrar Producto donde id = parametro.id`
        )
        const mostrar = arbol.paginas[0].hijos[0] as any
        expect(mostrar.modificadores[0]).toEqual({ tipo: "filtrados_parametro", campo: "id", parametro: "id" })
    })

})

describe("Parser — variables y estado local (v0.11)", () => {

    it("parsea una variable con valor inicial", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina inicio en "/"\n  variable cuenta = 0`)
        const variable = arbol.paginas[0].hijos[0] as any
        expect(variable.tipo).toBe("variable")
        expect(variable.nombre).toBe("cuenta")
        expect(variable.valorInicial).toBe(0)
    })

    it("parsea una variable con valor inicial distinto de cero", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina inicio en "/"\n  variable vidas = 3`)
        const variable = arbol.paginas[0].hijos[0] as any
        expect(variable.valorInicial).toBe(3)
    })

    it("parsea texto <variable> como referencia a mostrar", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina inicio en "/"\n  variable cuenta = 0\n  texto cuenta`)
        const textoVariable = arbol.paginas[0].hijos[1] as any
        expect(textoVariable.tipo).toBe("texto_variable")
        expect(textoVariable.nombre).toBe("cuenta")
    })

    it("un botón suma X guarda la operación y la variable", () => {
        const arbol = parsear(
            `aplicación MiApp\n\npágina inicio en "/"\n  variable cuenta = 0\n  botón "Sumar" suma cuenta`
        )
        const boton = arbol.paginas[0].hijos[1] as any
        expect(boton.accion).toBe("hacer")
        expect(boton.operacion).toBe("sumar")
        expect(boton.variable).toBe("cuenta")
        expect(boton.destino).toBe("sumar_cuenta")
    })

    it("un botón resta X guarda la operación y la variable", () => {
        const arbol = parsear(
            `aplicación MiApp\n\npágina inicio en "/"\n  variable cuenta = 0\n  botón "Restar" resta cuenta`
        )
        const boton = arbol.paginas[0].hijos[1] as any
        expect(boton.operacion).toBe("restar")
        expect(boton.variable).toBe("cuenta")
    })

    it("un botón con una acción normal no lleva operación ni variable", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina inicio en "/"\n  botón "Guardar" guardar`)
        const boton = arbol.paginas[0].hijos[0] as any
        expect(boton.destino).toBe("guardar")
        expect(boton.operacion).toBeUndefined()
        expect(boton.variable).toBeUndefined()
    })

})

describe("Parser — temas visuales (v0.12)", () => {

    it("sin declarar tema, la app usa automático", () => {
        const arbol = parsear(`aplicación MiApp`)
        expect(arbol.tema).toBe("automatico")
    })

    it("parsea tema oscuro", () => {
        const arbol = parsear(`aplicación MiApp\n  tema oscuro`)
        expect(arbol.tema).toBe("oscuro")
    })

    it("parsea tema claro", () => {
        const arbol = parsear(`aplicación MiApp\n  tema claro`)
        expect(arbol.tema).toBe("claro")
    })

    it("un botón alterna tema guarda la operación cambiar_tema", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina inicio en "/"\n  botón "Cambiar" alterna tema`)
        const boton = arbol.paginas[0].hijos[0] as any
        expect(boton.operacion).toBe("cambiar_tema")
        expect(boton.destino).toBe("cambiar_tema")
    })

})

describe("Parser — mostrar con componente como plantilla", () => {

    it("sin 'con', componentePlantilla queda indefinido", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina inicio en "/"\n  mostrar Producto recientes`)
        const mostrar = arbol.paginas[0].hijos[0] as any
        expect(mostrar.componentePlantilla).toBeUndefined()
    })

    it("parsea mostrar Modelo con NombreComponente", () => {
        const arbol = parsear(
            `aplicación MiApp\n\ncomponente TarjetaProducto\n  mostrar item.nombre\n\npágina inicio en "/"\n  mostrar Producto recientes\n    con TarjetaProducto`
        )
        const mostrar = arbol.paginas[0].hijos[0] as any
        expect(mostrar.componentePlantilla).toBe("TarjetaProducto")
    })

    it("con se puede combinar con otros modificadores en cualquier orden", () => {
        const arbol = parsear(
            `aplicación MiApp\n\ncomponente TarjetaProducto\n  mostrar item.nombre\n\npágina inicio en "/"\n  mostrar Producto recientes\n    máximo 8\n    con TarjetaProducto\n    ordenados por precio`
        )
        const mostrar = arbol.paginas[0].hijos[0] as any
        expect(mostrar.componentePlantilla).toBe("TarjetaProducto")
        expect(mostrar.modificadores).toHaveLength(3)
    })

})

describe("Parser — validación semántica de referencias", () => {

    it("un diseño existente no da error", () => {
        expect(() => parsear(
            `aplicación MiApp\n\ndiseño principal\n  título "Nav"\n\npágina inicio en "/"\n  diseño principal\n  título "Inicio"`
        )).not.toThrow()
    })

    it("un diseño que no existe lanza un error con las opciones disponibles", () => {
        expect(() => parsear(
            `aplicación MiApp\n\ndiseño principal\n  título "Nav"\n\npágina inicio en "/"\n  diseño principa\n  título "Inicio"`
        )).toThrow(/La página usa "diseño principa" pero no existe ningún diseño/)
    })

    it("sin ningún diseño declarado, referenciar uno también da error", () => {
        expect(() => parsear(
            `aplicación MiApp\n\npágina inicio en "/"\n  diseño principal\n  título "Inicio"`
        )).toThrow(/no existe ningún diseño/)
    })

    it("un componente existente (uso directo) no da error", () => {
        expect(() => parsear(
            `aplicación MiApp\n\ncomponente Tarjeta\n  mostrar item.nombre\n\npágina inicio en "/"\n  Tarjeta con producto`
        )).not.toThrow()
    })

    it("un componente inexistente (uso directo) lanza un error con las opciones disponibles", () => {
        expect(() => parsear(
            `aplicación MiApp\n\ncomponente Tarjeta\n  mostrar item.nombre\n\npágina inicio en "/"\n  TarjetaX con producto`
        )).toThrow(/"TarjetaX con \.\.\." usa un componente que no existe/)
    })

    it("un componente inexistente como plantilla de mostrar lanza error", () => {
        expect(() => parsear(
            `aplicación MiApp\n\npágina inicio en "/"\n  mostrar Producto recientes\n    con NoExiste`
        )).toThrow(/componente que no existe/)
    })

    it("valida referencias también dentro de un diseño, no solo en páginas", () => {
        expect(() => parsear(
            `aplicación MiApp\n\ndiseño principal\n  ComponenteFantasma con algo\n\npágina inicio en "/"\n  título "Inicio"`
        )).toThrow(/componente que no existe/)
    })

    it("valida referencias dentro de un bloque si/si no", () => {
        expect(() => parsear(
            `aplicación MiApp\n\npágina inicio en "/"\n  si el usuario está conectado\n    ComponenteFantasma con algo`
        )).toThrow(/componente que no existe/)
    })

})

describe("Parser — SEO y metadatos (v0.13)", () => {

    it("sin declarar dominio, queda indefinido", () => {
        const arbol = parsear(`aplicación MiApp`)
        expect(arbol.dominio).toBeUndefined()
    })

    it("parsea el dominio de la aplicación", () => {
        const arbol = parsear(`aplicación MiApp\n  dominio "https://mitienda.com"`)
        expect(arbol.dominio).toBe("https://mitienda.com")
    })

    it("parsea una imagen en una página", () => {
        const arbol = parsear(`aplicación MiApp\n\npágina inicio en "/"\n  imagen "https://mitienda.com/foto.jpg"`)
        const imagen = arbol.paginas[0].hijos[0] as any
        expect(imagen.tipo).toBe("imagen")
        expect(imagen.url).toBe("https://mitienda.com/foto.jpg")
    })

    it("un modelo puede tener un campo llamado 'imagen' sin romper el parseo", () => {
        const arbol = parsear(
            `aplicación MiApp\n\ndatos Producto\n  nombre: texto\n  imagen: foto\n  precio: número`
        )
        const campos = arbol.datos[0].campos
        expect(campos.length).toBe(3)
        expect(campos[1].nombre).toBe("imagen")
        expect(campos[1].tipoCampo).toBe("foto")
        expect(campos[2].nombre).toBe("precio")
    })

})
