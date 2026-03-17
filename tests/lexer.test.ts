// ---
// lexer.test.ts
// Tests del lexer de Telar.
// Ejecutar con: npm test
// ---

import { describe, it, expect } from "vitest"
import { Lexer } from "../src/lexer"
import { TipoToken } from "../src/tipos"
 
describe("Lexer — casos básicos", () => {

    it("tokeniza una declaración de aplicación", () => {
        const tokens = new Lexer("aplicación MiApp").tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Aplicacion)
        expect(tokens[1].tipo).toBe(TipoToken.Nombre)
        expect(tokens[1].valor).toBe("MiApp")
    })

    it("tokeniza texto entre comillas", () => {
        const tokens = new Lexer(`título "Bienvenido"`).tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Titulo)
        expect(tokens[1].tipo).toBe(TipoToken.Texto)
        expect(tokens[1].valor).toBe("Bienvenido")
    })

    it("tokeniza un número", () => {
        const tokens = new Lexer("máximo 8").tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Maximo)
        expect(tokens[1].tipo).toBe(TipoToken.Numero)
        expect(tokens[1].valor).toBe("8")
    })

    it("ignora comentarios", () => {
        const tokens = new Lexer("# esto es un comentario\naplicación MiApp").tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Aplicacion)
    })

    it("acepta palabras con tildes y ñ", () => {
        const tokens = new Lexer("página inicio").tokenizar()
        expect(tokens[0].tipo).toBe(TipoToken.Pagina)
    })

    it("lanza error con texto sin cerrar", () => {
        expect(() => new Lexer(`título "sin cerrar`).tokenizar()).toThrow()
    })

})
