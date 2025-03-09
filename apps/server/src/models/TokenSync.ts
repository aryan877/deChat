import mongoose from "mongoose";

const tokenSyncSchema = new mongoose.Schema(
  {
    lastSync: {
      type: Date,
      required: true,
    },
    tokensUpdated: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      required: true,
    },
    error: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const TokenSync = mongoose.model("TokenSync", tokenSyncSchema);

export const getLastSuccessfulSync = async (): Promise<Date | null> => {
  const lastSync = await TokenSync.findOne(
    { status: "success" },
    {},
    { sort: { lastSync: -1 } }
  );
  return lastSync?.lastSync || null;
};

export const recordSync = async (
  tokensUpdated: number,
  status: "success" | "failed",
  error?: string
) => {
  await TokenSync.create({
    lastSync: new Date(),
    tokensUpdated,
    status,
    error,
  });
};
