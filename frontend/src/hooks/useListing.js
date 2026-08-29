import { useState, useEffect, useCallback } from "react";
import { fetchListingById } from "../api/listingsApi";

export function useListing(id) {
  const [listing, setListing] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const retry = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setStatus("loading");
      try {
        const data = await fetchListingById(id);
        if (cancelled) return;
        setListing(data);
        setStatus("success");
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(err.message || "Couldn't load this listing.");
        setStatus("error");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, reloadToken]);

  return { listing, status, errorMessage, retry };
}
