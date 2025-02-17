import { Router } from "express";
import { authenticateUser } from "../middleware/auth/index.js";
import { validateCluster } from "../middleware/auth/cluster.js";
import {
  getThreads,
  createNewThread,
  sendMessage,
  getThreadHistory,
  deleteThread,
  saveAllMessages,
} from "../controllers/chatController.js";
import {
  validateSendMessage,
  validateThreadHistory,
  validateDeleteThread,
  validateSaveAllMessages,
  validateGetThreads,
} from "../validators/chatValidators.js";
import { asyncHandler } from "../middleware/errors/asyncHandler.js";

export function setupChatRoutes(router: Router): Router {
  router.use(authenticateUser);
  router.use(validateCluster);

  router.get("/threads", validateGetThreads, asyncHandler(getThreads));

  router.post(
    "/thread",
    asyncHandler((req, res) => createNewThread(req, res))
  );

  router.post(
    "/message",
    validateSendMessage,
    asyncHandler(async (req, res) => {
      await sendMessage(req, res);
    })
  );

  router.post(
    "/save-all-messages",
    validateSaveAllMessages,
    asyncHandler(saveAllMessages)
  );

  router.get(
    "/history/:threadId",
    validateThreadHistory,
    asyncHandler(getThreadHistory)
  );

  router.delete(
    "/thread/:threadId",
    validateDeleteThread,
    asyncHandler((req, res) => deleteThread(req, res))
  );

  return router;
}
