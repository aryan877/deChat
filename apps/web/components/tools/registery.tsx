// import { ConfirmationTool } from "./ConfirmationTool";
import { ToolInvocation } from "ai";
// import {
//   isToolResult,
//   ToolResultType,
//   ToolResultTypes,
//   ToolInputType,
// } from "../../types/tools";
import { ACTION_NAMES } from "@repo/de-agent";
import {
  isToolResult,
  ToolInputType,
  ToolResultType,
  ToolResultTypes,
} from "../../app/types/tools";
import { ConfirmationTool } from "./ConfirmationTool";

interface ToolConfig<T extends keyof ToolResultTypes> {
  component: React.ComponentType<{
    args: ToolInputType<T>;
    onSubmit: (result: ToolResultType<T>) => void;
  }>;
  preprocess?: (result: unknown) => ToolResultType<T>;
}

type ToolRegistry = {
  [T in keyof ToolResultTypes]: ToolConfig<T>;
};

export const toolRegistry: ToolRegistry = {
  [ACTION_NAMES.ASK_FOR_CONFIRMATION]: {
    component: ConfirmationTool,
  },
};

export type ValidToolName = keyof typeof toolRegistry;
export const VALID_TOOL_NAMES = Object.keys(toolRegistry) as ValidToolName[];

export function getToolComponent(toolInvocation: ToolInvocation) {
  const { toolName } = toolInvocation;
  const config = toolRegistry[toolName as ValidToolName];
  return config?.component;
}

export function preprocessToolResult<T extends keyof ToolResultTypes>(
  toolName: T,
  result: unknown
): ToolResultType<T> {
  const preprocessor = toolRegistry[toolName]?.preprocess;
  if (!preprocessor) {
    if (isToolResult(result)) {
      return result as ToolResultType<T>;
    }
    return {
      status: "success",
      message: "Operation completed successfully",
      data: result,
    } as ToolResultType<T>;
  }

  try {
    const processedResult = preprocessor(result);
    return processedResult;
  } catch (error) {
    return {
      status: "error",
      message: "Failed to process tool result",
      error: {
        code: "PREPROCESS_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        details: error,
      },
    } as ToolResultType<T>;
  }
}
