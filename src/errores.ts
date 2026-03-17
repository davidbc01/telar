// ---
// errores.ts
// Todos los mensajes de error de Telar, en español.
// Cada error tiene mensaje + sugerencia de cómo arreglarlo
// ---

import { ErrorTelar } from "./tipos";

export const Errores = {

    // --- Lexer ---

    caracterDesconocido: (caracter: string, linea: number, columna: number): ErrorTelar => ({
        mensaje: `Carácter desconocido: "${caracter}"`,
        sugerencia: "Telar solo usa letras, números, comillas y dos puntos",
        linea,
        columna
    }),

    textoSinCerrar: (linea: number, columna: number): ErrorTelar => ({
        mensaje: `Texto sin cerrar — falta la comilla de cierre`,
        sugerencia: `Asegúrate de cerrar el texto con comillas dobles: "tu texto aquí"`,
        linea,
        columna
    }),

    // --- Parser ---

    seEsperaba: (esperado: string, encontrado: string, linea: number, columna: number): ErrorTelar => ({
        mensaje: `Se esperaba ${esperado} pero se encontró "${encontrado}"`,
        sugerencia: `Comprueba la sintaxis en la línea ${linea}`,
        linea,
        columna
    }),

    nombreAplicacion: (linea: number, columna: number): ErrorTelar => ({
        mensaje: `La aplicación necesita un nombre`,
        sugerencia: `Escríbelo así: aplicación MiApp`,
        linea,
        columna
    }),

    rutaPagina: (nombre: string, linea: number, columna: number): ErrorTelar => ({
        mensaje: `La página "${nombre}" necesita una ruta`,
        sugerencia: `Escríbelo así: página ${nombre} en "/"`,
        linea,
        columna
    }),

    numeroEsperado: (valor: string, linea: number, columna: number): ErrorTelar => ({
        mensaje: `"${valor}" no es un número`,
        sugerencia: `Los números van sin comillas. Por ejemplo: máximo 10`,
        linea,
        columna
    }),

    tipoDatoDesconocido: (tipo: string, linea: number, columna: number): ErrorTelar => ({
        mensaje: `Tipo de dato desconocido: "${tipo}"`,
        sugerencia: `Los tipos disponibles son: texto, número, fecha, foto, verdad, lista`,
        linea,
        columna
    }),

    tipoCampoDesconocido: (tipo: string, linea: number, columna: number): ErrorTelar => ({
        mensaje: `Tipo de campo desconocido: "${tipo}"`,
        sugerencia: `Los tipos disponibles son: texto, email, contraseña, número, área de texto`,
        linea,
        columna
    }),

    condicionDesconocida: (texto: string, linea: number, columna: number): ErrorTelar => ({
        mensaje: `Condición no reconocida: "${texto}"`,
        sugerencia: `Prueba con: "si el usuario está conectado", "si hay resultados"`,
        linea,
        columna
    }),

    indentacionIncorrecta: (linea: number, columna: number): ErrorTelar => ({
        mensaje: `Indentación incorrecta en la línea ${linea}`,
        sugerencia: `Usa exactamente 2 espacios por nivel de indentación`,
        linea,
        columna
    }),

    archivoVacio: (): ErrorTelar => ({
        mensaje: `El archivo está vacío`,
        sugerencia: `Todo archivo Telar debe empezar con: aplicación NombreApp`,
        linea: 1,
        columna: 1,
    }),

    faltaAplicacion: (linea: number, columna: number): ErrorTelar => ({
        mensaje: `El archivo debe empezar con una declaración de aplicación`,
        sugerencia: `Añade al principio: aplicación NombreApp`,
        linea,
        columna,
    }),
}
