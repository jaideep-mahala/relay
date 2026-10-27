import { useState, useEffect } from "react";

const WS_URL = "ws://localhost:5000";
const RECONNECT_DELAY = 3000;

export function useSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    let currentSocket: WebSocket | null = null;
    let connectTimer: number;
    let reconnectTimer: number | undefined;

    const connect = () => {
      if (disposed) {
        return;
      }

      setLoading(true);
      setError(null);

      const ws = new WebSocket(WS_URL);
      currentSocket = ws;

      ws.onopen = () => {
        if (disposed) {
          return;
        }
        setSocket(ws);
        setLoading(false);
        setError(null);
      };

      ws.onerror = () => {
        if (!disposed) {
          setError("Failed to connect to backend WebSocket at " + WS_URL);
          setLoading(false);
        }
      };

      ws.onclose = () => {
        if (disposed || currentSocket !== ws) {
          return;
        }
        currentSocket = null;
        setSocket(null);
        setLoading(true);
        reconnectTimer = window.setTimeout(connect, RECONNECT_DELAY);
      };
    };

    // Deferring the initial connection lets Strict Mode's test cleanup cancel it.
    connectTimer = window.setTimeout(connect, 0);

    return () => {
      disposed = true;
      clearTimeout(connectTimer);
      if (reconnectTimer !== undefined) {
        clearTimeout(reconnectTimer);
      }
      if (currentSocket) {
        currentSocket.onopen = null;
        currentSocket.onerror = null;
        currentSocket.onclose = null;
        currentSocket.close();
      }
    };
  }, []);

  return {
    socket,
    loading,
    error,
  };
}
