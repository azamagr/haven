import { useState, useEffect, useCallback } from "react";
import * as api from "../api/listingsApi";

export function useMyListings() {
  const [listings, setListings] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await api.fetchMyListings();
      setListings(data);
      setStatus("success");
    } catch (err) {
      setErrorMessage(err.message || "Couldn't load your listings.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = useCallback(async (id) => {
    const prev = listings;
    setListings((list) => list.filter((l) => l._id !== id));
    try {
      await api.deleteListing(id);
    } catch (err) {
      setListings(prev);
      throw err;
    }
  }, [listings]);

  return { listings, status, errorMessage, reload: load, remove };
}
