// ---
// tipos.ts
// Define el vocabulario de todo el compilador de Telar.
// Aquí están los tokens, los nodos del árbol, y los errores.
// ---


// --- TOKENS ---
// Un token es la unidad mínima de significado.
// El lexer convierte el texto crudo en una lista de tokens.

export enum TipoToken {
    // Palabras clave - estructura
    Aplicacion = "aplicacion",
    Pagina = "pagina",
    Datos = "datos",
    En = "en",
    Usar = "usar",
    Codigo = "codigo",
    FinCodigo = "fin_codigo",

    // Palabras clave - contenido
    Titulo = "titulo",
    Descripcion = "descripcion",
    Mostrar = "mostrar",
    Boton = "boton",
    Campo = "campo",

    // Palabras clave - lógica
    Si = "si",
    SiNo = "si_no",
    El = "el",
    La = "la",
    Esta = "esta",
    Es = "es",
    Hay = "hay",
    Falla = "falla",
    Funciona = "funciona",

    // Palabras clave - modificadores
    Maximo = "maximo",
    Ordenados = "ordenados",
    Filtrados = "filtrados",
    Por = "por",
    Recientes = "recientes",
    Para = "para",
    Movil = "movil",
    Cache = "cache",
    Reintentar = "reintentar",
    Minutos = "minutos",
    Horas = "horas",
    Segundos = "segundos",
    Optimizar = "optimizar",
    Ir = "ir",
    Hacer = "hacer",
    Tipo = "tipo",
    Idioma = "idioma",

    // Valores
    Texto = "TEXTO", // "hola mundo"
    Numero = "NUMERO", // 42
    Nombre = "NOMBRE", // MiTienda, Producto...
    Identificador = "IDENTIFICADOR", // inicio, login...

    // Puntuación
    DosPuntos = ":",
    Mayor = ">",
    Igual = "=",

    // Especiales
    NuevaLinea = "NUEVA_LINEA",
    Indentacion = "INDENTACION",
    FinIndentacion = "FIN_INDENTACION",
    FinArchivo = "FIN_ARCHIVO",
    Desconocido = "DESCONOCIDO",
}

// Un token tiene tipo, valor literal, y su posición en el archivo
export interface Token {
    tipo: TipoToken
    valor: string
    linea: number
    columna: number
}


// --- NODOS DEL ÁRBOL (AST) ---
// El parser convierte tokens en un árbol de nodos.
// Cada nodo representa una pieza de la aplicación.

export type Nodo =
    | NodoAplicacion
    | NodoPagina
    | NodoDatos
    | NodoCamposDatos
    | NodoTitulo
    | NodoDescripcion
    | NodoMostrar
    | NodoBoton
    | NodoCampo
    | NodoSi
    | NodoOptimizar
    | NodoCache
    | NodoReintentar
    | NodoUsar
    | NodoCodigo

// aplicación MiTienda
export interface NodoAplicacion {
    tipo: "aplicacion"
    nombre: string
    idioma: string
    paginas: NodoPagina[]
    datos: NodoDatos[]
    linea: number
}

// página inicio en "/"
export interface NodoPagina {
    tipo: "pagina"
    nombre: string
    ruta: string
    hijos: Nodo[]
    linea: number
}

// datos Producto
export interface NodoDatos {
    tipo: "datos"
    nombre: string
    campos: NodoCamposDatos[]
    linea: number
}

// nombre: texto
export interface NodoCamposDatos {
    tipo: "campo_datos"
    nombre: string
    tipoCampo: TipoDato
    linea: number
}

// título: "Bienvenido"
export interface NodoTitulo {
    tipo: "titulo"
    texto: string
    linea: number
}

// descripción: "..."
export interface NodoDescripcion {
    tipo: "descripcion"
    texto: string
    linea: number
}

// mostrar Producto recientes
export interface NodoMostrar {
    tipo: "mostrar"
    modelo: string
    modificadores: ModificadorMostrar[]
    siFalla?: Nodo[]
    siFunciona?: Nodo[]
    linea: number
}

// botón "Entrar" ir a login
export interface NodoBoton {
    tipo: "boton"
    texto: string
    accion: AccionBoton
    destino: string
    siFalla?: Nodo[]
    linea: number
}

// campo "Correo" tipo email
export interface NodoCampo {
    tipo: "campo"
    etiqueta: string
    tipoCampo: TipoCampo
    linea: number
}

// si el usuario está conectado
export interface NodoSi {
    tipo: "si"
    condicion: Condicion
    entonces: Nodo[]
    siNo?: Nodo[]
    linea: number
}

// optimizar para movil
export interface NodoOptimizar {
    tipo: "optimizar"
    objetivo: "movil"
    linea: number
}

// caché 10 minutos
export interface NodoCache {
    tipo: "cache"
    cantidad: number
    unidad: "minutos" | "horas" | "segundos"
    linea: number
}

// reintentar en 5 segundos
export interface NodoReintentar {
    tipo: "reintentar"
    segundos: number
    linea: number
}

// usar formulario
export interface NodoUsar {
    tipo: "usar"
    paquete: string
    linea: number
}

// código ... fin código
export interface NodoCodigo {
    tipo: "codigo"
    contenido: string
    linea: number
}


// --- TIPOS AUXILIARES ---

export type TipoDato =
    | "texto"
    | "número"
    | "fecha"
    | "foto"
    | "verdad"
    | "lista"

export type TipoCampo =
    | "texto"
    | "email"
    | "contraseña"
    | "numero"
    | "área de texto"

export type AccionBoton =
    | "ir"
    | "hacer"

export type ModificadorMostrar =
    | { tipo: "maximo"; cantidad: number }
    | { tipo: "ordenados"; campo: string }
    | { tipo: "filtrados"; campo: string; valor: string }
    | { tipo: "recientes" }

export type Condicion =
    | { tipo: "usuario_conectado" }
    | { tipo: "usuario_admin" }
    | { tipo: "hay_resultados" }
    | { tipo: "campo_igual"; campo: string; valor: string }
    | { tipo: "campo_mayor"; campo: string; valor: number }


// --- ERRORES ---
// Los errores de Telar siempre tienen un mensaje en español
// y una sugerencia de cómo arreglarlo.

export interface ErrorTelar {
    mensaje: string // Qué salió mal
    sugerencia?: string // Cómo arreglarlo
    linea: number
    columna: number
}

export class TelarError extends Error {
    public readonly linea: number
    public readonly columna: number
    public readonly sugerencia?: string

    constructor(error: ErrorTelar) {
        super(error.mensaje)
        this.linea = error.linea
        this.columna = error.columna
        this.sugerencia = error.sugerencia
        this.name = "TelarError"
    }

    // Formatea el error para mostrarlo en la terminal
    formatear(nombreArchivo: string, contenido?: string): string {
        const ubicacion = `${nombreArchivo}:${this.linea}:${this.columna}`
        let salida = `\n✗  ${ubicacion} — ${this.message}\n`

        if (contenido) {
            const lineas = contenido.split('\n')
            const inicio = Math.max(0, this.linea - 3)
            const fin = Math.min(lineas.length, this.linea + 2)

            salida += '\n'

            for (let i = inicio; i < fin; i++) {
                const numLinea = i + 1
                const esLineaError = numLinea === this.linea
                const prefijo = esLineaError ? '→' : ' '
                const num = String(numLinea).padStart(4)

                salida += `  ${prefijo} ${num} │  ${lineas[i]}\n`

                if (esLineaError) {
                    const espacios = ' '.repeat(this.columna + 7)
                    salida += `  ${espacios}^^^^^\n`
                }
            }

            salida += '\n'
        }

        if (this.sugerencia) {
            salida += `  Sugerencia: ${this.sugerencia}\n`
        }

        return salida
    }
}
