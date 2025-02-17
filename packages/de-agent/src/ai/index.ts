import { tool, type CoreTool } from "ai";
import { DeAgent } from "../agent/index.js";
import { executeAction } from "../utils/actionExecutor.js";
import { ACTIONS } from "../actions/index.js";
import type { Action } from "../types/action.js";

export function createSonicTools(DeAgent: DeAgent): Record<string, CoreTool> {
  const tools: Record<string, CoreTool> = {};
  const actionKeys = Object.keys(ACTIONS) as Array<keyof typeof ACTIONS>;

  for (const key of actionKeys) {
    const action = ACTIONS[key] as Action;
    const toolConfig: any = {
      id: action.name,
      description: action.description,
      parameters: action.schema,
      requires_confirmation: action.requiresConfirmation ?? false,
    };

    if (action.handler) {
      toolConfig.execute = async (params: any) => {
        const result = await executeAction(action, DeAgent, params);
        return result;
      };
    }

    tools[key] = tool(toolConfig);
  }

  return tools;
}
