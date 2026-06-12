package com.recipeparser.dto;

/**
 * DTO (Data Transfer Object) para la solicitud de analisis de una receta.
 *
 * <p>Este record deserializa el cuerpo JSON de la peticion HTTP enviada al
 * endpoint {@code POST /api/compiler/analyze}.</p>
 *
 * <p>Ejemplo de JSON request:</p>
 * <pre>{@code
 * {
 *   "text": "INGREDIENT: 200 GRAMS OF Flour;\nSTEP 1: BOIL Water FOR 10 MINUTES;"
 * }
 * }</pre>
 *
 * @param text Texto completo de la receta en el DSL definido.
 */
public record AnalyzeRequest(String text) {
}
