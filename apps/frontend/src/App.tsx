import { useContext, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import ReactMarkdown from "react-markdown";
import { AppContext } from "./context/AppContext";
import { useSocket } from "./hooks/useSocket";
import { Session, Workspace } from "common/types";
import "./index.css";

const THINKING_MESSAGES = [
  "Thinking...",
  "Connecting the dots...",
  "Reading through your code...",
  "Brewing something up...",
  "Almost there...",
];

function Sidebar({
  activeSessionId,
  onSelectSession,
}: {
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
}) {
  const { workspaces, setWorkspaces, socket } = useContext(AppContext);
  const [path, setPath] = useState("");
  const [expandedWorkspaceId, setExpandedWorkspaceId] = useState<string | null>(
    null
  );

  const addWorkspace = () => {
    if (!path.trim() || !socket) {
      return;
    }

    // Optimistically add the workspace. The id and name get filled in
    // when the backend responds back with a workspaceCreated message.
    setWorkspaces([...workspaces, { id: null, name: null, path, sessions: [] }]);
    socket.send(
      JSON.stringify({
        type: "createWorkspace",
        payload: { path },
      })
    );
    setPath("");
  };

  const addSession = (workspaceId: string) => {
    socket?.send(
      JSON.stringify({
        type: "createSession",
        payload: { workspaceId },
      })
    );
  };

  return (
    <div className="w-72 h-screen flex flex-col border-r border-neutral-800 bg-neutral-950">
      <div className="p-4 text-lg font-semibold border-b border-neutral-800">
        acode
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {workspaces.map((w) => (
          <div key={w.id ?? w.path} className="mb-1">
            <button
              className="w-full text-left px-3 py-2 rounded hover:bg-neutral-900 text-sm truncate"
              onClick={() =>
                setExpandedWorkspaceId(expandedWorkspaceId === w.id ? null : w.id)
              }
            >
              {w.name ?? w.path.split("/").pop()}
            </button>
            {expandedWorkspaceId === w.id && (
              <div className="pl-4">
                {w.sessions.map((s) => (
                  <button
                    key={s.id}
                    className={`w-full text-left px-3 py-1.5 rounded text-sm truncate ${
                      activeSessionId === s.id
                        ? "bg-neutral-800 text-neutral-100"
                        : "text-neutral-300 hover:bg-neutral-900"
                    }`}
                    onClick={() => onSelectSession(s.id)}
                  >
                    Session {s.id.slice(0, 6)}
                  </button>
                ))}
                <button
                  className="w-full text-left px-3 py-1.5 rounded text-sm text-neutral-500 hover:bg-neutral-900"
                  onClick={() => w.id && addSession(w.id)}
                >
                  + New session
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-neutral-800 flex gap-2">
        <input
          type="text"
          placeholder="Path to your project"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          className="flex-1 bg-neutral-900 rounded px-2 py-1.5 text-sm outline-none"
        />
        <button
          className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-sm"
          onClick={addWorkspace}
        >
          Add
        </button>
      </div>
    </div>
  );
}

function ToolMessage({ payload }: { payload: any }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex justify-center my-1">
      <div className="border border-neutral-800 rounded-lg text-xs text-neutral-400 max-w-2xl w-full">
        <button
          className="w-full flex justify-between items-center px-3 py-1.5"
          onClick={() => setOpen(!open)}
        >
          <span>Tool {payload.message}</span>
          <span>{open ? "-" : "+"}</span>
        </button>
        {open && payload.input && (
          <pre className="px-3 pb-2 overflow-x-auto text-neutral-500 whitespace-pre-wrap">
            {JSON.stringify(payload.input, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

function ChatWindow({
  activeSession,
  isThinking,
  setIsThinking,
}: {
  activeSession: Session | null;
  isThinking: boolean;
  setIsThinking: Dispatch<SetStateAction<boolean>>;
}) {
  const { socket, workspaces, setWorkspaces } = useContext(AppContext);
  const [input, setInput] = useState("");
  const [thinkingIndex, setThinkingIndex] = useState(0);

  useEffect(() => {
    if (!isThinking) {
      return;
    }
    const interval = setInterval(() => {
      setThinkingIndex((i) => (i + 1) % THINKING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isThinking]);

  const sendMessage = () => {
    if (!input.trim() || !activeSession || !socket) {
      return;
    }

    const message = input;
    setInput("");

    // Optimistically show the user message on the right
    setWorkspaces(
      workspaces.map((w) => ({
        ...w,
        sessions: w.sessions.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                messages: [
                  ...s.messages,
                  { role: "user", payload: { message } },
                ],
              }
            : s
        ),
      }))
    );

    setIsThinking(true);

    socket.send(
      JSON.stringify({
        type: "addMessage",
        payload: { sessionId: activeSession.id, message },
      })
    );
  };

  return (
    <div className="flex-1 h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
        {!activeSession && (
          <div className="m-auto text-neutral-600 text-sm">
            Create or select a session to start
          </div>
        )}
        {activeSession?.messages.map((m, i) => {
          if (m.role === "user") {
            return (
              <div key={i} className="flex justify-end">
                <div className="bg-neutral-800 rounded-lg px-4 py-2 max-w-2xl text-sm">
                  {m.payload.message}
                </div>
              </div>
            );
          }
          if (m.payload?.type === "tool") {
            return <ToolMessage key={i} payload={m.payload} />;
          }
          return (
            <div key={i} className="flex justify-start">
              <div className="max-w-2xl text-sm break-words">
                <ReactMarkdown>{m.payload.message ?? ""}</ReactMarkdown>
              </div>
            </div>
          );
        })}
        {isThinking && activeSession && (
          <div className="flex justify-start text-neutral-500 text-sm animate-pulse">
            {THINKING_MESSAGES[thinkingIndex]}
          </div>
        )}
      </div>
      <div className="p-4 border-t border-neutral-800 flex gap-2">
        <input
          type="text"
          placeholder="Send a message to the agent..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 bg-neutral-900 rounded px-3 py-2 text-sm outline-none"
        />
        <button
          className="px-4 py-2 rounded bg-white text-black text-sm font-medium"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const { loading, socket } = useSocket();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    if (loading || !socket) {
      return;
    }

    socket.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);

      if (parsedData.type === "init") {
        setWorkspaces(parsedData.workspaces);
      } else if (parsedData.type === "workspaceCreated") {
        setWorkspaces((prev) =>
          prev.map((w) =>
            w.id === null ? { ...parsedData.payload, sessions: [] } : w
          )
        );
      } else if (parsedData.type === "sessionCreated") {
        setWorkspaces((prev) =>
          prev.map((w) =>
            w.id === parsedData.payload.workspaceId
              ? {
                  ...w,
                  sessions: [
                    ...w.sessions,
                    { id: parsedData.payload.sessionId, messages: [] },
                  ],
                }
              : w
          )
        );
      } else if (parsedData.type === "assistantMessage") {
        setIsThinking(false);
        setWorkspaces((prev) =>
          prev.map((w) => ({
            ...w,
            sessions: w.sessions.map((s) =>
              s.id === parsedData.payload.sessionId
                ? {
                    ...s,
                    messages: [
                      ...s.messages,
                      { role: "assistant", payload: parsedData.payload },
                    ],
                  }
                : s
            ),
          }))
        );
      }
    };
  }, [loading, socket]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">
        Loading...
      </div>
    );
  }

  const activeSession =
    workspaces.flatMap((w) => w.sessions).find((s) => s.id === activeSessionId) ??
    null;

  return (
    <AppContext.Provider value={{ workspaces, setWorkspaces, socket }}>
      <div className="flex bg-neutral-950 text-neutral-100">
        <Sidebar
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
        />
        <ChatWindow
          activeSession={activeSession}
          isThinking={isThinking}
          setIsThinking={setIsThinking}
        />
      </div>
    </AppContext.Provider>
  );
}
