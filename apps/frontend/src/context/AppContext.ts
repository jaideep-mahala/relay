import { createContext, type Dispatch, type SetStateAction } from "react";
import type { Workspace } from "common/types";

export interface AppContextType {
  workspaces: Workspace[];
  setWorkspaces: Dispatch<SetStateAction<Workspace[]>>;
  socket: WebSocket | null;
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
}

export const AppContext = createContext<AppContextType>({
  workspaces: [],
  setWorkspaces: () => {},
  socket: null,
  activeSessionId: null,
  setActiveSessionId: () => {},
});
