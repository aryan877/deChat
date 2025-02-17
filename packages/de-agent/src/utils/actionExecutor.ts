import { Action, HandlerResponse } from "../types/action.js";
import { DeAgent } from "../agent/index.js";
import { ACTIONS } from "../actions/index.js";

export function findAction(query: string): Action | undefined {
  const normalizedQuery = query.toLowerCase().trim();
  return Object.values(ACTIONS).find(
    (action): action is Action =>
      action.name.toLowerCase() === normalizedQuery ||
      action.similes.some(
        (simile: string) => simile.toLowerCase() === normalizedQuery
      )
  );
}

export async function executeAction(
  action: Action,
  agent: DeAgent,
  input: Record<string, any>
): Promise<HandlerResponse> {
  try {
    // Validate input using Zod schema
    const validatedInput = action.schema.parse(input);

    // Execute the action with validated input
    // We know handler exists because we only call this for backend tools
    const result = await action.handler!(agent, validatedInput);

    return result;
  } catch (error: any) {
    // Handle Zod validation errors specially
    if (error.errors) {
      return {
        status: "error",
        message: "Validation error",
        error: {
          code: "VALIDATION_ERROR",
          message: "Input validation failed",
          details: error.errors,
        },
      };
    }

    return {
      status: "error",
      message: error.message,
      error: {
        code: error.code || "EXECUTION_ERROR",
        message: error.message,
      },
    };
  }
}

/**
 * Get examples for an action
 */
export function getActionExamples(action: Action): string {
  return action.examples
    .flat()
    .map((example) => {
      return `Input: ${JSON.stringify(example.input, null, 2)}
Output: ${JSON.stringify(example.output, null, 2)}
Explanation: ${example.explanation}
---`;
    })
    .join("\n");
}
