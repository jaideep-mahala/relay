import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "./context/AppContext";
import { useSocket } from "./hooks/useSocket";
import type { Session, Workspace, Message } from "common/types";
import "./index.css";


interface SidebarProps {
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  workspaces: Workspace[];
  expandedWorkspaceId: string | null;
  onToggleExpand: (workspaceId: string) => void;
  onAddWorkspace: (path: string) => void;
}

function Sidebar({
  activeSessionId,
  onSelectSession,
  workspaces,
  expandedWorkspaceId,
  onToggleExpand,
  onAddWorkspace,
}: SidebarProps) {
  const { socket } = useContext(AppContext);

  const addWorkspace = (path: string) => {
    if (!socket) return;
    onAddWorkspace(path);
  };

  const addSession = (workspaceId: string) => {
    if (!socket) return;
    socket.send(JSON.stringify({ type: "createSession", payload: { workspaceId } }));
  };

  return (
    <div className="sidebar flex flex-col h-full bg-[#111111]">
      <div className="p-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">relay</h1>
            <p className="text-xs text-neutral-500">AI Coding Assistant</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
            Connected
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Path to project (e.g. /workspace/webapp)"
              className="flex-1 bg-neutral-900/50 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-neutral-600"
              onKeyDown={(e) => e.key === "Enter" && addWorkspace((document.activeElement as HTMLInputElement)?.value || "")}
            />
            <button
              onClick={() => addWorkspace((document.activeElement as HTMLInputElement)?.value || "")}
              className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        <div className="px-3 pb-2">
          <p className="text-xs text-neutral-500 font-medium mb-2 px-3">Workspaces</p>
          <div className="space-y-0">
            {workspaces.map((w) => (
              <div key={w.id ?? w.path}>
                <button
                  className="w-full flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-left hover:bg-neutral-800/50 transition-colors group"
                  onClick={() => w.id && onToggleExpand(w.id)}
                >
                  <svg
                    className={`w-3.5 h-3.5 text-neutral-500 flex-shrink-0 transition-transform${expandedWorkspaceId === w.id ? " rotate-90" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 5 7 7-7 7" />
                  </svg>
                  <span className={`text-sm truncate ${w.name ? "font-medium" : "font-mono text-neutral-400"}`}>
                    {w.name ?? w.path.split("/").pop() ?? "Untitled"}
                  </span>
                  <span className="text-xs text-neutral-600 ml-auto flex-shrink-0">
                    {w.sessions.length}
                  </span>
                </button>

                {expandedWorkspaceId === w.id && (
                  <div className="pl-4 ml-5 border-l border-neutral-800 py-1 space-y-1">
                    {w.sessions.map((s) => (
                      <button
                        key={s.id}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-sm transition-colors ${
                          activeSessionId === s.id
                            ? "bg-neutral-800 text-white"
                            : "text-neutral-400 hover:bg-neutral-800/50"
                        }`}
                        onClick={() => onSelectSession(s.id)}
                      >
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.446 3 13.771 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Session {s.id.slice(0, 6)}
                        <span className="text-xs text-neutral-600 ml-auto flex-shrink-0">
                          {s.messages.length} messages
                        </span>
                      </button>
                    ))}
                    <button
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-sm text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-400 transition-colors"
                      onClick={() => w.id && addSession(w.id)}
                    >
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      New session
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-neutral-800 text-xs text-neutral-600">
        <p>Claude models • Local files • Real-time sync</p>
      </div>
    </div>
  );
}

function MessageBubble({ message, isAssistant }: { message: Message; isAssistant: boolean }) {
  return (
    <div className={`message-bubble ${isAssistant ? "assistant" : "user"}`}>
      <div className={`chat-bubble rounded-2xl px-4 py-2.5 max-w-[85%] ${
        isAssistant
          ? "rounded-2xl rounded-tl-sm bg-neutral-800/80 text-white/90"
          : "rounded-2xl rounded-tr-sm bg-neutral-700/80 text-white"
      }`}>
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.payload?.message ?? message.payload}
        </div>
        {isAssistant && <div className="flex justify-start gap-2 mt-1.5"><span className="text-[10px] text-neutral-500">AI</span></div>}
      </div>
    </div>
  );
}

function ChatWindow({
  activeSession,
  isThinking,
  setIsThinking,
  thinkingMessage,
}: {
  activeSession: Session | null;
  isThinking: boolean;
  setIsThinking: (v: boolean) => void;
  thinkingMessage: string;
}) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [activeSession?.id]);

  const sendMessage = () => {
    if (!input.trim() || !activeSession || !isThinking) return;
    setIsThinking(false);
    setInput("");
    textareaRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-window flex flex-col h-full bg-[#111111]">
      <div className="chat-header flex items-center gap-3 px-4 py-3 border-b border-neutral-800">
        {activeSession ? (
          <>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-medium text-white truncate">{activeSession.id.slice(0, 6)}</h2>
              <p className="text-xs text-neutral-500 truncate">{activeSession.messages.length} messages</p>
            </div>
            <button className="px-3 py-1.5 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <div className="flex-1">
            <p className="text-sm text-neutral-500">Select a session or create one</p>
            <p className="text-xs text-neutral-600">No active conversation</p>
          </div>
        )}
      </div>

      <div className="chat-messages flex-1 overflow-y-auto p-4 space-y-3">
        {!activeSession || activeSession.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white">No conversation yet</h3>
            <p className="text-sm text-neutral-500 mt-1 max-w-sm">
              Select a workspace and create a session to start coding with AI assistance.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeSession!.messages.map((m, i) => (
              <MessageBubble key={i} message={m} isAssistant={m.role === "assistant"} />
            ))}
            {isThinking && (
              <div className="message-bubble assistant-thinking">
                <div className="chat-bubble assistant">
                  <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-sm bg-neutral-800/80">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </div>
                    <span className="text-xs text-neutral-400 ml-2">{thinkingMessage}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="chat-input-border border-t border-neutral-800 p-3 bg-black/20">
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            className="flex-1 bg-transparent text-white placeholder:text-neutral-600 resize-none outline-none max-h-32 text-sm"
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-medium hover:from-purple-600 hover:to-indigo-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={sendMessage}
            disabled={!input.trim()}
          >
            Send
          </button>
        </div>
        <p className="text-xs text-neutral-700 mt-1.5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
          AI coding assistant using Claude
        </p>
      </div>
    </div>
  );
}
export default function App() {
  const { socket, loading, error } = useSocket();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState("");
  const [expandedWorkspaceId, setExpandedWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;
    socket.onmessage = (event) => {
      let parsedData: any;
      try {
        parsedData = JSON.parse(event.data);
      } catch {
        return;
      }
      switch (parsedData.type) {
        case "init": {
          setWorkspaces(parsedData.workspaces);
          break;
        }
        case "workspaceCreated": {
          setWorkspaces((prev) => [...prev, { ...parsedData.payload, sessions: [], id: null, name: null }]);
          break;
        }
        case "sessionCreated": {
          setWorkspaces((prev) => prev.map((w) =>
            w.id === parsedData.payload.workspaceId
              ? { ...w, sessions: [...w.sessions, { id: parsedData.payload.sessionId, messages: [] }] }
              : w
          ));
          break;
        }
        case "assistantMessage": {
          const payload = parsedData.payload as { sessionId: string; type: string; message: string; input?: any };
          setIsThinking(false);
          setThinkingMessage("");
          setWorkspaces((prev) => prev.map((w) => ({
            ...w,
            sessions: w.sessions.map((s) =>
              s.id === payload.sessionId
                ? { ...s, messages: [...s.messages, { role: "assistant", payload: { message: payload.message, type: payload.type } }] }
                : s
            ),
          })));
          break;
        }
      }
    };
  }, [socket]);

  useEffect(() => {
    if (workspaces.length > 0 && !activeSessionId) {
      const first = workspaces.flatMap((w) => w.sessions).find((s) => s.id);
      if (first) setActiveSessionId(first.id);
    }
  }, [workspaces, activeSessionId]);

  const activeSession = workspaces.flatMap((w) => w.sessions).find((s) => s.id === activeSessionId) ?? null;

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#111111] text-white p-6">
        <div className="max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white">Connection Error</h2>
          <p className="text-sm text-neutral-400 mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-lg bg-neutral-800 text-white text-sm font-medium hover:bg-neutral-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#111111] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-neutral-700 border-t-purple-500 animate-spin"></div>
          <p className="text-sm text-neutral-400">Connecting to backend</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{ socket, workspaces, setWorkspaces, activeSessionId, setActiveSessionId }}
    >
      <div className="app-layout flex h-screen overflow-hidden">
        <Sidebar
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
          workspaces={workspaces}
          expandedWorkspaceId={expandedWorkspaceId}
          onToggleExpand={setExpandedWorkspaceId}
          onAddWorkspace={() => {
            const input = prompt("Enter workspace path (e.g. /home/user/project):");
            if (!input) return;
            if (socket) socket.send(JSON.stringify({ type: "createWorkspace", payload: { path: input } }));
          }}
        />
        <ChatWindow
          activeSession={activeSession}
          isThinking={isThinking}
          setIsThinking={setIsThinking}
          thinkingMessage={thinkingMessage}
        />
      </div>
    </AppContext.Provider>
  );
}
