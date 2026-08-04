// ─────────────────────────────────────────────────────────────
// cli.test.ts
// Tests de los comandos del CLI de Telar.
// Ejecutar con: npm test
// ─────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import * as fs from "fs"
import * as path from "path"
import * as os from "os"
import { comandoNuevo, comandoCompilar, comandoVerificar } from "../src/cli"

let dirTemp: string

beforeEach(() => {
    // Carpeta temporal aislada por test, para no ensuciar el repo real
    dirTemp = fs.mkdtempSync(path.join(os.tmpdir(), "telar-test-"))
})

afterEach(() => {
    fs.rmSync(dirTemp, { recursive: true, force: true })
    vi.restoreAllMocks()
})

// Los comandos escriben por consola — la silenciamos para que el
// resultado de los tests no se llene de ruido
function silenciarConsola() {
    vi.spyOn(console, "log").mockImplementation(() => {})
    vi.spyOn(console, "error").mockImplementation(() => {})
}

// process.exit(1) terminaría el propio proceso de test si no se
// intercepta — lo convertimos en una excepción normal y comprobable
function interceptarSalida() {
    return vi.spyOn(process, "exit").mockImplementation(((codigo?: number) => {
        throw new Error(`process.exit(${codigo})`)
    }) as never)
}

describe("CLI — telar nuevo", () => {

    it("crea la estructura de carpetas y archivos esperada", () => {
        silenciarConsola()
        const carpeta = path.join(dirTemp, "mi-proyecto")
        comandoNuevo([carpeta])

        expect(fs.existsSync(path.join(carpeta, "telar.config.json"))).toBe(true)
        expect(fs.existsSync(path.join(carpeta, "src", "app.telar"))).toBe(true)
        expect(fs.existsSync(path.join(carpeta, "src", "paginas", "inicio.telar"))).toBe(true)
        expect(fs.existsSync(path.join(carpeta, "public", "estilos.css"))).toBe(true)
        expect(fs.existsSync(path.join(carpeta, "README.md"))).toBe(true)
    })

    it("respeta rutas absolutas — no las trata como segmento relativo", () => {
        silenciarConsola()
        const carpeta = path.join(dirTemp, "proyecto-absoluto")
        comandoNuevo([carpeta])

        // Antes del fix, path.join(process.cwd(), carpeta) las creaba
        // dentro de process.cwd() en vez de en la ruta absoluta real
        expect(fs.existsSync(path.join(carpeta, "src", "app.telar"))).toBe(true)
    })

    it("el nombre de la aplicación generado es válido, no la ruta completa", () => {
        silenciarConsola()
        const carpeta = path.join(dirTemp, "mi-proyecto-genial")
        comandoNuevo([carpeta])

        const contenido = fs.readFileSync(path.join(carpeta, "src", "app.telar"), "utf-8")
        expect(contenido).toContain("aplicación MiProyectoGenial")
        expect(contenido).toMatch(/^aplicación MiProyectoGenial$/m)
    })

    it("el proyecto generado compila sin errores", () => {
        silenciarConsola()
        const carpeta = path.join(dirTemp, "proyecto-compilable")
        comandoNuevo([carpeta])

        const salida = path.join(carpeta, "dist")
        comandoCompilar([path.join(carpeta, "src", "app.telar"), "-o", salida])

        expect(fs.existsSync(path.join(salida, "index.html"))).toBe(true)
        expect(fs.existsSync(path.join(salida, "sobre-nosotros.html"))).toBe(true)
    })

    it("el idioma del telar.config.json generado se refleja en el HTML", () => {
        silenciarConsola()
        const carpeta = path.join(dirTemp, "proyecto-idioma")
        comandoNuevo([carpeta])

        const salida = path.join(carpeta, "dist")
        comandoCompilar([path.join(carpeta, "src", "app.telar"), "-o", salida])

        const html = fs.readFileSync(path.join(salida, "index.html"), "utf-8")
        expect(html).toContain('lang="es"')
    })

    it("falla si la carpeta ya existe", () => {
        silenciarConsola()
        const salir = interceptarSalida()
        const carpeta = path.join(dirTemp, "ya-existe")
        fs.mkdirSync(carpeta)

        expect(() => comandoNuevo([carpeta])).toThrow()
        expect(salir).toHaveBeenCalledWith(1)
    })

})

describe("CLI — telar compilar", () => {

    it("compila un proyecto válido y genera los archivos esperados", () => {
        silenciarConsola()
        const archivo = path.join(dirTemp, "app.telar")
        fs.writeFileSync(archivo, `aplicación Prueba\n\npágina inicio en "/"\n  título "Hola"`)
        const salida = path.join(dirTemp, "dist")

        comandoCompilar([archivo, "-o", salida])

        expect(fs.existsSync(path.join(salida, "index.html"))).toBe(true)
        expect(fs.existsSync(path.join(salida, "telar.css"))).toBe(true)
        expect(fs.existsSync(path.join(salida, "telar.js"))).toBe(true)
    })

    it("falla con un error de sintaxis si el .telar es inválido", () => {
        silenciarConsola()
        const salir = interceptarSalida()
        const archivo = path.join(dirTemp, "app.telar")
        fs.writeFileSync(archivo, `aplicación\n\npágina inicio en "/"`)

        expect(() => comandoCompilar([archivo])).toThrow()
        expect(salir).toHaveBeenCalledWith(1)
    })

    it("falla si el archivo no existe", () => {
        silenciarConsola()
        const salir = interceptarSalida()

        expect(() => comandoCompilar([path.join(dirTemp, "no-existe.telar")])).toThrow()
        expect(salir).toHaveBeenCalledWith(1)
    })

    it("falla si el archivo no tiene extensión .telar", () => {
        silenciarConsola()
        const salir = interceptarSalida()
        const archivo = path.join(dirTemp, "app.txt")
        fs.writeFileSync(archivo, "algo")

        expect(() => comandoCompilar([archivo])).toThrow()
        expect(salir).toHaveBeenCalledWith(1)
    })

})

describe("CLI — telar verificar", () => {

    it("no falla con un archivo sintácticamente correcto", () => {
        silenciarConsola()
        const archivo = path.join(dirTemp, "app.telar")
        fs.writeFileSync(archivo, `aplicación Prueba\n\npágina inicio en "/"\n  título "Hola"`)

        expect(() => comandoVerificar([archivo])).not.toThrow()
    })

    it("falla con un error de sintaxis", () => {
        silenciarConsola()
        const salir = interceptarSalida()
        const archivo = path.join(dirTemp, "app.telar")
        fs.writeFileSync(archivo, `aplicación\n\npágina inicio en "/"`)

        expect(() => comandoVerificar([archivo])).toThrow()
        expect(salir).toHaveBeenCalledWith(1)
    })

})

describe("CLI — telar.config.json y estructura src/public", () => {

    it("encuentra telar.config.json subiendo desde src/, no solo en la carpeta del app.telar", () => {
        silenciarConsola()
        fs.mkdirSync(path.join(dirTemp, "src"), { recursive: true })
        fs.writeFileSync(path.join(dirTemp, "telar.config.json"), JSON.stringify({ idioma: "inglés" }))
        fs.writeFileSync(
            path.join(dirTemp, "src", "app.telar"),
            `aplicación Prueba\n\npágina inicio en "/"\n  título "Hola"`
        )

        const salida = path.join(dirTemp, "dist")
        comandoCompilar([path.join(dirTemp, "src", "app.telar"), "-o", salida])

        const html = fs.readFileSync(path.join(salida, "index.html"), "utf-8")
        expect(html).toContain('lang="en"')
    })

    it("copia todo lo que haya en public/ al resultado, excepto estilos.css", () => {
        silenciarConsola()
        fs.mkdirSync(path.join(dirTemp, "src"), { recursive: true })
        fs.mkdirSync(path.join(dirTemp, "public"), { recursive: true })
        fs.writeFileSync(path.join(dirTemp, "public", "estilos.css"), "body { color: red; }")
        fs.writeFileSync(path.join(dirTemp, "public", "robots-a-mano.txt"), "contenido de prueba")
        fs.writeFileSync(
            path.join(dirTemp, "src", "app.telar"),
            `aplicación Prueba\n\npágina inicio en "/"\n  título "Hola"`
        )

        const salida = path.join(dirTemp, "dist")
        comandoCompilar([path.join(dirTemp, "src", "app.telar"), "-o", salida])

        expect(fs.existsSync(path.join(salida, "robots-a-mano.txt"))).toBe(true)
        // estilos.css no se copia tal cual — ya se copió como telar.css
        expect(fs.existsSync(path.join(salida, "estilos.css"))).toBe(false)
        const css = fs.readFileSync(path.join(salida, "telar.css"), "utf-8")
        expect(css).toContain("color: red")
    })

    it("sin telar.config.json, sigue compilando con los valores por defecto", () => {
        silenciarConsola()
        fs.mkdirSync(path.join(dirTemp, "src"), { recursive: true })
        fs.writeFileSync(
            path.join(dirTemp, "src", "app.telar"),
            `aplicación Prueba\n\npágina inicio en "/"\n  título "Hola"`
        )

        const salida = path.join(dirTemp, "dist")
        expect(() => comandoCompilar([path.join(dirTemp, "src", "app.telar"), "-o", salida])).not.toThrow()
        expect(fs.existsSync(path.join(salida, "index.html"))).toBe(true)
    })

})
