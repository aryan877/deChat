import mongoose from "mongoose";

const docsSyncSchema = new mongoose.Schema(
  {
    lastSync: {
      type: Date,
      required: true,
    },
    documentsProcessed: {
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
    usedCachedData: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const DocsSync = mongoose.model("DocsSync", docsSyncSchema);

export const getLastSuccessfulDocsSync = async (): Promise<Date | null> => {
  const lastSync = await DocsSync.findOne(
    { status: "success" },
    {},
    { sort: { lastSync: -1 } }
  );
  return lastSync?.lastSync || null;
};

export const recordDocsSync = async (
  documentsProcessed: number,
  status: "success" | "failed",
  usedCachedData: boolean = false,
  error?: string
) => {
  await DocsSync.create({
    lastSync: new Date(),
    documentsProcessed,
    status,
    usedCachedData,
    error,
  });
};
