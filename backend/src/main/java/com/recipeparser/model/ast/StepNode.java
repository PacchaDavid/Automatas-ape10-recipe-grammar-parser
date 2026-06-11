package com.recipeparser.model.ast;

public record StepNode(String type, int number, ActionNode action) {
    public StepNode(int number, ActionNode action) {
        this("STEP", number, action);
    }
}
