import mongoose from "mongoose";

const toolInvocationSchema = new mongoose.Schema(
  {
    toolCallId: {
      type: String,
      required: true,
    },
    toolName: {
      type: String,
      required: true,
    },
    args: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    result: mongoose.Schema.Types.Mixed,
    state: {
      type: String,
      enum: ["partial-call", "call", "result"],
      required: true,
    },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant", "system", "data"],
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    name: String,
    data: mongoose.Schema.Types.Mixed,
    annotations: [mongoose.Schema.Types.Mixed],
    experimental_providerMetadata: mongoose.Schema.Types.Mixed,
    toolInvocations: {
      type: [toolInvocationSchema],
      default: [],
    },
  },
  { _id: false }
);

const chatThreadSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    threadId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      default: "",
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ChatThread = mongoose.model("ChatThread", chatThreadSchema);
