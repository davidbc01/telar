// ---
// paquetes.ts
// Gestor de paquetes de Telar.
// Los paquetes son repositorios de GitHub con prefijo telar-
// ---

import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'

const CARPETA_PAQUETES = 'paquetes'
const PREFIJO = 'telar-'
const ORG_OFICIAL = 'davidbc01'

export interface InfoPaquete {
    nombre: string
    repo: string
    version: string
    descripcion: string
}

// --- Instalar paquete ---

export async function instalarPaquete(nombre: string): Promise<void> {
    const { usuario, repo } = resolverNombre(nombre)
    
    console.log(`\n📦  Instalando ${repo}...\n`)
    
    const info = await obtenerInfoRepo(usuario, repo)
    if (!info) {
        throw new Error(
        `No se encontró el paquete "${nombre}"\n` +
        `   Comprueba que existe en github.com/${usuario}/${repo}`
        )
    }
    
    if (!fs.existsSync(CARPETA_PAQUETES)) {
        fs.mkdirSync(CARPETA_PAQUETES, { recursive: true })
    }
    
    const carpetaDestino = path.join(CARPETA_PAQUETES, nombreCorto(nombre))
    await descargarPaquete(usuario, repo, carpetaDestino)
    
    registrarPaquete({
        nombre: nombreCorto(nombre),
        repo: `${usuario}/${repo}`,
        version: info.version ?? 'latest',
        descripcion: info.descripcion ?? ''
    })
    
    console.log(`✓  ${nombreCorto(nombre)} instalado en ${carpetaDestino}/`)
    console.log(`\n   Úsalo en tu app.telar:\n`)
    console.log(`   usar ${nombreCorto(nombre)}\n`)
}

// --- Listar paquetes instalados ---

export function listarPaquetes(): void {
    const archivo = 'telar.paquetes.json'
    
    if (!fs.existsSync(archivo)) {
        console.log('\n   No hay paquetes instalados todavía.')
        console.log('   Prueba: telar añadir formulario\n')
        return
    }
    
    const paquetes: InfoPaquete[] = JSON.parse(fs.readFileSync(archivo, 'utf-8'))
    
    if (paquetes.length === 0) {
        console.log('\n   No hay paquetes instalados todavía.\n')
        return
    }
    
    console.log(`\n📦  Paquetes instalados (${paquetes.length}):\n`)
    paquetes.forEach(p => {
        console.log(`   · ${p.nombre.padEnd(24)} ${p.version.padEnd(12)} ${p.descripcion}`)
    })
    console.log()
}

// --- Eliminar paquete ---

export function eliminarPaquete(nombre: string): void {
    const corto = nombreCorto(nombre)
    const carpeta = path.join(CARPETA_PAQUETES, corto)
    
    if (!fs.existsSync(carpeta)) {
        throw new Error(`El paquete "${corto}" no está instalado`)
    }
    
    fs.rmSync(carpeta, { recursive: true, force: true })
    
    const archivo = 'telar.paquetes.json'
    if (fs.existsSync(archivo)) {
        const paquetes: InfoPaquete[] = JSON.parse(fs.readFileSync(archivo, 'utf-8'))
        const nuevos = paquetes.filter(p => p.nombre !== corto)
        fs.writeFileSync(archivo, JSON.stringify(nuevos, null, 2), 'utf-8')
    }
    
    console.log(`\n✓  ${corto} eliminado\n`)
}

//--- Buscar paquetes en GitHub ---

export async function buscarPaquetes(termino: string): Promise<void> {
    console.log(`\n🔍  Buscando paquetes telar para "${termino}"...\n`)
    
    const query = encodeURIComponent(`${PREFIJO}${termino} in:name`)
    const url = `https://api.github.com/search/repositories?q=${query}&sort=stars&per_page=5`
    
    try {
        const datos = await httpGet(url)
        const resultados = JSON.parse(datos)
    
        if (!resultados.items || resultados.items.length === 0) {
            console.log(`   No se encontraron paquetes para "${termino}"\n`)
            return
        }
    
        console.log(`   Resultados:\n`)
        resultados.items.forEach((item: any) => {
            const nombre = item.name.replace(PREFIJO, '')
            console.log(`   · ${nombre.padEnd(24)} ⭐ ${item.stargazers_count.toString().padEnd(6)} ${item.description ?? ''}`)
            console.log(`     github.com/${item.full_name}`)
            console.log()
        })
    
        console.log(`   Para instalar: telar añadir <nombre>\n`)
    } catch {
        console.error(`   Error al buscar paquetes. Comprueba tu conexión.\n`)
    }
}

// --- Helpers ---

function resolverNombre(nombre: string): { usuario: string; repo: string } {
    if (nombre.includes('/')) {
        const [usuario, repo] = nombre.split('/')
        return {
            usuario,
            repo: repo.startsWith(PREFIJO) ? repo : `${PREFIJO}${repo}`
        }
    }
    return {
        usuario: ORG_OFICIAL,
        repo: nombre.startsWith(PREFIJO) ? nombre : `${PREFIJO}${nombre}`
    }
}

function nombreCorto(nombre: string): string {
    const partes = nombre.includes('/') ? nombre.split('/')[1] : nombre
    return partes.startsWith(PREFIJO) ? partes.slice(PREFIJO.length) : partes
}

async function obtenerInfoRepo(usuario: string, repo: string): Promise<any | null> {
    try {
        const datos = await httpGet(`https://api.github.com/repos/${usuario}/${repo}`)
        const info = JSON.parse(datos)
        return {
            version: info.default_branch ?? 'main',
            descripcion: info.description ?? ''
        }
    } catch {
        return null
    }
}

async function descargarPaquete(usuario: string, repo: string, destino: string): Promise<void> {
    const archivos = ['index.telar', 'paquete.telar', `${repo}.telar`]
    const ramas = ['main', 'master']

    if (!fs.existsSync(destino)) {
        fs.mkdirSync(destino, { recursive: true })
    }

    let descargado = false

    for (const rama of ramas) {
        for (const archivo of archivos) {
            const url = `https://raw.githubusercontent.com/${usuario}/${repo}/${rama}/${archivo}`
            try {
                const contenido = await httpGet(url)
                fs.writeFileSync(path.join(destino, archivo), contenido, 'utf-8')
                descargado = true
                console.log(`✓  Descargado ${archivo}`)
                break
            } catch {
                continue
            }
        }
        if (descargado) break
    }

    if (!descargado) {
        for (const rama of ramas) {
            try {
                const readme = await httpGet(
                `https://raw.githubusercontent.com/${usuario}/${repo}/${rama}/README.md`
                )
                fs.writeFileSync(path.join(destino, 'README.md'), readme, 'utf-8')
                console.log(`✓  Descargado README.md`)
                descargado = true
                break
            } catch {
                continue
            }
        }
    }

    if (!descargado) {
        throw new Error(`No se encontraron archivos en ${usuario}/${repo}`)
    }
}

function registrarPaquete(info: InfoPaquete): void {
    const archivo = 'telar.paquetes.json'
    let paquetes: InfoPaquete[] = []
    
    if (fs.existsSync(archivo)) {
        paquetes = JSON.parse(fs.readFileSync(archivo, 'utf-8'))
    }
    
    const indice = paquetes.findIndex(p => p.nombre === info.nombre)
    if (indice !== -1) {
        paquetes[indice] = info
    } else {
        paquetes.push(info)
    }
    
    fs.writeFileSync(archivo, JSON.stringify(paquetes, null, 2), 'utf-8')
}

function httpGet(url: string, headers: Record<string, string> = {}): Promise<string> {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'telar-cli', ...headers } }, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                if (res.headers.location) {
                httpGet(res.headers.location, headers).then(resolve).catch(reject)
                return
                }
            }
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode}`))
                return
            }
            let datos = ''
            res.on('data', chunk => datos += chunk)
            res.on('end', () => resolve(datos))
            res.on('error', reject)
        }).on('error', reject)
    })
}
