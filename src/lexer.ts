// ---
// lexer.ts
// Convierte un archivo .telar en una lista de tokens
// Es el primer paso del compilador.
// ---

import { Token, TipoToken} from './tipos';
import { Errores } from './errores';
import { TelarError } from './tipos';

// Mapa de palabras clave del lenguaje
const PALABRAS_CLAVE: Record<string, TipoToken> = {
    "aplicación": TipoToken.Aplicacion,
    "aplicacion": TipoToken.Aplicacion,
    "página": TipoToken.Pagina,
    "pagina": TipoToken.Pagina,
    "datos": TipoToken.Datos,
    "en": TipoToken.En,
    "título": TipoToken.Titulo,
    "titulo": TipoToken.Titulo,
    "descripción": TipoToken.Descripcion,
    "descripcion": TipoToken.Descripcion,
    "mostrar": TipoToken.Mostrar,
    "botón": TipoToken.Boton,
    "boton": TipoToken.Boton,
    "campo": TipoToken.Campo,
    "si": TipoToken.Si,
    "el": TipoToken.El,
    "la": TipoToken.La,
    "está": TipoToken.Esta,
    "esta": TipoToken.Esta,
    "es": TipoToken.Es,
    "hay": TipoToken.Hay,
    "falla": TipoToken.Falla,
    "funciona": TipoToken.Funciona,
    "máximo": TipoToken.Maximo,
    "maximo": TipoToken.Maximo,
    "ordenados": TipoToken.Ordenados,
    "filtrados": TipoToken.Filtrados,
    "por": TipoToken.Por,
    "recientes": TipoToken.Recientes,
    "para": TipoToken.Para,
    "móvil": TipoToken.Movil,
    "movil": TipoToken.Movil,
    "caché": TipoToken.Cache,
    "cache": TipoToken.Cache,
    "reintentar": TipoToken.Reintentar,
    "minutos": TipoToken.Minutos,
    "horas": TipoToken.Horas,
    "segundos": TipoToken.Segundos,
    "optimizar": TipoToken.Optimizar,
    "ir": TipoToken.Ir,
    "hacer": TipoToken.Hacer,
    "tipo": TipoToken.Tipo,
    "idioma": TipoToken.Idioma,
    "no": TipoToken.SiNo,
    "usar": TipoToken.Usar,
    "código": TipoToken.Codigo,
    "codigo": TipoToken.Codigo,
    "fin": TipoToken.FinCodigo,
}

export class Lexer {
    private texto: string
    private posicion: number = 0
    private linea: number = 1
    private columna: number = 1
    private nivelIndentacion: number = 0
 
    constructor(texto: string) {
        this.texto = texto
    }
 
    tokenizar(): Token[] {
        const tokens: Token[] = []
 
        while (!this.finArchivo()) {
        const token = this.siguienteToken()
        if (token) tokens.push(token)
        }
 
        tokens.push(this.crearToken(TipoToken.FinArchivo, ""))
        return tokens
    }
 
    private siguienteToken(): Token | null {
        // Ignorar retorno de carro (Windows \r\n)
        if (this.actual() === "\r") {
            this.avanzar()
            return null
        }

        // Saltar comentarios
        if (this.actual() === "#") {
            while (!this.finArchivo() && this.actual() !== "\n") {
                this.avanzar()
            }
            return null
        }
 
        // Nueva línea — gestiona la indentación
        if (this.actual() === "\n") {
            this.avanzar()
            this.linea++
            this.columna = 1
            return this.procesarIndentacion()
        }
 
        // Espacios al inicio ya procesados por indentación
        if (this.actual() === " " || this.actual() === "\t") {
            this.avanzar()
            return null
        }

        // Caracteres válidos que se ignoran fuera de strings
        if (".-()¿?¡!,;€@/".includes(this.actual())) {
            this.avanzar()
            return null
        }
 
        // Texto entre comillas
        if (this.actual() === '"') {
            return this.leerTexto()
        }
 
        // Números
        if (this.esDigito(this.actual())) {
            return this.leerNumero()
        }
 
        // Dos puntos
        if (this.actual() === ":") {
            const token = this.crearToken(TipoToken.DosPuntos, ":")
            this.avanzar()
            return token
        }
 
        // Mayor que
        if (this.actual() === ">") {
            const token = this.crearToken(TipoToken.Mayor, ">")
            this.avanzar()
            return token
        }
 
        // Igual
        if (this.actual() === "=") {
            const token = this.crearToken(TipoToken.Igual, "=")
            this.avanzar()
            return token
        }
 
        // Palabras
        if (this.esLetra(this.actual())) {
            return this.leerPalabra()
        }
 
        // Carácter desconocido
        const caracter = this.actual()
        throw new TelarError(
            Errores.caracterDesconocido(caracter, this.linea, this.columna)
        )
    }
 
    private procesarIndentacion(): Token | null {
        let espacios = 0
        while (this.actual() === " ") {
            espacios++
            this.avanzar()
        }
 
        // Línea vacía o comentario — ignorar
        if (this.actual() === "\n" || this.actual() === "#") {
            return null
        }
 
        const nuevoNivel = Math.floor(espacios / 2)
 
        if (nuevoNivel > this.nivelIndentacion) {
            this.nivelIndentacion = nuevoNivel
            return this.crearToken(TipoToken.Indentacion, ">")
        }
 
        if (nuevoNivel < this.nivelIndentacion) {
            this.nivelIndentacion = nuevoNivel
            return this.crearToken(TipoToken.FinIndentacion, "<")
        }
 
        return null
    }
 
    private leerTexto(): Token {
        const inicio = this.columna
        this.avanzar() // saltar la comilla de apertura
        let valor = ""
 
        while (!this.finArchivo() && this.actual() !== '"') {
            if (this.actual() === "\n") {
                throw new TelarError(
                    Errores.textoSinCerrar(this.linea, inicio)
                )
            }
            valor += this.actual()
            this.avanzar()
        }
 
        if (this.finArchivo()) {
            throw new TelarError(
                Errores.textoSinCerrar(this.linea, inicio)
            )
        }
 
        this.avanzar() // saltar la comilla de cierre
        return this.crearToken(TipoToken.Texto, valor)
    }
 
    private leerNumero(): Token {
        let valor = ""
        while (!this.finArchivo() && (this.esDigito(this.actual()) || this.actual() === ".")) {
            valor += this.actual()
            this.avanzar()
        }
        return this.crearToken(TipoToken.Numero, valor)
    }
 
    private leerPalabra(): Token {
        let valor = ""
        while (!this.finArchivo() && (this.esLetra(this.actual()) || this.esDigito(this.actual()) || this.actual() === ".")) {
            valor += this.actual()
            this.avanzar()
        }

        const tipo = PALABRAS_CLAVE[valor.toLowerCase()] ?? TipoToken.Identificador

        // Si es "código", leer el bloque completo hasta "fin código"
        if (tipo === TipoToken.Codigo) {
            while (!this.finArchivo() && this.actual() !== "\n") this.avanzar()
            return this.leerBloqueCodigo()
        }

        if (tipo === TipoToken.Identificador && valor[0] === valor[0].toUpperCase() && valor[0] !== valor[0].toLowerCase()) {
            return this.crearToken(TipoToken.Nombre, valor)
        }

        return this.crearToken(tipo, valor)
    }
 
    private actual(): string {
        return this.texto[this.posicion] ?? ""
    }
 
    private avanzar(): void {
        this.posicion++
        this.columna++
    }
 
    private finArchivo(): boolean {
        return this.posicion >= this.texto.length
    }
 
    private esDigito(c: string): boolean {
        return c >= "0" && c <= "9"
    }
 
    private esLetra(c: string): boolean {
        return /[a-záéíóúüñA-ZÁÉÍÓÚÜÑ_]/.test(c)
    }
 
    private crearToken(tipo: TipoToken, valor: string): Token {
        return { tipo, valor, linea: this.linea, columna: this.columna }
    }

    private leerBloqueCodigo(): Token {
        const linea = this.linea
        let contenido = ""

        // Leer hasta encontrar "fin código" o "fin codigo"
        while (!this.finArchivo()) {
            // Detectar "fin" al inicio de línea
            if (this.actual() === "\n") {
                this.avanzar()
                this.linea++
                this.columna = 1

                // Saltar espacios
                while (this.actual() === " ") this.avanzar()

                // Comprobar si es "fin código"
                const resto = this.texto.slice(this.posicion)
                if (resto.startsWith("fin código") || resto.startsWith("fin codigo")) {
                    // Avanzar hasta el fin de línea
                    while (!this.finArchivo() && this.actual() !== "\n") this.avanzar()
                    return this.crearToken(TipoToken.Codigo, contenido.trim())
                }

                contenido += "\n"
                continue
            }

            contenido += this.actual()
            this.avanzar()
        }

        return this.crearToken(TipoToken.Codigo, contenido.trim())
    }
}
