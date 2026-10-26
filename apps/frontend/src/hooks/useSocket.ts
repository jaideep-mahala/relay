import { useState , useEffect } from "react";

export function useSocket(){
    const [socket , setSocket] = useState<WebSocket | null>(null);
    const [loading , setLoading] = useState(true);

    useEffect(() => {
        const ws = WebSocket("ws://localhost:5000");

        ws.onopen = () => {
            setSocket(ws);
            setLoading(true);
        };

    }, []);

    return {
        socket,
        loading,
    };

}