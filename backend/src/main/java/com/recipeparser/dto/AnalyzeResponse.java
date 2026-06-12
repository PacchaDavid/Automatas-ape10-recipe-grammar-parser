package com.recipeparser.dto;

import com.recipeparser.model.CompileError;
import com.recipeparser.model.Token;
import com.recipeparser.model.ast.RecipeNode;
import java.util.List;

/**
 * DTO (Data Transfer Object) para la respuesta del analisis de una receta.
 *
 * <p>Este record se serializa automaticamente como JSON y contiene el resultado
 * completo del proceso de compilacion: analisis lexico, sintactico y AST.</p>
 *
 * <p>Estructura de la respuesta JSON:</p>
 * <pre>{@code
 * {
 *   "success": true,
 *   "tokens": [ ... ],
 *   "ast": { ... },
 *   "errors": []
 * }
 * }</pre>
 *
 * <p>Cuando el analisis falla, {@code ast} es {@code null} y {@code errors}
 * contiene la lista de errores encontrados (lexicos o sintacticos).</p>
 *
 * @param success Indica si el analisis se completo sin errores ({@code true})
 *                o si se detectaron problemas ({@code false}).
 * @param tokens  Lista completa de tokens generados por el analizador lexico.
 * @param ast     Arbol de Sintaxis Abstracta resultante, o {@code null} si
 *                hubo errores que impidieron construir el AST completo.
 * @param errors  Lista de errores de compilacion (LEXICO o SINTACTICO).
 *                Vacia si el analisis fue exitoso.
 */
public record AnalyzeResponse(
    boolean success,
    List<Token> tokens,
    RecipeNode ast,
    List<CompileError> errors
) {
}
