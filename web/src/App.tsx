import { Navigate, Route, Routes } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import { DashboardLayout } from "./pages/DashboardLayout";
import { MapPage } from "./pages/MapPage";
import { TripsPage } from "./pages/TripsPage";
import { WishlistPage } from "./pages/WishlistPage";
import { AdvisorPage } from "./pages/AdvisorPage";
import { ProfilePage } from "./pages/ProfilePage";
import { PlannerPage } from "./pages/PlannerPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuthStore } from "./store/useAuthStore";

const App = () => {
  const token = useAuthStore((state) => state.token);

  return (
    <Routes>
      <Route path="/" element={token ? <Navigate to="/app/map" replace /> : <AuthPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<Navigate to="map" replace />} />
          <Route path="map" element={<MapPage />} />
          <Route path="trips" element={<TripsPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="planner" element={<PlannerPage />} />
          <Route path="advisor" element={<AdvisorPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={token ? "/app/map" : "/"} replace />} />
    </Routes>
  );
};

export default App;
