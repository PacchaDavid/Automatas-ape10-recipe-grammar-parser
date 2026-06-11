package com.recipeparser.model.ast;

public record IngredientNode(String type, int quantity, String unit, String name) {
    public IngredientNode(int quantity, String unit, String name) {
        this("INGREDIENT", quantity, unit, name);
    }
}
