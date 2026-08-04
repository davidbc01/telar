// ─────────────────────────────────────────────────────────────
// cli-servir.test.ts
// Tests de integración de "telar servir": levanta el servidor
// real y hace peticiones HTTP de verdad contra él.
// ─────────────────────────────────────────────────────────────

import { describe, it, expect, afterEach, vi } from "vitest"
import * as fs from "fs"
import * as path from "path"
import * as os from "os"
import { comandoServir } from "../src/cli"

let dirTemp: string | undefined
let handle: ReturnType<typeof comandoServir> | undefined

function silenciarConsola() {
    vi.spyOn(console, "log").mockImplementation(() => {})
    vi.spyOn(console, "error").mockImplementation(() => {})
}

// servidor.listen() no es instantáneo — esperar a que el puerto
// esté realmente escuchando antes de hacer peticiones
async function esperarServidor(servidor: { listening: boolean }) {
    for (let i = 0; i < 100 && !servidor.listening; i++) {
        await new Promise(r => setTimeout(r, 5))
    }
}

function crearProyecto(codigo: string): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "telar-servir-"))
    fs.writeFileSync(path.join(dir, "app.telar"), codigo)
    return dir
}

afterEach(() => {
    handle?.cerrar()
    handle = undefined
    if (dirTemp) fs.rmSync(dirTemp, { recursive: true, force: true })
    dirTemp = undefined
    vi.restoreAllMocks()
})

describe("CLI — telar servir (integración HTTP real)", () => {

    it("sirve una página estática real por HTTP", async () => {
        silenciarConsola()
        dirTemp = crearProyecto(`aplicación Prueba\n\npágina inicio en "/"\n  título "Hola"`)

        handle = comandoServir([path.join(dirTemp, "app.telar"), "-o", path.join(dirTemp, "dist"), "-p", "3900"])
        await esperarServidor(handle.servidor)

        const res = await fetch(`http://localhost:${handle.puerto}/`)
        const texto = await res.text()

        expect(res.status).toBe(200)
        expect(texto).toContain("Hola")
    })

    it("resuelve rutas dinámicas de verdad, no solo archivos estáticos", async () => {
        silenciarConsola()
        dirTemp = crearProyecto(`aplicación Prueba\n\npágina detalle en "/producto/(id)"\n  título "Detalle"`)

        handle = comandoServir([path.join(dirTemp, "app.telar"), "-o", path.join(dirTemp, "dist"), "-p", "3901"])
        await esperarServidor(handle.servidor)

        const res1 = await fetch(`http://localhost:${handle.puerto}/producto/42`)
        const res2 = await fetch(`http://localhost:${handle.puerto}/producto/999`)

        expect(res1.status).toBe(200)
        expect(res2.status).toBe(200)
        expect(await res1.text()).toContain("Detalle")
    })

    it("una ruta estática normal sigue funcionando junto a las dinámicas", async () => {
        silenciarConsola()
        dirTemp = crearProyecto(
            `aplicación Prueba\n\npágina inicio en "/"\n  título "Inicio"\n\npágina detalle en "/producto/(id)"\n  título "Detalle"`
        )

        handle = comandoServir([path.join(dirTemp, "app.telar"), "-o", path.join(dirTemp, "dist"), "-p", "3902"])
        await esperarServidor(handle.servidor)

        const res = await fetch(`http://localhost:${handle.puerto}/`)
        expect(res.status).toBe(200)
        expect(await res.text()).toContain("Inicio")
    })

    it("una ruta estática de varios segmentos se sirve bien, no como carpeta anidada (regresión pre-v1.0)", async () => {
        silenciarConsola()
        dirTemp = crearProyecto(
            `aplicación Prueba\n\npágina detalle en "/blog/mi-articulo"\n  título "Mi artículo"`
        )

        handle = comandoServir([path.join(dirTemp, "app.telar"), "-o", path.join(dirTemp, "dist"), "-p", "3907"])
        await esperarServidor(handle.servidor)

        const res = await fetch(`http://localhost:${handle.puerto}/blog/mi-articulo`)
        expect(res.status).toBe(200)
        expect(await res.text()).toContain("Mi artículo")
    })

    it("devuelve 404 para una ruta que no existe", async () => {
        silenciarConsola()
        dirTemp = crearProyecto(`aplicación Prueba\n\npágina inicio en "/"\n  título "Hola"`)

        handle = comandoServir([path.join(dirTemp, "app.telar"), "-o", path.join(dirTemp, "dist"), "-p", "3903"])
        await esperarServidor(handle.servidor)

        const res = await fetch(`http://localhost:${handle.puerto}/esto-no-existe`)
        expect(res.status).toBe(404)
    })

    it("sirve el CSS y el JS generados con el content-type correcto", async () => {
        silenciarConsola()
        dirTemp = crearProyecto(`aplicación Prueba\n\npágina inicio en "/"\n  título "Hola"`)

        handle = comandoServir([path.join(dirTemp, "app.telar"), "-o", path.join(dirTemp, "dist"), "-p", "3904"])
        await esperarServidor(handle.servidor)

        const resCSS = await fetch(`http://localhost:${handle.puerto}/telar.css`)
        const resJS = await fetch(`http://localhost:${handle.puerto}/telar.js`)

        expect(resCSS.headers.get("content-type")).toContain("text/css")
        expect(resJS.headers.get("content-type")).toContain("javascript")
    })

    it("inyecta el script de live reload en el HTML servido", async () => {
        silenciarConsola()
        dirTemp = crearProyecto(`aplicación Prueba\n\npágina inicio en "/"\n  título "Hola"`)

        handle = comandoServir([path.join(dirTemp, "app.telar"), "-o", path.join(dirTemp, "dist"), "-p", "3905"])
        await esperarServidor(handle.servidor)

        const res = await fetch(`http://localhost:${handle.puerto}/`)
        const texto = await res.text()

        expect(texto).toContain(`ws://localhost:${handle.puertoWS}`)
    })

    it("recompila y sirve el cambio al modificar el archivo .telar", async () => {
        silenciarConsola()
        dirTemp = crearProyecto(`aplicación Prueba\n\npágina inicio en "/"\n  título "Antes"`)

        handle = comandoServir([path.join(dirTemp, "app.telar"), "-o", path.join(dirTemp, "dist"), "-p", "3906"])
        await esperarServidor(handle.servidor)

        fs.writeFileSync(path.join(dirTemp, "app.telar"), `aplicación Prueba\n\npágina inicio en "/"\n  título "Después"`)

        // El watcher hace debounce de 100ms antes de recompilar
        await new Promise(r => setTimeout(r, 400))

        const res = await fetch(`http://localhost:${handle.puerto}/`)
        const texto = await res.text()

        expect(texto).toContain("Después")
        expect(texto).not.toContain("Antes")
    })

})
