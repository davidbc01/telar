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

    // --- Validación semántica ---

    disenoNoExiste: (nombre: string, disponibles: string[], linea: number, columna: number): ErrorTelar => ({
        mensaje: `La página usa "diseño ${nombre}" pero no existe ningún diseño con ese nombre`,
        sugerencia: disponibles.length > 0
            ? `¿Quisiste decir "diseño ${disponibles[0]}"? Diseños declarados: ${disponibles.join(', ')}`
            : `No hay ningún "diseño" declarado en la aplicación`,
        linea,
        columna,
    }),

    componenteNoExiste: (nombre: string, disponibles: string[], linea: number, columna: number): ErrorTelar => ({
        mensaje: `"${nombre} con ..." usa un componente que no existe`,
        sugerencia: disponibles.length > 0
            ? `Componentes declarados: ${disponibles.join(', ')}`
            : `No hay ningún "componente" declarado en la aplicación`,
        linea,
        columna,
    }),

    componentePlantillaNoExiste: (nombre: string, disponibles: string[], linea: number, columna: number): ErrorTelar => ({
        mensaje: `"mostrar ... con ${nombre}" usa un componente que no existe`,
        sugerencia: disponibles.length > 0
            ? `Componentes declarados: ${disponibles.join(', ')}`
            : `No hay ningún "componente" declarado en la aplicación`,
        linea,
        columna,
    }),

    numeroArgumentosIncorrecto: (nombre: string, parametros: string[], recibidos: number, linea: number, columna: number): ErrorTelar => ({
        mensaje: `"${nombre}" espera ${parametros.length} argumento${parametros.length === 1 ? '' : 's'} (${parametros.join(', ')}), pero se le pasaron ${recibidos}`,
        sugerencia: `Escríbelo así: ${nombre} con ${parametros.join(' y ')}`,
        linea,
        columna,
    }),

    plantillaConVariosParametros: (nombre: string, cantidad: number, linea: number, columna: number): ErrorTelar => ({
        mensaje: `"mostrar ... con ${nombre}" no es válido: el componente tiene ${cantidad} argumentos, y una plantilla de lista solo puede tener uno (el elemento de la lista)`,
        sugerencia: `Declara "${nombre}" con un solo argumento para poder usarlo como plantilla, o usa "${nombre} con X" suelto en vez de en una lista`,
        linea,
        columna,
    }),

    coleccionNoExiste: (nombre: string, disponibles: string[], linea: number, columna: number): ErrorTelar => ({
        mensaje: `Se usa la colección "${nombre}" pero no existe`,
        sugerencia: disponibles.length > 0
            ? `Colecciones declaradas: ${disponibles.join(', ')}`
            : `Declara la colección primero: colección ${nombre} en "contenido/carpeta"`,
        linea,
        columna,
    }),

    articuloSinRutaDinamica: (nombrePagina: string, linea: number, columna: number): ErrorTelar => ({
        mensaje: `La página "${nombrePagina}" usa "artículo" pero su ruta no tiene ningún segmento dinámico`,
        sugerencia: `Un archivo se generaría por cada elemento, todos con el mismo nombre, pisándose entre sí. Añade un segmento como (slug) a la ruta: página ${nombrePagina} en "/blog/(slug)"`,
        linea,
        columna,
    }),

    configEnAppTelar: (palabra: string, linea: number, columna: number): ErrorTelar => ({
        mensaje: `"${palabra}" ya no va dentro de app.telar — es configuración del sitio, no código`,
        sugerencia: `Muévelo a telar.config.json, en la raíz del proyecto: { "${palabra}": "..." }`,
        linea,
        columna,
    }),
}
