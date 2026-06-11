package com.recipeparser.model.ast;

public record TimeNode(String type, int duration, String unit) {
    public TimeNode(int duration, String unit) {
        this("TIME", duration, unit);
    }
}
