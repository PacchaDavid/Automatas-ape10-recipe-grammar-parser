package com.recipeparser.model.ast;

import java.util.List;

/**
 * Nodo raiz del Arbol de Sintaxis Abstracta (AST).
 *
 * <p>Representa una receta completa compuesta por:
 * <ul>
 *   <li>Un unico {@link IngredientNode} con la declaracion del ingrediente principal.</li>
 *   <li>Una lista ordenada de {@link StepNode} con los pasos de coccion.</li>
 * </ul>
 *
 * <p>La estructura se construye siguiendo la produccion:</p>
 * <pre>
 *   programa -> ingrediente paso+
 * </pre>
 *
 * <p>Este nodo incluye un campo {@code type} que se serializa automaticamente
 * como {@code "RECIPE"} en la respuesta JSON, permitiendo identificar el tipo
 * de nodo sin necesidad de usar {@code instanceof}.</p>
 *
 * @param type        Identificador del tipo de nodo (siempre "RECIPE").
 * @param ingredient  Declaracion del ingrediente principal de la receta.
 * @param steps       Lista ordenada de pasos de coccion (al menos uno).
 */
public record RecipeNode(String type, IngredientNode ingredient, List<StepNode> steps) {

    /**
     * Crea un nodo receta asignando automaticamente el tipo {@code "RECIPE"}.
     *
     * @param ingredient Declaracion del ingrediente principal.
     * @param steps      Lista de pasos de coccion.
     */
    public RecipeNode(IngredientNode ingredient, List<StepNode> steps) {
        this("RECIPE", ingredient, steps);
    }
}
