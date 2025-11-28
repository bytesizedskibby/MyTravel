import { useEffect } from "react";

/**
 * Hook that pings the server to track online users.
 * Call this in your root layout or App component.
 */
export function usePing() {
  useEffect(() => {
    // Ping immediately on mount
    const ping = () => {
      fetch("/api/ping", { credentials: "include" }).catch(() => {
        // Silently ignore errors
      });
    };

    ping();

    // Ping every 2 minutes to keep the session alive
    const interval = setInterval(ping, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}
