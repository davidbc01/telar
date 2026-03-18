"use strict";
// ---
// tipos.ts
// Define el vocabulario de todo el compilador de Telar.
// Aquí están los tokens, los nodos del árbol, y los errores.
// ---
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelarError = exports.TipoToken = void 0;
// --- TOKENS ---
// Un token es la unidad mínima de significado.
// El lexer convierte el texto crudo en una lista de tokens.
var TipoToken;
(function (TipoToken) {
    // Palabras clave - estructura
    TipoToken["Aplicacion"] = "aplicacion";
    TipoToken["Pagina"] = "pagina";
    TipoToken["Datos"] = "datos";
    TipoToken["En"] = "en";
    // Palabras clave - contenido
    TipoToken["Titulo"] = "titulo";
    TipoToken["Descripcion"] = "descripcion";
    TipoToken["Mostrar"] = "mostrar";
    TipoToken["Boton"] = "boton";
    TipoToken["Campo"] = "campo";
    // Palabras clave - lógica
    TipoToken["Si"] = "si";
    TipoToken["SiNo"] = "si_no";
    TipoToken["El"] = "el";
    TipoToken["La"] = "la";
    TipoToken["Esta"] = "esta";
    TipoToken["Es"] = "es";
    TipoToken["Hay"] = "hay";
    TipoToken["Falla"] = "falla";
    TipoToken["Funciona"] = "funciona";
    // Palabras clave - modificadores
    TipoToken["Maximo"] = "maximo";
    TipoToken["Ordenados"] = "ordenados";
    TipoToken["Filtrados"] = "filtrados";
    TipoToken["Por"] = "por";
    TipoToken["Recientes"] = "recientes";
    TipoToken["Para"] = "para";
    TipoToken["Movil"] = "movil";
    TipoToken["Cache"] = "cache";
    TipoToken["Reintentar"] = "reintentar";
    TipoToken["Minutos"] = "minutos";
    TipoToken["Horas"] = "horas";
    TipoToken["Segundos"] = "segundos";
    TipoToken["Optimizar"] = "optimizar";
    TipoToken["Ir"] = "ir";
    TipoToken["Hacer"] = "hacer";
    TipoToken["Tipo"] = "tipo";
    TipoToken["Idioma"] = "idioma";
    // Valores
    TipoToken["Texto"] = "TEXTO";
    TipoToken["Numero"] = "NUMERO";
    TipoToken["Nombre"] = "NOMBRE";
    TipoToken["Identificador"] = "IDENTIFICADOR";
    // Puntuación
    TipoToken["DosPuntos"] = ":";
    TipoToken["Mayor"] = ">";
    TipoToken["Igual"] = "=";
    // Especiales
    TipoToken["NuevaLinea"] = "NUEVA_LINEA";
    TipoToken["Indentacion"] = "INDENTACION";
    TipoToken["FinIndentacion"] = "FIN_INDENTACION";
    TipoToken["FinArchivo"] = "FIN_ARCHIVO";
    TipoToken["Desconocido"] = "DESCONOCIDO";
})(TipoToken || (exports.TipoToken = TipoToken = {}));
class TelarError extends Error {
    constructor(error) {
        super(error.mensaje);
        this.linea = error.linea;
        this.columna = error.columna;
        this.sugerencia = error.sugerencia;
        this.name = "TelarError";
    }
    // Formatea el error para mostrarlo en la terminal
    formatear(nombreArchivo) {
        const ubicacion = `${nombreArchivo}:${this.linea}:${this.columna}`;
        let salida = `\n✗  ${ubicacion}: ${this.message}\n`;
        if (this.sugerencia) {
            salida += `   Sugerencia: ${this.sugerencia}\n`;
        }
        return salida;
    }
}
exports.TelarError = TelarError;
//# sourceMappingURL=tipos.js.map