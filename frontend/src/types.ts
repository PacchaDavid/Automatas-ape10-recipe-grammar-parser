export type TokenType =
  | 'INGREDIENT'
  | 'STEP'
  | 'GRAMS'
  | 'OF'
  | 'BOIL'
  | 'ADD'
  | 'FOR'
  | 'MINUTES'
  | 'NUMBER'
  | 'WORD'
  | 'COLON'
  | 'SEMICOLON'
  | 'EOF'
  | 'ERROR';

export interface Token {
  type: TokenType;
  lexeme: string;
  line: number;
  column: number;
}

export interface CompileError {
  type: 'LEXICO' | 'SINTACTICO';
  message: string;
  line: number;
  column: number;
}

export interface TimeNode {
  type: 'TIME';
  duration: number;
  unit: string;
}

export interface ActionNode {
  type: 'ACTION';
  actionType: 'BOIL' | 'ADD';
  target: string;
  time: TimeNode | null;
}

export interface StepNode {
  type: 'STEP';
  number: number;
  action: ActionNode;
}

export interface IngredientNode {
  type: 'INGREDIENT';
  quantity: number;
  unit: string;
  name: string;
}

export interface RecipeNode {
  type: 'RECIPE';
  ingredient: IngredientNode;
  steps: StepNode[];
}

export interface AnalyzeResponse {
  success: boolean;
  tokens: Token[];
  ast: RecipeNode | null;
  errors: CompileError[];
}
