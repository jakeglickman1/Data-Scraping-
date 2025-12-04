import { useState } from "react";
import type { FormEvent } from "react";
import { Panel } from "../components/Panel";
import { advisorService } from "../services/travelmateApi";
import type { AdvisorResponse } from "../types/api";
import { formatCurrency, formatDate } from "../utils/format";

export const AdvisorPage = () => {
  const [form, setForm] = useState({ destination: "", startDate: "", endDate: "", travelers: 2, stayType: "hotel" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<AdvisorResponse>();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      const data = await advisorService.search(form);
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Advisor</h1>
      <Panel title="Get recommendations" subtitle="Flights and stays tailored to your trip window.">
        <form className="form-grid two-cols" onSubmit={handleSubmit}>
          <label>
            Destination
            <input value={form.destination} onChange={(event) => setForm((prev) => ({ ...prev, destination: event.target.value }))} required />
          </label>
          <label>
            Start date
            <input type="date" value={form.startDate} onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))} required />
          </label>
          <label>
            End date
            <input type="date" value={form.endDate} onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))} required />
          </label>
          <label>
            Travelers
            <input
              type="number"
              min={1}
              value={form.travelers}
              onChange={(event) => setForm((prev) => ({ ...prev, travelers: Number(event.target.value) }))}
            />
          </label>
          <label>
            Stay type
            <select value={form.stayType} onChange={(event) => setForm((prev) => ({ ...prev, stayType: event.target.value }))}>
              <option value="hotel">Hotel</option>
              <option value="apartment">Apartment</option>
              <option value="boutique">Boutique</option>
            </select>
          </label>
          <button className="primary" type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
        {error && <div className="alert">{error}</div>}
      </Panel>
      {result && (
        <Panel title="Recommended flights & stays" subtitle="Compare at a glance and book your favorite.">
          <div className="stat-grid">
            <div>
              <h3>Flights</h3>
              <ul>
                {result.flights.map((flight) => (
                  <li key={flight.id}>
                    <strong>
                      {flight.from} → {flight.to}
                    </strong>
                    <p className="text-muted">
                      {flight.airline} · {formatDate(flight.departure)} ({flight.durationHours}h) · {formatCurrency(flight.price)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Stays</h3>
              <ul>
                {result.hotels.map((hotel) => (
                  <li key={hotel.id}>
                    <strong>{hotel.name}</strong>
                    <p className="text-muted">
                      {hotel.neighborhood} · {hotel.rating.toFixed(1)}★ · {formatCurrency(hotel.pricePerNight)} / night
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {result.notes.length > 0 && (
            <div>
              <h4>Notes</h4>
              <ul>
                {result.notes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </Panel>
      )}
    </div>
  );
};
