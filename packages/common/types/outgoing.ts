import { z } from "zod";

export const workspaceCreatedSchema = z.object({
  id: z.string(),
  path: z.string(),
  name: z.string(),
});

export type WorkspaceCreatedSchema = z.infer<typeof workspaceCreatedSchema>;

export const sessionCreatedSchema = z.object({
  sessionId: z.string(),
  workspaceId: z.string(),
});

export type SessionCreatedSchema = z.infer<typeof sessionCreatedSchema>;

export const messageCreatedSchema = z.object({
  id: z.string(),
});

export type MessageCreatedSchema = z.infer<typeof messageCreatedSchema>;

export const assistantMessageAddedSchema = z.any();

export type AssistantMessageAddedSchema = z.infer<
  typeof assistantMessageAddedSchema
>;

export type OutgoingMessageType =
  | "workspaceCreated"
  | "sessionCreated"
  | "messageAdded"
  | "assistantMessage";

export type OutgoingMessage =
  | {
      type: "workspaceCreated";
      payload: WorkspaceCreatedSchema;
    }
  | {
      type: "sessionCreated";
      payload: SessionCreatedSchema;
    }
  | {
      type: "messageAdded";
      payload: MessageCreatedSchema;
    }
  | {
      type: "assistantMessage";
      payload: AssistantMessageAddedSchema;
    };

export type Message =
  | {
      role: "user";
      payload: {
        message: string;
      };
    }
  | {
      role: "assistant";
      payload: any;
    };

export type Session = {
  id: string;
  messages: Message[];
};

export type Workspace = {
  id: string | null;
  name: string | null;
  path: string;
  sessions: Session[];
};

export type ConnectionResponse = {
  type: "init";
  workspaces: Workspace[];
};

export type AssistantMessageAdded = {
  type: "assistantMessage";
  payload: {
    sessionId: string;
    type: string;
    message: string;
    input?: any;
  };
};
