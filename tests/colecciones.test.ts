// ─────────────────────────────────────────────────────────────
// colecciones.test.ts
// Tests de colecciones de contenido (Markdown): parseo de
// frontmatter, conversión a HTML, y generación de un archivo
// real por cada elemento — con archivos .md de verdad en disco.
// ─────────────────────────────────────────────────────────────

import { describe, it, expect, afterEach } from "vitest"
import * as fs from "fs"
import * as path from "path"
import * as os from "os"
import { Lexer } from "../src/lexer"
import { Parser } from "../src/parser"
import { Generador } from "../src/generador"

let dirTemp: string | undefined

afterEach(() => {
    if (dirTemp) fs.rmSync(dirTemp, { recursive: true, force: true })
    dirTemp = undefined
})

function crearProyecto(articulos: Record<string, string>): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "telar-coleccion-"))
    const carpeta = path.join(dir, "contenido", "articulos")
    fs.mkdirSync(carpeta, { recursive: true })
    for (const [nombre, contenido] of Object.entries(articulos)) {
        fs.writeFileSync(path.join(carpeta, nombre), contenido)
    }
    return dir
}

function compilarEnDisco(dir: string, codigo: string) {
    const tokens = new Lexer(codigo).tokenizar()
    const arbol = new Parser(tokens).parsear()
    return new Generador(arbol, dir).generar()
}

describe("Parser — colecciones de contenido", () => {

    it("parsea la declaración de una colección", () => {
        const tokens = new Lexer(`aplicación MiApp\n\ncolección Articulos en "contenido/articulos"`).tokenizar()
        const arbol = new Parser(tokens).parsear()
        expect(arbol.colecciones).toEqual([
            { tipo: "coleccion", nombre: "Articulos", ruta: "contenido/articulos", linea: 3 }
        ])
    })

    it("parsea listar sin modificadores", () => {
        const tokens = new Lexer(
            `aplicación MiApp\n\ncolección Articulos en "contenido/articulos"\n\npágina blog en "/blog"\n  listar Articulos`
        ).tokenizar()
        const arbol = new Parser(tokens).parsear()
        const listar = arbol.paginas[0].hijos[0] as any
        expect(listar.tipo).toBe("listar")
        expect(listar.coleccion).toBe("Articulos")
        expect(listar.modificadores).toEqual([])
    })

    it("parsea listar con máximo y ordenados por", () => {
        const tokens = new Lexer(
            `aplicación MiApp\n\ncolección Articulos en "contenido/articulos"\n\npágina blog en "/blog"\n  listar Articulos\n    ordenados por fecha\n    máximo 5`
        ).tokenizar()
        const arbol = new Parser(tokens).parsear()
        const listar = arbol.paginas[0].hijos[0] as any
        expect(listar.modificadores).toContainEqual({ tipo: "ordenados", campo: "fecha" })
        expect(listar.modificadores).toContainEqual({ tipo: "maximo", cantidad: 5 })
    })

    it("parsea artículo dentro de una página con ruta dinámica", () => {
        const tokens = new Lexer(
            `aplicación MiApp\n\ncolección Articulos en "contenido/articulos"\n\npágina detalle en "/blog/(slug)"\n  artículo Articulos`
        ).tokenizar()
        const arbol = new Parser(tokens).parsear()
        const nodo = arbol.paginas[0].hijos[0] as any
        expect(nodo.tipo).toBe("articulo_coleccion")
        expect(nodo.coleccion).toBe("Articulos")
    })

    it("una página puede llamarse igual que la palabra clave 'articulo' (regresión)", () => {
        const tokens = new Lexer(
            `aplicación MiApp\n\ncolección Articulos en "contenido/articulos"\n\npágina articulo en "/blog/(slug)"\n  artículo Articulos`
        ).tokenizar()
        expect(() => new Parser(tokens).parsear()).not.toThrow()
    })

    it("listar con una colección inexistente es un error de compilación", () => {
        const tokens = new Lexer(
            `aplicación MiApp\n\npágina blog en "/blog"\n  listar NoExiste`
        ).tokenizar()
        expect(() => new Parser(tokens).parsear()).toThrow(/colección "NoExiste" pero no existe/)
    })

    it("artículo con una colección inexistente es un error de compilación", () => {
        const tokens = new Lexer(
            `aplicación MiApp\n\npágina detalle en "/blog/(slug)"\n  artículo NoExiste`
        ).tokenizar()
        expect(() => new Parser(tokens).parsear()).toThrow(/colección "NoExiste" pero no existe/)
    })

    it("artículo en una página sin ruta dinámica es un error de compilación", () => {
        const tokens = new Lexer(
            `aplicación MiApp\n\ncolección Articulos en "contenido/articulos"\n\npágina detalle en "/blog"\n  artículo Articulos`
        ).tokenizar()
        expect(() => new Parser(tokens).parsear()).toThrow(/no tiene ningún segmento dinámico/)
    })

})

describe("Generador — colecciones de contenido (con archivos .md reales)", () => {

    it("genera un archivo HTML real por cada elemento de la colección", () => {
        dirTemp = crearProyecto({
            "uno.md": `---\ntítulo: Primero\n---\nContenido uno.`,
            "dos.md": `---\ntítulo: Segundo\n---\nContenido dos.`
        })
        const archivos = compilarEnDisco(
            dirTemp,
            `aplicación MiApp\n\ncolección Articulos en "contenido/articulos"\n\npágina detalle en "/blog/(slug)"\n  artículo Articulos`
        )
        expect(archivos.find(a => a.nombre === 'blog-uno.html')).toBeDefined()
        expect(archivos.find(a => a.nombre === 'blog-dos.html')).toBeDefined()
    })

    it("no genera el archivo genérico compartido de rutas dinámicas", () => {
        dirTemp = crearProyecto({ "uno.md": `---\ntítulo: Uno\n---\nHola.` })
        const archivos = compilarEnDisco(
            dirTemp,
            `aplicación MiApp\n\ncolección Articulos en "contenido/articulos"\n\npágina detalle en "/blog/(slug)"\n  artículo Articulos`
        )
        expect(archivos.find(a => a.nombre === 'blog-slug.html')).toBeUndefined()
    })

    it("el frontmatter título se usa como <title> real de cada artículo", () => {
        dirTemp = crearProyecto({ "uno.md": `---\ntítulo: Un título concreto\n---\nContenido.` })
        const archivos = compilarEnDisco(
            dirTemp,
            `aplicación MiApp\n\ncolección Articulos en "contenido/articulos"\n\npágina detalle en "/blog/(slug)"\n  artículo Articulos`
        )
        const html = archivos.find(a => a.nombre === 'blog-uno.html')!.contenido
        expect(html).toContain('<title>Un título concreto</title>')
    })

    it("convierte Markdown básico a HTML: negrita, cursiva, código, encabezados, listas, citas, enlaces", () => {
        dirTemp = crearProyecto({
            "uno.md": `---\ntítulo: Prueba\n---\n**negrita** y *cursiva* y \`código\`\n\n## Subtítulo\n\n- item uno\n- item dos\n\n> una cita\n\n[link](https://x.com)`
        })
        const archivos = compilarEnDisco(
            dirTemp,
            `aplicación MiApp\n\ncolección Articulos en "contenido/articulos"\n\npágina detalle en "/blog/(slug)"\n  artículo Articulos`
        )
        const html = archivos.find(a => a.nombre === 'blog-uno.html')!.contenido
        expect(html).toContain('<strong>negrita</strong>')
        expect(html).toContain('<em>cursiva</em>')
        expect(html).toContain('<code>código</code>')
        expect(html).toContain('<h2>Subtítulo</h2>')
        expect(html).toContain('<li>item uno</li>')
        expect(html).toContain('<blockquote>una cita</blockquote>')
        expect(html).toContain('<a href="https://x.com">link</a>')
    })

    it("listar enlaza a la URL real de cada artículo", () => {
        dirTemp = crearProyecto({ "mi-post.md": `---\ntítulo: Mi post\n---\nHola.` })
        const archivos = compilarEnDisco(
            dirTemp,
            `aplicación MiApp\n\ncolección Articulos en "contenido/articulos"\n\npágina blog en "/blog"\n  listar Articulos\n\npágina detalle en "/blog/(slug)"\n  artículo Articulos`
        )
        const html = archivos.find(a => a.nombre === 'blog.html')!.contenido
        expect(html).toContain('href="/blog/mi-post"')
        expect(html).toContain('Mi post')
    })

    it("listar con 'ordenados por fecha' pone lo más reciente primero", () => {
        dirTemp = crearProyecto({
            "viejo.md": `---\ntítulo: Viejo\nfecha: 2026-01-01\n---\nA.`,
            "nuevo.md": `---\ntítulo: Nuevo\nfecha: 2026-06-01\n---\nB.`
        })
        const archivos = compilarEnDisco(
            dirTemp,
            `aplicación MiApp\n\ncolección Articulos en "contenido/articulos"\n\npágina blog en "/blog"\n  listar Articulos\n    ordenados por fecha`
        )
        const html = archivos.find(a => a.nombre === 'blog.html')!.contenido
        expect(html.indexOf('Nuevo')).toBeLessThan(html.indexOf('Viejo'))
    })

    it("listar con 'máximo' limita cuántos elementos se muestran", () => {
        dirTemp = crearProyecto({
            "uno.md": `---\ntítulo: Uno\n---\nA.`,
            "dos.md": `---\ntítulo: Dos\n---\nB.`,
            "tres.md": `---\ntítulo: Tres\n---\nC.`
        })
        const archivos = compilarEnDisco(
            dirTemp,
            `aplicación MiApp\n\ncolección Articulos en "contenido/articulos"\n\npágina blog en "/blog"\n  listar Articulos\n    máximo 2`
        )
        const html = archivos.find(a => a.nombre === 'blog.html')!.contenido
        const coincidencias = html.match(/articulo-item/g) ?? []
        expect(coincidencias.length).toBe(2)
    })

    it("el sitemap incluye la URL real de cada artículo, no una plantilla", () => {
        dirTemp = crearProyecto({ "mi-post.md": `---\ntítulo: Mi post\n---\nHola.` })
        fs.writeFileSync(path.join(dirTemp, "telar.config.json"), JSON.stringify({ dominio: "https://x.com" }))
        const archivos = compilarEnDisco(
            dirTemp,
            `aplicación MiApp\n\ncolección Articulos en "contenido/articulos"\n\npágina detalle en "/blog/(slug)"\n  artículo Articulos`
        )
        const sitemap = archivos.find(a => a.nombre === 'sitemap.xml')!.contenido
        expect(sitemap).toContain('https://x.com/blog/mi-post')
    })

    it("sin carpeta de contenido, la colección se trata como vacía sin romper la compilación", () => {
        dirTemp = fs.mkdtempSync(path.join(os.tmpdir(), "telar-coleccion-vacia-"))
        expect(() => compilarEnDisco(
            dirTemp!,
            `aplicación MiApp\n\ncolección Articulos en "contenido/no-existe"\n\npágina blog en "/blog"\n  listar Articulos`
        )).not.toThrow()
    })

})
