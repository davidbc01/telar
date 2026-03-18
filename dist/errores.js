"use strict";
// ---
// errores.ts
// Todos los mensajes de error de Telar, en español.
// Cada error tiene mensaje + sugerencia de cómo arreglarlo
// ---
Object.defineProperty(exports, "__esModule", { value: true });
exports.Errores = void 0;
exports.Errores = {
    // --- Lexer ---
    caracterDesconocido: (caracter, linea, columna) => ({
        mensaje: `Carácter desconocido: "${caracter}"`,
        sugerencia: "Telar solo usa letras, números, comillas y dos puntos",
        linea,
        columna
    }),
    textoSinCerrar: (linea, columna) => ({
        mensaje: `Texto sin cerrar — falta la comilla de cierre`,
        sugerencia: `Asegúrate de cerrar el texto con comillas dobles: "tu texto aquí"`,
        linea,
        columna
    }),
    // --- Parser ---
    seEsperaba: (esperado, encontrado, linea, columna) => ({
        mensaje: `Se esperaba ${esperado} pero se encontró "${encontrado}"`,
        sugerencia: `Comprueba la sintaxis en la línea ${linea}`,
        linea,
        columna
    }),
    nombreAplicacion: (linea, columna) => ({
        mensaje: `La aplicación necesita un nombre`,
        sugerencia: `Escríbelo así: aplicación MiApp`,
        linea,
        columna
    }),
    rutaPagina: (nombre, linea, columna) => ({
        mensaje: `La página "${nombre}" necesita una ruta`,
        sugerencia: `Escríbelo así: página ${nombre} en "/"`,
        linea,
        columna
    }),
    numeroEsperado: (valor, linea, columna) => ({
        mensaje: `"${valor}" no es un número`,
        sugerencia: `Los números van sin comillas. Por ejemplo: máximo 10`,
        linea,
        columna
    }),
    tipoDatoDesconocido: (tipo, linea, columna) => ({
        mensaje: `Tipo de dato desconocido: "${tipo}"`,
        sugerencia: `Los tipos disponibles son: texto, número, fecha, foto, verdad, lista`,
        linea,
        columna
    }),
    tipoCampoDesconocido: (tipo, linea, columna) => ({
        mensaje: `Tipo de campo desconocido: "${tipo}"`,
        sugerencia: `Los tipos disponibles son: texto, email, contraseña, número, área de texto`,
        linea,
        columna
    }),
    condicionDesconocida: (texto, linea, columna) => ({
        mensaje: `Condición no reconocida: "${texto}"`,
        sugerencia: `Prueba con: "si el usuario está conectado", "si hay resultados"`,
        linea,
        columna
    }),
    indentacionIncorrecta: (linea, columna) => ({
        mensaje: `Indentación incorrecta en la línea ${linea}`,
        sugerencia: `Usa exactamente 2 espacios por nivel de indentación`,
        linea,
        columna
    }),
    archivoVacio: () => ({
        mensaje: `El archivo está vacío`,
        sugerencia: `Todo archivo Telar debe empezar con: aplicación NombreApp`,
        linea: 1,
        columna: 1,
    }),
    faltaAplicacion: (linea, columna) => ({
        mensaje: `El archivo debe empezar con una declaración de aplicación`,
        sugerencia: `Añade al principio: aplicación NombreApp`,
        linea,
        columna,
    }),
};
//# sourceMappingURL=errores.js.map