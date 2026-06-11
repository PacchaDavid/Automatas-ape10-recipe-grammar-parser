package com.recipeparser.lexer;

import java_cup.runtime.Symbol;
import com.recipeparser.model.Token;
import com.recipeparser.model.TokenType;
import com.recipeparser.parser.sym;

%%

%class RecipeLexer
%unicode
%cup
%line
%column

%{
  private Token createToken(TokenType type) {
    return new Token(type, yytext(), yyline + 1, yycolumn + 1);
  }
  
  private Symbol symbol(int id, TokenType type) {
    Token t = createToken(type);
    return new Symbol(id, yyline + 1, yycolumn + 1, t);
  }

  public int getLine() {
    return yyline;
  }

  public int getColumn() {
    return yycolumn;
  }
%}

/* Regular expressions */
LineTerminator = \r|\n|\r\n
WhiteSpace     = {LineTerminator} | [ \t\f]
Number         = [0-9]+
Word           = [a-zA-Z]+

%%

<YYINITIAL> {
  /* Keywords */
  "INGREDIENT"      { return symbol(sym.INGREDIENT, TokenType.INGREDIENT); }
  "STEP"            { return symbol(sym.STEP, TokenType.STEP); }
  "GRAMS"           { return symbol(sym.GRAMS, TokenType.GRAMS); }
  "OF"              { return symbol(sym.OF, TokenType.OF); }
  "BOIL"            { return symbol(sym.BOIL, TokenType.BOIL); }
  "ADD"             { return symbol(sym.ADD, TokenType.ADD); }
  "FOR"             { return symbol(sym.FOR, TokenType.FOR); }
  "MINUTES"         { return symbol(sym.MINUTES, TokenType.MINUTES); }

  /* Operators/Separators */
  ":"               { return symbol(sym.COLON, TokenType.COLON); }
  ";"               { return symbol(sym.SEMICOLON, TokenType.SEMICOLON); }

  /* Literals & Identifiers */
  {Number}          { return symbol(sym.NUMBER, TokenType.NUMBER); }
  {Word}            { return symbol(sym.WORD, TokenType.WORD); }

  /* Whitespace (ignored) */
  {WhiteSpace}      { /* ignore */ }

  /* Fallback for invalid characters */
  [^]               { return symbol(sym.error, TokenType.ERROR); }
}
