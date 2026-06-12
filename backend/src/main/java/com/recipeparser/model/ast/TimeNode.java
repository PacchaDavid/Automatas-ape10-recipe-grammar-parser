package com.recipeparser.model.ast;

/**
 * Nodo del AST que representa una duracion de tiempo asociada a una accion BOIL.
 *
 * <p>Se construye a partir de la produccion:</p>
 * <pre>
 *   tiempo -> FOR NUMBER MINUTES
 * </pre>
 *
 * <p>Ejemplo: {@code FOR 10 MINUTES} produce un nodo con
 * {@code duration=10}, {@code unit="MINUTES"}.</p>
 *
 * <p>Actualmente solo se soporta "MINUTES" como unidad de tiempo, pero el
 * campo {@code unit} permite extension futura (SECONDS, HOURS, etc.).</p>
 *
 * @param type     Identificador del tipo de nodo (siempre "TIME").
 * @param duration Cantidad numerica de tiempo (entero positivo).
 * @param unit     Unidad de tiempo (actualmente solo "MINUTES").
 */
public record TimeNode(String type, int duration, String unit) {

    /**
     * Crea un nodo tiempo asignando automaticamente el tipo {@code "TIME"}.
     *
     * @param duration Duracion en la unidad especificada.
     * @param unit     Unidad de tiempo.
     */
    public TimeNode(int duration, String unit) {
        this("TIME", duration, unit);
    }
}
