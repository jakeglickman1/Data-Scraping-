import { useState } from "react";
import type { FormEvent } from "react";
import { Panel } from "../components/Panel";
import { plannerService } from "../services/travelmateApi";
import type { PlannerResponse } from "../types/api";
import { formatDate } from "../utils/format";

export const PlannerPage = () => {
  const [form, setForm] = useState({ destination: "", startDate: "", endDate: "", interests: "food, art" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<PlannerResponse>();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      const interests = form.interests
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      const data = await plannerService.recommend({
        destination: form.destination,
        startDate: form.startDate,
        endDate: form.endDate,
        interests,
      });
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Planner</h1>
      <Panel title="Request a plan" subtitle="Tell the planner what kind of experiences you want.">
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
            Interests
            <input value={form.interests} onChange={(event) => setForm((prev) => ({ ...prev, interests: event.target.value }))} placeholder="Food, culture, hiking" />
          </label>
          <button className="primary" type="submit" disabled={loading}>
            {loading ? "Generating..." : "Generate"}
          </button>
        </form>
        {error && <div className="alert">{error}</div>}
      </Panel>
      {result && (
        <Panel title={`Suggested plan for ${result.destination}`} subtitle={`${formatDate(result.startDate)} → ${formatDate(result.endDate)}`}>
          <div className="stat-grid">
            <div>
              <h3>Activities</h3>
              <ul>
                {result.activities.map((activity) => (
                  <li key={activity.id}>
                    <strong>{activity.name}</strong> · {activity.category} · {activity.durationHours}h
                    {activity.description && <p className="text-muted">{activity.description}</p>}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Events</h3>
              <ul>
                {result.events.map((event) => (
                  <li key={event.id}>
                    <strong>{event.name}</strong> · {event.venue} · {formatDate(event.date)}
                    {event.link && (
                      <p>
                        <a href={event.link} target="_blank" rel="noreferrer">
                          View details
                        </a>
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
};
