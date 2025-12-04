import { useEffect, useMemo, useState } from "react";
import { Panel } from "../components/Panel";
import { StatCard } from "../components/StatCard";
import { placeService, tripService } from "../services/travelmateApi";
import { useDataStore } from "../store/useDataStore";
import { formatDate } from "../utils/format";

export const MapPage = () => {
  const { trips, visitedPlaces, setTrips, setVisitedPlaces } = useDataStore();
  const [selectedTrip, setSelectedTrip] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(undefined);
      try {
        if (!trips.length) {
          const fetchedTrips = await tripService.list();
          if (!cancelled) {
            setTrips(fetchedTrips);
          }
        }
        const places = await placeService.visited();
        if (!cancelled) {
          setVisitedPlaces(places);
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [setTrips, setVisitedPlaces, trips.length]);

  const filteredPlaces = useMemo(
    () =>
      selectedTrip === "all"
        ? visitedPlaces
        : visitedPlaces.filter((place) => place.tripId === selectedTrip),
    [selectedTrip, visitedPlaces],
  );

  const stats = useMemo(() => {
    const countries = new Set(visitedPlaces.map((place) => place.country));
    const cities = new Set(visitedPlaces.map((place) => place.city));
    return {
      total: visitedPlaces.length,
      countries: countries.size,
      cities: cities.size,
    };
  }, [visitedPlaces]);

  return (
    <div>
      <h1 className="page-title">Visited places</h1>
      <Panel>
        <div className="stat-grid">
          <StatCard label="Places logged" value={stats.total} accent="#2563eb" />
          <StatCard label="Countries" value={stats.countries} accent="#0ea5e9" />
          <StatCard label="Cities" value={stats.cities} accent="#9333ea" />
        </div>
      </Panel>
      <Panel
        title="Highlights map"
        subtitle="Filter by trip to focus on specific journeys."
        actions={
          <select value={selectedTrip} onChange={(event) => setSelectedTrip(event.target.value)}>
            <option value="all">All trips</option>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.destination}
              </option>
            ))}
          </select>
        }
      >
        {error && <div className="alert">{error}</div>}
        {loading ? (
          <p>Loading your map...</p>
        ) : filteredPlaces.length === 0 ? (
          <p>No visited places logged yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Place</th>
                <th>Trip</th>
                <th>Date</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlaces.map((place) => (
                <tr key={place.id}>
                  <td>
                    <strong>{place.name}</strong>
                    <br />
                    <span className="text-muted">
                      {place.city}, {place.country}
                    </span>
                  </td>
                  <td>{trips.find((trip) => trip.id === place.tripId)?.destination ?? "-"}</td>
                  <td>{formatDate(place.visitDate)}</td>
                  <td>{place.caption ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
};
