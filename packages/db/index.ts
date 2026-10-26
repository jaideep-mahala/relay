import mongoose from "mongoose";

export const workspaceSchema = new mongoose.Schema({
  path: String,
  name: String,
});

export const sessionSchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
  },
  conversations: [
    {
      role: {
        type: String,
        enum: ["user", "assistant"],
      },
      payload: Object,
    },
  ],
  anthropicSessionId: {
    type: String,
    required: false,
  },
});

export const workspaceModel = mongoose.model("Workspace", workspaceSchema);
export const sessionModel = mongoose.model("Session", sessionSchema);