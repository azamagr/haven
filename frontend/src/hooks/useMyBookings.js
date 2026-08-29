import { useState, useEffect, useCallback } from "react";
import * as api from "../api/bookingsApi";

export function useMyBookings() {
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await api.fetchMyBookings();
      setBookings(data);
      setStatus("success");
    } catch (err) {
      setErrorMessage(err.message || "Couldn't load your bookings.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cancel = useCallback(async (id) => {
    const prev = bookings;
    setBookings((list) => list.map((b) => (b._id === id ? { ...b, status: "cancelled" } : b)));
    try {
      await api.cancelBooking(id);
    } catch (err) {
      setBookings(prev);
      throw err;
    }
  }, [bookings]);

  return { bookings, status, errorMessage, reload: load, cancel };
}
