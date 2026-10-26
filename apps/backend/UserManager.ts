import { WebSocket } from "ws";
import { sessionModel, workspaceModel } from "db/client";
import { ConnectionResponse, Workspace } from "common/types";
import { User } from "./user";

export class UserManager {
  private users: User[] = [];
  private static instance: UserManager;

  private constructor() {
    this.users = [];
  }

  public static getInstance(): UserManager {
    if (UserManager.instance) {
      return UserManager.instance;
    }
    UserManager.instance = new UserManager();
    return UserManager.instance;
  }

  public addUser(socket: WebSocket): User {
    const user = new User(socket);
    this.users.push(user);

    this.sendInitialState(socket);

    socket.on("close", () => {
      this.users = this.users.filter((x) => x.id !== user.id);
    });

    return user;
  }

  private async sendInitialState(socket: WebSocket) {
    const workspaces = await workspaceModel.find({});
    const sessions = await sessionModel.find({}).populate("workspace");

    const response: Workspace[] = [];

    workspaces.forEach((w) => {
      response.push({
        id: w.id.toString(),
        name: w.name ?? null,
        path: w.path ?? "",
        sessions: [],
      });
    });

    sessions.forEach((s) => {
      const workspace = response.find(
        (w) => w.id === (s.workspace as any)?.id?.toString()
      );
      workspace?.sessions.push({
        id: s.id,
        messages: s.conversations.map((c: any) => ({
          role: c.role,
          payload: c.payload,
        })),
      });
    });

    socket.send(
      JSON.stringify({
        type: "init",
        workspaces: response,
      } satisfies ConnectionResponse)
    );
  }
}
