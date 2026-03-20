// ---
// lexer.test.ts
// Tests del lexer de Telar.
// Ejecutar con: npm test
// ---

import { describe, it, expect } from "vitest"
import { Lexer } from "../src/lexer"
import { TipoToken } from "../src/tipos"
 
describe("Lexer — palabras clave de estructura", () => {
 
    it("tokeniza aplicación", () => {
        const tokens = new Lexer("aplicación MiApp").tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Aplicacion)
        expect(tokens[1].tipo).toBe(TipoToken.Nombre)
        expect(tokens[1].valor).toBe("MiApp")
    })
    
    it("tokeniza aplicacion sin tilde", () => {
        const tokens = new Lexer("aplicacion MiApp").tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Aplicacion)
    })
    
    it("tokeniza página", () => {
        const tokens = new Lexer('página inicio en "/"').tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Pagina)
        expect(tokens[1].tipo).toBe(TipoToken.Identificador)
        expect(tokens[2].tipo).toBe(TipoToken.En)
        expect(tokens[3].tipo).toBe(TipoToken.Texto)
        expect(tokens[3].valor).toBe("/")
    })
    
    it("tokeniza datos", () => {
        const tokens = new Lexer("datos Producto").tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Datos)
        expect(tokens[1].tipo).toBe(TipoToken.Nombre)
        expect(tokens[1].valor).toBe("Producto")
    })
 
})
 
describe("Lexer — palabras clave de contenido", () => {
 
    it("tokeniza título con texto", () => {
        const tokens = new Lexer(`título "Bienvenido"`).tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Titulo)
        expect(tokens[1].tipo).toBe(TipoToken.Texto)
        expect(tokens[1].valor).toBe("Bienvenido")
    })
    
    it("tokeniza descripción", () => {
        const tokens = new Lexer(`descripción "Mi app"`).tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Descripcion)
        expect(tokens[1].valor).toBe("Mi app")
    })
    
    it("tokeniza mostrar", () => {
        const tokens = new Lexer("mostrar Producto").tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Mostrar)
        expect(tokens[1].tipo).toBe(TipoToken.Nombre)
    })
    
    it("tokeniza botón", () => {
        const tokens = new Lexer(`botón "Entrar" ir a login`).tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Boton)
        expect(tokens[1].tipo).toBe(TipoToken.Texto)
        expect(tokens[1].valor).toBe("Entrar")
        expect(tokens[2].tipo).toBe(TipoToken.Ir)
    })
    
    it("tokeniza campo", () => {
        const tokens = new Lexer(`campo "Correo" tipo email`).tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Campo)
        expect(tokens[1].tipo).toBe(TipoToken.Texto)
        expect(tokens[2].tipo).toBe(TipoToken.Tipo)
    })
 
})
 
describe("Lexer — palabras clave de lógica", () => {
 
    it("tokeniza si el usuario está conectado", () => {
        const tokens = new Lexer("si el usuario está conectado").tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Si)
        expect(tokens[1].tipo).toBe(TipoToken.El)
    })
    
    it("tokeniza si no", () => {
        const tokens = new Lexer("si no").tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Si)
        expect(tokens[1].tipo).toBe(TipoToken.SiNo)
    })
    
    it("tokeniza si falla", () => {
        const tokens = new Lexer("si falla").tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Si)
        expect(tokens[1].tipo).toBe(TipoToken.Falla)
    })
    
    it("tokeniza si funciona", () => {
        const tokens = new Lexer("si funciona").tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Si)
        expect(tokens[1].tipo).toBe(TipoToken.Funciona)
    })
    
    it("tokeniza hay resultados", () => {
        const tokens = new Lexer("si hay resultados").tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Si)
        expect(tokens[1].tipo).toBe(TipoToken.Hay)
    })
 
})
 
describe("Lexer — modificadores", () => {
 
    it("tokeniza máximo con número", () => {
        const tokens = new Lexer("máximo 8").tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Maximo)
        expect(tokens[1].tipo).toBe(TipoToken.Numero)
        expect(tokens[1].valor).toBe("8")
    })
    
    it("tokeniza ordenados por", () => {
        const tokens = new Lexer("ordenados por fecha").tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Ordenados)
        expect(tokens[1].tipo).toBe(TipoToken.Por)
        expect(tokens[2].tipo).toBe(TipoToken.Identificador)
    })
    
    it("tokeniza caché con minutos", () => {
        const tokens = new Lexer("caché 10 minutos").tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Cache)
        expect(tokens[1].tipo).toBe(TipoToken.Numero)
        expect(tokens[2].tipo).toBe(TipoToken.Minutos)
    })
    
    it("tokeniza optimizar para móvil", () => {
        const tokens = new Lexer("optimizar para móvil").tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Optimizar)
        expect(tokens[1].tipo).toBe(TipoToken.Para)
        expect(tokens[2].tipo).toBe(TipoToken.Movil)
    })
    
    it("tokeniza reintentar en segundos", () => {
        const tokens = new Lexer("reintentar en 5 segundos").tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Reintentar)
        expect(tokens[1].tipo).toBe(TipoToken.En)
        expect(tokens[2].tipo).toBe(TipoToken.Numero)
        expect(tokens[3].tipo).toBe(TipoToken.Segundos)
    })
    
    it("tokeniza usar", () => {
        const tokens = new Lexer("usar navbar").tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Usar)
        expect(tokens[1].tipo).toBe(TipoToken.Identificador)
        expect(tokens[1].valor).toBe("navbar")
    })
 
})
 
describe("Lexer — valores", () => {
 
    it("tokeniza texto entre comillas", () => {
        const tokens = new Lexer(`"Hola mundo"`).tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Texto)
        expect(tokens[0].valor).toBe("Hola mundo")
    })
    
    it("tokeniza texto con caracteres especiales", () => {
        const tokens = new Lexer(`"¿Olvidaste tu contraseña?"`).tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Texto)
        expect(tokens[0].valor).toBe("¿Olvidaste tu contraseña?")
    })
    
    it("tokeniza número entero", () => {
        const tokens = new Lexer("42").tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Numero)
        expect(tokens[0].valor).toBe("42")
    })
    
    it("tokeniza número decimal", () => {
        const tokens = new Lexer("3.14").tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Numero)
        expect(tokens[0].valor).toBe("3.14")
    })
    
    it("tokeniza nombre propio con mayúscula", () => {
        const tokens = new Lexer("MiTienda").tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Nombre)
        expect(tokens[0].valor).toBe("MiTienda")
    })
    
    it("tokeniza identificador con punto", () => {
        const tokens = new Lexer("producto.nombre").tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Identificador)
        expect(tokens[0].valor).toBe("producto.nombre")
    })
 
})
 
describe("Lexer — indentación", () => {
 
    it("genera token INDENTACION al aumentar nivel", () => {
        const tokens = new Lexer("aplicación MiApp\n  idioma español").tokenizar()
        expect(tokens.some(t => t.tipo === TipoToken.Indentacion)).toBe(true)
    })
    
    it("genera token FIN_INDENTACION al bajar nivel", () => {
        const tokens = new Lexer("aplicación MiApp\n  idioma español\ndatos Producto").tokenizar()
        expect(tokens.some(t => t.tipo === TipoToken.FinIndentacion)).toBe(true)
    })
 
})
 
describe("Lexer — comentarios y caracteres especiales", () => {
 
    it("ignora comentarios", () => {
        const tokens = new Lexer("# esto es un comentario\naplicación MiApp").tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Aplicacion)
    })
    
    it("ignora comentarios con caracteres unicode", () => {
        const tokens = new Lexer("# ── Sección ──────\naplicación MiApp").tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Aplicacion)
    })
    
    it("maneja saltos de línea Windows \\r\\n", () => {
        const tokens = new Lexer("aplicación MiApp\r\n  idioma español").tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Aplicacion)
    })
    
    it("acepta tildes en palabras clave", () => {
        const tokens = new Lexer("página título descripción máximo caché móvil").tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Pagina)
        expect(tokens[1].tipo).toBe(TipoToken.Titulo)
        expect(tokens[2].tipo).toBe(TipoToken.Descripcion)
        expect(tokens[3].tipo).toBe(TipoToken.Maximo)
        expect(tokens[4].tipo).toBe(TipoToken.Cache)
        expect(tokens[5].tipo).toBe(TipoToken.Movil)
    })
    
    it("acepta ñ en palabras", () => {
        const tokens = new Lexer("español").tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Identificador)
        expect(tokens[0].valor).toBe("español")
    })
 
})
 
describe("Lexer — errores", () => {
 
    it("lanza error con texto sin cerrar", () => {
        expect(() => new Lexer(`título "sin cerrar`).tokenizar()).toThrow()
    })
    
    it("el error incluye número de línea", () => {
        try {
            new Lexer(`título "sin cerrar`).tokenizar()
        } catch (e: any) {
            expect(e.linea).toBeDefined()
        }
    })
    
    it("el error incluye sugerencia", () => {
        try {
            new Lexer(`título "sin cerrar`).tokenizar()
        } catch (e: any) {
            expect(e.sugerencia).toBeDefined()
        }
    })
 
})
