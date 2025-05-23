import type { Plugin } from "../types"

export interface CalculatorData {
  expression: string
  result: string
}

export class CalculatorPlugin implements Plugin {
  name = "calc"
  description = "Calculate mathematical expressions"
  triggers = [/^\/calc\s+(.+)$/i]
  naturalLanguageTriggers = ["calculate", "compute", "what is", "what's", "solve"]

  async execute(expression: string): Promise<{ response: string; data: CalculatorData }> {
    if (!expression) {
      throw new Error("Expression is required")
    }

    try {
      // Clean up the expression
      const cleanExpression = this.cleanExpression(expression)

      // Validate the expression for safety
      this.validateExpression(cleanExpression)

      // Evaluate the expression
      // Using Function constructor is generally not recommended for security reasons,
      // but we've validated the input to ensure it only contains safe mathematical operations
      const result = new Function(`return ${cleanExpression}`)()

      // Format the result
      const formattedResult = this.formatResult(result)

      const data: CalculatorData = {
        expression: cleanExpression,
        result: formattedResult,
      }

      // Generate response text
      const response = `${cleanExpression} = ${formattedResult}`

      return { response, data }
    } catch (error) {
      console.error("Calculator plugin error:", error)
      if (error instanceof Error) {
        throw new Error(`Calculation error: ${error.message}`)
      }
      throw new Error("Could not calculate the expression. Please check your input.")
    }
  }

  private cleanExpression(expression: string): string {
    // Remove any non-mathematical characters and common natural language patterns
    let cleaned = expression
      .replace(/what\s+is|what's|calculate|compute|solve/gi, "")
      .replace(/[^0-9+\-*/().%\s]/g, "")
      .trim()

    // Handle special cases like "5 + 5" vs "5+5"
    cleaned = cleaned.replace(/\s+/g, " ")

    return cleaned
  }

  private validateExpression(expression: string): void {
    // Check for potentially unsafe code
    if (/[a-zA-Z_$]/.test(expression)) {
      throw new Error("Expression contains invalid characters")
    }

    // Check for balanced parentheses
    const stack = []
    for (const char of expression) {
      if (char === "(") {
        stack.push(char)
      } else if (char === ")") {
        if (stack.length === 0) {
          throw new Error("Unbalanced parentheses")
        }
        stack.pop()
      }
    }

    if (stack.length > 0) {
      throw new Error("Unbalanced parentheses")
    }

    // Check for valid mathematical expression
    if (!/^[\d\s+\-*/%().]+$/.test(expression)) {
      throw new Error("Expression contains invalid characters")
    }
  }

  private formatResult(result: number): string {
    // Handle special cases
    if (isNaN(result)) {
      return "Not a number"
    }

    if (!isFinite(result)) {
      return result > 0 ? "Infinity" : "-Infinity"
    }

    // Format decimal numbers nicely
    if (Number.isInteger(result)) {
      return result.toString()
    } else {
      // Limit to 6 decimal places
      return result.toFixed(6).replace(/\.?0+$/, "")
    }
  }
}
