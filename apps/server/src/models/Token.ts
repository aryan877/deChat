import mongoose from "mongoose";

// Define the token schema
const tokenSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    address: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    symbol: {
      type: String,
      required: true,
      index: true,
    },
    decimals: {
      type: Number,
      required: true,
    },
    logo: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create text indexes for better search capabilities
// Using weight to prioritize symbol matches over name matches
tokenSchema.index(
  { name: "text", symbol: "text" },
  { weights: { symbol: 10, name: 5 } }
);

// Create the Token model
export const Token = mongoose.model("Token", tokenSchema);

// Function to ensure indexes are created
export const ensureIndexes = async () => {
  try {
    try {
      await Token.collection.dropIndex("name_text_symbol_text");
      console.log("Dropped existing text index");
    } catch (dropError: any) {
      console.log(
        "No existing index to drop or error dropping index:",
        dropError.message
      );
    }

    await Token.createIndexes();
    console.log("Token indexes created successfully");
  } catch (error) {
    console.error("Error creating token indexes:", error);
  }
};
