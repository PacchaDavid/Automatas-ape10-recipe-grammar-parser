package com.recipeparser.model.ast;

/**
 * Nodo del AST que representa una accion de coccion dentro de un paso.
 *
 * <p>Se construye a partir de las producciones:</p>
 * <pre>
 *   accion -> BOIL WORD tiempo
 *           | ADD WORD
 * </pre>
 *
 * <p>Actualmente soporta dos tipos de accion:</p>
 * <ul>
 *   <li><b>BOIL:</b> Hervir un ingrediente por un tiempo determinado.
 *       Incluye un nodo {@link TimeNode} obligatorio.</li>
 *   <li><b>ADD:</b> Anadir un ingrediente. No incluye tiempo asociado
 *       (el campo {@code time} es {@code null}).</li>
 * </ul>
 *
 * @param type       Identificador del tipo de nodo (siempre "ACTION").
 * @param actionType Tipo de accion: "BOIL" o "ADD".
 * @param target     Ingrediente objetivo de la accion (token WORD).
 * @param time       Tiempo asociado (solo para BOIL; {@code null} para ADD).
 */
public record ActionNode(String type, String actionType, String target, TimeNode time) {

    /**
     * Crea un nodo accion asignando automaticamente el tipo {@code "ACTION"}.
     *
     * @param actionType Tipo de accion ("BOIL" o "ADD").
     * @param target     Ingrediente objetivo.
     * @param time       Tiempo asociado (puede ser {@code null}).
     */
    public ActionNode(String actionType, String target, TimeNode time) {
        this("ACTION", actionType, target, time);
    }
}
