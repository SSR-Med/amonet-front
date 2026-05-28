import { parse, type MathNode } from 'mathjs';

export function validateFormula(formula: string, variableNames: string[]): { valid: boolean; error?: string } {
  if (!formula.trim()) {
    return { valid: false, error: 'La fórmula no puede estar vacía' };
  }

  try {
    const node = parse(formula);
    const usedSymbols: string[] = [];
    
    node.traverse((n: MathNode) => {
      if (n.type === 'SymbolNode' && 'name' in n) {
        usedSymbols.push(n.name as string);
      }
    });

    for (const symbol of usedSymbols) {
      if (!variableNames.includes(symbol)) {
        return { valid: false, error: `Variable "${symbol}" no está definida` };
      }
    }

    const scope = variableNames.reduce((acc, name) => ({ ...acc, [name]: 1 }), {} as Record<string, number>);
    node.evaluate(scope);
    
    return { valid: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Expresión inválida';
    return { valid: false, error };
  }
}

export function getFormulaVariables(formula: string): Record<string, string> {
  const variables: Record<string, string> = {};
  
  try {
    const node = parse(formula);
    
    node.traverse((n: MathNode) => {
      if (n.type === 'SymbolNode' && 'name' in n) {
        const name = n.name as string;
        variables[name] = name;
      }
    });
  } catch {
    // ignore parse errors in extraction
  }
  
  return variables;
}
