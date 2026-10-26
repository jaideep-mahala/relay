import { WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import {
  addMessageSchema,
  createSessionSchema,
  createWorkspaceSchema,
  IncomingMessage,
  OutgoingMessage,
} from "common/types";
import { sessionModel, workspaceModel } from "db/client";
import { query } from "@anthropic-ai/claude-agent-sdk";

export class User {
  private socket: WebSocket;
  public id: string;

  constructor(socket: WebSocket) {
    this.socket = socket;
    this.id = uuidv4();
  }

  public async handleIncomingMessage(
    message: IncomingMessage
  ): Promise<OutgoingMessage> {
    if (message.type === "createWorkspace") {
      const parsedData = createWorkspaceSchema.safeParse(message.payload);
      if (!parsedData.success) {
        throw new Error("Incorrect schema");
      }

      const workspace = await workspaceModel.create({
        path: parsedData.data.path,
        name: parsedData.data.path.split("/").pop(),
      });

      return {
        type: "workspaceCreated",
        payload: {
          id: workspace.id.toString(),
          path: workspace.path!,
          name: workspace.name!,
        },
      };
    }

    if (message.type === "createSession") {
      const parsedData = createSessionSchema.safeParse(message.payload);
      if (!parsedData.success) {
        throw new Error("Incorrect schema");
      }

      const session = await sessionModel.create({
        workspace: parsedData.data.workspaceId,
        conversations: [],
      });

      return {
        type: "sessionCreated",
        payload: {
          sessionId: session.id.toString(),
          workspaceId: parsedData.data.workspaceId,
        },
      };
    }

    if (message.type === "addMessage") {
      const parsedData = addMessageSchema.safeParse(message.payload);
      if (!parsedData.success) {
        throw new Error("Incorrect schema");
      }

      // Dump the user's message into the database first
      await sessionModel.updateOne(
        { _id: parsedData.data.sessionId },
        {
          $push: {
            conversations: {
              role: "user",
              payload: {
                message: parsedData.data.message,
              },
            },
          },
        }
      );

      const session = await sessionModel.findById(parsedData.data.sessionId);
      if (!session) {
        throw new Error("Session does not exist");
      }

      const workspace = await workspaceModel.findOne({
        _id: session.workspace,
      });
      if (!workspace?.path) {
        throw new Error("Workspace does not exist");
      }

      // If this session has spoken to the agent before, resume the same
      // anthropic session, otherwise start a fresh one
      const resume =
        session.conversations.length === 0
          ? undefined
          : (session.anthropicSessionId ?? undefined);

      const result = query({
        prompt: parsedData.data.message,
        options: {
          cwd: workspace.path,
          resume,
          permissionMode: "bypassPermissions",
        },
      });

      for await (const message of result) {
        if (message.type === "result") {
          session.anthropicSessionId = message.session_id;
          await session.save();

          const payload = {
            sessionId: parsedData.data.sessionId,
            type: "result",
            message:
              message.subtype === "success"
                ? message.result
                : `Error: ${message.subtype}`,
          };

          this.sendMessage({
            type: "assistantMessage",
            payload,
          });

          await sessionModel.updateOne(
            { _id: parsedData.data.sessionId },
            {
              $push: {
                conversations: {
                  role: "assistant",
                  payload,
                },
              },
            }
          );
        } else if (message.type === "assistant") {
          for (const block of message.message.content) {
            if (block.type === "tool_use") {
              const payload = {
                sessionId: parsedData.data.sessionId,
                type: "tool",
                message: block.name,
                input: block.input,
              };

              this.sendMessage({
                type: "assistantMessage",
                payload,
              });

              await sessionModel.updateOne(
                { _id: parsedData.data.sessionId },
                {
                  $push: {
                    conversations: {
                      role: "assistant",
                      payload,
                    },
                  },
                }
              );
            }
          }
        }
      }

      return {
        type: "messageAdded",
        payload: {
          id: "1",
        },
      };
    }

    throw new Error("Incorrect schema");
  }

  public async sendMessage(payload: OutgoingMessage) {
    this.socket.send(JSON.stringify(payload));
  }
}
