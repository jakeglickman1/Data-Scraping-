import { useState } from "react";
import { Panel } from "../components/Panel";
import { StatCard } from "../components/StatCard";
import { useAuthStore } from "../store/useAuthStore";
import { useDataStore } from "../store/useDataStore";

export const ProfilePage = () => {
  const { user, logout } = useAuthStore();
  const { trips, visitedPlaces, wishlist, setTrips, setVisitedPlaces, setWishlist } = useDataStore();
  const [message, setMessage] = useState<string>();

  const handleLogout = async () => {
    setMessage(undefined);
    await logout();
  };

  const clearCaches = () => {
    setTrips([]);
    setVisitedPlaces([]);
    setWishlist([]);
    setMessage("Local cache cleared. Data will refetch next visit.");
  };

  return (
    <div>
      <h1 className="page-title">Profile</h1>
      <Panel title="Account">
        <p>
          Signed in as <strong>{user?.name ?? user?.email}</strong>
        </p>
        <p className="text-muted">{user?.email}</p>
        <div className="stat-grid">
          <StatCard label="Trips" value={trips.length} />
          <StatCard label="Visited" value={visitedPlaces.length} />
          <StatCard label="Wishlist" value={wishlist.length} />
        </div>
        {message && <div className="alert">{message}</div>}
        <div style={{ display: "flex", gap: 12 }}>
          <button className="primary" onClick={handleLogout}>
            Log out
          </button>
          <button className="secondary" type="button" onClick={clearCaches}>
            Clear cached data
          </button>
        </div>
      </Panel>
    </div>
  );
};
