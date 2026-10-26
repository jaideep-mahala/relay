import { z } from "zod";

export const createWorkspaceSchema = z.object({
  path: z.string(),
});

export type CreateWorkspaceSchema = z.infer<typeof createWorkspaceSchema>;

export const createSessionSchema = z.object({
  workspaceId: z.string(),
});

export type CreateSessionSchema = z.infer<typeof createSessionSchema>;

export const addMessageSchema = z.object({
  sessionId: z.string(),
  message: z.string(),
});

export type AddMessageSchema = z.infer<typeof addMessageSchema>;

export type IncomingMessageType =
  | "createWorkspace"
  | "createSession"
  | "addMessage";

export type IncomingMessage =
  | {
      type: "createWorkspace";
      payload: CreateWorkspaceSchema;
    }
  | {
      type: "createSession";
      payload: CreateSessionSchema;
    }
  | {
      type: "addMessage";
      payload: AddMessageSchema;
    };
