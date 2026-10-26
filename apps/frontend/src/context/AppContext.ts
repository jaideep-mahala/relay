import { createContext, type Dispatch, type SetStateAction } from "react";
import { Workspace } from "common/types";

export interface AppContextType {
  workspaces: Workspace[];
  setWorkspaces: Dispatch<SetStateAction<Workspace[]>>;
  socket: WebSocket | null;
}

export const AppContext = createContext<AppContextType>({
  workspaces: [],
  setWorkspaces: () => {},
  socket: null,
});