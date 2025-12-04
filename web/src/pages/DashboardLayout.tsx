import { NavLink, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const links = [
  { to: "map", label: "Visited" },
  { to: "trips", label: "Trips" },
  { to: "wishlist", label: "Wishlist" },
  { to: "planner", label: "Planner" },
  { to: "advisor", label: "Advisor" },
  { to: "profile", label: "Profile" },
];

export const DashboardLayout = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <h1>Travel Companion</h1>
          <p>Welcome{user?.name ? `, ${user.name}` : ""}!</p>
        </div>
        <nav className="nav-links">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
