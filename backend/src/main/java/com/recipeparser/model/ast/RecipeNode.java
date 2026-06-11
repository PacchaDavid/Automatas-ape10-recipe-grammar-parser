package com.recipeparser.model.ast;

import java.util.List;

public record RecipeNode(String type, IngredientNode ingredient, List<StepNode> steps) {
    public RecipeNode(IngredientNode ingredient, List<StepNode> steps) {
        this("RECIPE", ingredient, steps);
    }
}
