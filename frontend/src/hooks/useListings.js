import { useState, useEffect, useCallback } from "react";
import { fetchListings } from "../api/listingsApi";

export function useListings(filters) {
  const [listings, setListings] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const retry = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setStatus("loading");
      try {
        const data = await fetchListings(filters);
        if (cancelled) return;
        setListings(data);
        setStatus("success");
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(err.message || "Couldn't load listings.");
        setStatus("error");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters), reloadToken]);

  return { listings, status, errorMessage, retry };
}
