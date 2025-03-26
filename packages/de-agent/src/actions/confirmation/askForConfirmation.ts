import { z } from "zod";
import { Action } from "../../types/action.js";
import { ACTION_NAMES } from "../actionNames.js";

export type AskForConfirmationInput = z.infer<typeof askForConfirmationSchema>;

const askForConfirmationSchema = z.object({
  message: z.string().describe("The message to ask for confirmation"),
});

const askForConfirmationAction: Action = {
  name: ACTION_NAMES.ASK_FOR_CONFIRMATION,
  similes: ["confirm", "ask for confirmation", "get user approval"],
  description: "Ask the user for confirmation before proceeding with an action",
  examples: [
    [
      {
        input: {
          message: "Do you want to proceed with transferring 1 SONIC?",
        },
        output: {
          status: "success",
          data: {
            confirmed: true,
          },
          message: "User confirmed the action",
        },
        explanation:
          "Ask user to confirm a SONIC token transfer on Sonic Network",
      },
    ],
  ],
  schema: askForConfirmationSchema,
  //   handler: async (
  //     _agent,
  //     input: Record<string, any>,
  //   ): Promise<HandlerResponse<{ confirmed: boolean }>> => {
  //     // This is a client-side action, so we just return success
  //     // The actual confirmation will be handled by the frontend
  //     return {
  //       status: "success",
  //       message: "Waiting for user confirmation",
  //       data: {
  //         confirmed: false,
  //       },
  //     };
  //   },
};

export default askForConfirmationAction;
