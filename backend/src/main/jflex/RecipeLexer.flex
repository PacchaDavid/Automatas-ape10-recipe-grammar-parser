// Recipe Parser CFG - Backend
// Especificacion JFlex para el analizador lexico del DSL de recetas.
//
// Este archivo define las reglas de analisis lexico que JFlex convierte
// en el escaner RecipeLexer.java. El escaner reconoce:
//   - 8 palabras clave reservadas (INGREDIENT, STEP, GRAMS, OF, BOIL, ADD, FOR, MINUTES)
//   - Numeros enteros ([0-9]+)
//   - Identificadores ([a-zA-Z]+)
//   - Simbolos de separacion (: y ;)
//   - Espacios en blanco (ignorados)
//   - Caracteres invalidos (reportados como ERROR)
//
// Integracion con CUP: Cada token se devuelve como un java_cup.runtime.Symbol
// con el ID del terminal definido en la clase sym.java generada por CUP.
//
// Integracion con el modelo: Cada Symbol encapsula un objeto Token del modelo
// de dominio (com.recipeparser.model.Token) con su tipo, lexema y posicion.

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
  /**
   * Crea un objeto Token con el tipo especificado, utilizando yytext()
   * como lexema y las variables yyline/yycolumn (0-indexed) ajustadas
   * a 1-indexed para la posicion.
   */
  private Token createToken(TokenType type) {
    return new Token(type, yytext(), yyline + 1, yycolumn + 1);
  }
  
  /**
   * Crea un Symbol de CUP que encapsula un Token del modelo de dominio.
   * El ID del simbolo corresponde a una de las constantes en sym.java.
   */
  private Symbol symbol(int id, TokenType type) {
    Token t = createToken(type);
    return new Symbol(id, yyline + 1, yycolumn + 1, t);
  }

  /**
   * Devuelve la linea actual (0-indexed) del analisis lexico.
   * Util para que el Lexer fachada pueda construir el token EOF
   * con la posicion final correcta.
   */
  public int getLine() {
    return yyline;
  }

  /**
   * Devuelve la columna actual (0-indexed) del analisis lexico.
   */
  public int getColumn() {
    return yycolumn;
  }
%}

/* Expresiones regulares */
LineTerminator = \r|\n|\r\n
WhiteSpace     = {LineTerminator} | [ \t\f]
Number         = [0-9]+
Word           = [a-zA-Z]+

%%

<YYINITIAL> {
  /* Palabras clave (keywords) del lenguaje DSL */
  "INGREDIENT"      { return symbol(sym.INGREDIENT, TokenType.INGREDIENT); }
  "STEP"            { return symbol(sym.STEP, TokenType.STEP); }
  "GRAMS"           { return symbol(sym.GRAMS, TokenType.GRAMS); }
  "OF"              { return symbol(sym.OF, TokenType.OF); }
  "BOIL"            { return symbol(sym.BOIL, TokenType.BOIL); }
  "ADD"             { return symbol(sym.ADD, TokenType.ADD); }
  "FOR"             { return symbol(sym.FOR, TokenType.FOR); }
  "MINUTES"         { return symbol(sym.MINUTES, TokenType.MINUTES); }

  /* Simbolos de separacion */
  ":"               { return symbol(sym.COLON, TokenType.COLON); }
  ";"               { return symbol(sym.SEMICOLON, TokenType.SEMICOLON); }

  /* Literales e identificadores */
  {Number}          { return symbol(sym.NUMBER, TokenType.NUMBER); }
  {Word}            { return symbol(sym.WORD, TokenType.WORD); }

  /* Espacios en blanco (ignorados por el analizador) */
  {WhiteSpace}      { /* ignore */ }

  /* Caracteres no reconocidos: se reportan como ERROR */
  [^]               { return symbol(sym.error, TokenType.ERROR); }
}
