import { NodoAplicacion } from './tipos';
export interface ArchivoGenerado {
    nombre: string;
    contenido: string;
}
export declare class Generador {
    private app;
    constructor(app: NodoAplicacion);
    generar(): ArchivoGenerado[];
    private generarPagina;
    private generarNodo;
    private generarTitulo;
    private generarDescripcion;
    private generarMostrar;
    private generarBoton;
    private generarCampo;
    private generarSi;
    private generarReintentar;
    private generarCSS;
    private condicionAAtributo;
    private extraerTitulo;
    private extraerDescripcion;
    private rutaANombre;
    private textoAId;
    private escapar;
    private indentar;
}
//# sourceMappingURL=generador.d.ts.map