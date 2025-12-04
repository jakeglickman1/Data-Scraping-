import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Panel } from "../components/Panel";
import { StatCard } from "../components/StatCard";
import { tripService } from "../services/travelmateApi";
import { useDataStore } from "../store/useDataStore";
import { formatDate } from "../utils/format";

export const TripsPage = () => {
  const { trips, setTrips } = useDataStore();
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [initialError, setInitialError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [savingTrip, setSavingTrip] = useState(false);
  const [highlightLoading, setHighlightLoading] = useState(false);
  const [form, setForm] = useState({
    destination: "",
    country: "",
    startDate: "",
    endDate: "",
    notes: "",
  });
  const [highlight, setHighlight] = useState({ title: "", caption: "" });

  useEffect(() => {
    let cancelled = false;
    const loadTrips = async () => {
      if (trips.length) {
        setSelectedTripId((prev) => prev ?? trips[0]?.id);
        return;
      }
      setLoading(true);
      try {
        const data = await tripService.list();
        if (!cancelled) {
          setTrips(data);
          setSelectedTripId(data[0]?.id);
        }
      } catch (err) {
        if (!cancelled) {
          setInitialError((err as Error).message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadTrips();
    return () => {
      cancelled = true;
    };
  }, [setTrips, trips]);

  const selectedTrip = useMemo(() => trips.find((trip) => trip.id === selectedTripId), [selectedTripId, trips]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTrip = async (event: FormEvent) => {
    event.preventDefault();
    setSavingTrip(true);
    try {
      const newTrip = await tripService.create(form);
      setTrips([newTrip, ...trips]);
      setForm({ destination: "", country: "", startDate: "", endDate: "", notes: "" });
      setSelectedTripId(newTrip.id);
    } catch (err) {
      setInitialError((err as Error).message);
    } finally {
      setSavingTrip(false);
    }
  };

  const handleAddHighlight = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedTrip) return;
    setHighlightLoading(true);
    try {
      const created = await tripService.addHighlight(selectedTrip.id, highlight);
      const updatedTrip = {
        ...selectedTrip,
        highlights: [...(selectedTrip.highlights ?? []), created],
      };
      setTrips(trips.map((trip) => (trip.id === updatedTrip.id ? updatedTrip : trip)));
      setHighlight({ title: "", caption: "" });
    } catch (err) {
      setInitialError((err as Error).message);
    } finally {
      setHighlightLoading(false);
    }
  };

  const totalNights = trips.reduce((acc, trip) => {
    const start = new Date(trip.startDate).getTime();
    const end = new Date(trip.endDate).getTime();
    const diff = Math.max(0, end - start);
    return acc + Math.round(diff / (1000 * 60 * 60 * 24));
  }, 0);

  return (
    <div>
      <h1 className="page-title">Trips</h1>
      <Panel>
        <div className="stat-grid">
          <StatCard label="Upcoming / past" value={trips.length} accent="#2563eb" />
          <StatCard label="Nights planned" value={totalNights} accent="#16a34a" />
        </div>
      </Panel>
      <Panel title="Create trip" subtitle="Add destinations to keep itineraries on track.">
        <form className="form-grid two-cols" onSubmit={handleCreateTrip}>
          <label>
            Destination
            <input name="destination" value={form.destination} onChange={handleInputChange} required />
          </label>
          <label>
            Country
            <input name="country" value={form.country} onChange={handleInputChange} required />
          </label>
          <label>
            Start date
            <input type="date" name="startDate" value={form.startDate} onChange={handleInputChange} required />
          </label>
          <label>
            End date
            <input type="date" name="endDate" value={form.endDate} onChange={handleInputChange} required />
          </label>
          <label>
            Notes
            <textarea name="notes" value={form.notes} onChange={handleInputChange} placeholder="Optional context" />
          </label>
          <button className="primary" type="submit" disabled={savingTrip}>
            {savingTrip ? "Saving..." : "Save trip"}
          </button>
        </form>
      </Panel>
      <Panel
        title="Itinerary"
        subtitle="Select a trip to review highlights and dates."
        actions={
          <select value={selectedTripId} onChange={(event) => setSelectedTripId(event.target.value)}>
            <option value="">Select a trip</option>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.destination}
              </option>
            ))}
          </select>
        }
      >
        {initialError && <div className="alert">{initialError}</div>}
        {loading ? (
          <p>Loading trips...</p>
        ) : !selectedTrip ? (
          <p>No trip selected yet.</p>
        ) : (
          <div className="form-grid">
            <div>
              <h3>
                {selectedTrip.destination} ({selectedTrip.country})
              </h3>
              <p className="text-muted">
                {formatDate(selectedTrip.startDate)} → {formatDate(selectedTrip.endDate)}
              </p>
              {selectedTrip.notes && <p>{selectedTrip.notes}</p>}
            </div>
            <div>
              <h4>Highlights</h4>
              {selectedTrip.highlights?.length ? (
                <ul>
                  {selectedTrip.highlights.map((item) => (
                    <li key={item.id}>
                      <strong>{item.title}</strong>
                      {item.caption && <p className="text-muted">{item.caption}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No highlights logged.</p>
              )}
            </div>
            <form className="form-grid" onSubmit={handleAddHighlight}>
              <label>
                Highlight title
                <input value={highlight.title} onChange={(event) => setHighlight((prev) => ({ ...prev, title: event.target.value }))} required />
              </label>
              <label>
                Caption
                <textarea
                  value={highlight.caption}
                  onChange={(event) => setHighlight((prev) => ({ ...prev, caption: event.target.value }))}
                  placeholder="Favorite meal, scenic overlook..."
                />
              </label>
              <button className="primary" type="submit" disabled={highlightLoading}>
                {highlightLoading ? "Saving..." : "Add highlight"}
              </button>
            </form>
          </div>
        )}
      </Panel>
    </div>
  );
};
