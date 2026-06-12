package com.recipeparser.model.ast;

/**
 * Nodo del AST que representa un paso individual en la receta.
 *
 * <p>Se construye a partir de la produccion:</p>
 * <pre>
 *   paso -> STEP NUMBER : accion ;
 * </pre>
 *
 * <p>Ejemplo: {@code STEP 1: BOIL Water FOR 10 MINUTES;} produce un nodo
 * con {@code number=1} y la accion correspondiente.</p>
 *
 * <p>Los pasos se numeran secuencialmente comenzando desde 1. El parser
 * no valida que los numeros sean consecutivos; simplemente preserva el
 * valor proporcionado en el texto de entrada.</p>
 *
 * @param type   Identificador del tipo de nodo (siempre "STEP").
 * @param number Numero del paso segun aparece en la entrada.
 * @param action Accion de coccion asociada a este paso.
 */
public record StepNode(String type, int number, ActionNode action) {

    /**
     * Crea un nodo paso asignando automaticamente el tipo {@code "STEP"}.
     *
     * @param number Numero del paso.
     * @param action Accion de coccion.
     */
    public StepNode(int number, ActionNode action) {
        this("STEP", number, action);
    }
}
