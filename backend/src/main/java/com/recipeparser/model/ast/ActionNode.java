package com.recipeparser.model.ast;

public record ActionNode(String type, String actionType, String target, TimeNode time) {
    public ActionNode(String actionType, String target, TimeNode time) {
        this("ACTION", actionType, target, time);
    }
}
