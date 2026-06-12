package com.recipeparser.model.ast;

/**
 * Nodo del AST que representa la declaracion de un ingrediente.
 *
 * <p>Se construye a partir de la produccion:</p>
 * <pre>
 *   ingrediente -> INGREDIENT : NUMBER GRAMS OF WORD ;
 * </pre>
 *
 * <p>Ejemplo: {@code INGREDIENT: 200 GRAMS OF Flour;} produce un nodo con
 * {@code quantity=200}, {@code unit="GRAMS"}, {@code name="Flour"}.</p>
 *
 * <p>Actualmente la unica unidad soportada es "GRAMS", pero el campo
 * {@code unit} permite extension futura a otras unidades (kg, cups, etc.).</p>
 *
 * @param type     Identificador del tipo de nodo (siempre "INGREDIENT").
 * @param quantity Cantidad numerica del ingrediente (entero positivo).
 * @param unit     Unidad de medida (actualmente solo "GRAMS").
 * @param name     Nombre del ingrediente segun el token WORD.
 */
public record IngredientNode(String type, int quantity, String unit, String name) {

    /**
     * Crea un nodo ingrediente asignando automaticamente el tipo {@code "INGREDIENT"}.
     *
     * @param quantity Cantidad del ingrediente.
     * @param unit     Unidad de medida.
     * @param name     Nombre del ingrediente.
     */
    public IngredientNode(int quantity, String unit, String name) {
        this("INGREDIENT", quantity, unit, name);
    }
}
