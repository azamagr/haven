import { useState, useEffect, useCallback } from "react";
import { fetchDashboard } from "../api/dashboardApi";

export function useDashboard() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const retry = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setStatus("loading");
      try {
        const result = await fetchDashboard();
        if (cancelled) return;
        setData(result);
        setStatus("success");
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(err.message || "Couldn't load your dashboard.");
        setStatus("error");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  return { data, status, errorMessage, retry };
}
