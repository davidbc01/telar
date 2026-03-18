"use strict";
// ---
// lexer.ts
// Convierte un archivo .telar en una lista de tokens
// Es el primer paso del compilador.
// ---
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = void 0;
const tipos_1 = require("./tipos");
const errores_1 = require("./errores");
const tipos_2 = require("./tipos");
// Mapa de palabras clave del lenguaje
const PALABRAS_CLAVE = {
    "aplicación": tipos_1.TipoToken.Aplicacion,
    "aplicacion": tipos_1.TipoToken.Aplicacion,
    "página": tipos_1.TipoToken.Pagina,
    "pagina": tipos_1.TipoToken.Pagina,
    "datos": tipos_1.TipoToken.Datos,
    "en": tipos_1.TipoToken.En,
    "título": tipos_1.TipoToken.Titulo,
    "titulo": tipos_1.TipoToken.Titulo,
    "descripción": tipos_1.TipoToken.Descripcion,
    "descripcion": tipos_1.TipoToken.Descripcion,
    "mostrar": tipos_1.TipoToken.Mostrar,
    "botón": tipos_1.TipoToken.Boton,
    "boton": tipos_1.TipoToken.Boton,
    "campo": tipos_1.TipoToken.Campo,
    "si": tipos_1.TipoToken.Si,
    "el": tipos_1.TipoToken.El,
    "la": tipos_1.TipoToken.La,
    "está": tipos_1.TipoToken.Esta,
    "esta": tipos_1.TipoToken.Esta,
    "es": tipos_1.TipoToken.Es,
    "hay": tipos_1.TipoToken.Hay,
    "falla": tipos_1.TipoToken.Falla,
    "funciona": tipos_1.TipoToken.Funciona,
    "máximo": tipos_1.TipoToken.Maximo,
    "maximo": tipos_1.TipoToken.Maximo,
    "ordenados": tipos_1.TipoToken.Ordenados,
    "filtrados": tipos_1.TipoToken.Filtrados,
    "por": tipos_1.TipoToken.Por,
    "recientes": tipos_1.TipoToken.Recientes,
    "para": tipos_1.TipoToken.Para,
    "móvil": tipos_1.TipoToken.Movil,
    "movil": tipos_1.TipoToken.Movil,
    "caché": tipos_1.TipoToken.Cache,
    "cache": tipos_1.TipoToken.Cache,
    "reintentar": tipos_1.TipoToken.Reintentar,
    "minutos": tipos_1.TipoToken.Minutos,
    "horas": tipos_1.TipoToken.Horas,
    "segundos": tipos_1.TipoToken.Segundos,
    "optimizar": tipos_1.TipoToken.Optimizar,
    "ir": tipos_1.TipoToken.Ir,
    "hacer": tipos_1.TipoToken.Hacer,
    "tipo": tipos_1.TipoToken.Tipo,
    "idioma": tipos_1.TipoToken.Idioma,
    "no": tipos_1.TipoToken.SiNo,
};
class Lexer {
    constructor(texto) {
        this.posicion = 0;
        this.linea = 1;
        this.columna = 1;
        this.nivelIndentacion = 0;
        this.texto = texto;
    }
    tokenizar() {
        const tokens = [];
        while (!this.finArchivo()) {
            const token = this.siguienteToken();
            if (token)
                tokens.push(token);
        }
        tokens.push(this.crearToken(tipos_1.TipoToken.FinArchivo, ""));
        return tokens;
    }
    siguienteToken() {
        // Ignorar retorno de carro (Windows \r\n)
        if (this.actual() === "\r") {
            this.avanzar();
            return null;
        }
        // Saltar comentarios
        if (this.actual() === "#") {
            while (!this.finArchivo() && this.actual() !== "\n") {
                this.avanzar();
            }
            return null;
        }
        // Nueva línea — gestiona la indentación
        if (this.actual() === "\n") {
            this.avanzar();
            this.linea++;
            this.columna = 1;
            return this.procesarIndentacion();
        }
        // Espacios al inicio ya procesados por indentación
        if (this.actual() === " " || this.actual() === "\t") {
            this.avanzar();
            return null;
        }
        // Caracteres válidos que se ignoran fuera de strings
        if (".-()¿?¡!,;€@/".includes(this.actual())) {
            this.avanzar();
            return null;
        }
        // Texto entre comillas
        if (this.actual() === '"') {
            return this.leerTexto();
        }
        // Números
        if (this.esDigito(this.actual())) {
            return this.leerNumero();
        }
        // Dos puntos
        if (this.actual() === ":") {
            const token = this.crearToken(tipos_1.TipoToken.DosPuntos, ":");
            this.avanzar();
            return token;
        }
        // Mayor que
        if (this.actual() === ">") {
            const token = this.crearToken(tipos_1.TipoToken.Mayor, ">");
            this.avanzar();
            return token;
        }
        // Igual
        if (this.actual() === "=") {
            const token = this.crearToken(tipos_1.TipoToken.Igual, "=");
            this.avanzar();
            return token;
        }
        // Palabras
        if (this.esLetra(this.actual())) {
            return this.leerPalabra();
        }
        // Carácter desconocido
        const caracter = this.actual();
        throw new tipos_2.TelarError(errores_1.Errores.caracterDesconocido(caracter, this.linea, this.columna));
    }
    procesarIndentacion() {
        let espacios = 0;
        while (this.actual() === " ") {
            espacios++;
            this.avanzar();
        }
        // Línea vacía o comentario — ignorar
        if (this.actual() === "\n" || this.actual() === "#") {
            return null;
        }
        const nuevoNivel = Math.floor(espacios / 2);
        if (nuevoNivel > this.nivelIndentacion) {
            this.nivelIndentacion = nuevoNivel;
            return this.crearToken(tipos_1.TipoToken.Indentacion, ">");
        }
        if (nuevoNivel < this.nivelIndentacion) {
            this.nivelIndentacion = nuevoNivel;
            return this.crearToken(tipos_1.TipoToken.FinIndentacion, "<");
        }
        return null;
    }
    leerTexto() {
        const inicio = this.columna;
        this.avanzar(); // saltar la comilla de apertura
        let valor = "";
        while (!this.finArchivo() && this.actual() !== '"') {
            if (this.actual() === "\n") {
                throw new tipos_2.TelarError(errores_1.Errores.textoSinCerrar(this.linea, inicio));
            }
            valor += this.actual();
            this.avanzar();
        }
        if (this.finArchivo()) {
            throw new tipos_2.TelarError(errores_1.Errores.textoSinCerrar(this.linea, inicio));
        }
        this.avanzar(); // saltar la comilla de cierre
        return this.crearToken(tipos_1.TipoToken.Texto, valor);
    }
    leerNumero() {
        let valor = "";
        while (!this.finArchivo() && (this.esDigito(this.actual()) || this.actual() === ".")) {
            valor += this.actual();
            this.avanzar();
        }
        return this.crearToken(tipos_1.TipoToken.Numero, valor);
    }
    leerPalabra() {
        let valor = "";
        while (!this.finArchivo() && (this.esLetra(this.actual()) || this.esDigito(this.actual()) || this.actual() === ".")) {
            valor += this.actual();
            this.avanzar();
        }
        // Comprobar si es palabra clave
        const tipo = PALABRAS_CLAVE[valor.toLowerCase()] ?? tipos_1.TipoToken.Identificador;
        // Si empieza por mayúscula y no es palabra clave, es un Nombre propio
        if (tipo === tipos_1.TipoToken.Identificador && valor[0] === valor[0].toUpperCase() && valor[0] !== valor[0].toLowerCase()) {
            return this.crearToken(tipos_1.TipoToken.Nombre, valor);
        }
        return this.crearToken(tipo, valor);
    }
    actual() {
        return this.texto[this.posicion] ?? "";
    }
    avanzar() {
        this.posicion++;
        this.columna++;
    }
    finArchivo() {
        return this.posicion >= this.texto.length;
    }
    esDigito(c) {
        return c >= "0" && c <= "9";
    }
    esLetra(c) {
        return /[a-záéíóúüñA-ZÁÉÍÓÚÜÑ_]/.test(c);
    }
    crearToken(tipo, valor) {
        return { tipo, valor, linea: this.linea, columna: this.columna };
    }
}
exports.Lexer = Lexer;
//# sourceMappingURL=lexer.js.map