package com.recipeparser.model;

/**
 * Representa un error de compilacion detectado durante el analisis lexico o
 * sintactico del DSL de recetas.
 *
 * <p>Los errores se clasifican en dos categorias:</p>
 * <ul>
 *   <li><b>LEXICO:</b> Ocurre cuando el analizador lexico encuentra un caracter
 *       que no pertenece al alfabeto del lenguaje (ej: comas, arrobas).</li>
 *   <li><b>SINTACTICO:</b> Ocurre cuando la secuencia de tokens no sigue las
 *       producciones de la gramatica (ej: falta un punto y coma, orden incorrecto).</li>
 * </ul>
 *
 * <p>La posicion (linea y columna) indica exactamente donde se detected el error
 * en el texto de entrada, facilitando la depuracion.</p>
 *
 * @param type    Tipo de error: "LEXICO" o "SINTACTICO".
 * @param message Mensaje descriptivo del error en espanol.
 * @param line    Linea donde se detected el error (comienza en 1).
 * @param column  Columna donde se detected el error (comienza en 1).
 */
public record CompileError(String type, String message, int line, int column) {
}
