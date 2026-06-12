package com.recipeparser.model;

/**
 * Representa un token individual producido por el analizador lexico (JFlex).
 *
 * <p>Cada token captura cuatro aspectos fundamentales:</p>
 * <ul>
 *   <li><b>type:</b> Clasificacion del token segun {@link TokenType}.</li>
 *   <li><b>lexeme:</b> Cadena de texto original que coincidio con el patron.</li>
 *   <li><b>line:</b> Numero de linea (1-indexed) donde aparece en la entrada.</li>
 *   <li><b>column:</b> Numero de columna (1-indexed) donde comienza el token.</li>
 * </ul>
 *
 * <p>El lexema preserva el texto exacto tal como aparece en la entrada,
 * incluyendo mayusculas/minusculas. Por ejemplo, para la entrada "Flour"
 * el lexema sera {@code "Flour"} y el tipo sera {@link TokenType#WORD}.</p>
 *
 * @param type   Tipo del token segun la clasificacion del lenguaje.
 * @param lexeme Cadena de caracteres que forma el token en la entrada original.
 * @param line   Linea donde se encontro el token (comienza en 1).
 * @param column Columna donde se encontro el token (comienza en 1).
 */
public record Token(TokenType type, String lexeme, int line, int column) {
}
